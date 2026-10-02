import React, { useState } from 'react';
import { Home, User, Shield, Briefcase, Bell, Trash2, Mail, CheckCheck } from 'lucide-react';
import { SystemNotification } from '../types';

interface NavbarProps {
  currentRole: 'buyer' | 'seller' | 'admin';
  setRole: (role: 'buyer' | 'seller' | 'admin') => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
  notifications: SystemNotification[];
  onMarkAsRead: (id: string) => void;
  onClearNotifications: () => void;
  lang: 'en' | 'np';
  setLang: (lang: 'en' | 'np') => void;
}

export default function Navbar({ 
  currentRole, 
  setRole, 
  onNavigate, 
  activeTab,
  notifications,
  onMarkAsRead,
  onClearNotifications,
  lang,
  setLang
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const t = {
    en: {
      brandSub: 'Nepal',
      buyerPortal: 'Buyer Portal',
      sellerHub: 'Seller Hub',
      adminPanel: 'Admin Panel',
      explore: 'Explore Listings',
      calculator: 'Commission & Tax Calculator',
      legal: 'Legal Support & Checklists',
      myBookings: 'My Visits & Queries',
      saved: 'Saved Listings',
      upload: 'Upload Land',
      manage: 'Manage Listings',
      approvals: 'Approvals & Audit',
      adminVisits: 'Site Visits',
      adminInquiries: 'Queries & Law',
    },
    np: {
      brandSub: 'नेपाल',
      buyerPortal: 'खरीददार पोर्टल',
      sellerHub: 'बिक्रीकर्ता केन्द्र',
      adminPanel: 'प्रशासन प्यानल',
      explore: 'जग्गाहरू खोज्नुहोस्',
      calculator: 'कमिसन र कर क्याल्कुलेटर',
      legal: 'कानूनी सहायता र चेकलिस्ट',
      myBookings: 'मेरो भ्रमण र जिज्ञासाहरू',
      saved: 'सुरक्षित जग्गाहरू',
      upload: 'जग्गा दर्ता',
      manage: 'जग्गा व्यवस्थापन',
      approvals: 'स्वीकृति र लेखापरीक्षण',
      adminVisits: 'साइट भ्रमणहरू',
      adminInquiries: 'जिज्ञासा र कानुनी',
    }
  };

  const strings = t[lang];
  return (
    <header className="border-b border-neutral-100 bg-white sticky top-0 z-50">
      {/* Upper bar: Logo, Role Selector, User indicators */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Zone 1: Single element wordmark for Brand */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-neutral-900 font-serif">
            GharJagga <span className="text-amber-700">Nepal</span>
          </span>
        </div>

        {/* Zone 2: Role switcher - styled segmented controls (Allowed interactive buttons) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
          <button
            onClick={() => {
              setRole('buyer');
              onNavigate('explore');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentRole === 'buyer'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <User size={14} />
            {lang === 'np' ? 'खरीददार पोर्टल' : 'Buyer Portal'}
          </button>
          <button
            onClick={() => {
              setRole('seller');
              onNavigate('upload');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentRole === 'seller'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Briefcase size={14} />
            {lang === 'np' ? 'बिक्रीकर्ता केन्द्र' : 'Seller Hub'}
          </button>
          <button
            onClick={() => {
              setRole('admin');
              onNavigate('approvals');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
              currentRole === 'admin'
                ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Shield size={14} />
            {lang === 'np' ? 'प्रशासन प्यानल' : 'Admin Panel'}
          </button>
        </div>

        {/* User indicator, Language Toggle & Real-time Notification Dropdown */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Role: {currentRole.toUpperCase()}</span>
          </div>

          {/* Language Toggle Button */}
          <div className="flex bg-neutral-100 p-0.5 rounded-md border border-neutral-200">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                lang === 'en' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('np')}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition-all ${
                lang === 'np' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              नेपाली
            </button>
          </div>

          {/* Real-time secure notification system */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 hover:bg-neutral-100 rounded-full transition-all relative text-neutral-600 hover:text-neutral-900 cursor-pointer flex items-center"
              title="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-amber-700 text-white rounded-full flex items-center justify-center text-[8px] font-bold font-sans">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Dropdown */}
            {isOpen && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white border border-neutral-150 rounded-xl shadow-lg py-3 z-50 space-y-2">
                <div className="px-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-900 uppercase tracking-wider font-mono">Alert Logs</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={() => { onClearNotifications(); setIsOpen(false); }}
                      className="text-[9px] text-red-600 hover:text-red-800 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 size={10} /> Clear All
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto px-2 space-y-1">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-neutral-400 italic font-sans">
                      No secure notification logs.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2 rounded-lg text-left transition-all ${
                          notif.read ? 'bg-white opacity-60' : 'bg-neutral-50 border border-neutral-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-[10px] text-neutral-700 leading-snug font-sans font-medium">
                            {notif.message}
                          </p>
                          {!notif.read && (
                            <button
                              onClick={() => onMarkAsRead(notif.id)}
                              className="text-[9px] text-emerald-600 hover:text-emerald-800 font-semibold p-0.5 shrink-0 cursor-pointer"
                              title="Mark read"
                            >
                              <CheckCheck size={11} />
                            </button>
                          )}
                        </div>
                        <span className="text-[8px] text-neutral-400 font-mono block mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation links bar matching Role */}
      <div className="bg-neutral-50/50 border-t border-neutral-100 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
            {currentRole === 'buyer' && (
              <>
                <button
                  onClick={() => onNavigate('explore')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'explore' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Explore Listings
                </button>
                <button
                  onClick={() => onNavigate('calculator')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'calculator' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Commission & Tax Calculator
                </button>
                <button
                  onClick={() => onNavigate('legal')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'legal' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Legal Support & Checklists
                </button>
                <button
                  onClick={() => onNavigate('my-bookings')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'my-bookings' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  My Visits & Queries
                </button>
                <button
                  onClick={() => onNavigate('saved')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'saved' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Saved Listings
                </button>
                <button
                  onClick={() => onNavigate('insights')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'insights' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Market Insights & Policy
                </button>
                <button
                  onClick={() => onNavigate('broker-chat')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'broker-chat' ? 'text-amber-800 font-semibold underline underline-offset-4 flex items-center gap-1' : 'flex items-center gap-1'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Broker Chat & Negotiation
                </button>
              </>
            )}

            {currentRole === 'seller' && (
              <>
                <button
                  onClick={() => onNavigate('upload')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'upload' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Upload New Plot
                </button>
                <button
                  onClick={() => onNavigate('my-listings')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'my-listings' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  My Plot Listings
                </button>
                <button
                  onClick={() => onNavigate('seller-queries')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'seller-queries' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Buyer Queries & Visits
                </button>
                <button
                  onClick={() => onNavigate('broker-chat')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'broker-chat' ? 'text-amber-800 font-semibold underline underline-offset-4 flex items-center gap-1' : 'flex items-center gap-1'}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Broker Chat & Negotiation
                </button>
              </>
            )}

            {currentRole === 'admin' && (
              <>
                <button
                  onClick={() => onNavigate('approvals')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'approvals' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Pending Listing Approvals
                </button>
                <button
                  onClick={() => onNavigate('admin-visits')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'admin-visits' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Booked Site Visits
                </button>
                <button
                  onClick={() => onNavigate('admin-inquiries')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'admin-inquiries' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Legal & Indirect Communications
                </button>
                <button
                  onClick={() => onNavigate('admin-billing')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'admin-billing' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Commission Billing / Invoices
                </button>
                <button
                  onClick={() => onNavigate('admin-analytics')}
                  className={`hover:text-amber-800 transition-colors ${activeTab === 'admin-analytics' ? 'text-amber-800 font-semibold underline underline-offset-4' : ''}`}
                >
                  Density Analytics
                </button>
              </>
            )}
          </nav>

          {/* Quick Contextual Action */}
          <div>
            {currentRole === 'buyer' && (
              <button
                onClick={() => {
                  setRole('seller');
                  onNavigate('upload');
                }}
                className="text-xs bg-amber-700 hover:bg-amber-800 text-white py-1 px-3 rounded-md transition-colors whitespace-nowrap"
              >
                Sell Your Land
              </button>
            )}
            {currentRole === 'seller' && (
              <button
                onClick={() => onNavigate('upload')}
                className="text-xs bg-amber-700 hover:bg-amber-800 text-white py-1 px-3 rounded-md transition-colors whitespace-nowrap"
              >
                + Post New Land
              </button>
            )}
            {currentRole === 'admin' && (
              <span className="text-xs text-neutral-400 font-mono">Brokerage Mode</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
