import React from 'react';
import { CheckCircle2, MapPin, ShieldCheck, Sparkles, X } from 'lucide-react';
import { CAMPUS_IMAGES } from '../demoData';
import { CampusItem, ItemMatch } from '../types';
import { ItemImage } from './ItemImage';

interface MatchComparisonModalProps {
  match: ItemMatch;
  lostItem?: CampusItem;
  foundItem?: CampusItem;
  onClose: () => void;
  onProceedToClaim: (targetItem: CampusItem, matchedLostItemId?: string) => void;
}

export const MatchComparisonModal: React.FC<MatchComparisonModalProps> = ({
  match,
  lostItem,
  foundItem,
  onClose,
  onProceedToClaim,
}) => {
  const displayLost = lostItem || {
    id: 'item_lost_earbuds_01',
    reportCode: 'FB-2026-101',
    title: match.lostItemTitle || 'Black Boat Earbuds',
    description:
      'Matte black Boat wireless earbuds in charging case. Left near the study desks on the 2nd floor of the College Library.',
    category: 'Electronics' as const,
    type: 'lost' as const,
    date: '2026-09-18',
    location: 'College Library',
    image: CAMPUS_IMAGES.earbuds,
    status: 'Possible Match' as const,
    userId: 'student_arjun_01',
    reporterName: 'Arjun Mehta',
    createdAt: '2026-09-18T11:20:00.000Z',
  };

  const displayFound =
    foundItem && foundItem.id !== displayLost.id
      ? foundItem
      : {
          ...displayLost,
          reportCode: 'FB-2026-FOUND',
          title: match.foundItemTitle || 'Black Wireless Earbuds',
          description:
            'Black wireless earbuds in a matte charging case turned in at the College Library circulation desk.',
          type: 'found' as const,
        };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full overflow-hidden shadow-2xl my-8">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-blue-100" />
            <div>
              <h2 className="text-base font-bold font-display">
                <span className="font-mono tabular-nums">
                  {match.matchScore}% Possible Match
                </span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-4 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <p className="text-[11px] text-slate-500">Category Match</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {match.categoryMatch ? '✓' : '—'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <p className="text-[11px] text-slate-500">Description Similarity</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {match.descriptionSimilarity ? '✓' : '—'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <p className="text-[11px] text-slate-500">Location Match</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {match.locationMatch ? '✓' : '—'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                <p className="text-[11px] text-slate-500">Date Match</p>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {match.dateMatch ? '✓' : '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-semibold text-amber-700">Lost Item</div>
              <h3 className="text-base font-bold text-slate-900">{displayLost.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{displayLost.description}</p>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayLost.location}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{displayLost.date}</span>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-200 bg-indigo-50/20 p-4 space-y-3">
              <div className="text-xs font-semibold text-blue-700">Found Item</div>
              <h3 className="text-base font-bold text-slate-900">{displayFound.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{displayFound.description}</p>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{displayFound.location}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{displayFound.date}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Verify ownership to claim this item.</span>
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => onProceedToClaim(displayLost, displayLost.id)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Claim This Item</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
