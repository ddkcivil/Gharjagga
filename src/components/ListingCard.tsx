import React from 'react';
import { Listing } from '../types';
import { formatNepaliArea } from '../utils/converters';
import { MapPin, ArrowUpRight, Check, Heart, Printer } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
  onClick: (listing: Listing) => void;
  isAdmin?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
  onPrint?: (listing: Listing) => void;
  isCompared?: boolean;
  onToggleCompare?: (id: string) => void;
}

export default function ListingCard({ listing, onClick, isAdmin = false, isFavorite = false, onToggleFavorite, onPrint, isCompared = false, onToggleCompare }: ListingCardProps) {
  // Convert area units for secondary display (Sq. Ft.)
  const isTerai = listing.landType === 'Terai';
  const displayArea = formatNepaliArea(listing.landType, listing.area);

  // Calculate Sq. Ft. roughly for secondary text
  let sqFt = 0;
  if (isTerai) {
    const b = listing.area.bigha || 0;
    const k = listing.area.kattha || 0;
    const d = listing.area.dhur || 0;
    sqFt = (b * 72900) + (k * 3645) + (d * 182.25);
  } else {
    const r = listing.area.ropani || 0;
    const a = listing.area.aana || 0;
    const p = listing.area.paisa || 0;
    const dm = listing.area.daam || 0;
    sqFt = (r * 5476) + (a * 342.25) + (p * 85.56) + (dm * 21.39);
  }

  // Get dynamic image or fallback
  const propertyImage = listing.photos && listing.photos[0] ? listing.photos[0] : '/src/assets/images/nepal_plotting_land_1790864925005.jpg';

  return (
    <div className="group bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-350 flex flex-col h-full">
      {/* Property Image & Scrim */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={propertyImage}
          alt={listing.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Simple Gradient overlay for premium contrast (allowed) */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent pointer-events-none" />

        {/* Favorite toggle & Compare toggle */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {onToggleCompare && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleCompare(listing.id); }}
              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md shadow-sm transition-all cursor-pointer ${
                isCompared 
                  ? 'bg-amber-700 text-white' 
                  : 'bg-white/90 hover:bg-white text-neutral-800'
              }`}
            >
              {isCompared ? '✓ Comparing' : '+ Compare'}
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
              className="p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors cursor-pointer"
            >
              <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : 'text-neutral-400'} />
            </button>
          )}
        </div>

        {/* Floating marker indicators - unboxed label text ONLY, no badges */}
        <div className="absolute bottom-3 left-3 text-white font-mono text-xs font-semibold drop-shadow-sm flex items-center gap-1">
          <MapPin size={12} />
          {listing.municipality}, W-{listing.ward}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          {/* Editorial No-badge sandwich: quiet 1-line text kicker instead of pill badges */}
          <div className="text-[10px] uppercase tracking-widest font-mono text-amber-800 font-semibold">
            {listing.landType} Plot · Access {listing.accessRoadWidth} Ft Road
          </div>

          <h3 className="font-serif text-lg font-bold text-neutral-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {listing.title}
          </h3>

          <p className="text-xs text-neutral-500 line-clamp-2">
            {listing.description}
          </p>
        </div>

        {/* Key specifications - Clean unboxed text with subtle typographic separators */}
        <div className="border-t border-b border-neutral-100 py-2.5 my-1 text-xs text-neutral-600 flex flex-col gap-1.5 font-mono">
          <div className="flex justify-between">
            <span className="text-neutral-400">Area Measure:</span>
            <span className="font-medium text-neutral-800">{displayArea}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Sq. Ft. Equivalent:</span>
            <span className="font-medium text-neutral-800">~{sqFt.toLocaleString('en-US')} Sq. Ft.</span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-neutral-400 mt-1">
            <span>Promotion Tier: {listing.serviceCategory}</span>
            <span>·</span>
            <span className={`${listing.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
              Payment: {listing.paymentStatus}
            </span>
          </div>
        </div>

        {/* Dynamic Price Display depending on Role and Approval */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase font-mono tracking-wider">
              {isAdmin ? 'Secret expected / Approved' : 'Approved Guide Budget'}
            </span>
            <div className="flex items-baseline gap-1.5">
              {isAdmin || listing.showPriceToPublic ? (
                <span className="text-base font-bold text-amber-900 font-mono">
                  NPR {listing.guidePrice.toLocaleString('en-US')}
                </span>
              ) : (
                <span className="text-xs font-semibold text-neutral-500 font-sans italic bg-neutral-100/50 py-0.5 px-2 rounded border border-neutral-200/40">
                  Price on Request
                </span>
              )}
              {isAdmin && (
                <span className="text-[10px] text-neutral-400 line-through font-mono">
                  (Exp: {listing.expectedPrice.toLocaleString('en-US')})
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrint(listing); }}
                className="p-2 text-xs text-neutral-600 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:text-amber-800 transition-all cursor-pointer"
                title="Print Government Malpot Sheet"
              >
                <Printer size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={() => onClick(listing)}
              className="p-2 text-xs font-semibold text-neutral-900 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:border-amber-800 hover:text-amber-800 transition-all flex items-center gap-1 shrink-0 font-mono cursor-pointer"
            >
              Details
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
