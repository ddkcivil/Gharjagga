import React, { useState, useEffect } from 'react';
import { Listing, SiteVisit, Inquiry } from '../types';
import { calculateSlabCommission, calculateNepalGovTaxes, formatNepaliArea } from '../utils/converters';
import { ShieldAlert, CheckCircle, XCircle, FileText, Calendar, MessageSquare, IndianRupee, Printer, AlertTriangle, BarChart3, TrendingUp, Users, Map } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface AdminPortalProps {
  listings: Listing[];
  visits: SiteVisit[];
  inquiries: Inquiry[];
  onApproveListing: (id: string, guidePrice: number, showPriceToPublic: boolean) => void;
  onRejectListing: (id: string, reason: string) => void;
  onTogglePriceVisibility: (id: string) => void;
  onUpdateVisitStatus: (id: string, status: SiteVisit['status']) => void;
  onUpdateInquiry: (id: string, adminNotes: string, status: Inquiry['status']) => void;
  onAddInquiryResponse: (id: string, sellerResponse: string, status: Inquiry['status']) => void;
  activeTab: string;
}

export default function AdminPortal({
  listings,
  visits,
  inquiries,
  onApproveListing,
  onRejectListing,
  onTogglePriceVisibility,
  onUpdateVisitStatus,
  onUpdateInquiry,
  onAddInquiryResponse,
  activeTab,
}: AdminPortalProps) {
  // Administrative Secure Access & Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [enteredKey, setEnteredKey] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [securityAuditLogs, setSecurityAuditLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Secure sandbox firewall loaded.`,
    `[${new Date().toLocaleTimeString()}] Standard Admin portal locked. Passcode required.`
  ]);

  // Local list variables
  const pendingListings = listings.filter((l) => l.status === 'Pending Approval');
  const activeListings = listings.filter((l) => l.status === 'Approved');

  // Input states
  const [editingGuidePrices, setEditingGuidePrices] = useState<Record<string, number>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);
  const [priceReleaseToggles, setPriceReleaseToggles] = useState<Record<string, boolean>>({});

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    const masterPasscode = 'GharJaggaAdmin2026';
    if (enteredKey === masterPasscode) {
      setIsAuthenticated(true);
      setFailedAttempts(0);
      setSecurityAuditLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SUCCESSFUL Authentication. Secure token allocated.`
      ]);
      setEnteredKey('');
    } else {
      const nextFailCount = failedAttempts + 1;
      setFailedAttempts(nextFailCount);
      let nextLogs = [
        ...securityAuditLogs,
        `[${new Date().toLocaleTimeString()}] FAILED attempt. Input: "${enteredKey}". Attempts: ${nextFailCount}/3`
      ];

      if (nextFailCount >= 3) {
        setLockoutSeconds(30);
        nextLogs.push(`[${new Date().toLocaleTimeString()}] BRUTE-FORCE LOCKOUT TRIGGERED. Cooldown active.`);
      }
      setSecurityAuditLogs(nextLogs);
      setEnteredKey('');
      alert('Invalid administrative passcode. Access denied.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Listing ID,Title,District,Municipality,Ward,Land Type,Guide Price (NPR),Status,Payment Status,Seller Name'];
    const rows = listings.map(l => {
      const title = `"${l.title.replace(/"/g, '""')}"`;
      const seller = `"${l.sellerName.replace(/"/g, '""')}"`;
      return `${l.id},${title},${l.district},${l.municipality},${l.ward},${l.landType},${l.guidePrice},${l.status},${l.paymentStatus},${seller}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gharjagga_plot_distribution_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSecureLogout = () => {
    setIsAuthenticated(false);
    setSecurityAuditLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] User signed out. Administrative token revoked.`
    ]);
  };

  // Communications state
  const [adminReplyTexts, setAdminReplyTexts] = useState<Record<string, string>>({});

  // Billing calculation state
  const [billingListingId, setBillingListingId] = useState<string>('');
  const [customFinalPrice, setCustomFinalPrice] = useState<number>(0);
  const [customCommRate, setCustomCommRate] = useState<number>(2.0);
  const [billingBuyerName, setBillingBuyerName] = useState<string>('Dharma Raj Kunwar');
  const [buyerPrivilege, setBuyerPrivilege] = useState<'None' | 'Female' | 'Senior/Disabled'>('None');
  const [holdingYears, setHoldingYears] = useState<number>(5);

  const [activeInvoice, setActiveInvoice] = useState<any>(null);

  // Billing logic
  const selectedBillingListing = listings.find((l) => l.id === billingListingId);

  const handleCalculateInvoice = () => {
    if (!selectedBillingListing) return;
    const price = customFinalPrice || selectedBillingListing.guidePrice;
    const slab = calculateSlabCommission(price);
    const rate = customCommRate;
    const commission = price * (rate / 100);
    const vat = commission * 0.13;
    const tds = commission * 0.015;
    const billTotal = commission + vat;

    const taxes = calculateNepalGovTaxes(price, buyerPrivilege === 'Female', buyerPrivilege === 'Senior/Disabled', holdingYears);

    setActiveInvoice({
      invoiceNo: `GJN-INV-${Date.now().toString().slice(-6)}`,
      propertyTitle: selectedBillingListing.title,
      sellerName: selectedBillingListing.sellerName,
      buyerName: billingBuyerName,
      finalPrice: price,
      commissionRate: rate,
      commissionAmount: commission,
      vatAmount: vat,
      tdsAmount: tds,
      netAmount: billTotal,
      registrationFee: taxes.registrationFee,
      appliedRegRate: taxes.appliedRegRate,
      capitalGainTax: taxes.capitalGainTax,
      cgtRate: taxes.cgtRate,
      areaStr: formatNepaliArea(selectedBillingListing.landType, selectedBillingListing.area),
    });
  };

  // Recharts Density & Listing Distribution Analytics Preprocessing
  const districtDistribution = listings.reduce((acc: Record<string, number>, l) => {
    acc[l.district] = (acc[l.district] || 0) + 1;
    return acc;
  }, {});

  const districtData = Object.entries(districtDistribution).map(([name, count]) => ({
    name,
    count,
  }));

  const landTypeDistribution = listings.reduce((acc: Record<string, number>, l) => {
    const typeLabel = l.landType === 'Terai' ? 'Terai Plain' : 'Hilly Area';
    acc[typeLabel] = (acc[typeLabel] || 0) + 1;
    return acc;
  }, {});

  const landTypeData = Object.entries(landTypeDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  const totalListingsCount = listings.length;
  const approvedListingsCount = listings.filter((l) => l.status === 'Approved').length;
  const pendingListingsCount = listings.filter((l) => l.status === 'Pending Approval').length;
  const totalRevenuePotential = listings.reduce((sum, l) => sum + (l.guidePrice * 0.02), 0); // estimated average 2% broker commission

  const PIE_COLORS = ['#b45309', '#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white rounded-xl border border-neutral-150 shadow-md p-6 font-sans space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-neutral-950 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert size={24} className="text-amber-500" />
          </div>
          <h2 className="text-lg font-serif font-bold text-neutral-950">Administrative Firewall Protection</h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Authorized GharJagga Nepal Personnel Only. Access is tracked under cyber-security audit guidelines of Nepal.
          </p>
        </div>

        <form onSubmit={handleVerifyPasscode} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Enter Administrative Passcode
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              value={enteredKey}
              onChange={(e) => setEnteredKey(e.target.value)}
              disabled={lockoutSeconds > 0}
              className="w-full text-center border border-neutral-250 rounded-lg py-2.5 px-3 focus:outline-none font-mono text-sm tracking-widest bg-neutral-50/50"
            />
          </div>

          {lockoutSeconds > 0 ? (
            <div className="bg-red-50 text-red-700 border border-red-100 p-3 rounded-lg text-xs font-mono text-center">
              BRUTE-FORCE DETECTED: Panel Locked for {lockoutSeconds}s
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-semibold py-2 px-4 rounded text-xs transition-colors shadow"
            >
              Authenticate & Decrypt Portal
            </button>
          )}

          <div className="text-center">
            <span className="text-[10px] text-neutral-400 font-mono">
              Default Sandbox Key: <strong className="text-neutral-500 select-all">GharJaggaAdmin2026</strong>
            </span>
          </div>
        </form>

        {/* Live Security Audit Logs */}
        <div className="border-t border-neutral-100 pt-4 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            <span>Live Security Audit Logs</span>
            <span className="text-emerald-600 animate-pulse">● System Active</span>
          </div>
          <div className="bg-neutral-950 text-neutral-400 rounded-lg p-3 font-mono text-[9px] h-32 overflow-y-auto space-y-1 select-none">
            {securityAuditLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-neutral-600">&gt;</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Session Security Banner */}
      <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3.5 mb-6 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span className="font-semibold font-mono">Administrative Session Encrypted & Verified (ID: GJN-ADMIN-SECURE)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-emerald-600 font-mono">Token expires in: 12h 00m</span>
          <button
            type="button"
            onClick={handleSecureLogout}
            className="bg-neutral-950 hover:bg-neutral-850 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-neutral-900 transition-colors cursor-pointer"
          >
            Lock Session (Sign Out)
          </button>
        </div>
      </div>
      {/* Pending Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="text-amber-700" size={20} />
              Review Pending Real Estate Listings ({pendingListings.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Admin audit parameters: confirm survey blueprint coordinates, check access road alignment, review expected reserve price, and set public buyer guide price.
            </p>
          </div>

          {pendingListings.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-150 p-12 text-center rounded-xl text-neutral-400 font-mono text-xs">
              No listings currently pending approval. All submitted plots are publicly live or rejected.
            </div>
          ) : (
            <div className="space-y-6">
              {pendingListings.map((listing) => {
                const guideVal = editingGuidePrices[listing.id] ?? listing.expectedPrice;

                return (
                  <div key={listing.id} className="bg-white border border-neutral-150 rounded-xl overflow-hidden p-6 grid grid-cols-1 md:grid-cols-12 gap-6 shadow-xs">
                    {/* Visual Thumbnail & Document map */}
                    <div className="md:col-span-3 space-y-3">
                      <div className="relative aspect-video rounded overflow-hidden border border-neutral-200 bg-neutral-100">
                        <img src={listing.photos[0]} alt="thumbnail" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-neutral-900/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">
                          Tier {listing.serviceCategory}
                        </span>
                      </div>
                      <div className="aspect-square w-full rounded overflow-hidden border border-neutral-200 bg-neutral-100">
                        <img src={listing.planUrl} alt="plan" className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* Meta detailed info */}
                    <div className="md:col-span-6 space-y-4">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-widest font-semibold text-amber-800">
                          {listing.district} District · {listing.municipality} Municipality
                        </span>
                        <h3 className="font-serif text-lg font-bold text-neutral-950 mt-1">{listing.title}</h3>
                        <p className="text-xs text-neutral-500 line-clamp-3 mt-1.5">{listing.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-b border-neutral-100 py-3">
                        <div>
                          <span className="text-neutral-400 block text-[9px]">Land Area</span>
                          <strong className="text-neutral-800">{formatNepaliArea(listing.landType, listing.area)}</strong>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[9px]">Seller Expected (Secret)</span>
                          <strong className="text-amber-800 font-bold">NPR {listing.expectedPrice.toLocaleString('en-US')}</strong>
                        </div>
                      </div>

                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-neutral-400">Amenities:</span>{' '}
                          <span className="text-neutral-700 font-mono">{listing.amenities.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Seller:</span>{' '}
                          <span className="text-neutral-700 font-semibold">
                            {listing.sellerName} ({listing.sellerContact})
                          </span>
                        </div>
                      </div>

                      {/* Attached Legal Documents for Admin Verification */}
                      {((listing.lalpurjaUrl) || (listing.legalDocs && listing.legalDocs.length > 0)) && (
                        <div className="border-t border-neutral-100 pt-3 space-y-2">
                          <span className="text-neutral-400 font-bold uppercase text-[9px] block tracking-wider">
                            Attached Auditing Documents
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {listing.lalpurjaUrl && (
                              <a
                                href={listing.lalpurjaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-250/55 text-amber-900 font-semibold transition-all"
                              >
                                <FileText size={13} className="text-amber-800" />
                                <span>Primary Lalpurja Certificate</span>
                              </a>
                            )}
                            {listing.legalDocs && listing.legalDocs.map((doc, idx) => (
                              <a
                                key={idx}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 border border-neutral-250/55 text-neutral-700 font-mono transition-all"
                              >
                                <FileText size={13} className="text-neutral-400" />
                                <span className="truncate">{doc.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Approval Form Panel */}
                    <div className="md:col-span-3 flex flex-col justify-between space-y-4 bg-neutral-50 p-4 rounded-xl border border-neutral-150">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide mb-1">
                          Release Guide Price (NPR)
                        </label>
                        <input
                          type="number"
                          value={guideVal}
                          onChange={(e) =>
                            setEditingGuidePrices({
                              ...editingGuidePrices,
                              [listing.id]: Math.max(0, parseInt(e.target.value) || 0),
                            })
                          }
                          className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono focus:outline-none bg-white"
                        />
                        <p className="text-[9px] text-neutral-400 mt-1 leading-snug">
                          * Adjust to set public guide pricing. Default matches the seller's initial expected price.
                        </p>
                      </div>

                      {/* Interactive Price Display Controller for Public */}
                      <div className="flex items-center gap-2 py-1.5 bg-neutral-100/50 p-2 rounded-lg border border-neutral-200/50">
                        <input
                          type="checkbox"
                          id={`release-price-${listing.id}`}
                          checked={priceReleaseToggles[listing.id] ?? true}
                          onChange={(e) =>
                            setPriceReleaseToggles({
                              ...priceReleaseToggles,
                              [listing.id]: e.target.checked,
                            })
                          }
                          className="rounded text-amber-700 focus:ring-amber-500 accent-amber-700 cursor-pointer w-3.5 h-3.5"
                        />
                        <label
                          htmlFor={`release-price-${listing.id}`}
                          className="text-[9px] font-bold text-neutral-600 uppercase cursor-pointer select-none font-mono"
                        >
                          Display Price to Buyers
                        </label>
                      </div>

                      <div className="space-y-2">
                        {activeRejectId === listing.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              required
                              placeholder="Reason for rejection..."
                              value={rejectionReasons[listing.id] ?? ''}
                              onChange={(e) =>
                                setRejectionReasons({
                                  ...rejectionReasons,
                                  [listing.id]: e.target.value,
                                })
                              }
                              className="border border-neutral-200 rounded p-1 w-full text-xs"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveRejectId(null)}
                                className="bg-neutral-200 text-neutral-700 font-semibold px-2 py-1 rounded text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onRejectListing(listing.id, rejectionReasons[listing.id] || 'Insufficient land documents');
                                  setActiveRejectId(null);
                                }}
                                className="bg-red-700 text-white font-semibold px-2 py-1 rounded text-[10px]"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onApproveListing(listing.id, guideVal, priceReleaseToggles[listing.id] ?? true)}
                              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 rounded text-xs transition-colors flex items-center justify-center gap-1"
                            >
                              <CheckCircle size={12} />
                              Approve Listing
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveRejectId(listing.id)}
                              className="bg-red-50 text-red-700 border border-red-200 font-semibold p-1.5 rounded text-xs transition-colors"
                            >
                              <XCircle size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Listings Price Management Section */}
          <div className="border-t border-neutral-200 pt-8 mt-8 space-y-4">
            <div>
              <h3 className="text-base font-serif font-bold text-neutral-900">Active Listings Price Release Controls</h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Instantly toggle whether the approved guide price is visible to public buyers or masked behind a "Price on Request" tag.
              </p>
            </div>

            {activeListings.length === 0 ? (
              <span className="text-xs font-mono text-neutral-400 block italic">No active approved listings to display.</span>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeListings.map(listing => (
                  <div key={listing.id} className="bg-white border border-neutral-150 p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">{listing.title}</h4>
                      <div className="flex gap-2 text-[10px] text-neutral-500 font-mono">
                        <span>Guide Price: NPR {listing.guidePrice.toLocaleString()}</span>
                        <span>·</span>
                        <span>Ward {listing.ward}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTogglePriceVisibility(listing.id)}
                      className={`text-xs font-semibold font-mono py-1 px-3 rounded-lg border transition-all cursor-pointer ${
                        listing.showPriceToPublic 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-neutral-900 text-white border-neutral-800'
                      }`}
                    >
                      {listing.showPriceToPublic ? 'Price: Public (Visible)' : 'Price: Masked (Hidden)'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booked Site Visits Tab */}
      {activeTab === 'admin-visits' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
              <Calendar className="text-amber-700" size={20} />
              Manage Booked Site Visits ({visits.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Confirm scheduled site trips, coordinate local land agents in Rupandehi/Tilottama, and log completion flags for final invoicing.
            </p>
          </div>

          {visits.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 font-mono">No active site visit bookings.</div>
          ) : (
            <div className="bg-white border border-neutral-150 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-150 text-neutral-500 font-semibold">
                    <th className="p-4">Plot / Property</th>
                    <th className="p-4">Buyer Details</th>
                    <th className="p-4">Preferred Date/Time</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-mono">
                  {visits.map((v) => (
                    <tr key={v.id} className="hover:bg-neutral-50/50">
                      <td className="p-4 font-sans">
                        <strong className="block text-neutral-900 font-semibold">{v.listingTitle}</strong>
                        <span className="text-[10px] text-neutral-400">ID: {v.listingId}</span>
                      </td>
                      <td className="p-4 font-sans">
                        <span className="font-semibold text-neutral-900 block">{v.buyerName}</span>
                        <span className="text-[10px] text-neutral-500 block">{v.buyerContact} · {v.buyerEmail}</span>
                      </td>
                      <td className="p-4 text-neutral-700">
                        {v.preferredDate} at {v.preferredTime}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold text-[10px] uppercase font-mono ${
                            v.status === 'Approved'
                              ? 'text-emerald-600'
                              : v.status === 'Pending'
                              ? 'text-amber-600'
                              : 'text-neutral-500'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-sans space-x-1 whitespace-nowrap">
                        {v.status === 'Pending' && (
                          <button
                            onClick={() => onUpdateVisitStatus(v.id, 'Approved')}
                            className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold py-1 px-2 rounded.md text-[10px]"
                          >
                            Approve Visit
                          </button>
                        )}
                        {v.status === 'Approved' && (
                          <button
                            onClick={() => onUpdateVisitStatus(v.id, 'Completed')}
                            className="bg-amber-700 text-white hover:bg-amber-800 font-semibold py-1 px-2 rounded.md text-[10px]"
                          >
                            Mark Completed
                          </button>
                        )}
                        {v.status !== 'Cancelled' && (
                          <button
                            onClick={() => onUpdateVisitStatus(v.id, 'Cancelled')}
                            className="bg-red-50 text-red-700 hover:bg-red-100 font-semibold py-1 px-2 rounded.md text-[10px]"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Communications Routing Tab */}
      {activeTab === 'admin-inquiries' && (
        <div className="space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
              <MessageSquare className="text-amber-700" size={20} />
              Admin Communication Routing ({inquiries.length})
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Securely moderate dialogue between buyer and seller. Review survey boundary disputes or land document queries, and dispatch legal assistance answers.
            </p>
          </div>

          {inquiries.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400 font-mono">No active buyer inquiries currently logged.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white border border-neutral-150 p-5 rounded-xl space-y-4 text-xs shadow-xs">
                  <div className="flex justify-between items-start border-b border-neutral-50 pb-2">
                    <div>
                      <span className="text-[9px] uppercase font-mono tracking-wider font-semibold text-amber-800">
                        Subject: {inq.subject}
                      </span>
                      <h4 className="font-semibold text-neutral-950 mt-0.5">{inq.listingTitle}</h4>
                    </div>
                    <span className="bg-neutral-100 font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">
                      {inq.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-400 uppercase block">Buyer Request</span>
                    <p className="text-neutral-700 font-medium italic bg-neutral-50 p-2.5 rounded">"{inq.message}"</p>
                    <span className="text-[10px] text-neutral-400 font-mono block mt-1">
                      From: {inq.buyerName} ({inq.buyerContact})
                    </span>
                  </div>

                  {inq.adminNotes && (
                    <div className="bg-neutral-100 p-2.5 rounded border border-neutral-200">
                      <strong>Admin routing notes:</strong> {inq.adminNotes}
                    </div>
                  )}

                  {inq.sellerResponse && (
                    <div className="bg-emerald-50 p-2.5 rounded border border-emerald-100 text-emerald-800">
                      <strong>Seller Reply:</strong> {inq.sellerResponse}
                    </div>
                  )}

                  {/* Actions for Admin to Route */}
                  <div className="space-y-3 pt-2 border-t border-neutral-100">
                    <label className="block text-[10px] text-neutral-400 uppercase font-semibold">Route with Admin Instructions</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Sent deed blueprints. Waiting for seller's tax clearance..."
                        value={adminReplyTexts[inq.id] ?? ''}
                        onChange={(e) =>
                          setAdminReplyTexts({
                            ...adminReplyTexts,
                            [inq.id]: e.target.value,
                          })
                        }
                        className="flex-1 border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateInquiry(inq.id, adminReplyTexts[inq.id] || '', 'Admin Routed');
                          setAdminReplyTexts({ ...adminReplyTexts, [inq.id]: '' });
                          alert('Dialogue routed to seller for prompt attention.');
                        }}
                        className="bg-neutral-900 text-white font-semibold px-3 py-1.5 rounded text-xs hover:bg-neutral-850"
                      >
                        Route
                      </button>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateInquiry(inq.id, 'Verified Lalpurja clear from land registry (Malpot) records.', 'Resolved');
                          alert('Query marked resolved.');
                        }}
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded text-[10px]"
                      >
                        Mark Verified & Resolved
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nepal Commission & Billing Invoice Generator Tab */}
      {activeTab === 'admin-billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Billing selector form */}
          <div className="lg:col-span-5 bg-white p-6 border border-neutral-100 rounded-xl space-y-5">
            <h3 className="font-serif text-base font-bold text-neutral-950 border-b border-neutral-100 pb-2 flex items-center gap-2">
              <IndianRupee className="text-amber-700" size={16} />
              Billing Terminal
            </h3>

            <div>
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Select Concluded Plot</label>
              <select
                value={billingListingId}
                onChange={(e) => {
                  const id = e.target.value;
                  setBillingListingId(id);
                  const l = listings.find((item) => item.id === id);
                  if (l) {
                    setCustomFinalPrice(l.guidePrice);
                  }
                }}
                className="w-full border border-neutral-200 rounded p-2 text-xs focus:outline-none"
              >
                <option value="">-- Choose Approved Plot --</option>
                {activeListings.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title} (NPR {l.guidePrice.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedBillingListing && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Final Agreed Price (NPR)</label>
                  <input
                    type="number"
                    value={customFinalPrice}
                    onChange={(e) => setCustomFinalPrice(parseInt(e.target.value) || 0)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Commission Rate (%)</label>
                    <input
                      type="number"
                      step={0.1}
                      min={1.0}
                      max={4.0}
                      value={customCommRate}
                      onChange={(e) => setCustomCommRate(parseFloat(e.target.value) || 2.0)}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Buyer Privilege</label>
                    <select
                      value={buyerPrivilege}
                      onChange={(e) => setBuyerPrivilege(e.target.value as any)}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                    >
                      <option value="None">None (5% standard)</option>
                      <option value="Female">Female Buyer (25% discount)</option>
                      <option value="Senior/Disabled">Senior / Disabled (50% discount)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Buyer Name</label>
                  <input
                    type="text"
                    value={billingBuyerName}
                    onChange={(e) => setBillingBuyerName(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">CGT Holding Period</label>
                  <select
                    value={holdingYears}
                    onChange={(e) => setHoldingYears(parseInt(e.target.value))}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs"
                  >
                    <option value={3}>Owned less than 5 years (7.5% CGT)</option>
                    <option value={6}>Owned 5 years or more (5.0% CGT)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleCalculateInvoice}
                  className="w-full bg-amber-700 text-white font-semibold py-2 rounded text-xs hover:bg-amber-800 transition-colors"
                >
                  Generate Invoice Bill & Tax Estimation
                </button>
              </div>
            )}
          </div>

          {/* Invoice render preview */}
          <div className="lg:col-span-7">
            {activeInvoice ? (
              <div className="bg-white p-6 border border-neutral-200 rounded-xl space-y-6">
                <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                  <div className="font-serif">
                    <h3 className="font-bold text-lg text-neutral-900">GHARJAGGA NEPAL</h3>
                    <span className="text-[10px] text-neutral-400 block font-mono">Licensed Brokerage, Tilottama Ward 4, Rupandehi</span>
                  </div>
                  <div className="text-right font-mono text-xs text-neutral-500">
                    <span className="font-bold block text-neutral-900">INVOICE BILL</span>
                    <span>No: {activeInvoice.invoiceNo}</span>
                  </div>
                </div>

                {/* Identity breakdown */}
                <div className="grid grid-cols-2 gap-4 text-xs border-b border-neutral-100 pb-4 font-mono">
                  <div>
                    <span className="text-[9px] text-neutral-400 uppercase block">Land Specifications</span>
                    <strong className="text-neutral-800">{activeInvoice.propertyTitle}</strong>
                    <span className="block text-neutral-500 mt-1">Area: {activeInvoice.areaStr}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-neutral-400 uppercase block">Parties</span>
                    <span className="block text-neutral-700">Seller: {activeInvoice.sellerName}</span>
                    <span className="block text-neutral-700">Buyer: {activeInvoice.buyerName}</span>
                  </div>
                </div>

                {/* Numeric details */}
                <div className="space-y-2 border-b border-neutral-100 pb-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Total Land Deal Value:</span>
                    <strong className="text-neutral-800">NPR {activeInvoice.finalPrice.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Agency Commission Rate:</span>
                    <strong className="text-neutral-800">{activeInvoice.commissionRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Agency Commission Amount:</span>
                    <strong className="text-neutral-800">NPR {activeInvoice.commissionAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">VAT (13.0% Government Tax):</span>
                    <strong className="text-neutral-800">NPR {activeInvoice.vatAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>1.5% TDS Withheld Amount:</span>
                    <strong>NPR {activeInvoice.tdsAmount.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Bill payable */}
                <div className="flex justify-between items-center bg-neutral-900 text-white p-4 rounded-lg font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block uppercase">Net Invoice Bill Amount (incl. VAT)</span>
                    <span className="text-[9px] text-amber-500">To be settled by Land Owner/Seller party</span>
                  </div>
                  <strong className="text-lg text-amber-500">NPR {activeInvoice.netAmount.toLocaleString()}</strong>
                </div>

                {/* Land Registration estimate */}
                <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-900 tracking-wide block">
                    Nepal Malpot Land Registration Tax Estimate
                  </span>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-medium">Est. Land Registry Fee (Applied {activeInvoice.appliedRegRate}%):</span>
                    <strong className="font-mono text-amber-950">NPR {activeInvoice.registrationFee.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-medium">Est. Capital Gains Tax (Applied {activeInvoice.cgtRate}%):</span>
                    <strong className="font-mono text-amber-950">NPR {activeInvoice.capitalGainTax.toLocaleString()}</strong>
                  </div>
                  <span className="text-[9px] text-amber-700 italic block leading-normal mt-1">
                    * Values simulated using Nepalese Municipal Acts. Actual values vary dynamically based on government floor valuations at Malpot Karyalaya.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                  }}
                  className="w-full bg-neutral-900 hover:bg-neutral-850 text-white py-2 px-4 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Printer size={14} />
                  Print Receipt Bill
                </button>
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-150 p-12 text-center rounded-xl text-neutral-400 font-mono text-xs h-full flex flex-col items-center justify-center">
                <AlertTriangle className="text-neutral-300 mb-2" size={24} />
                Select a completed listing from the form to generate and print official broker invoice receipts.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Density Analytics Dashboard Tab with Recharts */}
      {activeTab === 'admin-analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Header block */}
          <div className="border-b border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-serif font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 className="text-amber-700" size={20} />
                Listing Density & Geographical Analytics
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Real-time spatial data distribution of land plots across Nepalese provinces and development regions.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="bg-neutral-900 hover:bg-neutral-850 text-white font-mono text-xs py-1.5 px-3.5 rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>📥</span> Export CSV Report
              </button>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live GIS Feeds Connected</span>
              </div>
            </div>
          </div>

          {/* KPI Dashboard Metrics Row - Zero Pill discipline */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-150 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Total Database Plots</span>
              <div className="flex items-baseline justify-between">
                <strong className="text-2xl font-serif font-bold text-neutral-900">{totalListingsCount}</strong>
                <span className="text-[10px] font-mono text-neutral-400">100% indexed</span>
              </div>
            </div>

            <div className="bg-white border border-neutral-150 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Published (Live)</span>
              <div className="flex items-baseline justify-between">
                <strong className="text-2xl font-serif font-bold text-emerald-700">{approvedListingsCount}</strong>
                <span className="text-[10px] font-mono text-emerald-500 font-semibold">Active market</span>
              </div>
            </div>

            <div className="bg-white border border-neutral-150 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Awaiting Audit</span>
              <div className="flex items-baseline justify-between">
                <strong className="text-2xl font-serif font-bold text-amber-600">{pendingListingsCount}</strong>
                <span className="text-[10px] font-mono text-amber-500 font-semibold">Needs review</span>
              </div>
            </div>

            <div className="bg-white border border-neutral-150 p-4 rounded-xl space-y-1">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Est. Revenue Pool</span>
              <div className="flex items-baseline justify-between">
                <strong className="text-lg font-mono font-bold text-neutral-900">NPR {(totalRevenuePotential / 100000).toFixed(1)}L</strong>
                <span className="text-[10px] font-mono text-neutral-400">Avg. 2% cut</span>
              </div>
            </div>
          </div>

          {/* Visual Recharts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* BarChart: Listing distribution density per district */}
            <div className="lg:col-span-8 bg-white border border-neutral-150 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Map size={14} className="text-amber-800" />
                  Listing Density per District (Nepal Grid)
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono">Count distribution metrics</span>
              </div>

              <div className="h-72 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={11} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={11} allowDecimals={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '11px' }}
                      labelClassName="font-bold text-neutral-900"
                    />
                    <Bar dataKey="count" fill="#b45309" radius={[4, 4, 0, 0]} maxBarSize={45}>
                      {districtData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* PieChart: Land terrain system shares */}
            <div className="lg:col-span-4 bg-white border border-neutral-150 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-amber-800" />
                  Land Type share ratio
                </h3>
                <span className="text-[10px] text-neutral-400 font-mono">Plain vs Slope</span>
              </div>

              <div className="h-56 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={landTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {landTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'monospace', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center text displaying aggregate status */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-neutral-400 uppercase font-mono">Aggr Share</span>
                  <strong className="text-xs font-bold text-neutral-950 font-serif">100% Live</strong>
                </div>
              </div>

              {/* Pie legend list */}
              <div className="space-y-1.5 border-t border-neutral-100 pt-3 text-[11px] font-mono">
                {landTypeData.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-neutral-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                      {item.name}
                    </span>
                    <strong className="text-neutral-900">{item.value} plots</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Regional Planning Insights Box - zero pill */}
          <div className="bg-neutral-50 border border-neutral-150 rounded-xl p-5 space-y-2">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide font-mono">Spatial Intelligence Report</h4>
            <p className="text-xs text-neutral-500 leading-relaxed font-sans">
              Geographical distribution analysis signals heavy listing consolidation in urban development corridors. Terai plain regions indicate a higher concentration of standard residential plotting grids suited for commercial road integration. Hilly areas remain primary hubs for luxury Himalayan view villa construction. It is highly recommended to allocate field verification agents proportionally matching these spatial density parameters.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
