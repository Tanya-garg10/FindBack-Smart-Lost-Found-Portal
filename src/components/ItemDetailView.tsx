import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ImagePlus,
  Lock,
  MapPin,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { CampusItem, ItemMatch, OwnershipClaim, UserRole } from '../types';
import { ItemImage } from './ItemImage';

interface ItemDetailViewProps {
  item: CampusItem;
  matches: ItemMatch[];
  claims: OwnershipClaim[];
  currentRole: UserRole;
  onBack: () => void;
  onSubmitClaim: (data: {
    itemId: string;
    matchedLostItemId?: string;
    itemTitle: string;
    uniqueFeature: string;
    attachedContents: string;
    exactLastSeen: string;
    proofImage?: string;
  }) => Promise<void>;
  onAdminApproveClaim: (claim: OwnershipClaim) => Promise<void>;
  onAdminMarkReturned: (item: CampusItem) => Promise<void>;
  onContactAdmin: (item: CampusItem) => void;
}

const TIMELINE_STAGES = [
  { key: 'Reported', label: 'Reported' },
  { key: 'Possible Match', label: 'Possible Match' },
  { key: 'Verified', label: 'Verified' },
  { key: 'Returned', label: 'Returned' },
];

function getActiveTimelineStage(status: CampusItem['status']): number {
  if (status === 'Reported') return 0;
  if (status === 'Possible Match') return 1;
  if (status === 'Verification Pending' || status === 'Verified') return 2;
  if (status === 'Returned') return 3;
  return 1;
}

export const ItemDetailView: React.FC<ItemDetailViewProps> = ({
  item,
  matches,
  claims,
  currentRole,
  onBack,
  onSubmitClaim,
  onAdminApproveClaim,
  onAdminMarkReturned,
  onContactAdmin,
}) => {
  const [showVerification, setShowVerification] = useState(false);
  const [uniqueFeature, setUniqueFeature] = useState('');
  const [exactLastSeen, setExactLastSeen] = useState('');
  const [attachedContents, setAttachedContents] = useState('');
  const [proofImage, setProofImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const itemMatch = matches.find(
    (m) => m.lostItemId === item.id || m.foundItemId === item.id
  );
  const itemClaims = claims.filter(
    (c) => c.itemId === item.id || c.matchedLostItemId === item.id
  );

  const stageIdx = getActiveTimelineStage(item.status);
  const matchPercent = itemMatch ? itemMatch.matchScore : 92;

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 450 * 1024) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') setProofImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmitClaim({
        itemId: item.id,
        matchedLostItemId: itemMatch?.lostItemId,
        itemTitle: item.title,
        uniqueFeature: uniqueFeature.trim(),
        exactLastSeen: exactLastSeen.trim(),
        attachedContents: attachedContents.trim(),
        proofImage: proofImage || undefined,
      });
      setShowVerification(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Explore</span>
      </button>

      {/* TWO-COLUMN PREMIUM ITEM LAYOUT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Large Item Image Gallery */}
          <div className="lg:col-span-6 bg-slate-100 min-h-[300px] lg:min-h-[420px]">
            <ItemImage
              src={item.image}
              alt={item.title}
              category={item.category}
              className="w-full h-full"
            />
          </div>

          {/* Right: Details + Match Progress + Claim / Contact Admin */}
          <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
                <span className={item.type === 'found' ? 'text-blue-600' : 'text-amber-600'}>
                  {item.type === 'found' ? 'FOUND' : 'LOST'}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-500 font-medium capitalize">{item.category}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
                {item.title}
              </h1>

              <div className="grid grid-cols-2 gap-4 py-2 text-xs">
                <div>
                  <p className="text-slate-400">Location</p>
                  <p className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.location}</span>
                  </p>
                </div>
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {item.date}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

              {/* Possible Match Visual Progress Indicator */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Possible Match</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600 tabular-nums">
                    {matchPercent}% Match
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-blue-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-300"
                    style={{ width: `${matchPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Claim This Item + Contact Admin */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              {item.status !== 'Returned' ? (
                <button
                  type="button"
                  onClick={() => setShowVerification(true)}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  Claim This Item
                </button>
              ) : (
                <div className="flex-1 py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Returned to Verified Owner</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => onContactAdmin(item)}
                className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* HORIZONTAL STATUS TRACKING TIMELINE */}
        <div className="bg-slate-50/80 border-t border-slate-200/80 px-6 sm:px-10 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {TIMELINE_STAGES.map((stage, idx) => {
              const isPassed = idx < stageIdx || item.status === 'Returned';
              const isCurrent = idx === stageIdx && item.status !== 'Returned';
              return (
                <div
                  key={stage.key}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-white border-blue-600 shadow-2xs'
                      : isPassed
                      ? 'bg-white border-emerald-200'
                      : 'bg-slate-100/60 border-slate-200/60 opacity-60'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900">{stage.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isPassed ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                    </p>
                  </div>
                  {isPassed ? (
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CLAIM / OWNERSHIP VERIFICATION SCREEN */}
      {showVerification && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="space-y-1.5 border-b border-slate-100 pb-5">
            <h2 className="text-2xl font-bold text-slate-950 font-display">
              Let’s make sure it belongs to you.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              For everyone&apos;s safety, answer a few questions before claiming this item.
            </p>
          </div>

          <form onSubmit={handleVerificationSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                What unique feature does your item have?
              </label>
              <input
                type="text"
                required
                value={uniqueFeature}
                onChange={(e) => setUniqueFeature(e.target.value)}
                placeholder="e.g., Tiny silver scratch near the charging port"
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Where exactly did you lose it?
              </label>
              <input
                type="text"
                required
                value={exactLastSeen}
                onChange={(e) => setExactLastSeen(e.target.value)}
                placeholder="e.g., Central Library 2nd floor study table #4"
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Was anything attached to it?
              </label>
              <input
                type="text"
                required
                value={attachedContents}
                onChange={(e) => setAttachedContents(e.target.value)}
                placeholder="e.g., Matte black silicone case"
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Optional Proof Upload
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 cursor-pointer">
                <ImagePlus className="w-4 h-4 text-blue-600" />
                <span>{proofImage ? 'Proof Image Attached ✓' : 'Upload Receipt or Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProofUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Your information is only shared with authorized administrators.</span>
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowVerification(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Verification'}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* EXISTING VERIFICATION CLAIMS */}
      {itemClaims.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Submitted Verification Claims</h3>
          {itemClaims.map((claim) => (
            <div
              key={claim.id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex flex-wrap items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <p className="font-bold text-slate-900">
                  {claim.claimantName} · <span className="text-blue-600">{claim.status}</span>
                </p>
                <p className="text-slate-600">
                  {claim.uniqueFeature} · {claim.exactLastSeen} · {claim.attachedContents}
                </p>
              </div>
              {currentRole === 'admin' && claim.status === 'Verification Pending' && (
                <button
                  type="button"
                  onClick={() => onAdminApproveClaim(claim)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                >
                  Approve &amp; Mark Returned
                </button>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};
