import React, { useState } from 'react';
import { Listing, SiteVisit, Inquiry } from '../types';
import { formatNepaliArea } from '../utils/converters';
import { PlusCircle, Info, UploadCloud, CreditCard, CheckCircle, Clock, Check, X, Sparkles } from 'lucide-react';
import FAQ from './FAQ';

interface SellerPortalProps {
  listings: Listing[];
  visits: SiteVisit[];
  inquiries: Inquiry[];
  onAddListing: (newListing: Listing) => void;
  onUpdatePayment: (listingId: string) => void;
  onSellerReply: (inquiryId: string, reply: string) => void;
  activeTab: string;
}

export default function SellerPortal({
  listings,
  visits,
  inquiries,
  onAddListing,
  onUpdatePayment,
  onSellerReply,
  activeTab,
}: SellerPortalProps) {
  // Upload form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Rupandehi');
  const [municipality, setMunicipality] = useState('Tilottama');
  const [ward, setWard] = useState(4);
  const [landType, setLandType] = useState<'Terai' | 'Hilly'>('Terai');

  // Area measurements
  const [bigha, setBigha] = useState(0);
  const [kattha, setKattha] = useState(0);
  const [dhur, setDhur] = useState(0);
  const [ropani, setRopani] = useState(0);
  const [aana, setAana] = useState(0);
  const [paisa, setPaisa] = useState(0);
  const [daam, setDaam] = useState(0);

  const [accessRoadWidth, setAccessRoadWidth] = useState(16);
  const [expectedPrice, setExpectedPrice] = useState(5000000);
  const [amenities, setAmenities] = useState<string[]>(['Water supply', 'Electricity', 'Drainage']);
  const [serviceCategory, setServiceCategory] = useState<'A' | 'B' | 'C'>('B');

  // Seller credentials
  const [sellerName, setSellerName] = useState('Krishna Prasad Sharma');
  const [sellerContact, setSellerContact] = useState('9857012345');
  const [sellerEmail, setSellerEmail] = useState('krishna.sharma@example.com');

  // Legal document uploads states
  const [lalpurjaName, setLalpurjaName] = useState<string>('');
  const [lalpurjaUrl, setLalpurjaUrl] = useState<string>('');
  const [citizenshipName, setCitizenshipName] = useState<string>('');
  const [citizenshipUrl, setCitizenshipUrl] = useState<string>('');
  const [encryptionProgress, setEncryptionProgress] = useState<Record<string, number>>({});
  const [additionalDocs, setAdditionalDocs] = useState<{ name: string; url: string; uploadedAt: string }[]>([]);
  const [customDocName, setCustomDocName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const generateListingImage = async () => {
    setIsGenerating(true);
    const prompt = `Professional real estate hero image for a ${landType} land plot in ${municipality}, ${district}, featuring a scenic, sunny landscape, photorealistic, wide angle shot.`;
    try {
      const response = await fetch('/api/generate-listing-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (data.image) {
        setGeneratedImageUrl(data.image);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Location & Photo enhancement states
  const [landmarks, setLandmarks] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(27.6185);
  const [longitude, setLongitude] = useState<number>(83.4682);
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([]);
  const [isPhotoUploading, setIsPhotoUploading] = useState<boolean>(false);

  // Payment checkout simulation state
  const [checkoutListingId, setCheckoutListingId] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<'fonepay' | 'esewa' | 'khalti'>('fonepay');
  const [isPaying, setIsPaying] = useState(false);

  // Inquiry reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [sellerReplyText, setSellerReplyText] = useState('');

  // Seller listings
  const sellerListings = listings.filter((l) => l.sellerEmail === sellerEmail);

  const handleAmenityToggle = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter((a) => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const simulateSecureUpload = (docType: 'lalpurja' | 'citizenship') => {
    setEncryptionProgress((prev) => ({ ...prev, [docType]: 10 }));
    
    let prog = 10;
    const interval = setInterval(() => {
      prog += 20;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
        
        if (docType === 'lalpurja') {
          setLalpurjaName(`Lalpurja_Deed_Kitta_${Math.floor(100 + Math.random() * 800)}.pdf`);
          setLalpurjaUrl('/src/assets/images/blueprint_sketch_1790864939184.jpg');
        } else {
          setCitizenshipName(`Citizenship_Copy_${Math.floor(10000 + Math.random() * 80000)}.jpg`);
          setCitizenshipUrl('/src/assets/images/blueprint_sketch_1790864939184.jpg');
        }
      }
      setEncryptionProgress((prev) => ({ ...prev, [docType]: prog }));
    }, 120);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const areaObj =
      landType === 'Terai'
        ? { bigha, kattha, dhur }
        : { ropani, aana, paisa, daam };

    // Set demo files or templates
    const mapPlanDemo = '/src/assets/images/blueprint_sketch_1790864939184.jpg';
    const photoDemo =
      landType === 'Terai'
        ? '/src/assets/images/nepal_plotting_land_1790864925005.jpg'
        : '/src/assets/images/nepal_modern_villa_1790864836958.jpg';

    const documentsPayload = [
      ...(lalpurjaUrl ? [{ name: `Land Ownership Deed (Lalpurja) - ${lalpurjaName}`, url: lalpurjaUrl, uploadedAt: new Date().toISOString() }] : []),
      ...(citizenshipUrl ? [{ name: `Citizenship Document (Nagarikta) - ${citizenshipName}`, url: citizenshipUrl, uploadedAt: new Date().toISOString() }] : []),
      ...additionalDocs
    ];

    const finalDocs = documentsPayload.length > 0 ? documentsPayload : [
      { name: 'Simulated Lalpurja Certification Scan', url: mapPlanDemo, uploadedAt: new Date().toISOString() }
    ];

    const newListing: Listing = {
      id: `prop-${Date.now()}`,
      title,
      description,
      district,
      municipality,
      ward,
      landType,
      area: areaObj,
      accessRoadWidth,
      coordinates: { lat: latitude, lng: longitude },
      expectedPrice,
      guidePrice: expectedPrice, // guide price defaults to expected secret price initially
      showPriceToPublic: false, // Default is hidden until approved/toggled by admin!
      landmarks: landmarks || 'Near main ward planning area',
      amenities,
      locationMapUrl: mapPlanDemo,
      planUrl: mapPlanDemo,
      photos: attachedPhotos.length > 0 ? attachedPhotos : [photoDemo],
      lalpurjaUrl: lalpurjaUrl || mapPlanDemo, // Attached Lalpurja scan
      legalDocs: finalDocs,
      serviceCategory,
      paymentStatus: 'Pending',
      status: 'Pending Approval',
      sellerName,
      sellerContact,
      sellerEmail,
      createdAt: new Date().toISOString(),
    };

    onAddListing(newListing);
    // Prompt payment for the listed property
    setCheckoutListingId(newListing.id);

    // Reset upload form
    setTitle('');
    setDescription('');
    setBigha(0);
    setKattha(0);
    setDhur(0);
    setRopani(0);
    setAana(0);
    setPaisa(0);
    setDaam(0);
    setAmenities(['Water supply', 'Electricity', 'Drainage']);
    setLalpurjaName('');
    setLalpurjaUrl('');
    setCitizenshipName('');
    setCitizenshipUrl('');
    setAdditionalDocs([]);
    setLandmarks('');
    setLatitude(27.6185);
    setLongitude(83.4682);
    setAttachedPhotos([]);
  };

  const processPayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      if (checkoutListingId) {
        onUpdatePayment(checkoutListingId);
      }
      setIsPaying(false);
      setCheckoutListingId(null);
      alert('Payment received! Your listing tier is now upgraded to PAID and sent to Admin for audit.');
    }, 1500);
  };

  const handleReplySubmit = (inqId: string) => {
    onSellerReply(inqId, sellerReplyText);
    setActiveReplyId(null);
    setSellerReplyText('');
    alert('Reply submitted to Admin! Admin will route this to the buyer.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Broker Chat & Negotiation Tab for Seller */}
      {activeTab === 'broker-chat' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
          <div className="bg-white border border-neutral-150 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-neutral-100 pb-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest font-bold">Seller Negotiation Hub</span>
                <h2 className="text-xl font-serif font-bold text-neutral-950 mt-1">Broker Chat & Direct Buyer Negotiation</h2>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">Manage incoming buyer inquiries and offer terms instantly.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Connection</span>
              </div>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral-400 font-mono space-y-2">
                <p>No active buyer chats found.</p>
                <p className="text-[11px]">When buyers inquire about your plots, negotiation streams will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Thread list */}
                <div className="md:col-span-5 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase font-mono">Incoming Buyer Inquiries</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {inquiries.map((inq) => (
                      <div
                        key={`seller-inq-${inq.id}`}
                        className="p-3.5 rounded-xl border border-neutral-200 hover:border-amber-700 transition-all cursor-pointer bg-neutral-50/50 space-y-1.5"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-amber-800 font-bold uppercase">{inq.subject}</span>
                          <span className="text-[9px] font-mono bg-white border border-neutral-200 px-1.5 py-0.5 rounded text-neutral-600">{inq.status}</span>
                        </div>
                        <h4 className="font-serif font-bold text-neutral-900 text-xs">{inq.listingTitle}</h4>
                        <p className="text-[11px] text-neutral-600 line-clamp-1 italic">"{inq.message}"</p>
                        <span className="text-[9px] text-neutral-400 font-mono block">From: {inq.buyerName} ({inq.buyerContact})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active chat window */}
                <div className="md:col-span-7 bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col justify-between h-[520px]">
                  <div className="border-b border-neutral-200 pb-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-neutral-900 text-sm">Negotiation & Counter-Offer Stream</h4>
                      <p className="text-[10px] text-neutral-500 font-mono">Direct seller response channel</p>
                    </div>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      SELLER-HUB
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2">
                    {inquiries.map((inq) => (
                      <div key={`seller-chat-${inq.id}`} className="space-y-3">
                        {/* Buyer message */}
                        <div className="flex flex-col items-start">
                          <div className="bg-white text-neutral-900 border border-neutral-200 p-3 rounded-2xl rounded-tl-xs max-w-md text-xs font-sans space-y-1 shadow-xs">
                            <span className="text-[9px] font-mono font-bold uppercase text-neutral-400 block">Buyer Inquiry:</span>
                            <p>{inq.message}</p>
                            <span className="text-[9px] text-neutral-400 font-mono block">{new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        {/* Seller response */}
                        {inq.sellerResponse && (
                          <div className="flex flex-col items-end">
                            <div className="bg-emerald-800 text-white p-3 rounded-2xl rounded-tr-xs max-w-md text-xs font-sans space-y-1">
                              <span className="text-[9px] font-mono font-bold uppercase text-emerald-200 block">Your Reply:</span>
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
                      placeholder="Type counter-offer, terms, or inspection details..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          onSellerReply(inquiries[0]?.id || '', e.currentTarget.value);
                          alert('Counter-offer and reply sent to buyer successfully.');
                          e.currentTarget.value = '';
                        }
                      }}
                      className="flex-1 bg-white border border-neutral-300 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (inquiries[0]) {
                          onSellerReply(inquiries[0].id, 'Accepted terms. Proceeding to Malpot verification.');
                          alert('Reply dispatched to buyer!');
                        }
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                    >
                      Send Reply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload New Plot Tab */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <form onSubmit={handleUploadSubmit} className="lg:col-span-8 bg-white p-6 border border-neutral-100 rounded-xl space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h2 className="text-lg font-bold text-neutral-900 font-serif flex items-center gap-2">
                <PlusCircle className="text-amber-700" size={18} />
                Upload New Land Plot / Real Estate Listing
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Note: Under Nepal rules, the exact expected price remains encrypted and strictly visible to the Admin only.
              </p>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Listing Headline Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prime Corner Plotting Land - Chabahil, Kathmandu"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your land, surrounding community, road plans, proximity to highways, soil suitability, water source, and boundaries."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-2 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Geographical Address details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-neutral-100">
              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                >
                  <option value="Rupandehi">Rupandehi</option>
                  <option value="Kathmandu">Kathmandu</option>
                  <option value="Lalitpur">Lalitpur</option>
                  <option value="Kaski">Kaski</option>
                  <option value="Chitwan">Chitwan</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Municipality</label>
                <input
                  type="text"
                  required
                  value={municipality}
                  onChange={(e) => setMunicipality(e.target.value)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Ward No</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={32}
                  value={ward}
                  onChange={(e) => setWard(parseInt(e.target.value) || 1)}
                  className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">Regional System</label>
                <div className="flex bg-neutral-100 p-0.5 rounded">
                  <button
                    type="button"
                    onClick={() => setLandType('Terai')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded ${landType === 'Terai' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'}`}
                  >
                    Terai (KBD)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLandType('Hilly')}
                    className={`flex-1 py-1 text-[10px] font-medium rounded ${landType === 'Hilly' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'}`}
                  >
                    Hilly (RAPD)
                  </button>
                </div>
              </div>
            </div>

            {/* Area Covered & Specifications */}
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-150 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <Info size={14} className="text-amber-800" />
                Land Dimensions / Area Covered ({landType === 'Terai' ? 'Bigha-Kattha-Dhur' : 'Ropani-Aana-Paisa'})
              </h4>

              {landType === 'Terai' ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Bigha</label>
                    <input
                      type="number"
                      min={0}
                      value={bigha}
                      onChange={(e) => setBigha(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Kattha</label>
                    <input
                      type="number"
                      min={0}
                      max={19}
                      value={kattha}
                      onChange={(e) => setKattha(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Dhur</label>
                    <input
                      type="number"
                      min={0}
                      max={19}
                      value={dhur}
                      onChange={(e) => setDhur(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Ropani</label>
                    <input
                      type="number"
                      min={0}
                      value={ropani}
                      onChange={(e) => setRopani(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Aana</label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={aana}
                      onChange={(e) => setAana(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Paisa</label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={paisa}
                      onChange={(e) => setPaisa(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-500 uppercase mb-1">Daam</label>
                    <input
                      type="number"
                      min={0}
                      max={3}
                      value={daam}
                      onChange={(e) => setDaam(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Dynamic Calculated Area display - Zero Pill conform */}
              <div className="bg-neutral-100/50 p-2.5 rounded-lg border border-neutral-200/40 text-[11px] text-neutral-600 font-mono flex justify-between items-center">
                <span>Calculated Space Area:</span>
                <strong className="text-neutral-900 font-bold">
                  ~{(landType === 'Terai' 
                    ? (bigha * 72900) + (kattha * 3645) + (dhur * 182.25) 
                    : (ropani * 5476) + (aana * 342.25) + (paisa * 85.56) + (daam * 21.39)
                  ).toLocaleString()} Sq. Ft.
                </strong>
              </div>

              {/* Coordinates and Road specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-neutral-150 pt-3">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Road Width (Ft)</label>
                  <input
                    type="number"
                    min={0}
                    value={accessRoadWidth}
                    onChange={(e) => setAccessRoadWidth(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">GPS Latitude Coordinate</label>
                  <input
                    type="number"
                    step={0.0001}
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 27.6185)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">GPS Longitude Coordinate</label>
                  <input
                    type="number"
                    step={0.0001}
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 83.4682)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                  />
                </div>
              </div>

              {/* Expected secret Price & landmarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Expected Pricing (NPR - Secret)</label>
                  <input
                    type="number"
                    min={0}
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-neutral-500 uppercase mb-1">Nearest Landmarks / Chowk Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. 200m East of Siddhartha Chowk, next to Ward Office"
                    value={landmarks}
                    onChange={(e) => setLandmarks(e.target.value)}
                    className="w-full border border-neutral-200 rounded p-1.5 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Interactive Photo Upload Component */}
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-150 space-y-4">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                <PlusCircle size={14} className="text-amber-800" />
                Upload Property Photos & Scenic Portfolios
              </h4>
              <p className="text-[11px] text-neutral-500 leading-normal">
                Attach high-resolution photos of your plot or neighborhood structures to increase target interest.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setAttachedPhotos([...attachedPhotos, '/src/assets/images/nepal_plotting_land_1790864925005.jpg']);
                  }}
                  className="p-3 border border-neutral-250 bg-white hover:bg-neutral-50 rounded-lg text-center transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-semibold text-neutral-800 block">Attach Plotting Land Photo</span>
                  <span className="text-[9px] text-neutral-400 font-mono mt-0.5 block">Preset Pokhara/Tilottama asset</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAttachedPhotos([...attachedPhotos, '/src/assets/images/nepal_modern_villa_1790864836958.jpg']);
                  }}
                  className="p-3 border border-neutral-250 bg-white hover:bg-neutral-50 rounded-lg text-center transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-semibold text-neutral-800 block">Attach Modern Villa Structure</span>
                  <span className="text-[9px] text-neutral-400 font-mono mt-0.5 block">Preset Kathmandu valley asset</span>
                </button>

                <div className="flex flex-col justify-center p-3 border border-dashed border-neutral-300 bg-white/50 rounded-lg text-center text-[10px] text-neutral-400 font-mono">
                  Drag & drop files here to attach
                </div>
              </div>

              {/* Render Preview cards */}
              {attachedPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-3 pt-2">
                  {attachedPhotos.map((url, index) => (
                    <div key={index} className="relative aspect-video rounded border border-neutral-200 overflow-hidden bg-neutral-100 group">
                      <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedPhotos(attachedPhotos.filter((_, idx) => idx !== index))}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-700 text-white p-0.5 rounded-full text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities Checklist - no static capsules, unboxed text blocks with toggle buttons */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Available Plots Infrastructures
              </label>
              <div className="flex flex-wrap gap-2">
                {['Electricity', 'Water supply', 'Drainage', 'Blacktopped Road', 'Fenced', 'Solar Panel', 'Near Market', 'Corner Plot'].map((amenity) => (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                      amenities.includes(amenity)
                        ? 'bg-amber-50 text-amber-900 border-amber-700/35 font-semibold'
                        : 'bg-white text-neutral-600 border-neutral-200 hover:text-neutral-800'
                    }`}
                  >
                    {amenities.includes(amenity) ? '✓ ' : ''}
                    {amenity}
                  </button>
                ))}
              </div>
            </div>

            {/* Secure Legal Verification Document Upload Interface */}
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-150 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide flex items-center gap-1.5">
                  <UploadCloud size={14} className="text-amber-800" />
                  Legal Ownership & Identity Verification Files
                </h4>
                <div className="flex items-center gap-1 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                  <span>🔒</span> AES-256 Encrypted Tunnel
                </div>
              </div>

              <p className="text-[11px] text-neutral-500 leading-normal">
                Under Malpot Land Registry guidelines, listing land requires both proof of ownership (Lalpurja) and identity verification (Citizenship Copy).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File Uploader 1: Lalpurja Deeds */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 block uppercase font-mono tracking-wider">
                      1. Land Ownership Deed (Lalpurja)
                    </span>
                    <p className="text-[9px] text-neutral-400 leading-snug mt-0.5">
                      Clear PDF or scan of the official registration land deed.
                    </p>
                  </div>

                  <div className="pt-3">
                    {encryptionProgress['lalpurja'] !== undefined && encryptionProgress['lalpurja'] < 100 ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-amber-700">
                          <span>Encrypting stream...</span>
                          <span>{encryptionProgress['lalpurja']}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-600 h-full rounded-full transition-all duration-100" 
                            style={{ width: `${encryptionProgress['lalpurja']}%` }}
                          />
                        </div>
                      </div>
                    ) : lalpurjaName ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 py-2 px-3 rounded border border-emerald-150 font-mono">
                        <span className="truncate max-w-[140px] font-semibold">{lalpurjaName}</span>
                        <button 
                          type="button" 
                          onClick={() => { setLalpurjaName(''); setLalpurjaUrl(''); }}
                          className="text-neutral-400 hover:text-red-700 font-bold ml-1 text-xs"
                        >
                          Clear ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => simulateSecureUpload('lalpurja')}
                        className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-mono font-bold py-2 px-3 rounded text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Attach Certified Deed PDF
                      </button>
                    )}
                  </div>
                </div>

                {/* File Uploader 2: Citizenship Certificate Copy (Nagarikta) */}
                <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-neutral-500 block uppercase font-mono tracking-wider">
                      2. Citizenship Copy (Nagarikta)
                    </span>
                    <p className="text-[9px] text-neutral-400 leading-snug mt-0.5">
                      Both front and back scans of Nepalese citizenship card.
                    </p>
                  </div>

                  <div className="pt-3">
                    {encryptionProgress['citizenship'] !== undefined && encryptionProgress['citizenship'] < 100 ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-mono text-amber-700">
                          <span>Securing document copy...</span>
                          <span>{encryptionProgress['citizenship']}%</span>
                        </div>
                        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-600 h-full rounded-full transition-all duration-100" 
                            style={{ width: `${encryptionProgress['citizenship']}%` }}
                          />
                        </div>
                      </div>
                    ) : citizenshipName ? (
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 py-2 px-3 rounded border border-emerald-150 font-mono">
                        <span className="truncate max-w-[140px] font-semibold">{citizenshipName}</span>
                        <button 
                          type="button" 
                          onClick={() => { setCitizenshipName(''); setCitizenshipUrl(''); }}
                          className="text-neutral-400 hover:text-red-700 font-bold ml-1 text-xs"
                        >
                          Clear ×
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => simulateSecureUpload('citizenship')}
                        className="w-full bg-neutral-950 hover:bg-neutral-850 text-white font-mono font-bold py-2 px-3 rounded text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        Attach Citizenship Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase font-mono tracking-wider">
                  3. AI Hero Image Generator
                </span>
                <button
                  type="button"
                  onClick={generateListingImage}
                  disabled={isGenerating}
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-mono font-bold py-2 px-3 rounded text-[10px] transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {isGenerating ? 'Generating...' : <><Sparkles size={12} /> Generate Listing Hero Image</>}
                </button>
                {generatedImageUrl && (
                  <img src={generatedImageUrl} alt="Generated Hero" className="mt-2 rounded" />
                )}
              </div>

              {/* Additional Verification Scans */}
              <div className="border border-neutral-200 rounded-lg p-4 bg-white space-y-3">
                <span className="text-[10px] font-bold text-neutral-400 block uppercase font-mono tracking-wider">
                  4. Optional Trace Maps / Tax Receipts
                </span>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Ward Road Recommendation, Trace Map"
                    value={customDocName}
                    onChange={(e) => setCustomDocName(e.target.value)}
                    className="flex-1 border border-neutral-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customDocName.trim()) return;
                      setAdditionalDocs([
                        ...additionalDocs,
                        {
                          name: customDocName.trim() + '.jpg',
                          url: '/src/assets/images/blueprint_sketch_1790864939184.jpg',
                          uploadedAt: new Date().toISOString()
                        }
                      ]);
                      setCustomDocName('');
                    }}
                    className="bg-amber-700 text-white text-[10px] font-semibold px-2.5 rounded hover:bg-amber-800 shrink-0 cursor-pointer"
                  >
                    Add File
                  </button>
                </div>

                {/* Document List */}
                {additionalDocs.length > 0 ? (
                  <div className="space-y-1.5 max-h-24 overflow-y-auto">
                    {additionalDocs.map((doc, index) => (
                      <div key={index} className="flex justify-between items-center text-[11px] bg-neutral-50 p-1.5 rounded border border-neutral-100 font-mono">
                        <span className="text-neutral-700 truncate">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setAdditionalDocs(additionalDocs.filter((_, idx) => idx !== index))}
                          className="text-neutral-400 hover:text-red-700 font-bold px-1 text-xs cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-[9px] text-neutral-400 block leading-relaxed italic">
                    Optionally add Trace Maps (Kitta Trace) or Municipal Tax Clearance receipts.
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white font-semibold py-2.5 px-6 rounded text-xs transition-colors w-full"
            >
              Verify Details & List Plot
            </button>
            <FAQ role="seller" />
          </form>

          {/* Service Categories Promo Tier Guide */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 border border-neutral-100 rounded-xl space-y-4">
              <h3 className="font-serif text-base font-bold text-neutral-950 border-b border-neutral-100 pb-2">
                Display Promotion Tiers
              </h3>
              <p className="text-xs text-neutral-500 leading-normal">
                Choose a priority listing category below to display your plot. Social media boosts are powered by our localized networks in Tilottama & Pokhara.
              </p>

              {/* Tier Cards */}
              <div className="space-y-3.5">
                {[
                  {
                    code: 'A',
                    price: '10,000',
                    name: 'Tier A: Basic Display',
                    desc: 'Plot listed publicly on GharJagga Nepal app + initial Facebook/TikTok promotion.',
                  },
                  {
                    code: 'B',
                    price: '15,000',
                    name: 'Tier B: Priority Target',
                    desc: 'Priority search ranking, active client match alerts, and mid-range social campaigns.',
                  },
                  {
                    code: 'C',
                    price: '20,000',
                    name: 'Tier C: Premium Counsel',
                    desc: 'Permanent banner slot, high-reach TikTok video, and dedicated legal draft checking by counsel.',
                  },
                ].map((tier) => (
                  <div
                    key={tier.code}
                    onClick={() => setServiceCategory(tier.code as any)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all flex flex-col space-y-1.5 ${
                      serviceCategory === tier.code
                        ? 'bg-amber-50/50 border-amber-800/40 shadow-xs'
                        : 'border-neutral-150 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-xs text-neutral-950">{tier.name}</span>
                      <span className="font-mono text-xs font-bold text-amber-800">NPR {tier.price}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-normal">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Track Listings Tab */}
      {activeTab === 'my-listings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-baseline border-b border-neutral-100 pb-3">
            <h2 className="text-xl font-serif font-bold text-neutral-900">My Uploaded Plots ({sellerListings.length})</h2>
            <span className="text-xs text-neutral-400 font-mono">Verified Seller: {sellerName}</span>
          </div>

          {sellerListings.length === 0 ? (
            <div className="bg-neutral-50 border border-neutral-150 p-12 text-center rounded-xl text-neutral-400">
              You haven't listed any real estate plots yet. Use the "Upload New Plot" tab to list land.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerListings.map((listing) => (
                <div key={listing.id} className="bg-white border border-neutral-150 rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="relative aspect-video">
                    <img
                      src={listing.photos[0] || '/src/assets/images/nepal_plotting_land_1790864925005.jpg'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Status marker */}
                    <div className="absolute top-3 left-3 bg-neutral-900/85 text-white font-mono text-[9px] px-2 py-0.5 rounded uppercase font-semibold">
                      {listing.status}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-400 uppercase font-mono tracking-wider">
                        {listing.district} · Tier {listing.serviceCategory}
                      </span>
                      <h4 className="font-semibold text-xs text-neutral-900 line-clamp-1">{listing.title}</h4>
                      <p className="text-[11px] text-neutral-400">
                        Area: {formatNepaliArea(listing.landType, listing.area)}
                      </p>
                    </div>

                    <div className="border-t border-neutral-100 pt-3 space-y-2.5 text-xs">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-neutral-400">Secret Expected Price:</span>
                        <strong className="text-neutral-800">NPR {listing.expectedPrice.toLocaleString('en-US')}</strong>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-neutral-400">Upgrade Tier Payment:</span>
                        <span
                          className={`font-mono text-[10px] font-bold uppercase ${
                            listing.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {listing.paymentStatus}
                        </span>
                      </div>

                      {listing.rejectionReason && (
                        <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded">
                          <strong>Rejection reason:</strong> {listing.rejectionReason}
                        </p>
                      )}

                      {listing.paymentStatus === 'Pending' && (
                        <button
                          type="button"
                          onClick={() => setCheckoutListingId(listing.id)}
                          className="w-full bg-amber-700 text-white font-semibold py-1.5 rounded text-[11px] transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CreditCard size={12} />
                          Pay Tier Service Charge
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Buyer Inquiries received */}
      {activeTab === 'seller-queries' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Incoming Visits */}
          <div className="bg-white p-6 border border-neutral-100 rounded-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-neutral-950 border-b border-neutral-50 pb-2">
              Assigned Site Visits Schedule
            </h3>
            <p className="text-xs text-neutral-500 leading-normal">
              These visits are assigned through GharJagga Nepal brokers to protect physical security and location privacy of your land plot.
            </p>

            {visits.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-mono">No visits assigned yet.</div>
            ) : (
              <div className="space-y-3">
                {visits.map((v) => (
                  <div key={v.id} className="border border-neutral-100 p-3.5 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between items-start">
                      <strong className="text-neutral-900">{v.listingTitle}</strong>
                      <span className="font-mono text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase">
                        {v.status}
                      </span>
                    </div>
                    <p className="text-neutral-500">
                      Proposed Date: <span className="font-mono font-medium text-neutral-700">{v.preferredDate}</span> at {v.preferredTime}
                    </p>
                    {v.notes && <p className="text-[10px] text-neutral-400 italic">Notes: "{v.notes}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Incoming Inquiries */}
          <div className="bg-white p-6 border border-neutral-100 rounded-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-neutral-950 border-b border-neutral-50 pb-2">
              Buyer Queries (Indirect Communications)
            </h3>
            <p className="text-xs text-neutral-500 leading-normal">
              Respond to potential buyer queries. The broker manages document transmittals on your behalf to maintain brokerage confidentiality.
            </p>

            {inquiries.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-mono">No active queries routed yet.</div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq.id} className="border border-neutral-100 p-4 rounded-lg space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-amber-800 font-bold">{inq.subject}</span>
                        <h4 className="font-bold text-neutral-900 mt-0.5">{inq.listingTitle}</h4>
                      </div>
                      <span className="font-mono text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">
                        {inq.status}
                      </span>
                    </div>

                    <p className="text-neutral-600 italic bg-neutral-50 p-2.5 rounded">"{inq.message}"</p>

                    {inq.sellerResponse ? (
                      <div className="bg-emerald-50 p-2.5 rounded border border-emerald-100 text-emerald-900">
                        <strong>My Response:</strong> {inq.sellerResponse}
                      </div>
                    ) : activeReplyId === inq.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={sellerReplyText}
                          onChange={(e) => setSellerReplyText(e.target.value)}
                          className="w-full border border-neutral-200 rounded p-1.5 text-xs focus:outline-none"
                          placeholder="Type your response to the buyer inquiry..."
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => setActiveReplyId(null)}
                            className="bg-neutral-50 text-neutral-500 px-2.5 py-1 rounded hover:bg-neutral-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(inq.id)}
                            className="bg-amber-700 text-white px-3 py-1 rounded hover:bg-amber-850"
                          >
                            Submit Response
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(inq.id)}
                        className="w-full text-center border border-amber-700/20 text-amber-900 bg-amber-50/20 py-1.5 rounded hover:bg-amber-50/50"
                      >
                        Reply to Query
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout QR Modal (Fonepay Simulation) */}
      {checkoutListingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-59">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center space-y-4 border border-neutral-200">
            <h3 className="font-serif text-lg font-bold text-neutral-950">Secure Promotion Tier checkout</h3>
            <p className="text-xs text-neutral-500">
              Upgrade your listing priority. Instantly pay your listing tier charge via mobile wallet.
            </p>

            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedWallet('fonepay')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md ${
                  selectedWallet === 'fonepay' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Fonepay QR
              </button>
              <button
                type="button"
                onClick={() => setSelectedWallet('esewa')}
                className={`flex-1 text-center py-1.5 text-xs font-semibold rounded-md ${
                  selectedWallet === 'esewa' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                eSewa
              </button>
            </div>

            {/* Fonepay simulated QR */}
            <div className="bg-neutral-50 border border-neutral-150 p-4 rounded-lg flex flex-col items-center space-y-2">
              <div className="w-40 h-40 bg-neutral-900 flex items-center justify-center border border-neutral-200 p-2 rounded">
                {/* Simulated QR block */}
                <div className="w-full h-full bg-cover" style={{ backgroundImage: 'url("https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=fonepay-gharjagga")' }} />
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">Scan QR to pay: NPR 15,000 (Priority B)</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutListingId(null)}
                className="flex-1 py-2 text-xs font-semibold text-neutral-500 bg-neutral-50 rounded hover:bg-neutral-100"
              >
                Skip / Pay Later
              </button>
              <button
                type="button"
                disabled={isPaying}
                onClick={processPayment}
                className="flex-1 py-2 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded transition-colors"
              >
                {isPaying ? 'Verifying payment...' : 'Confirm Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
