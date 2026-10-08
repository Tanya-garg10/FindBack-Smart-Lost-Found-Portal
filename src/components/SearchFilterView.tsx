import React, { useMemo, useState } from 'react';
import { MapPin, RotateCcw, Search, Sparkles } from 'lucide-react';
import { CampusItem, ItemCategory, ItemMatch, ItemStatus } from '../types';
import { ItemImage } from './ItemImage';

interface SearchFilterViewProps {
  items: CampusItem[];
  matches: ItemMatch[];
  initialQuery: string;
  initialCategory: string;
  onSelectItem: (item: CampusItem) => void;
  onOpenMatchModal: (match: ItemMatch) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'ID Cards',
  'Bags',
  'Stationery',
  'Clothing',
  'Accessories',
  'Other',
];

const STATUSES: ItemStatus[] = [
  'Reported',
  'Possible Match',
  'Verification Pending',
  'Verified',
  'Returned',
];

export const SearchFilterView: React.FC<SearchFilterViewProps> = ({
  items,
  matches,
  initialQuery,
  initialCategory,
  onSelectItem,
  onOpenMatchModal,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'relevant'>('relevant');

  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.location));
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);

    return items
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
        if (selectedType !== 'all' && item.type !== selectedType) return false;
        if (selectedStatus !== 'All' && item.status !== selectedStatus) return false;
        if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
        if (dateFilter && item.date !== dateFilter) return false;

        if (tokens.length > 0) {
          const hay = `${item.title} ${item.description} ${item.category} ${item.location} ${item.reportCode}`.toLowerCase();
          return tokens.every((t) => hay.includes(t));
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        // Most Relevant: prioritize items with active high-probability matches
        const matchA = matches.find((m) => m.lostItemId === a.id || m.foundItemId === a.id);
        const matchB = matches.find((m) => m.lostItemId === b.id || m.foundItemId === b.id);
        const scoreA = matchA ? matchA.matchScore : 0;
        const scoreB = matchB ? matchB.matchScore : 0;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [
    items,
    matches,
    query,
    selectedCategory,
    selectedType,
    selectedStatus,
    selectedLocation,
    dateFilter,
    sortBy,
  ]);

  const handleReset = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedType('all');
    setSelectedStatus('All');
    setSelectedLocation('All');
    setDateFilter('');
    setSortBy('relevant');
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">
              Search Lost &amp; Found Items
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Filter by category, report type, campus building, date, or match status
            </p>
          </div>

          {/* Interactive Type Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
            {(['all', 'lost', 'found'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  selectedType === t
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All Reports' : `${t} Items`}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input + Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search item name, keywords, or report ID (e.g., Black Earbuds)..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              aria-label="Filter by location"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter by status"
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1 flex items-center justify-end">
            <button
              type="button"
              onClick={handleReset}
              title="Reset filters"
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center justify-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date Filter & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800 tabular-nums">
              Showing {filteredItems.length} of {items.length} reports
            </span>
            <span aria-hidden="true">·</span>
            <label className="inline-flex items-center gap-2">
              <span>Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-2 py-1 rounded-lg border border-slate-200 text-xs tabular-nums"
              />
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {(
                [
                  { id: 'relevant', label: 'Most Relevant' },
                  { id: 'newest', label: 'Newest' },
                  { id: 'oldest', label: 'Oldest' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSortBy(opt.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    sortBy === opt.id
                      ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <p className="text-base font-bold text-slate-900">
            No items match your current filter criteria
          </p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try clearing your search query or switching to “All Categories” to inspect all
            campus reports.
          </p>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const linkedMatch = matches.find(
              (m) => m.lostItemId === item.id || m.foundItemId === item.id
            );

            return (
              <article
                key={item.id}
                className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-300 overflow-hidden transition-all flex flex-col"
              >
                <div
                  onClick={() => onSelectItem(item)}
                  className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
                >
                  <ItemImage
                    src={item.image}
                    alt={item.title}
                    category={item.category}
                    className="w-full h-full hover:scale-103 transition-transform duration-200"
                  />
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <span
                        className={
                          item.type === 'lost'
                            ? 'text-amber-700 font-semibold'
                            : 'text-blue-700 font-semibold'
                        }
                      >
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.status === 'Returned'
                            ? 'text-emerald-700 font-semibold'
                            : item.status === 'Possible Match'
                            ? 'text-indigo-700 font-semibold'
                            : 'text-slate-600'
                        }
                      >
                        {item.status}
                      </span>
                    </div>

                    <h3
                      onClick={() => onSelectItem(item)}
                      className="text-base font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition-colors"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </span>
                      <span className="tabular-nums font-mono">{item.date}</span>
                    </div>

                    {linkedMatch && (
                      <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                          <Sparkles className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono tabular-nums">
                            {linkedMatch.matchScore}% Possible Match
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenMatchModal(linkedMatch)}
                          className="text-xs font-semibold text-indigo-700 underline hover:text-indigo-900 cursor-pointer whitespace-nowrap"
                        >
                          View Match
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectItem(item)}
                      className="w-full py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
