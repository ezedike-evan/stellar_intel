'use client';
import { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import { CountrySelector } from '@/components/offramp/CountrySelector';
import { CurrencyDisplay } from '@/components/offramp/CurrencySelector';
import { Button } from '@/components/ui/Button';
import { SUPPORTED_COUNTRIES } from '@/constants';
import type { Country, OfframpSortKey } from '@/types';

export default function OfframpPage() {
  const [country, setCountry] = useState<Country>(SUPPORTED_COUNTRIES[0]);
  const [amount, setAmount] = useState(100);
  const [sortKey, setSortKey] = useState<OfframpSortKey>('rate');
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Off-ramp Comparator</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Compare USDC withdrawal rates across Stellar anchors
        </p>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50 sm:grid-cols-3">
        <CountrySelector value={country.code} onChange={setCountry} />
        <CurrencyDisplay currency={country.currency} currencySymbol={country.currencySymbol} />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount (USDC)
          </label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(['rate', 'fee', 'total'] as OfframpSortKey[]).map((k) => (
            <Button
              key={k}
              variant={sortKey === k ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSortKey(k)}
            >
              {k === 'rate' ? 'Best Rate' : k === 'fee' ? 'Lowest Fee' : 'Best Total'}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {true && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              Updated just now
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={() => {}}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
