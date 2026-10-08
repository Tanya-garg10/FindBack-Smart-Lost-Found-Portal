import React, { useState } from 'react';
import { PackageSearch } from 'lucide-react';

interface ItemImageProps {
  src: string;
  alt: string;
  category?: string;
  className?: string;
}

export const ItemImage: React.FC<ItemImageProps> = ({ src, alt, category, className = '' }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 text-slate-500 p-4 ${className}`}
      >
        <PackageSearch className="w-8 h-8 text-indigo-500 mb-1.5 opacity-80" />
        <span className="text-xs font-medium text-slate-700 text-center line-clamp-1">{alt}</span>
        {category && <span className="text-[11px] text-slate-400 mt-0.5">{category}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`object-cover ${className}`}
    />
  );
};
