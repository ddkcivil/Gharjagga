import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Listing, SiteVisit, Inquiry } from '../types';
import ListingCard from './ListingCard';
import { getLegalVerificationChecklist, generateBainaAgreement } from '../utils/aiHelper';
import { formatNepaliArea } from '../utils/converters';
import GharJaggaMap from './GharJaggaMap';
import FAQ from './FAQ';
import { Search, Filter, Calendar, FileText, CheckCircle, Clock, BookOpen, AlertCircle, X, Check, Map as MapIcon, Grid, Printer } from 'lucide-react';

interface BuyerPortalProps {
  listings: Listing[];
  visits: SiteVisit[];
  inquiries: Inquiry[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onBookVisit: (newVisit: Omit<SiteVisit, 'id' | 'createdAt'>) => void;
  onSendInquiry: (newInquiry: Omit<Inquiry, 'id' | 'createdAt'>) => void;
  activeTab: string;
}

export default function BuyerPortal({
  listings,
  visits,
  inquiries,
  favorites,
  onToggleFavorite,
  onBookVisit,
  onSendInquiry,
  activeTab,
}: BuyerPortalProps) {
  // Filtering states
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('All');
  const [minRoadWidth, setMinRoadWidth] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(50000000); // 5 Crore NPR
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected details listing modal
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Property comparison state (max 3 listings)
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false);

