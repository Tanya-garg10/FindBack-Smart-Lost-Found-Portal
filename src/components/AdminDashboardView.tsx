import React from 'react';
import { CheckCircle2, ShieldCheck, Trash2 } from 'lucide-react';
import { CampusItem, ItemCategory, ItemMatch, OwnershipClaim } from '../types';

interface AdminDashboardViewProps {
  items: CampusItem[];
  matches: ItemMatch[];
  claims: OwnershipClaim[];
  onApproveClaim: (claim: OwnershipClaim) => Promise<void>;
  onMarkItemReturned: (item: CampusItem) => Promise<void>;
  onVerifyItem: (item: CampusItem) => Promise<void>;
  onRemoveDuplicateItem: (itemId: string) => Promise<void>;
  onSelectItem: (item: CampusItem) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'ID Cards',
  'Bags',
  'Stationery',
  'Other',
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  items,
  matches,
  claims,
  onApproveClaim,
  onMarkItemReturned,
  onVerifyItem,
  onRemoveDuplicateItem,
  onSelectItem,
}) => {
  const totalReports = items.length;
  const activeMatches = matches.length;
  const pendingClaims = claims.filter((c) => c.status === 'Verification Pending').length;
  const itemsReturned = items.filter((i) => i.status === 'Returned').length;

  const lostCount = items.filter((i) => i.type === 'lost').length;
  const foundCount = items.filter((i) => i.type === 'found').length;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
            FindBack Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Campus verification governance, match oversight, and recovery analytics.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3.5 py-2 rounded-xl">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Administrator</span>
        </div>
      </div>

      {/* 4 Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Reports</p>
          <p className="text-3xl font-bold text-slate-950 font-mono tabular-nums mt-1">
            {totalReports}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Active Matches</p>
          <p className="text-3xl font-bold text-blue-600 font-mono tabular-nums mt-1">
            {activeMatches}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Pending Claims</p>
          <p className="text-3xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {pendingClaims}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Items Returned</p>
          <p className="text-3xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {itemsReturned}
          </p>
        </div>
      </div>

      {/* 3 Clean Charts: Lost vs Found | Reports by Category | Recovery Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lost vs Found */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900">Lost vs Found</h2>
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-amber-600">Lost ({lostCount})</span>
              <span className="text-blue-600">Found ({foundCount})</span>
            </div>
            <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="bg-amber-500 h-full"
                style={{
                  width: `${
                    totalReports > 0 ? Math.round((lostCount / totalReports) * 100) : 50
                  }%`,
                }}
              />
              <div
                className="bg-blue-600 h-full"
                style={{
                  width: `${
                    totalReports > 0 ? Math.round((foundCount / totalReports) * 100) : 50
                  }%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Balanced campus reporting across student and staff submissions.
            </p>
          </div>
        </div>

        {/* Reports by Category */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900">Reports by Category</h2>
          <div className="space-y-2.5">
            {CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              const pct = totalReports > 0 ? Math.round((count / totalReports) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-medium">{cat}</span>
                    <span className="font-mono text-slate-500 tabular-nums">{count}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600"
                      style={{ width: `${Math.max(pct, count > 0 ? 15 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recovery Rate */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between space-y-4 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900">Recovery Rate</h2>
          <div className="grid grid-cols-4 gap-3 items-end h-32 pt-2">
            {[
              { m: 'Jul', r: 64 },
              { m: 'Aug', r: 69 },
              { m: 'Sep', r: 74 },
              { m: 'Oct', r: 78 },
            ].map((bar) => (
              <div key={bar.m} className="flex flex-col items-center gap-1 h-full justify-end">
                <span className="text-[11px] font-mono font-semibold text-slate-700 tabular-nums">
                  {bar.r}%
                </span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-blue-600 to-violet-500"
                  style={{ height: `${bar.r}%` }}
                />
                <span className="text-[11px] text-slate-400">{bar.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Claims Quick Action Bar (if any) */}
      {claims.filter((c) => c.status === 'Verification Pending').length > 0 && (
        <div className="bg-blue-50/70 rounded-2xl border border-blue-200 p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-950">Pending Ownership Verifications</h3>
          {claims
            .filter((c) => c.status === 'Verification Pending')
            .map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {c.itemTitle} — Claimed by {c.claimantName}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    Feature: {c.uniqueFeature} · Location: {c.exactLastSeen}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onApproveClaim(c)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve &amp; Return</span>
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Management Table: Item | Reporter | Type | Location | Status | Action */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-950 font-display">All Campus Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                <th className="py-3.5 px-5">Item</th>
                <th className="py-3.5 px-4">Reporter</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer text-left"
                    >
                      {item.title}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.reporterName}</td>
                  <td className="py-3.5 px-4 capitalize font-semibold">
                    <span className={item.type === 'lost' ? 'text-amber-600' : 'text-blue-600'}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.location}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{item.status}</td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-2">
                      {item.status !== 'Verified' && item.status !== 'Returned' && (
                        <button
                          type="button"
                          onClick={() => onVerifyItem(item)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                      {item.status !== 'Returned' && (
                        <button
                          type="button"
                          onClick={() => onMarkItemReturned(item)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          Mark Returned
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveDuplicateItem(item.id)}
                        title="Delete report"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
