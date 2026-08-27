import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { RoomManagement } from './components/rooms/RoomManagement';
import { ActiveStaysList } from './components/stays/ActiveStaysList';
import { FolioManagement } from './components/billing/FolioManagement';
import { GuestDirectory } from './components/guests/GuestDirectory';
import { HotelReports } from './components/reports/HotelReports';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { HotelSettingsView } from './components/settings/HotelSettingsView';
import { CheckInWizard } from './components/checkin/CheckInWizard';
import { InvoiceView } from './components/billing/InvoiceView';
import { AddChargeModal } from './components/billing/AddChargeModal';
import { AddPaymentModal } from './components/billing/AddPaymentModal';
import { CheckoutModal } from './components/billing/CheckoutModal';
import { ToastContainer } from './components/common/Toast';
import { Room, Guest, Stay, Invoice } from './types/hotel';

function MainAppContent() {
  const { isLoading, toast, hideToast, stays, getInvoiceByStayId } = useHotel();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modal Triggers
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [preselectedRoom, setPreselectedRoom] = useState<Room | null>(null);
  const [preselectedGuest, setPreselectedGuest] = useState<Guest | null>(null);

  // Global Quick Action Modals
  const [chargeStay, setChargeStay] = useState<Stay | null>(null);
  const [paymentStay, setPaymentStay] = useState<Stay | null>(null);
  const [checkoutStay, setCheckoutStay] = useState<Stay | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Handlers for cross-component triggers
  const handleOpenCheckInWithRoom = (room: Room) => {
    setPreselectedRoom(room);
    setPreselectedGuest(null);
    setIsCheckInOpen(true);
  };

  const handleOpenCheckInWithGuest = (guest: Guest) => {
    setPreselectedGuest(guest);
    setPreselectedRoom(null);
    setIsCheckInOpen(true);
  };

  const handleQuickCheckIn = () => {
    setPreselectedRoom(null);
    setPreselectedGuest(null);
    setIsCheckInOpen(true);
  };

  const handleViewActiveStayFolio = (stayId: string) => {
    setActiveTab('billing');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-zinc-900 space-y-3 select-none">
        <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-sm font-semibold shadow-xs">
          GH
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-sm font-semibold text-zinc-900">Loading Property Manager...</h2>
          <p className="text-xs text-zinc-500">Syncing rooms, guests & folios</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex font-sans antialiased selection:bg-zinc-900 selection:text-white">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-zinc-50/50">
        <Header onQuickCheckIn={handleQuickCheckIn} activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onCheckInClick={handleQuickCheckIn}
              onNavigateRooms={() => setActiveTab('rooms')}
              onNavigateStays={() => setActiveTab('stays')}
              onNavigateBilling={() => setActiveTab('billing')}
              onOpenChargeModal={(s) => setChargeStay(s)}
              onOpenPaymentModal={(s) => setPaymentStay(s)}
              onOpenCheckoutModal={(s) => setCheckoutStay(s)}
              onViewInvoice={(inv) => setViewInvoice(inv)}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomManagement
              onCheckInRoom={handleOpenCheckInWithRoom}
              onViewActiveStay={handleViewActiveStayFolio}
            />
          )}

          {activeTab === 'stays' && (
            <ActiveStaysList
              onCheckInClick={handleQuickCheckIn}
              onOpenGuestProfile={(gId) => setActiveTab('guests')}
            />
          )}

          {activeTab === 'billing' && <FolioManagement />}

          {activeTab === 'guests' && (
            <GuestDirectory onCheckInGuest={handleOpenCheckInWithGuest} />
          )}

          {activeTab === 'reports' && <HotelReports />}

          {activeTab === 'audit' && <AuditTrailView />}

          {activeTab === 'settings' && <HotelSettingsView />}
        </main>
      </div>

      {/* Check-In Wizard Multi-step Modal */}
      {isCheckInOpen && (
        <CheckInWizard
          isOpen={isCheckInOpen}
          onClose={() => {
            setIsCheckInOpen(false);
            setPreselectedRoom(null);
            setPreselectedGuest(null);
          }}
          preselectedRoom={preselectedRoom}
          preselectedGuest={preselectedGuest}
        />
      )}

      {/* Global Add Charge Modal */}
      {chargeStay && (
        <AddChargeModal
          stay={chargeStay}
          isOpen={!!chargeStay}
          onClose={() => setChargeStay(null)}
        />
      )}

      {/* Global Add Payment Modal */}
      {paymentStay && (
        <AddPaymentModal
          stay={paymentStay}
          isOpen={!!paymentStay}
          onClose={() => setPaymentStay(null)}
        />
      )}

      {/* Global Checkout Modal */}
      {checkoutStay && (
        <CheckoutModal
          stay={checkoutStay}
          isOpen={!!checkoutStay}
          onClose={() => setCheckoutStay(null)}
          onViewInvoice={(inv) => setViewInvoice(inv)}
        />
      )}

      {/* Global Invoice View Modal */}
      {viewInvoice && (
        <InvoiceView
          invoice={viewInvoice}
          isOpen={!!viewInvoice}
          onClose={() => setViewInvoice(null)}
        />
      )}

      {/* Global Real-time Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <MainAppContent />
      </HotelProvider>
    </AuthProvider>
  );
}
