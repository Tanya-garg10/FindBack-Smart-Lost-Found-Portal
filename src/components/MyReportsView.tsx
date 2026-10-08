import React, { useState } from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { CampusItem, OwnershipClaim } from '../types';
import { ItemImage } from './ItemImage';

interface MyReportsViewProps {
  items: CampusItem[];
  claims: OwnershipClaim[];
  userName?: string;
  onSelectItem: (item: CampusItem) => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({
  items,
  claims,
  userName,
  onSelectItem,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'lost' | 'found' | 'claims'>('lost');

  const firstName = (userName || 'Tanya').split(' ')[0];

  const lostItems = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');

  const getStatusDisplay = (status: CampusItem['status']) => {
    if (status === 'Returned') {
      return { dot: 'bg-emerald-500', text: 'Returned', textColor: 'text-emerald-700' };
    }
    if (status === 'Possible Match' || status === 'Verification Pending' || status === 'Verified') {
      return { dot: 'bg-blue-500', text: 'Possible match', textColor: 'text-blue-700' };
    }
    return { dot: 'bg-amber-400', text: 'Looking for a match', textColor: 'text-amber-700' };
  };

  const displayedItems = activeSubTab === 'lost' ? lostItems : foundItems;

  return (
    <div className="space-y-8 pb-20">
      {/* Personalized Greeting */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-sm text-slate-500">
            Here’s what’s happening with your reports.
          </p>
        </div>

        {/* Tabs: Lost | Found | Claims */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl self-start">
          {(
            [
              { id: 'lost', label: `Lost (${lostItems.length})` },
              { id: 'found', label: `Found (${foundItems.length})` },
              { id: 'claims', label: `Claims (${claims.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeSubTab === t.id
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards or Claims List */}
      {activeSubTab !== 'claims' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedItems.map((item) => {
            const st = getStatusDisplay(item.status);
            return (
              <article
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                <div className="h-44 w-full bg-slate-100 overflow-hidden">
                  <ItemImage
                    src={item.image}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-full group-hover:scale-102 transition-transform duration-200"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                      <span className={st.textColor}>{st.text}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{item.date}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 font-semibold text-blue-600 shrink-0">
                      <span>View details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {claims.map((claim) => {
            const linkedItem = items.find((i) => i.id === claim.itemId);
            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-950 text-sm">{claim.itemTitle}</span>
                  <span className="font-semibold text-blue-600">{claim.status}</span>
                </div>
                <p className="text-xs text-slate-600">
                  Unique feature: <strong>{claim.uniqueFeature}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  Last seen: {claim.exactLastSeen} · Attached: {claim.attachedContents}
                </p>
                {linkedItem && (
                  <button
                    type="button"
                    onClick={() => onSelectItem(linkedItem)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
