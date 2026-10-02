export interface Listing {
  id: string;
  title: string;
  description: string;
  district: string;
  municipality: string;
  ward: number;
  landType: 'Terai' | 'Hilly';
  area: {
    bigha?: number;
    kattha?: number;
    dhur?: number;
    ropani?: number;
    aana?: number;
    paisa?: number;
    daam?: number;
  };
  accessRoadWidth: number; // in feet
  coordinates?: { lat: number; lng: number }; // Geographical Coordinates
  expectedPrice: number; // secret, only admin and listing seller see this
  guidePrice: number; // public approved price seen by buyers
  showPriceToPublic?: boolean; // Controlled by admin to reveal or mask price to buyers
  landmarks?: string; // Nearest Highway/Chowk reference description
  amenities: string[];
  locationMapUrl: string;
  planUrl: string;
  photos: string[];
  lalpurjaUrl?: string; // Lalpurja scan document URL
  legalDocs?: { name: string; url: string; uploadedAt: string }[]; // Additional verification documents
  serviceCategory: 'A' | 'B' | 'C'; // A = 10k, B = 15k, C = 20k
  paymentStatus: 'Pending' | 'Paid';
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  rejectionReason?: string;
  sellerName: string;
  sellerContact: string;
  sellerEmail: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface SiteVisit {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  buyerContact: string;
  buyerEmail: string;
  preferredDate: string;
  preferredTime: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerName: string;
  buyerContact: string;
  buyerEmail: string;
  subject: 'Legal Support' | 'Agreement Draft' | 'Plot Query' | 'Price Negotiation' | 'Document Verification';
  message: string;
  status: 'Open' | 'Admin Routed' | 'Seller Replied' | 'Resolved';
  adminNotes?: string;
  sellerResponse?: string;
  createdAt: string;
}

export interface CommissionInvoice {
  invoiceNo: string;
  listingId: string;
  propertyTitle: string;
  sellerName: string;
  buyerName: string;
  finalPrice: number;
  commissionRate: number; // e.g. 2.5 (%)
  commissionAmount: number;
  vatAmount: number; // 13%
  tdsAmount: number; // 1.5%
  netAmount: number;
  buyerRebateType: 'None' | 'Female' | 'Senior/Disabled';
  registrationFeeEstimate: number;
  capitalGainsTaxEstimate: number;
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  message: string;
  type: 'visit_update' | 'inquiry_response' | 'system';
  read: boolean;
  createdAt: string;
}
