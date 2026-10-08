import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  FileText,
  ImagePlus,
  MapPin,
  Tag,
} from 'lucide-react';
import { CAMPUS_IMAGES } from '../demoData';
import { CampusItem, ItemCategory, ItemType } from '../types';

interface ReportFormViewProps {
  initialType: ItemType;
  onSubmitReport: (
    data: Omit<
      CampusItem,
      'id' | 'reportCode' | 'status' | 'userId' | 'reporterName' | 'createdAt'
    >
  ) => Promise<{ reportCode: string; matchedScore?: number; createdItem: CampusItem }>;
  onViewCreatedItem: (item: CampusItem) => void;
  onBackToHome: () => void;
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

const CAMPUS_LOCATIONS = [
  'Central Library',
  'Computer Lab',
  'Cafeteria',
  'Examination Hall',
  'Seminar Hall',
  'Student Center',
];

const DEFAULT_CATEGORY_IMAGE: Record<ItemCategory, string> = {
  Electronics: CAMPUS_IMAGES.earbuds,
  'ID Cards': CAMPUS_IMAGES.idCard,
  Bags: CAMPUS_IMAGES.backpack,
  Stationery: CAMPUS_IMAGES.calculator,
  Clothing: CAMPUS_IMAGES.backpack,
  Accessories: CAMPUS_IMAGES.earbuds,
  Other: CAMPUS_IMAGES.waterBottle,
};

const STEPS = [
  { num: '01', label: 'Item Details' },
  { num: '02', label: 'Location' },
  { num: '03', label: 'Image' },
  { num: '04', label: 'Review' },
];

export const ReportFormView: React.FC<ReportFormViewProps> = ({
  initialType,
  onSubmitReport,
  onViewCreatedItem,
  onBackToHome,
}) => {
  const [step, setStep] = useState<number>(1);
  const [formType, setFormType] = useState<ItemType>(initialType);

  useEffect(() => {
    setFormType(initialType);
  }, [initialType]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('2026-09-18');
  const [location, setLocation] = useState('Central Library');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{
    reportCode: string;
    matchedScore?: number;
    createdItem: CampusItem;
  } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 450 * 1024) {
      setErrorMsg('Please select an image smaller than 450 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (title.trim().length < 2) {
        setErrorMsg('Please enter an item name.');
        return;
      }
      if (description.trim().length < 5) {
        setErrorMsg('Please enter a short description.');
        return;
      }
    }
    if (step === 2 && location.trim().length < 2) {
      setErrorMsg('Please enter the campus location.');
      return;
    }
    setErrorMsg(null);
    setStep((s) => Math.min(4, s + 1));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const finalImage = imagePreview || DEFAULT_CATEGORY_IMAGE[category];
      const res = await onSubmitReport({
        title: title.trim(),
        description: description.trim(),
        category,
        type: formType,
        date,
        location: location.trim(),
        image: finalImage,
        isPublic: true,
      });
      setSubmittedResult(res);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-5 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Report Registered
          </p>
          <h2 className="text-2xl font-bold text-slate-950 font-display">
            {submittedResult.createdItem.title}
          </h2>
          <p className="text-xs text-slate-500">
            Reference ID:{' '}
            <strong className="font-mono text-slate-900">{submittedResult.reportCode}</strong>
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onViewCreatedItem(submittedResult.createdItem)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-semibold cursor-pointer"
          >
            View Item Page
          </button>
          <button
            type="button"
            onClick={onBackToHome}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-6">
      {/* Top 4-Step Progress Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="grid grid-cols-4 gap-2">
          {STEPS.map((s, idx) => {
            const stepNum = idx + 1;
            const isCurrent = step === stepNum;
            const isDone = step > stepNum;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (stepNum < step) setStep(stepNum);
                }}
                className={`text-left p-2.5 rounded-xl transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50/80 text-blue-700'
                    : isDone
                    ? 'text-emerald-700 hover:bg-slate-50'
                    : 'text-slate-400'
                }`}
              >
                <span className="text-[11px] font-mono font-bold block">{s.num}</span>
                <span className="text-xs font-semibold">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Multi-Step Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
            Tell us what happened
          </h1>

          {/* Toggle: I Lost Something | I Found Something */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200/70">
            <button
              type="button"
              onClick={() => setFormType('lost')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                formType === 'lost'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Lost Something
            </button>
            <button
              type="button"
              onClick={() => setFormType('found')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                formType === 'found'
                  ? 'bg-white text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              I Found Something
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
            {errorMsg}
          </div>
        )}

        {/* STEP 01: ITEM DETAILS */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Item Name</label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Black Wireless Earbuds"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-4 py-3 text-sm rounded-2xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Description</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe brand, color, and distinguishing features..."
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 02: LOCATION & DATE */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  list="campus-locs"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Central Library"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none"
                />
                <datalist id="campus-locs">
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-2xl border border-slate-200 focus:border-blue-500 focus:outline-none tabular-nums"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 03: DRAG & DROP IMAGE CARD */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-3xl p-10 text-center bg-slate-50/70 hover:bg-blue-50/30 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ImagePlus className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Drop your item photo here</p>
              <p className="text-xs text-slate-500 mt-1">
                or <span className="text-blue-600 font-semibold underline">Browse files</span>
              </p>
              {imagePreview && (
                <p className="text-xs font-semibold text-emerald-600 mt-3">
                  Photo attached and ready ✓
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* STEP 04: REVIEW */}
        {step === 4 && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Report Type</span>
              <span className="font-bold uppercase text-blue-600">{formType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Item Name</span>
              <span className="font-bold text-slate-900">{title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Category</span>
              <span className="font-semibold text-slate-800">{category}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Location &amp; Date</span>
              <span className="font-semibold text-slate-800">
                {location} · {date}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200/70">
              <span className="text-slate-500 block mb-1">Description</span>
              <p className="text-slate-800 leading-relaxed">{description}</p>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons: Back / Continue */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step > 1 ? setStep(step - 1) : onBackToHome())}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
