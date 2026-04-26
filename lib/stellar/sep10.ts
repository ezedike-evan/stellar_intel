import { Keypair, Networks, Transaction } from '@stellar/stellar-sdk'
import { getWebAuthEndpoint } from './sep1'
import type { Sep10Auth } from '@/types'

// ─── Challenge fetch ──────────────────────────────────────────────────────────

/**
 * Fetches a SEP-10 challenge transaction from the anchor's web auth endpoint.
 * Validates that the challenge is for Stellar mainnet.
 */
export async function fetchChallenge(
  webAuthEndpoint: string,
  publicKey: string
): Promise<{ transaction: string; network_passphrase: string }> {
  const url = new URL(webAuthEndpoint)
  url.searchParams.set('account', publicKey)

  const res = await fetch(url.toString())
  if (!res.ok) {
    throw new Error(`Challenge fetch failed: HTTP ${res.status} from ${webAuthEndpoint}`)
  }

  const data = (await res.json()) as Record<string, unknown>

  const transaction = data['transaction']
  if (!transaction || typeof transaction !== 'string') {
    throw new Error(`Missing "transaction" field in challenge response from ${webAuthEndpoint}`)
  }

  const network_passphrase = data['network_passphrase']
  if (!network_passphrase || typeof network_passphrase !== 'string') {
    throw new Error(
      `Missing "network_passphrase" field in challenge response from ${webAuthEndpoint}`
    )
  }

  if (network_passphrase !== Networks.PUBLIC) {
    throw new Error(
      `Challenge is for wrong network: "${network_passphrase}". Expected Stellar mainnet.`
    )
  }

  return { transaction, network_passphrase }
}

// ─── Challenge signing ────────────────────────────────────────────────────────

export class UserRejectedError extends Error {
  constructor(message = 'User rejected signing') {
    super(message)
    this.name = 'UserRejectedError'
  }
}

function isUserRejectedError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { code?: unknown; message?: unknown }
  const message = typeof maybeError.message === 'string' ? maybeError.message : ''

  return (
    maybeError.code === -4 ||
    /user rejected|user declined|declined|denied|cancelled|canceled/i.test(message)
  )
}

function hasSignatureFromPublicKey(
  signedXdr: string,
  networkPassphrase: string,
  publicKey: string
): boolean {
  const transaction = new Transaction(signedXdr, networkPassphrase)
  const signer = Keypair.fromPublicKey(publicKey)
  const transactionHash = transaction.hash()

  return transaction.signatures.some((signature) => {
    return signer.verify(transactionHash, signature.signature())
  })
}

/**
 * Signs the challenge XDR using the Freighter browser extension.
 * Throws if the user rejects the signing prompt.
 */
export async function signChallenge(
  challengeXdr: string,
  networkPassphrase: string,
  publicKey: string
): Promise<string> {
  const { signTransaction } = await import('@stellar/freighter-api')
  const result = await signTransaction(challengeXdr, {
    networkPassphrase,
    address: publicKey,
  })

  if (result.error) {
    if (isUserRejectedError(result.error)) {
      throw new UserRejectedError()
    }

    throw new Error(`Freighter signing failed: ${result.error.message}`)
  }

  if (!result.signedTxXdr) {
    throw new Error('Freighter signing failed: missing signed transaction XDR')
  }

  if (!hasSignatureFromPublicKey(result.signedTxXdr, networkPassphrase, publicKey)) {
    throw new Error('Freighter signing failed: signed envelope does not match the user account')
  }

  return result.signedTxXdr
}

// ─── JWT exchange ─────────────────────────────────────────────────────────────

/**
 * Submits the signed challenge XDR to the anchor and receives a JWT in return.
 */
export async function submitChallenge(webAuthEndpoint: string, signedXdr: string): Promise<string> {
  const res = await fetch(webAuthEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transaction: signedXdr }),
  })

  if (!res.ok) {
    throw new Error(`JWT exchange failed: HTTP ${res.status} from ${webAuthEndpoint}`)
  }

  const data = (await res.json()) as Record<string, unknown>
  const token = data['token']

  if (!token || typeof token !== 'string') {
    throw new Error(`Missing "token" field in JWT response from ${webAuthEndpoint}`)
  }

  return token
}

// ─── Full auth orchestrator ───────────────────────────────────────────────────

/**
 * Runs the complete SEP-10 authentication flow for an anchor domain.
 * Returns a Sep10Auth object containing the JWT and its expiry.
 */
export async function authenticate(anchorDomain: string, publicKey: string): Promise<Sep10Auth> {
  const webAuthEndpoint = await getWebAuthEndpoint(anchorDomain)
  const { transaction, network_passphrase } = await fetchChallenge(webAuthEndpoint, publicKey)
  const signedXdr = await signChallenge(transaction, network_passphrase, publicKey)
  const jwt = await submitChallenge(webAuthEndpoint, signedXdr)

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  return { jwt, anchorDomain, publicKey, expiresAt }
}
