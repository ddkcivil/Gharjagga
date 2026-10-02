/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BuyerPortal from './components/BuyerPortal';
import SellerPortal from './components/SellerPortal';
import AdminPortal from './components/AdminPortal';
import CalculatorPortal from './components/CalculatorPortal';

import { Listing, SiteVisit, Inquiry, SystemNotification } from './types';
import { initialListings, initialVisits, initialInquiries } from './mockData';

export default function App() {
  // Primary role states: 'buyer', 'seller', 'admin'
  const [role, setRole] = useState<'buyer' | 'seller' | 'admin'>('buyer');
  
  // Tab states for distinct navigation matching active role
  const [buyerTab, setBuyerTab] = useState<string>('explore');
  const [sellerTab, setSellerTab] = useState<string>('upload');
  const [adminTab, setAdminTab] = useState<string>('approvals');

  // Load from localStorage if present, otherwise default to initial mocked datasets
  const [listings, setListings] = useState<Listing[]>(() => {
    const saved = localStorage.getItem('gjn_listings');
    return saved ? JSON.parse(saved) : initialListings;
  });

  const [visits, setVisits] = useState<SiteVisit[]>(() => {
    const saved = localStorage.getItem('gjn_visits');
    return saved ? JSON.parse(saved) : initialVisits;
  });

  const [inquiries, setInquiries] = useState<Inquiry[]>(() => {
    const saved = localStorage.getItem('gjn_inquiries');
    return saved ? JSON.parse(saved) : initialInquiries;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('gjn_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    const saved = localStorage.getItem('gjn_notifications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'system-welcome',
        message: 'Welcome to GharJagga Nepal! Securely list, explore and audit certified lands.',
        type: 'system',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gjn_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    localStorage.setItem('gjn_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('gjn_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('gjn_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('gjn_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Language state: 'en' (English) or 'np' (Nepali)
  const [lang, setLang] = useState<'en' | 'np'>('en');

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fId => fId !== id) : [...prev, id]
    );
  };


  // Handler helpers
  const handleAddListing = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    alert('Land plot uploaded successfully! You can now pay the tier service charge.');
  };

  const handleUpdatePayment = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, paymentStatus: 'Paid' } : l))
    );
  };

  const handleApproveListing = (id: string, guidePrice: number, showPriceToPublic: boolean) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Approved', guidePrice, showPriceToPublic } : l))
    );
    alert('Listing successfully approved & published for buyers!');
  };

  const handleTogglePriceVisibility = (id: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, showPriceToPublic: !l.showPriceToPublic } : l))
    );
  };

  const handleRejectListing = (id: string, reason: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'Rejected', rejectionReason: reason } : l))
    );
    alert('Listing rejected and marked with auditing notes.');
  };

  const handleBookVisit = (newVisitData: Omit<SiteVisit, 'id' | 'createdAt'>) => {
    const newVisit: SiteVisit = {
      ...newVisitData,
      id: `visit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setVisits((prev) => [newVisit, ...prev]);
  };

  const handleSendInquiry = (newInquiryData: Omit<Inquiry, 'id' | 'createdAt'>) => {
    const newInquiry: Inquiry = {
      ...newInquiryData,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setInquiries((prev) => [newInquiry, ...prev]);
  };

  const handleUpdateVisitStatus = (id: string, status: SiteVisit['status']) => {
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    const targetVisit = visits.find((v) => v.id === id);
    if (targetVisit) {
      const msg = `Your site visit request for "${targetVisit.listingTitle}" has been updated to: "${status}".`;
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        message: msg,
        type: 'visit_update',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    alert(`Site visit status updated to: ${status}`);
  };

  const handleUpdateInquiry = (id: string, adminNotes: string, status: Inquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, adminNotes, status } : inq))
    );
  };

  const handleSellerReply = (inquiryId: string, reply: string) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === inquiryId ? { ...inq, sellerResponse: reply, status: 'Seller Replied' } : inq))
    );
    const inq = inquiries.find((i) => i.id === inquiryId);
    if (inq) {
      const msg = `Seller replied to your query regarding "${inq.subject}": "${reply.slice(0, 45)}..."`;
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        message: msg,
        type: 'inquiry_response',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddInquiryResponse = (id: string, response: string, status: Inquiry['status']) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq.id === id ? { ...inq, sellerResponse: response, status } : inq))
    );
    const inq = inquiries.find((i) => i.id === id);
    if (inq) {
      const msg = `New update on your Inquiry "${inq.subject}": "${response.slice(0, 45)}..."`;
      const newNotif: SystemNotification = {
        id: `notif-${Date.now()}`,
        message: msg,
        type: 'inquiry_response',
        read: false,
        createdAt: new Date().toISOString()
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  // Switch tabs cleanly based on active role
  const activeTab = role === 'buyer' ? buyerTab : role === 'seller' ? sellerTab : adminTab;
  const setTab = (tab: string) => {
    if (role === 'buyer') setBuyerTab(tab);
    else if (role === 'seller') setSellerTab(tab);
    else setAdminTab(tab);
  };

  return (
    <div className="min-h-screen bg-neutral-50/50 flex flex-col font-sans">
      {/* 3-Zone top navigation */}
      <Navbar
        currentRole={role}
        setRole={(r) => setRole(r)}
        activeTab={activeTab}
        onNavigate={(tab) => setTab(tab)}
        notifications={notifications}
        onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
        onClearNotifications={() => setNotifications([])}
        lang={lang}
        setLang={setLang}
      />

      {/* Main page content area */}
      <main className="flex-1">
        {role === 'buyer' && (
          <>
            {buyerTab === 'calculator' ? (
              <CalculatorPortal />
            ) : (
              <BuyerPortal
                listings={listings}
                visits={visits}
                inquiries={inquiries}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onBookVisit={handleBookVisit}
                onSendInquiry={handleSendInquiry}
                activeTab={buyerTab}
              />
            )}
          </>
        )}

        {role === 'seller' && (
          <SellerPortal
            listings={listings}
            visits={visits}
            inquiries={inquiries}
            onAddListing={handleAddListing}
            onUpdatePayment={handleUpdatePayment}
            onSellerReply={handleSellerReply}
            activeTab={sellerTab}
          />
        )}

        {role === 'admin' && (
          <AdminPortal
            listings={listings}
            visits={visits}
            inquiries={inquiries}
            onApproveListing={handleApproveListing}
            onRejectListing={handleRejectListing}
            onTogglePriceVisibility={handleTogglePriceVisibility}
            onUpdateVisitStatus={handleUpdateVisitStatus}
            onUpdateInquiry={handleUpdateInquiry}
            onAddInquiryResponse={handleAddInquiryResponse}
            activeTab={adminTab}
          />
        )}
      </main>

      {/* Footer conforming to guidelines */}
      <footer className="bg-white border-t border-neutral-100 py-8 text-center text-xs text-neutral-400 font-mono mt-12 space-y-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 GharJagga Nepal. Governed as per Land Revenue & Brokerage Rules of Nepal.</p>
          <div className="flex items-center gap-6 text-[11px] font-sans">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 transition-colors">Facebook Ad Hub</a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 transition-colors">WhatsApp Direct</a>
            <a href="https://viber.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 transition-colors">Viber Community</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 transition-colors">Instagram Showcase</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-amber-800 transition-colors">YouTube Video Tours</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
