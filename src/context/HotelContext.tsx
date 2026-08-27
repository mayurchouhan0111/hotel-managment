import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Room,
  Guest,
  Stay,
  Folio,
  Invoice,
  AuditLog,
  HotelSettings,
  RoomStatus,
  FolioCharge,
  FolioPayment,
} from '../types/hotel';
import {
  subscribeRooms,
  subscribeGuests,
  subscribeStays,
  subscribeFolios,
  subscribeInvoices,
  subscribeAuditLogs,
  subscribeHotelSettings,
  performCheckIn,
  CheckInPayload,
  addFolioCharge,
  voidFolioCharge,
  addFolioPayment,
  performCheckout,
  CheckoutPayload,
  updateRoomStatus as firestoreUpdateRoomStatus,
  saveGuest as firestoreSaveGuest,
  updateHotelSettings as firestoreUpdateSettings,
  findDuplicateGuests as firestoreFindDuplicateGuests,
} from '../firebase/firestore';
import { checkAndSeedInitialData, DEFAULT_HOTEL_SETTINGS } from '../firebase/seed';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface HotelContextType {
  rooms: Room[];
  guests: Guest[];
  stays: Stay[];
  activeStays: Stay[];
  folios: Folio[];
  invoices: Invoice[];
  auditLogs: AuditLog[];
  settings: HotelSettings;
  loading: boolean;
  toasts: ToastMessage[];
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  
  // Helpers
  getRoomById: (id: string) => Room | undefined;
  getGuestById: (id: string) => Guest | undefined;
  getStayById: (id: string) => Stay | undefined;
  getFolioById: (id: string) => Folio | undefined;
  getFolioByStayId: (stayId: string) => Folio | undefined;
  getInvoiceByStayId: (stayId: string) => Invoice | undefined;
  
  // Business Operations
  checkIn: (payload: CheckInPayload) => Promise<{ stay: Stay; folio: Folio }>;
  addCharge: (folioId: string, charge: Omit<FolioCharge, 'id' | 'timestamp' | 'addedByStaffName'>) => Promise<FolioCharge>;
  voidCharge: (folioId: string, chargeId: string, reason: string) => Promise<void>;
  addPayment: (folioId: string, payment: Omit<FolioPayment, 'id' | 'timestamp' | 'receivedByStaffName' | 'receiptNumber'>) => Promise<FolioPayment>;
  checkoutStay: (payload: Omit<CheckoutPayload, 'hotelSettings'>) => Promise<{ invoice: Invoice }>;
  updateRoomStatus: (roomId: string, status: RoomStatus, notes?: string) => Promise<void>;
  saveGuest: (guest: Guest, isNew: boolean) => Promise<Guest>;
  updateSettings: (newSettings: HotelSettings) => Promise<void>;
  seedInitialData: () => Promise<boolean>;
  findDuplicateGuests: (params: { phone: string; idNumber?: string; email?: string; excludeGuestId?: string }) => Promise<Guest[]>;
  updateGuest: (guestId: string, updates: Partial<Guest>) => Promise<void>;
  resetDemoData: () => Promise<boolean>;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [folios, setFolios] = useState<Folio[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<HotelSettings>(DEFAULT_HOTEL_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let initialSeeded = false;

    // Check & seed initial data on first mount if empty
    checkAndSeedInitialData().then((seeded) => {
      if (seeded) {
        showToast('info', 'Sample Hotel Data Initialized', 'Loaded demo rooms, guests, and active folios.');
      }
    });

    const unsubSettings = subscribeHotelSettings((s) => {
      if (s) setSettings(s);
    });

    const unsubRooms = subscribeRooms((r) => {
      setRooms(r);
      setLoading(false);
    });

    const unsubGuests = subscribeGuests((g) => {
      setGuests(g);
    });

    const unsubStays = subscribeStays((s) => {
      setStays(s);
    });

    const unsubFolios = subscribeFolios((f) => {
      setFolios(f);
    });

    const unsubInvoices = subscribeInvoices((inv) => {
      setInvoices(inv);
    });

    const unsubLogs = subscribeAuditLogs((logs) => {
      setAuditLogs(logs);
    });

    return () => {
      unsubSettings();
      unsubRooms();
      unsubGuests();
      unsubStays();
      unsubFolios();
      unsubInvoices();
      unsubLogs();
    };
  }, []);

  const activeStays = stays.filter((s) => s.status === 'active');

  const getRoomById = (id: string) => rooms.find((r) => r.id === id);
  const getGuestById = (id: string) => guests.find((g) => g.id === id);
  const getStayById = (id: string) => stays.find((s) => s.id === id);
  const getFolioById = (id: string) => folios.find((f) => f.id === id);
  const getFolioByStayId = (stayId: string) => folios.find((f) => f.stayId === stayId);
  const getInvoiceByStayId = (stayId: string) => invoices.find((inv) => inv.stayId === stayId);

  // Check In
  const checkIn = async (payload: CheckInPayload) => {
    try {
      const res = await performCheckIn(payload, currentUser);
      showToast(
        'success',
        `Guest Checked In: Room ${payload.roomNumber}`,
        `${payload.guest.fullName} checked in for ${res.stay.nightsCount} nights.`
      );
      return res;
    } catch (err: any) {
      showToast('error', 'Check-in Failed', err.message || 'Error occurred during check-in.');
      throw err;
    }
  };

  // Add Charge
  const addCharge = async (folioId: string, charge: Omit<FolioCharge, 'id' | 'timestamp' | 'addedByStaffName'>) => {
    try {
      const newCharge = await addFolioCharge(folioId, charge, currentUser);
      showToast('success', 'Charge Added', `${charge.description} added (${settings.currencySymbol}${newCharge.total})`);
      return newCharge;
    } catch (err: any) {
      showToast('error', 'Failed to Add Charge', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Void Charge
  const voidCharge = async (folioId: string, chargeId: string, reason: string) => {
    try {
      await voidFolioCharge(folioId, chargeId, reason, currentUser);
      showToast('info', 'Charge Voided', `Charge removed from active billing folio.`);
    } catch (err: any) {
      showToast('error', 'Failed to Void Charge', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Add Payment
  const addPayment = async (
    folioId: string,
    payment: Omit<FolioPayment, 'id' | 'timestamp' | 'receivedByStaffName' | 'receiptNumber'>
  ) => {
    try {
      const newPayment = await addFolioPayment(folioId, payment, currentUser);
      showToast(
        'success',
        'Payment Recorded',
        `Received ${settings.currencySymbol}${newPayment.amount} via ${newPayment.method.toUpperCase()} (Receipt: ${newPayment.receiptNumber})`
      );
      return newPayment;
    } catch (err: any) {
      showToast('error', 'Payment Failed', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Checkout Stay
  const checkoutStay = async (payload: Omit<CheckoutPayload, 'hotelSettings'>) => {
    try {
      const res = await performCheckout({ ...payload, hotelSettings: settings }, currentUser);
      showToast(
        'success',
        `Checkout Completed!`,
        `Invoice #${res.invoice.invoiceNumber} generated. Room marked for housekeeping.`
      );
      return res;
    } catch (err: any) {
      showToast('error', 'Checkout Failed', err.message || 'Error occurred during checkout.');
      throw err;
    }
  };

  // Update Room Status
  const updateRoomStatus = async (roomId: string, status: RoomStatus, notes?: string) => {
    try {
      await firestoreUpdateRoomStatus(roomId, status, notes, currentUser);
      showToast('success', `Room ${roomId} Status Updated`, `Marked as ${status.replace('_', ' ').toUpperCase()}`);
    } catch (err: any) {
      showToast('error', 'Room Update Failed', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Save Guest
  const saveGuest = async (guest: Guest, isNew: boolean) => {
    try {
      const saved = await firestoreSaveGuest(guest, currentUser, isNew);
      showToast(
        'success',
        isNew ? 'Guest Profile Created' : 'Guest Profile Updated',
        `${guest.fullName} (ID: ${guest.id})`
      );
      return saved;
    } catch (err: any) {
      showToast('error', 'Failed to Save Guest', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Update Settings
  const updateSettings = async (newSettings: HotelSettings) => {
    try {
      await firestoreUpdateSettings(newSettings, currentUser);
      showToast('success', 'Settings Saved', 'Hotel configuration updated.');
    } catch (err: any) {
      showToast('error', 'Settings Update Failed', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Manual trigger to seed data
  const seedInitialData = async () => {
    try {
      const success = await checkAndSeedInitialData();
      if (success) {
        showToast('success', 'Demo Data Seeded', 'Loaded rooms, demo guests, and folios.');
      } else {
        showToast('info', 'Data Already Exists', 'Rooms and database records are already present.');
      }
      return success;
    } catch (err: any) {
      showToast('error', 'Seed Failed', err.message);
      return false;
    }
  };

  // Find duplicate guests
  const findDuplicateGuests = async (params: {
    phone: string;
    idNumber?: string;
    email?: string;
    excludeGuestId?: string;
  }) => {
    try {
      return await firestoreFindDuplicateGuests(params);
    } catch (err: any) {
      console.error('Error finding duplicates:', err);
      return [];
    }
  };

  // Update guest profile
  const updateGuest = async (guestId: string, updates: Partial<Guest>) => {
    try {
      const guestRef = doc(db, 'guests', guestId);
      await updateDoc(guestRef, { ...updates, updatedAt: new Date().toISOString() });
      showToast('success', 'Guest Updated', `Profile ${guestId} updated successfully.`);
    } catch (err: any) {
      showToast('error', 'Guest Update Failed', err.message || 'Error occurred.');
      throw err;
    }
  };

  // Reset demo data
  const resetDemoData = async () => {
    try {
      const success = await checkAndSeedInitialData();
      if (success) {
        showToast('success', 'Demo Data Reset', 'Fresh hotel data has been loaded.');
      } else {
        showToast('info', 'Data Already Exists', 'Database already contains records.');
      }
      return success;
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
      return false;
    }
  };

  return (
    <HotelContext.Provider
      value={{
        rooms,
        guests,
        stays,
        activeStays,
        folios,
        invoices,
        auditLogs,
        settings,
        loading,
        toasts,
        showToast,
        removeToast,
        getRoomById,
        getGuestById,
        getStayById,
        getFolioById,
        getFolioByStayId,
        getInvoiceByStayId,
        checkIn,
        addCharge,
        voidCharge,
        addPayment,
        checkoutStay,
        updateRoomStatus,
        saveGuest,
        updateSettings,
        seedInitialData,
        findDuplicateGuests,
        updateGuest,
        resetDemoData,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}