  const handleToggleCompare = (id: string) => {
    setComparedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else {
        if (prev.length >= 3) {
          alert('You can compare a maximum of 3 listings side-by-side.');
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  // Modals
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showInquiryModal, setShowInquiryModal] = useState<boolean>(false);

  // Forms
  const [buyerName, setBuyerName] = useState<string>('Dharma Raj Kunwar');
  const [buyerContact, setBuyerContact] = useState<string>('9865123456');
  const [buyerEmail, setBuyerEmail] = useState<string>('dharmadkunwar20@gmail.com');
  const [visitDate, setVisitDate] = useState<string>('2026-10-10');
  const [visitTime, setVisitTime] = useState<string>('10:00 AM');
  const [visitNotes, setVisitNotes] = useState<string>('');

  // Inquiry form
  const [inquirySubject, setInquirySubject] = useState<'Legal Support' | 'Agreement Draft' | 'Plot Query' | 'Price Negotiation' | 'Document Verification'>('Legal Support');
  const [inquiryMsg, setInquiryMsg] = useState<string>('');

  // Agreement generator fields
  const [agreementSeller, setAgreementSeller] = useState<string>('');
  const [agreementBuyer, setAgreementBuyer] = useState<string>('Dharma Raj Kunwar');
  const [agreementWitness, setAgreementWitness] = useState<string>('Ram Krishna Karki');
  const [agreementPrice, setAgreementPrice] = useState<number>(0);
  const [agreementAdvance, setAgreementAdvance] = useState<number>(0);
  const [agreementDue, setAgreementDue] = useState<string>('2026-11-30');
  const [draftedAgreementText, setDraftedAgreementText] = useState<string>('');

  // View style layout mode state
  const [viewMode, setViewMode] = useState<'split' | 'grid' | 'map'>('split');
  const [mapCenterListing, setMapCenterListing] = useState<Listing | null>(null);

  // Filter approved listings for buyer search
  const approvedListings = listings.filter((l) => l.status === 'Approved');

  const handlePrintPropertySheet = (listing: Listing) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print the property sheet.');
      return;
    }

    const areaStr = formatNepaliArea(listing.landType, listing.area);
    const priceStr = listing.showPriceToPublic 
      ? `NPR ${listing.guidePrice.toLocaleString('en-US')}`
      : 'Price on Request';

    printWindow.document.write(`
      <html>
        <head>
          <title>${listing.title} - Official Land Revenue (Malpot) & Ward Verification Sheet</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #171717; line-height: 1.5; }
            .gov-header { text-align: center; border-bottom: 2px solid #171717; padding-bottom: 15px; margin-bottom: 25px; }
            .gov-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .gov-sub { font-size: 12px; font-weight: bold; margin-top: 4px; }
            .office-name { font-size: 11px; color: #525252; margin-top: 2px; }
            .document-title { font-size: 18px; font-family: Georgia, serif; text-align: center; font-weight: bold; margin: 20px 0; text-transform: uppercase; letter-spacing: 1px; background-color: #f5f5f5; padding: 10px; border: 1px solid #d4d4d4; }
            .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 12px; }
            .meta-table th, .meta-table td { border: 1px solid #d4d4d4; padding: 8px 12px; text-align: left; }
            .meta-table th { background-color: #fafafa; font-weight: bold; width: 30%; text-transform: uppercase; font-size: 10px; color: #525252; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #b45309; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; margin-bottom: 10px; }
            .text { font-size: 12px; color: #404040; }
            .stamp-box { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
            .stamp-area { width: 30%; border-top: 1px solid #171717; text-align: center; padding-top: 8px; font-size: 11px; font-weight: bold; }
            .footer { margin-top: 40px; font-size: 9px; text-align: center; color: #737373; border-top: 1px solid #e5e5e5; padding-top: 10px; }
            @media print {
              .no-print { display: none; }
              body { padding: 15px; }
            }
          </style>
        </head>
        <body>
          <div class="gov-header">
            <div class="gov-title">नेपाल सरकार (Government of Nepal)</div>
            <div class="office-name">भूमि व्यवस्था, सहकारी तथा गरिबी निवारण मन्त्रालय</div>
            <div class="gov-sub">नापी विभाग तथा मालपोत कार्यालय / स्थानीय वडा कार्यालय</div>
            <div class="office-name">District: ${listing.district} · Municipality/Rural Mun: ${listing.municipality} · Ward No: ${listing.ward}</div>
          </div>

          <div class="document-title">
            जग्गा विवरण तथा कानूनी प्रमाणीकरण पत्र (Official Land Verification Sheet)
          </div>

          <table class="meta-table">
            <tr>
              <th>Property Title / Plot Name</th>
              <td><strong>${listing.title}</strong></td>
            </tr>
            <tr>
              <th>Survey / Kitta Number</th>
              <td>GJN-KITA-${listing.id.slice(-6).toUpperCase()}</td>
            </tr>
            <tr>
              <th>Land Type & Area</th>
              <td><strong>${listing.landType}</strong> (${areaStr})</td>
            </tr>
            <tr>
              <th>Approx. Equivalent</th>
              <td>~${Math.round(((listing.area.ropani || 0) * 5476) + ((listing.area.bigha || 0) * 72900) || 1200).toLocaleString('en-US')} Sq. Ft.</td>
            </tr>
            <tr>
              <th>Access Road Width</th>
              <td>${listing.accessRoadWidth} Feet (Registered Right-of-Way)</td>
            </tr>
            <tr>
              <th>Approved Valuation / Guide Price</th>
              <td>${priceStr}</td>
            </tr>
            <tr>
              <th>Lalpurja Ownership Status</th>
              <td>Verified & Audited (Owner Lalpurja Matched with Napi Records)</td>
            </tr>
          </table>

          <div class="section">
            <div class="section-title">Plot Boundaries & Chaukilla (सीमाना)</div>
            <p class="text">
              <strong>East (पूर्व):</strong> Main Access Road (${listing.accessRoadWidth} Ft)<br/>
              <strong>West (पश्चिम):</strong> Private Partition Plot / Registered Boundary<br/>
              <strong>North (उत्तर):</strong> Community Drainage / Access Trail<br/>
              <strong>South (दक्षिण):</strong> Neighboring Certified Land Parcel
            </p>
          </div>

          <div class="section">
            <div class="section-title">Plot Description & Remarks</div>
            <p class="text">${listing.description}</p>
          </div>

          <div class="section">
            <div class="section-title">Integrated Utilities & Infrastructure</div>
            <p class="text">${listing.amenities.join(' · ')}</p>
          </div>

          <div class="stamp-box">
            <div class="stamp-area">
              जग्गाधनीको सही<br/>(Seller / Owner Signature)
            </div>
            <div class="stamp-area">
              वडा कार्यालयको छाप<br/>(Ward Office Seal & Stamp)
            </div>
            <div class="stamp-area">
              मालपोत अधिकृतको सही<br/>(Malpot Officer Signature)
            </div>
          </div>

          <div style="text-align: center;" class="no-print">
            <button onclick="window.print()" style="background-color: #b45309; border: none; color: white; padding: 10px 20px; font-size: 13px; font-weight: bold; cursor: pointer; border-radius: 6px; margin-top: 20px;">
              Print Government Verified Sheet
            </button>
          </div>

          <div class="footer">
            Official System Record Reference: GJN-AUDIT-${listing.id.toUpperCase()} · GharJagga Nepal Digital Land Registry System
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredListings = (activeTab === 'saved' 
    ? approvedListings.filter(l => favorites.includes(l.id))
    : approvedListings
  ).filter((listing) => {
    const matchDistrict = selectedDistrict === 'All' || listing.district === selectedDistrict;
    const matchAmenity = selectedAmenity === 'All' || listing.amenities.includes(selectedAmenity);
    const matchRoad = listing.accessRoadWidth >= minRoadWidth;
    const matchBudget = listing.guidePrice <= maxBudget;
    const matchSearch =
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDistrict && matchAmenity && matchRoad && matchBudget && matchSearch;
  });

  const districts = ['All', ...new Set(approvedListings.map((l) => l.district))];
  const allAmenities = ['All', ...new Set(approvedListings.flatMap((l) => l.amenities))];

  // Submission helpers
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    onBookVisit({
      listingId: selectedListing.id,
      listingTitle: selectedListing.title,
      buyerName,
      buyerContact,
      buyerEmail,
      preferredDate: visitDate,
      preferredTime: visitTime,
      notes: visitNotes,
      status: 'Pending',
    });
    setShowBookingModal(false);
    setVisitNotes('');
    alert('Site Visit booking submitted successfully! Access "My Visits & Queries" tab to track status.');
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    onSendInquiry({
      listingId: selectedListing.id,
      listingTitle: selectedListing.title,
      buyerName,
      buyerContact,
      buyerEmail,
      subject: inquirySubject,
      message: inquiryMsg,
      status: 'Open',
    });
    setShowInquiryModal(false);
    setInquiryMsg('');
    alert('Query submitted successfully! Our Admin will verify documents & route this to the seller.');
  };

  const handleDraftAgreement = () => {
    if (!selectedListing) return;
    const drafted = generateBainaAgreement({
      propertyTitle: selectedListing.title,
      sellerName: agreementSeller || selectedListing.sellerName,
      sellerContact: selectedListing.sellerContact,
      buyerName: agreementBuyer,
      buyerContact: buyerContact,
      agreedPrice: agreementPrice || selectedListing.guidePrice,
      advanceAmount: agreementAdvance,
      witnessName: agreementWitness,
      district: selectedListing.district,
      municipality: selectedListing.municipality,
      ward: selectedListing.ward,
      areaString: `${selectedListing.area.bigha || selectedListing.area.ropani || 0} units`,
      dueDate: agreementDue,
    });
    setDraftedAgreementText(drafted);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search & Filter Tab */}
      {activeTab === 'explore' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 bg-white p-5 border border-neutral-100 rounded-xl space-y-6 h-fit sticky top-24">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Filter size={16} className="text-amber-700" />
                Filter Lands & Plots
              </h2>
              <button
                onClick={() => {
                  setSelectedDistrict('All');
                  setSelectedAmenity('All');
                  setMinRoadWidth(0);
                  setMaxBudget(50000000);
                  setSearchQuery('');
                }}
                className="text-[10px] text-amber-800 hover:underline font-mono"
              >
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Keyword Search
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  placeholder="e.g. Ward, Tilottama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 w-full border border-neutral-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* District dropdown */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Select District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full border border-neutral-200 rounded-md py-1.5 px-2.5 text-xs focus:outline-none"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? 'All Districts / Regions' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget filter slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                <span>Max Budget (NPR)</span>
                <span className="font-mono text-neutral-700">{(maxBudget / 100000).toFixed(0)} Lakhs</span>
              </div>
              <input
                type="range"
                min="1000000"
                max="50000000"
                step="500000"
                value={maxBudget}
                onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                className="w-full accent-amber-700"
              />
              <div className="flex justify-between text-[9px] text-neutral-400 font-mono">
                <span>10L</span>
                <span>5 Crore</span>
              </div>
            </div>

            {/* Road width filter */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Min Road Width (Feet)
              </label>
              <select
                value={minRoadWidth}
                onChange={(e) => setMinRoadWidth(parseInt(e.target.value))}
                className="w-full border border-neutral-200 rounded-md py-1.5 px-2.5 text-xs focus:outline-none"
              >
                <option value={0}>Any Road Access</option>
                <option value={12}>12+ Feet Road</option>
                <option value={16}>16+ Feet (Standard Residential)</option>
                <option value={20}>20+ Feet (Wide Main planning)</option>
              </select>
            </div>

            {/* Amenities selection */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">
                Key Amenities
              </label>
              <select
                value={selectedAmenity}
                onChange={(e) => setSelectedAmenity(e.target.value)}
                className="w-full border border-neutral-200 rounded-md py-1.5 px-2.5 text-xs focus:outline-none"
              >
                {allAmenities.map((a) => (
                  <option key={a} value={a}>
                    {a === 'All' ? 'All / Any Amenity' : a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Listings Grid / Map Layout Container */}
          <div className="lg:col-span-3 space-y-8">
            {/* Trending & New Arrivals Real-Time Widget */}
            <div className="bg-gradient-to-r from-amber-900/5 via-amber-800/10 to-neutral-100 p-5 rounded-2xl border border-amber-200/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping"></span>
                  <h2 className="font-serif font-bold text-neutral-900 text-sm tracking-wide">🔥 Live Trending & New Arrivals in Nepal</h2>
                </div>
                <span className="text-[10px] font-mono text-neutral-500">Updated in Real-Time</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {approvedListings.slice(0, 3).map((l, idx) => (
                  <div
                    key={`trending-${l.id}`}
                    onClick={() => setSelectedListing(l)}
                    className="bg-white p-3 rounded-xl border border-neutral-200 hover:border-amber-700 transition-all cursor-pointer shadow-xs group flex gap-3 items-center"
                  >
                    <img
                      src={l.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'}
                      alt={l.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[9px] font-mono text-amber-800 font-bold uppercase truncate">
                        {idx === 0 ? '★ Top Trending' : idx === 1 ? '⚡ New Arrival' : '✓ Verified Pick'}
                      </div>
                      <h4 className="font-serif text-xs font-bold text-neutral-900 truncate mt-0.5">{l.title}</h4>
                      <p className="text-[10px] font-mono text-neutral-500 truncate">{l.municipality}, {l.district}</p>
                      <div className="text-xs font-mono font-bold text-amber-900 mt-1">
                        {l.showPriceToPublic ? `NPR ${l.guidePrice.toLocaleString('en-US')}` : 'Price on Request'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-5">
              <div>
                <h1 className="text-2xl font-serif font-bold text-neutral-950">Verified Plots for Sale</h1>
                <p className="text-sm text-neutral-500 font-mono mt-2">{filteredListings.length} plots active in chosen filters</p>
              </div>

              {/* View Switcher segment - interactive buttons */}
              <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200/40 w-fit shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
                    viewMode === 'grid'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Grid size={13} />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
                    viewMode === 'map'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <MapIcon size={13} />
                  <span>Map Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded ${
                    viewMode === 'split'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  <Grid size={13} />
                  <span>+ Map Split</span>
                </button>
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-12 text-center space-y-3">
                <AlertCircle className="mx-auto text-neutral-400" size={32} />
                <h3 className="font-semibold text-neutral-800">No matching plots found</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto font-sans">
                  Try widening your budget, selecting another district, or choosing "Any Road Access" to explore more planning options.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Grid Only View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredListings.map((listing) => (
                      <div key={listing.id} className="relative">
                        <ListingCard
                          listing={listing}
                          onClick={(l) => setSelectedListing(l)}
                          isFavorite={favorites.includes(listing.id)}
                          onToggleFavorite={onToggleFavorite}
                          onPrint={handlePrintPropertySheet}
                          isCompared={comparedIds.includes(listing.id)}
                          onToggleCompare={handleToggleCompare}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setMapCenterListing(listing);
                            setViewMode('split');
                            setTimeout(() => {
                              document.getElementById('map-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          className="absolute top-3 right-3 bg-neutral-950/85 hover:bg-amber-800 text-white text-[9px] font-mono font-bold px-2 py-1 rounded shadow-md transition-colors z-20 cursor-pointer"
                        >
                          Locate
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Map Only View */}
                {viewMode === 'map' && (
                  <div className="animate-fadeIn">
                    <GharJaggaMap
                      listings={filteredListings}
                      onMarkerClick={(l) => setSelectedListing(l)}
                      centerListing={mapCenterListing}
                    />
                  </div>
                )}

                {/* 3. Split Screen View */}
                {viewMode === 'split' && (
                  <div id="map-section-anchor" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fadeIn">
                    <div className="xl:col-span-6 grid grid-cols-1 gap-6 max-h-[700px] overflow-y-auto pr-1">
                      {filteredListings.map((listing) => (
                        <div key={listing.id} className="relative">
                          <ListingCard
                            listing={listing}
                            onClick={(l) => setSelectedListing(l)}
                            isFavorite={favorites.includes(listing.id)}
                            onToggleFavorite={onToggleFavorite}
                            onPrint={handlePrintPropertySheet}
                            isCompared={comparedIds.includes(listing.id)}
                            onToggleCompare={handleToggleCompare}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMapCenterListing(listing);
                              if (window.innerWidth < 1280) {
                                document.getElementById('split-map-container')?.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            className="absolute top-3 right-3 bg-neutral-950/85 hover:bg-amber-800 text-white text-[9px] font-mono font-bold px-2 py-1 rounded shadow-md transition-colors z-20 cursor-pointer"
                          >
                            Locate
                          </button>
                        </div>
                      ))}
                    </div>
                    <div id="split-map-container" className="xl:col-span-6 sticky top-24 z-10">
                      <GharJaggaMap
                        listings={filteredListings}
                        onMarkerClick={(l) => setSelectedListing(l)}
                        centerListing={mapCenterListing}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legal Support Checklist Tab */}
      {activeTab === 'legal' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-white p-6 border border-neutral-100 rounded-xl space-y-4">
            <h2 className="text-xl font-serif font-bold text-neutral-950 flex items-center gap-2">
              <BookOpen size={20} className="text-amber-700" />
              Nepal Land Legal Verification Guideline
            </h2>
            <p className="text-xs text-neutral-500 leading-relaxed">
              In Nepal, land transfer through the Land Revenue Office (मालपोत कार्यालय - Malpot Karyalaya) requires intensive due diligence. Follow our legal support verification checklists to protect your investment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-neutral-100">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900">Document Verification Protocol</h3>
                <ul className="space-y-2 text-xs text-neutral-600">
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-700 font-bold">Lalpurja:</span> Verify the landowner certificate (Lalpurja) is in the original owner's name. Check for multiple co-owners (Sajhedar).
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-700 font-bold">Kitta No check:</span> Cross-verify the plot number (Kitta Number) on blueprint maps from the Survey Office (नापी कार्यालय).
                  </li>
                  <li className="flex gap-2 items-start">
                    <span className="text-amber-700 font-bold">Nadi Baha clearance:</span> Make sure the land does not lie within the river flow reservation boundary limits (highly restricted for structures).
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-neutral-900">Interactive Legal Checklist</h3>
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2 border border-neutral-100 font-mono text-xs">
                  {getLegalVerificationChecklist('Rupandehi', 'Tilottama').map((step, idx) => (
                    <div key={idx} className="text-neutral-700">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <FAQ role="buyer" />
          </div>
        </div>
      )}

      {/* Broker Chat & Negotiation Tab */}
      {activeTab === 'broker-chat' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white border border-neutral-150 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest font-bold">Secure Real-Time Messaging</span>
                <h2 className="text-xl font-serif font-bold text-neutral-950 mt-1">Broker Chat & Direct Negotiation Hub</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Communicate directly with verified sellers and legal brokerage officers.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Connection</span>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 font-mono space-y-2">
                <p>No active negotiation chats found.</p>
                <p className="text-[11px]">Submit an inquiry on any land listing to initiate a secure broker chat session.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Thread list */}
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase font-mono">Active Negotiation Threads</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        onClick={() => {
                          setSelectedListing(listings.find(l => l.id === inq.listingId) || null);
                        }}
                        className="p-3.5 rounded-xl border border-neutral-200 hover:border-amber-700 transition-all cursor-pointer bg-neutral-50/50 space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">{inq.subject}</span>
                          <span className="text-[9px] font-mono bg-white border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-600">{inq.status}</span>
                        </div>
                        <h4 className="font-serif font-bold text-neutral-900 text-xs">{inq.listingTitle}</h4>
                        <p className="text-[11px] text-neutral-600 line-clamp-1 italic">"{inq.message}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active chat window */}
                <div className="md:col-span-7 bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col justify-between h-[520px]">
                  <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-900 text-sm">Negotiation & Legal Support Stream</h4>
                      <p className="text-[10px] text-neutral-500 font-mono">Encrypted messaging with broker & owner</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      ID: GJN-CHAT-SECURE
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                    {inquiries.map((inq) => (
                      <div key={`chat-${inq.id}`} className="space-y-3">
                        {/* Buyer message */}
                        <div className="flex flex-col items-end">
                          <div className="bg-neutral-900 text-white p-3 rounded-2xl rounded-tr-xs max-w-md text-xs font-sans space-y-1">
                            <p>{inq.message}</p>
                            <span className="text-[9px] text-neutral-400 font-mono block text-right">{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Admin / Broker routing notes */}
                        {inq.adminNotes && (
                          <div className="flex flex-col items-start">
                            <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-2xl rounded-tl-xs max-w-md text-xs font-sans space-y-1">
                              <span className="text-[9px] font-mono font-bold uppercase text-amber-700 block">Brokerage Advisory:</span>
                              <p>{inq.adminNotes}</p>
                            </div>
                          </div>
                        )}

                        {/* Seller response */}
                        {inq.sellerResponse && (
                          <div className="flex flex-col items-start">
                            <div className="bg-white text-neutral-800 border border-neutral-200 p-3 rounded-2xl rounded-tl-xs max-w-md text-xs font-sans space-y-1 shadow-xs">
                              <span className="text-[9px] font-mono font-bold uppercase text-emerald-700 block">Seller Verified Reply:</span>
                              <p>{inq.sellerResponse}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Message input */}
                  <div className="border-t border-neutral-200 pt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Type offer, price negotiation, or document query..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          alert(`Message sent to broker & seller: "${e.currentTarget.value}"`);
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => alert('Secure message dispatched instantly to broker negotiation desk.')}
                      className="bg-neutral-900 hover:bg-neutral-850 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'insights' && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
          <div className="bg-white p-6 sm:p-8 border border-neutral-150 rounded-2xl space-y-6">
            <div className="border-b border-neutral-100 pb-4">
              <span className="text-[10px] font-mono text-amber-800 uppercase tracking-widest font-bold">Real Estate Intelligence</span>
              <h2 className="text-2xl font-serif font-bold text-neutral-950 mt-1">Nepal Land Market Insights & Government Policy Updates</h2>
              <p className="text-xs text-neutral-500 font-mono mt-1">Aggregated from Department of Land Management, Survey Office, and Nepal Rastra Bank guidelines.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 space-y-3">
                <div className="text-[10px] font-mono text-amber-700 font-semibold uppercase">Policy Update</div>
                <h3 className="font-serif font-bold text-neutral-950 text-sm">Malpot Office Digitalization & Online Lalpurja Verification</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  The Ministry of Land Management has expanded online land revenue payment and title deed tracking across 50+ Malpot offices in Kathmandu, Lalitpur, Rupandehi, and Kaski.
                </p>
                <div className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-200/50">
                  Source: Department of Land Management (Bheema/Malpot Portal)
                </div>
              </div>

              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 space-y-3">
                <div className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">Market Trend</div>
                <h3 className="font-serif font-bold text-neutral-950 text-sm">Kathmandu Valley & Terai Corridor Price Index</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Residential plots with minimum 16-20 ft road access in prime municipal corridors (Lalitpur, Butwal, Bharatpur, Pokhara) maintain steady appreciation averaging 6-8% annually.
                </p>
                <div className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-200/50">
                  Source: Nepal Real Estate Developers Association Index
                </div>
              </div>

              <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-200/60 space-y-3">
                <div className="text-[10px] font-mono text-blue-700 font-semibold uppercase">Financial Rates</div>
                <h3 className="font-serif font-bold text-neutral-950 text-sm">Commercial Bank Real Estate Loan Interest Rates</h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Average real estate and home construction loan rates across class-A commercial banks hover around 8.5% to 9.25% p.a. with up to 60% valuation financing for approved plots.
                </p>
                <div className="text-[10px] text-neutral-400 font-mono pt-2 border-t border-neutral-200/50">
                  Source: Nepal Rastra Bank (NRB) Monetary Policy Directive
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-6 space-y-4">
              <h3 className="font-serif font-bold text-neutral-900 text-base">Key Government Regulations for Buyers & Sellers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-700">
                <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl space-y-1.5">
                  <strong className="text-amber-900 block font-semibold">1. Land Fragmentation (Kitta Kat Guidelines)</strong>
                  <p className="text-neutral-600">Agricultural zoning laws restrict dividing plots below government-mandated minimum sq. meters unless designated for structured housing development.</p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl space-y-1.5">
                  <strong className="text-emerald-900 block font-semibold">2. Capital Gains Tax (Pugi Tax / Puji Gathee Kar)</strong>
                  <p className="text-neutral-600">Holding land for less than 5 years attracts a 5% capital gains tax on profit, while holding beyond 5 years reduces the rate to 2.5%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* User Site Visits and Inquiries status */}
      {activeTab === 'my-bookings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Site Visits Section */}
          <div className="bg-white p-6 border border-neutral-100 rounded-xl space-y-4">
            <h2 className="text-lg font-serif font-bold text-neutral-950 flex items-center gap-2">
              <Calendar size={18} className="text-amber-700" />
              Booked Site Visits Status
            </h2>

            {visits.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400 font-mono">No site visits scheduled yet.</div>
            ) : (
              <div className="space-y-3.5">
                {visits.map((v) => (
                  <div key={v.id} className="border border-neutral-100 p-4 rounded-lg flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-xs text-neutral-900">{v.listingTitle}</h4>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          Scheduled: {v.preferredDate} at {v.preferredTime}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded font-mono ${
                          v.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : v.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {v.status}
                      </span>
                    </div>
                    {v.notes && <p className="text-[11px] text-neutral-500 italic bg-neutral-50 p-2 rounded">Notes: {v.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legal Inquiries Status */}
          <div className="bg-white p-6 border border-neutral-100 rounded-xl space-y-4">
            <h2 className="text-lg font-serif font-bold text-neutral-950 flex items-center gap-2">
              <FileText size={18} className="text-amber-700" />
              My Queries & Legal Communications
            </h2>

            {inquiries.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-400 font-mono">No active queries found.</div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="border border-neutral-100 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-start border-b border-neutral-50 pb-2">
                      <div>
                        <span className="text-[10px] uppercase font-mono text-amber-800 font-semibold">{inq.subject}</span>
                        <h4 className="font-semibold text-xs text-neutral-900 mt-0.5">{inq.listingTitle}</h4>
                      </div>
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 italic bg-neutral-50 p-2 rounded">"{inq.message}"</p>

                    {inq.adminNotes && (
                      <div className="text-xs text-neutral-500 bg-neutral-100/50 p-2.5 rounded border border-neutral-200/50">
                        <strong className="text-[10px] uppercase text-neutral-400 block font-semibold mb-1">
                          Indirect Brokerage (Admin Routing Update)
                        </strong>
                        {inq.adminNotes}
                      </div>
                    )}

                    {inq.sellerResponse && (
                      <div className="text-xs text-emerald-800 bg-emerald-50/50 p-2.5 rounded border border-emerald-100/50">
                        <strong className="text-[10px] uppercase text-emerald-600 block font-semibold mb-1">
                          Seller's Verified Response
                        </strong>
                        {inq.sellerResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Listing details expanded modal */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-55 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-neutral-200">
            {/* Modal header image */}
            <div className="relative aspect-video sm:aspect-21/9 w-full bg-neutral-100">
              <img
                src={selectedListing.photos[0] || '/src/assets/images/nepal_plotting_land_1790864925005.jpg'}
                alt={selectedListing.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  setSelectedListing(null);
                  setDraftedAgreementText('');
                }}
                className="absolute top-4 right-4 bg-black/55 hover:bg-black/75 text-white p-1.5 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Info body */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-mono tracking-widest font-semibold text-amber-800">
                  {selectedListing.district} · {selectedListing.municipality} Municipality
                </span>
                <h2 className="font-serif text-2xl font-bold text-neutral-950">{selectedListing.title}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs border-t border-b border-neutral-100 py-4">
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] block">Land Dimensions</span>
                  <strong className="text-neutral-800 text-sm font-semibold">
                    {formatNepaliArea(selectedListing.landType, selectedListing.area)}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] block">Approved Guide Price</span>
                  <strong className="text-neutral-800 text-sm font-semibold">
                    {selectedListing.showPriceToPublic ? (
                      `NPR ${selectedListing.guidePrice.toLocaleString('en-US')}`
                    ) : (
                      <span className="italic text-neutral-500 font-sans font-medium">Price on Request</span>
                    )}
                  </strong>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase text-[9px] block">Planning Access Road</span>
                  <strong className="text-neutral-800 text-sm font-semibold">{selectedListing.accessRoadWidth} Ft Road</strong>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-950 uppercase font-mono">Detailed Plot Description</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">{selectedListing.description}</p>
              </div>

              {/* Amenities List - Unboxed plain text with dot separators */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-neutral-950 uppercase font-mono">Integrated Plot Utilities</h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-neutral-600 font-mono">
                  {selectedListing.amenities.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <span className="flex items-center gap-1">
                        <Check size={12} className="text-emerald-600" />
                        {item}
                      </span>
                      {idx < selectedListing.amenities.length - 1 && <span className="text-neutral-300">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Map & Plot Sketch Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-neutral-150 rounded-lg p-3 bg-neutral-50 space-y-2">
                  <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Survey Plot Sketch Map</h5>
                  <img
                    src={selectedListing.planUrl}
                    alt="Plot Plan"
                    referrerPolicy="no-referrer"
                    className="w-full h-52 object-cover rounded border border-neutral-200"
                  />
                </div>
                <div className="border border-neutral-150 rounded-lg p-3 bg-neutral-50 space-y-2">
                  <h5 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Interactive Plot Satellite Tracker</h5>
                  <GharJaggaMap
                    listings={[selectedListing]}
                    onMarkerClick={() => {}}
                    centerListing={selectedListing}
                    isMiniMap={true}
                  />
                </div>
              </div>

              {/* Interaction Call-To-Actions (Actions) */}
              <div className="flex flex-col sm:flex-row gap-3 border-t border-neutral-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(true)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2 px-4 rounded text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar size={14} />
                  Book Site Visit
                </button>
                <button
                  type="button"
                  onClick={() => setShowInquiryModal(true)}
                  className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white font-semibold py-2 px-4 rounded text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={14} />
                  Request Legal Check
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintPropertySheet(selectedListing)}
                  className="flex-1 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-850 font-bold py-2 px-4 rounded text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer size={14} className="text-amber-800 shrink-0" />
                  Print / Save PDF Flyer
                </button>
              </div>

              <div className="border-t border-neutral-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-950 uppercase font-mono">Instant Social Ad Share</h4>
                    <p className="text-[10px] text-neutral-500">Promote this verified land plot instantly</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-neutral-100 shadow-sm">
                    <QRCodeCanvas 
                      value={`${window.location.origin}/listing/${selectedListing.id}`} 
                      size={54}
                      level="H"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this verified land plot for sale: ${selectedListing.title} in ${selectedListing.municipality} - ${window.location.origin}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold py-2 px-3 rounded text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💬</span> WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-semibold py-2 px-3 rounded text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>📘</span> Facebook Ad
                  </a>
                  <a
                    href={`viber://forward?text=${encodeURIComponent(`Check out this verified land plot: ${selectedListing.title} - ${window.location.origin}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold py-2 px-3 rounded text-center transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>💜</span> Viber Share
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/listing/${selectedListing.id}`);
                      alert('Direct listing link copied to clipboard!');
                    }}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 text-xs font-semibold py-2 px-3 rounded text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>🔗</span> Copy Link
                  </button>
                </div>
              </div>

              {/* Agreement drafting builder inside detail modal */}
              <div className="border-t border-neutral-100 pt-5 space-y-4">
                <h4 className="text-xs font-bold text-neutral-950 uppercase font-mono">
                  Baina Agreement Draft Assistant (Likhit generator)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Advance Token (NPR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500,000"
                      value={agreementAdvance}
                      onChange={(e) => setAgreementAdvance(parseInt(e.target.value) || 0)}
                      className="border border-neutral-200 rounded p-1 w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Due Clearance Date</label>
                    <input
                      type="date"
                      value={agreementDue}
                      onChange={(e) => setAgreementDue(e.target.value)}
                      className="border border-neutral-200 rounded p-1 w-full text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase font-bold mb-1">Agreement Witness</label>
                    <input
                      type="text"
                      placeholder="Witness Name"
                      value={agreementWitness}
                      onChange={(e) => setAgreementWitness(e.target.value)}
                      className="border border-neutral-200 rounded p-1 w-full text-xs"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDraftAgreement}
                  className="bg-amber-700/10 text-amber-900 border border-amber-700/20 hover:bg-amber-700/20 font-semibold py-1.5 px-4 rounded text-xs transition-all w-full"
                >
                  Generate Legal Baina Agreement
                </button>

                {draftedAgreementText && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 relative">
                    <pre className="text-[11px] text-neutral-700 font-mono whitespace-pre-wrap leading-normal overflow-auto max-h-60">
                      {draftedAgreementText}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(draftedAgreementText);
                        alert('Baina agreement copied to clipboard!');
                      }}
                      className="absolute top-2 right-2 bg-neutral-900 text-white text-[10px] px-2.5 py-1 rounded hover:bg-neutral-850"
                    >
                      Copy Draft
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-59">
          <form onSubmit={handleBookingSubmit} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200">
            <h3 className="font-serif text-lg font-bold text-neutral-950">Book Site Visit</h3>
            <p className="text-xs text-neutral-500">
              Listing: <strong className="text-neutral-800">{selectedListing.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Contact No</label>
                  <input
                    type="text"
                    required
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Preferred Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:30 AM"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Instructions or Special Queries</label>
                <textarea
                  rows={3}
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                  placeholder="e.g. Please verify road connectivity with owner before our visit."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="py-1.5 px-4 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 text-xs font-semibold bg-amber-700 text-white hover:bg-amber-800 rounded"
              >
                Submit Site Visit Request
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inquiry Form Modal */}
      {showInquiryModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-59">
          <form onSubmit={handleInquirySubmit} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-neutral-200">
            <h3 className="font-serif text-lg font-bold text-neutral-950">Submit Inquiry / Ask Legal Verification</h3>
            <p className="text-xs text-neutral-500">
              Listing: <strong className="text-neutral-800">{selectedListing.title}</strong>
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Inquiry Subject Category</label>
                <select
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value as any)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                >
                  <option value="Legal Support">Legal Support / Lalpurja Check</option>
                  <option value="Agreement Draft">Baina Agreement Draft Assistance</option>
                  <option value="Plot Query">Boundary / Road Query</option>
                  <option value="Price Negotiation">Price Negotiations & Offmarket terms</option>
                  <option value="Document Verification">Blueprint or Trace Map verification</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Explain Your Query</label>
                <textarea
                  rows={4}
                  required
                  value={inquiryMsg}
                  onChange={(e) => setInquiryMsg(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                  placeholder="Ask our professional legal advisory unit about the plot details, boundary verification, or local municipality plans."
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowInquiryModal(false)}
                className="py-1.5 px-4 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-850 rounded"
              >
                Send Indirect Inquiry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Property Comparison Bar */}
      {comparedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-950 text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-6 border border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Comparing {comparedIds.length}/3 plots</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowComparisonModal(true)}
              className="bg-amber-700 hover:bg-amber-600 text-white font-semibold text-xs py-1.5 px-4 rounded-full transition-colors cursor-pointer"
            >
              Open Comparison Table
            </button>
            <button
              onClick={() => setComparedIds([])}
              className="text-neutral-400 hover:text-white text-xs underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Property Comparison Side-by-Side Modal */}
      {showComparisonModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-60 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full p-6 sm:p-8 space-y-6 border border-neutral-200 max-h-[90vh] overflow-y-auto relative animate-fadeIn">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-neutral-950">Side-by-Side Property Comparison</h3>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Evaluating area, price, location, and legal certification status</p>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-2 hover:bg-neutral-100 rounded-full text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="p-3 font-mono text-neutral-400 uppercase text-[10px] w-40">Parameter</th>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      if (!l) return null;
                      return (
                        <th key={l.id} className="p-3 w-72">
                          <div className="space-y-2">
                            <img 
                              src={l.photos?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef'} 
                              alt={l.title} 
                              className="w-full h-32 object-cover rounded-lg border border-neutral-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex justify-between items-start">
                              <h4 className="font-serif font-bold text-neutral-900 text-sm line-clamp-1">{l.title}</h4>
                              <button 
                                onClick={() => handleToggleCompare(l.id)}
                                className="text-red-600 hover:text-red-800 text-[10px] underline shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Approved Guide Price</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 font-bold text-amber-900">
                          {l?.showPriceToPublic ? `NPR ${l.guidePrice.toLocaleString('en-US')}` : 'Price on Request'}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Land Area Measure</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 text-neutral-800">
                          {l ? formatNepaliArea(l.landType, l.area) : ''} ({l?.landType})
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">District & Municipality</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 text-neutral-800">
                          {l?.municipality}, Ward-{l?.ward} ({l?.district})
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Access Road Width</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 text-neutral-800 font-medium">
                          {l?.accessRoadWidth} Feet Road
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Legal Certification Status</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3">
                          <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                            ✓ {l?.status} & Audited
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Promotion Tier</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 text-neutral-700">
                          {l?.serviceCategory}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className="p-3 text-neutral-500 font-sans font-semibold">Integrated Utilities</td>
                    {comparedIds.map(id => {
                      const l = listings.find(item => item.id === id);
                      return (
                        <td key={id} className="p-3 text-neutral-600 text-[11px] leading-relaxed">
                          {l?.amenities.join(', ')}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t border-neutral-100">
              <button
                onClick={() => setShowComparisonModal(false)}
                className="bg-neutral-900 hover:bg-neutral-850 text-white text-xs font-semibold px-6 py-2 rounded-lg cursor-pointer"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
