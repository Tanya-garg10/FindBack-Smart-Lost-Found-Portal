import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  BellPlus,
  Check,
  CheckCircle2,
  FileText,
  MapPin,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CampusItem, ItemCategory, ItemMatch } from '../types';
import { ItemImage } from './ItemImage';

interface DashboardViewProps {
  items: CampusItem[];
  matches: ItemMatch[];
  onReportLost: () => void;
  onReportFound: () => void;
  onSelectItem: (item: CampusItem) => void;
  onOpenMatchModal: (match: ItemMatch) => void;
  onCreateAlert: (queryText: string) => void;
}

const QUICK_CHIPS: ItemCategory[] = ['Electronics', 'ID Cards', 'Bags', 'Stationery'];

const ALL_CATEGORIES: ItemCategory[] = [
  'Electronics',
  'ID Cards',
  'Bags',
  'Stationery',
  'Clothing',
  'Accessories',
  'Other',
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  items,
  matches,
  onReportLost,
  onReportFound,
  onSelectItem,
  onOpenMatchModal,
  onCreateAlert,
}) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [exploreSearch, setExploreSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');

  const locations = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => set.add(i.location));
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = (exploreSearch || heroSearch).trim().toLowerCase();
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedLocation !== 'All' && item.location !== selectedLocation) return false;
      if (selectedDate && item.date !== selectedDate) return false;
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (q) {
        const hay = `${item.title} ${item.description} ${item.category} ${item.location}`.toLowerCase();
        return hay.includes(q);
      }
      return true;
    });
  }, [
    items,
    exploreSearch,
    heroSearch,
    selectedCategory,
    selectedLocation,
    selectedDate,
    selectedType,
  ]);

  const topMatch = matches[0];

  const handleHeroChipClick = (cat: ItemCategory) => {
    setSelectedCategory(cat);
    const el = document.getElementById('explore-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-16 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Side */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>CAMPUS LOST &amp; FOUND</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-bold text-slate-950 tracking-tight leading-[1.08] font-display">
              Lost something?
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Let’s find it back.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              FindBack connects lost belongings with the people looking for them — quickly,
              securely, and simply.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <button
                type="button"
                onClick={onReportLost}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                Report Lost Item
              </button>
              <button
                type="button"
                onClick={onReportFound}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/90 text-sm font-semibold shadow-2xs hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                I Found Something
              </button>
            </div>

            <p className="text-xs font-medium text-slate-500 pt-1 tabular-nums">
              <strong className="text-slate-800">2,480+</strong> items reported{' '}
              <span className="mx-1.5 text-slate-300">•</span>{' '}
              <strong className="text-slate-800">1,860</strong> recovered
            </p>
          </div>

          {/* Right Side: Floating Search Panel & Subtle Floating Item Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500">
                  Instant Campus Search
                </label>
                <div className="relative flex items-center">
                  <Search className="w-5 h-5 text-blue-600 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search your lost item…"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick Category Buttons */}
              <div className="space-y-2.5">
                <span className="text-xs font-medium text-slate-400">Popular categories</span>
                <div className="flex flex-wrap items-center gap-2">
                  {QUICK_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleHeroChipClick(chip)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedCategory === chip
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border-slate-200/80'
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floating Item Preview Cards inside the panel */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-semibold text-slate-400">
                  Live Campus Activity
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      title: 'Black Earbuds',
                      place: 'Central Library',
                      note: '92% Match',
                      itemRef: items[0],
                    },
                    {
                      title: 'Student ID',
                      place: 'Computer Lab',
                      note: 'Reported',
                      itemRef: items[1],
                    },
                    {
                      title: 'Black Backpack',
                      place: 'Cafeteria',
                      note: 'Found',
                      itemRef: items[2],
                    },
                  ].map((card) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => card.itemRef && onSelectItem(card.itemRef)}
                      className="text-left p-3 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                    >
                      <p className="text-xs font-bold text-slate-900 truncate">{card.title}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{card.place}</p>
                      <p className="text-[11px] font-semibold text-blue-600 mt-1">{card.note}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPACT STATISTICS STRIP */}
      <section aria-label="Platform Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-2xl font-bold text-slate-950 font-mono tabular-nums">2,480</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Total Reports</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-2xl font-bold text-slate-950 font-mono tabular-nums">1,860</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Items Recovered</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-2xl font-bold text-blue-600 font-mono tabular-nums">420</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Active Matches</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 flex items-center justify-between shadow-2xs">
            <div>
              <p className="text-2xl font-bold text-violet-600 font-mono tabular-nums">74%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Recovery Rate</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. SMART MATCH EXPERIENCE ("We found something that might be yours.") */}
      {topMatch && (
        <section className="bg-gradient-to-br from-blue-50/70 via-white to-violet-50/70 rounded-3xl border border-blue-200/80 p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl mb-8 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span>SMART MATCH EXPERIENCE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
              We found something that might be yours.
            </h2>
            <p className="text-sm text-slate-600">
              Our similarity engine compares category, description, location, and date automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Connected Lost & Found Cards */}
            <div className="lg:col-span-7 space-y-3">
              {/* YOUR LOST ITEM */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-amber-600">
                    YOUR LOST ITEM
                  </p>
                  <h3 className="text-lg font-bold text-slate-950">Black Boat Earbuds</h3>
                  <p className="text-xs text-slate-500">
                    Reported: <strong className="text-slate-700">18 Sept</strong> · Location:{' '}
                    <strong className="text-slate-700">Library</strong>
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">FB-2026-101</span>
              </div>

              {/* Downward Connector */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* POSSIBLE MATCH */}
              <div className="bg-white rounded-2xl border-2 border-blue-500/80 p-5 shadow-sm flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold tracking-wider uppercase text-blue-600">
                    POSSIBLE MATCH
                  </p>
                  <h3 className="text-lg font-bold text-slate-950">Black Wireless Earbuds</h3>
                  <p className="text-xs text-slate-500">
                    Found: <strong className="text-slate-700">18 Sept</strong> · Location:{' '}
                    <strong className="text-slate-700">Library</strong>
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-blue-600">Matched ✓</span>
              </div>
            </div>

            {/* Right: Circular 92% Indicator + Criteria + View Match Button */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 text-center space-y-5 shadow-2xs">
              <div className="relative w-28 h-28 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-violet-600 p-1.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-950 font-mono tabular-nums">
                    {topMatch.matchScore}%
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600">Possible Match</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left text-xs font-medium text-slate-700 max-w-xs mx-auto">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Same category</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Similar description</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Same location</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Same date</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenMatchModal(topMatch)}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                View Match
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. EXPLORE ITEMS ("Recently Reported") */}
      <section id="explore-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950 font-display">Recently Reported</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Browse the latest lost and found items around your campus.
            </p>
          </div>

          {/* Lost / Found Segmented Filter */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl self-start">
            {(['all', 'lost', 'found'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedType(t)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-white text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 shadow-2xs">
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={exploreSearch}
              onChange={(e) => setExploreSearch(e.target.value)}
              placeholder="Search by item name or keyword..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Item Grid or Beautiful Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <BellPlus className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-950 font-display">
                No matching items yet
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Don&apos;t worry. We&apos;ll notify you when something similar is reported.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCreateAlert(exploreSearch || heroSearch || selectedCategory)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold shadow-xs hover:opacity-95 transition-opacity cursor-pointer"
            >
              Create Alert
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
                  onClick={() => onSelectItem(item)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <ItemImage
                      src={item.image}
                      alt={item.title}
                      category={item.category}
                      className="w-full h-full group-hover:scale-102 transition-transform duration-200"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-500">
                          <strong
                            className={
                              item.type === 'lost' ? 'text-amber-600' : 'text-blue-600'
                            }
                          >
                            {item.type === 'lost' ? 'LOST' : 'FOUND'}
                          </strong>{' '}
                          · {item.category}
                        </span>
                        {linkedMatch && (
                          <span className="font-mono font-bold text-blue-600 tabular-nums">
                            {linkedMatch.matchScore}% Match
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-950 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.location}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums shrink-0">{item.date}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 font-semibold text-blue-600 shrink-0">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
