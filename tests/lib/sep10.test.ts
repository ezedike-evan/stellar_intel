// @vitest-environment node

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  Account,
  Keypair,
  Networks,
  Operation,
  Transaction,
  TransactionBuilder,
} from '@stellar/stellar-sdk'
import {
  fetchChallenge,
  signChallenge,
  submitChallenge,
  authenticate,
  UserRejectedError,
} from '@/lib/stellar/sep10'
import * as sep1 from '@/lib/stellar/sep1'

const WEB_AUTH_ENDPOINT = 'https://cowrie.exchange/auth'
const SERVER = Keypair.fromSecret('SAAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQC5MY')
const USER = Keypair.fromSecret('SABAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAEAQCAIBAFNE7')
const PUBLIC_KEY = USER.publicKey()
const SIGNED_XDR = 'AAAAAQAAAAD...'
const JWT = 'eyJhbGciOiJIUzI1NiJ9.test.token'

function buildChallengeXdr(networkPassphrase = Networks.PUBLIC): string {
  const transaction = new TransactionBuilder(new Account(SERVER.publicKey(), '0'), {
    fee: '100',
    networkPassphrase,
  })
    .addOperation(
      Operation.manageData({
        name: 'stellar.toml auth',
        value: 'test challenge',
      })
    )
    .setTimeout(300)
    .build()

  transaction.sign(SERVER)
  return transaction.toXDR()
}

const CHALLENGE_XDR = buildChallengeXdr()

vi.mock('@stellar/freighter-api', () => ({
  signTransaction: vi.fn(),
}))

beforeEach(() => {
  vi.restoreAllMocks()
  vi.spyOn(sep1, 'getWebAuthEndpoint').mockResolvedValue(WEB_AUTH_ENDPOINT)
})

async function getFreighter() {
  return await import('@stellar/freighter-api')
}

async function mockFreighterSignature() {
  const freighter = await getFreighter()
  vi.mocked(freighter.signTransaction).mockImplementation(async (xdr, opts) => {
    const transaction = new Transaction(xdr, opts?.networkPassphrase ?? Networks.PUBLIC)
    transaction.sign(USER)

    return {
      signedTxXdr: transaction.toXDR(),
      signerAddress: PUBLIC_KEY,
    }
  })

  return freighter
}

// ─── fetchChallenge ───────────────────────────────────────────────────────────

describe('fetchChallenge', () => {
  it('constructs the correct challenge URL with the public key', async () => {
    let capturedUrl = ''
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        capturedUrl = url
        return {
          ok: true,
          json: async () => ({
            transaction: CHALLENGE_XDR,
            network_passphrase: Networks.PUBLIC,
          }),
        }
      })
    )

    await fetchChallenge(WEB_AUTH_ENDPOINT, PUBLIC_KEY)
    expect(capturedUrl).toContain(`account=${PUBLIC_KEY}`)
  })

  it('throws when network_passphrase does not match mainnet', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          transaction: CHALLENGE_XDR,
          network_passphrase: 'Test SDF Network ; September 2015',
        }),
      }))
    )

    await expect(fetchChallenge(WEB_AUTH_ENDPOINT, PUBLIC_KEY)).rejects.toThrow(/wrong network/)
  })

  it('throws when transaction is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ network_passphrase: Networks.PUBLIC }),
      }))
    )

    await expect(fetchChallenge(WEB_AUTH_ENDPOINT, PUBLIC_KEY)).rejects.toThrow(/"transaction"/)
  })

  it('throws when network_passphrase is absent', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ transaction: CHALLENGE_XDR }),
      }))
    )

    await expect(fetchChallenge(WEB_AUTH_ENDPOINT, PUBLIC_KEY)).rejects.toThrow(
      /"network_passphrase"/
    )
  })
})

// ─── submitChallenge ──────────────────────────────────────────────────────────

describe('submitChallenge', () => {
  it('extracts the JWT from the anchor response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ token: JWT }),
      }))
    )

    const result = await submitChallenge(WEB_AUTH_ENDPOINT, SIGNED_XDR)
    expect(result).toBe(JWT)
  })

  it('throws when token is absent from the response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ other: 'data' }),
      }))
    )

    await expect(submitChallenge(WEB_AUTH_ENDPOINT, SIGNED_XDR)).rejects.toThrow(/"token"/)
  })
})

// ─── signChallenge ────────────────────────────────────────────────────────────

describe('signChallenge', () => {
  it('returns the signed XDR from Freighter', async () => {
    await mockFreighterSignature()

    const result = await signChallenge(CHALLENGE_XDR, Networks.PUBLIC, PUBLIC_KEY)
    const transaction = new Transaction(result, Networks.PUBLIC)

    expect(transaction.signatures).toHaveLength(2)
  })

  it('throws UserRejectedError when Freighter returns a user rejection error', async () => {
    const freighter = await getFreighter()
    vi.mocked(freighter.signTransaction).mockResolvedValue({
      signedTxXdr: '',
      signerAddress: '',
      error: { message: 'User declined', code: -4 },
    })

    await expect(signChallenge(CHALLENGE_XDR, Networks.PUBLIC, PUBLIC_KEY)).rejects.toBeInstanceOf(
      UserRejectedError
    )
  })
})

// ─── authenticate ─────────────────────────────────────────────────────────────

describe('authenticate', () => {
  it('calls fetchChallenge, signChallenge, and submitChallenge in sequence', async () => {
    await mockFreighterSignature()

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ transaction: CHALLENGE_XDR, network_passphrase: Networks.PUBLIC }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ token: JWT }),
        })
    )

    const result = await authenticate('cowrie.exchange', PUBLIC_KEY)

    expect(result.jwt).toBe(JWT)
    expect(result.anchorDomain).toBe('cowrie.exchange')
    expect(result.publicKey).toBe(PUBLIC_KEY)
    expect(result.expiresAt).toBeInstanceOf(Date)
  })
})
