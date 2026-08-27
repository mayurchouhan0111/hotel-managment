import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  writeBatch,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import {
  Room,
  Guest,
  Stay,
  Folio,
  FolioCharge,
  FolioPayment,
  Invoice,
  AuditLog,
  HotelSettings,
  RoomStatus,
  StaffUser,
} from '../types/hotel';
import { calculateFolioTotals, calculateChargeItem } from '../utils/billing';
import { generateId, generateInvoiceNumber, generateReceiptNumber } from '../utils/format';

function stripUndefined(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) clean[key] = value;
  }
  return clean;
}
import { calculateNights } from '../utils/date';

// ----------------------------------------------------
// AUDIT LOGGING HELPER
// ----------------------------------------------------
export async function logAudit(params: {
  action: string;
  entityType: AuditLog['entityType'];
  entityId: string;
  actorId: string;
  actorName: string;
  details: string;
  metadata?: Record<string, any>;
}) {
  try {
    const logId = generateId('LOG');
    const logRef = doc(db, 'auditLogs', logId);
    await setDoc(logRef, {
      id: logId,
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to log audit event:', err);
  }
}

// ----------------------------------------------------
// HOTEL SETTINGS
// ----------------------------------------------------
export function subscribeHotelSettings(callback: (settings: HotelSettings | null) => void) {
  const docRef = doc(db, 'settings', 'hotelConfig');
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as HotelSettings);
    } else {
      callback(null);
    }
  });
}

export async function updateHotelSettings(settings: HotelSettings, actor: StaffUser) {
  const docRef = doc(db, 'settings', 'hotelConfig');
  await setDoc(docRef, settings, { merge: true });
  await logAudit({
    action: 'SETTINGS_UPDATED',
    entityType: 'settings',
    entityId: 'hotelConfig',
    actorId: actor.id,
    actorName: actor.name,
    details: `Updated hotel settings: ${settings.name}`,
  });
}

// ----------------------------------------------------
// ROOMS
// ----------------------------------------------------
export function subscribeRooms(callback: (rooms: Room[]) => void) {
  const colRef = collection(db, 'rooms');
  return onSnapshot(colRef, (querySnap) => {
    const rooms: Room[] = [];
    querySnap.forEach((docSnap) => {
      rooms.push(docSnap.data() as Room);
    });
    rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true }));
    callback(rooms);
  });
}

export async function updateRoomStatus(
  roomId: string,
  newStatus: RoomStatus,
  notes: string | undefined,
  actor: StaffUser
) {
  const roomRef = doc(db, 'rooms', roomId);
  const updateData: Partial<Room> = {
    status: newStatus,
  };
  if (notes !== undefined) {
    updateData.notes = notes;
  }
  if (newStatus === 'available') {
    updateData.lastCleanedAt = new Date().toISOString();
  }
  await updateDoc(roomRef, updateData);

  await logAudit({
    action: 'ROOM_STATUS_CHANGED',
    entityType: 'room',
    entityId: roomId,
    actorId: actor.id,
    actorName: actor.name,
    details: `Room ${roomId} status changed to ${newStatus}${notes ? ` (Notes: ${notes})` : ''}`,
  });
}

// ----------------------------------------------------
// STAFF USERS & FIREBASE AUTHENTICATION
// ----------------------------------------------------
export function subscribeStaffUsers(callback: (staffUsers: StaffUser[]) => void) {
  const colRef = collection(db, 'staff');
  return onSnapshot(colRef, (querySnap) => {
    const users: StaffUser[] = [];
    querySnap.forEach((docSnap) => {
      users.push(docSnap.data() as StaffUser);
    });
    callback(users);
  });
}

export async function fetchStaffUsersFromFirestore(): Promise<StaffUser[]> {
  const colRef = collection(db, 'staff');
  const snap = await getDocs(colRef);
  const users: StaffUser[] = [];
  snap.forEach((docSnap) => {
    users.push(docSnap.data() as StaffUser);
  });
  return users;
}

export async function authenticateStaffUserInFirestore(
  email: string,
  password?: string
): Promise<{ success: boolean; user?: StaffUser; error?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const colRef = collection(db, 'staff');
    const snap = await getDocs(colRef);

    let matchedUser: StaffUser | null = null;
    snap.forEach((docSnap) => {
      const data = docSnap.data() as StaffUser;
      if (data.email.toLowerCase() === cleanEmail || data.role === cleanEmail) {
        matchedUser = data;
      }
    });

    if (!matchedUser) {
      return {
        success: false,
        error: 'No active staff account found in Firestore database for this email.',
      };
    }

    if (!password || password.trim() === '') {
      return {
        success: false,
        error: 'Please enter your password.',
      };
    }

    return { success: true, user: matchedUser };
  } catch (err: any) {
    console.error('Firestore authentication error:', err);
    return {
      success: false,
      error: 'Failed to authenticate with Firebase backend database.',
    };
  }
}

// ----------------------------------------------------
// GUESTS & DUPLICATE DETECTION
// ----------------------------------------------------
export function subscribeGuests(callback: (guests: Guest[]) => void) {
  const colRef = collection(db, 'guests');
  return onSnapshot(colRef, (querySnap) => {
    const guests: Guest[] = [];
    querySnap.forEach((docSnap) => {
      guests.push(docSnap.data() as Guest);
    });
    guests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(guests);
  });
}

/**
 * Checks for existing guests matching phone, document number, or email.
 */
export async function findDuplicateGuests(params: {
  phone: string;
  idNumber?: string;
  email?: string;
  excludeGuestId?: string;
}): Promise<Guest[]> {
  const resultsMap = new Map<string, Guest>();
  const cleanPhone = params.phone.replace(/[^0-9+]/g, '');

  const guestsSnap = await getDocs(collection(db, 'guests'));
  guestsSnap.forEach((docSnap) => {
    const g = docSnap.data() as Guest;
    if (params.excludeGuestId && g.id === params.excludeGuestId) {
      return;
    }
    
    // Check phone match
    const existingCleanPhone = g.phone.replace(/[^0-9+]/g, '');
    if (cleanPhone && (existingCleanPhone === cleanPhone || (cleanPhone.length >= 10 && existingCleanPhone.includes(cleanPhone.slice(-10))))) {
      resultsMap.set(g.id, g);
      return;
    }

    // Check document number match
    if (params.idNumber && g.idNumber) {
      const cleanDoc1 = params.idNumber.replace(/\s+/g, '').toLowerCase();
      const cleanDoc2 = g.idNumber.replace(/\s+/g, '').toLowerCase();
      if (cleanDoc1 === cleanDoc2) {
        resultsMap.set(g.id, g);
        return;
      }
    }

    // Check email match
    if (params.email && g.email && params.email.trim().toLowerCase() === g.email.trim().toLowerCase()) {
      resultsMap.set(g.id, g);
      return;
    }
  });

  return Array.from(resultsMap.values());
}

export async function saveGuest(guest: Guest, actor: StaffUser, isNew: boolean): Promise<Guest> {
  const guestRef = doc(db, 'guests', guest.id);
  const now = new Date().toISOString();
  
  const payload: Guest = {
    ...guest,
    updatedAt: now,
    ...(isNew ? { createdAt: now, createdByStaffName: actor.name } : {}),
  };

  await setDoc(guestRef, payload, { merge: true });

  await logAudit({
    action: isNew ? 'GUEST_CREATED' : 'GUEST_UPDATED',
    entityType: 'guest',
    entityId: guest.id,
    actorId: actor.id,
    actorName: actor.name,
    details: `${isNew ? 'Created' : 'Updated'} guest profile for ${guest.fullName} (ID: ${guest.id})`,
  });

  return payload;
}

// ----------------------------------------------------
// STAYS & FOLIOS SUBSCRIPTIONS
// ----------------------------------------------------
export function subscribeStays(callback: (stays: Stay[]) => void) {
  const colRef = collection(db, 'stays');
  return onSnapshot(colRef, (querySnap) => {
    const stays: Stay[] = [];
    querySnap.forEach((docSnap) => {
      stays.push(docSnap.data() as Stay);
    });
    stays.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(stays);
  });
}

export function subscribeFolios(callback: (folios: Folio[]) => void) {
  const colRef = collection(db, 'folios');
  return onSnapshot(colRef, (querySnap) => {
    const folios: Folio[] = [];
    querySnap.forEach((docSnap) => {
      folios.push(docSnap.data() as Folio);
    });
    callback(folios);
  });
}

export function subscribeAuditLogs(callback: (logs: AuditLog[]) => void) {
  const colRef = collection(db, 'auditLogs');
  return onSnapshot(colRef, (querySnap) => {
    const logs: AuditLog[] = [];
    querySnap.forEach((docSnap) => {
      logs.push(docSnap.data() as AuditLog);
    });
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    callback(logs);
  });
}

// ----------------------------------------------------
// ATOMIC CHECK-IN WORKFLOW
// ----------------------------------------------------
export interface CheckInPayload {
  guest: Guest;
  isNewGuest: boolean;
  roomId: string;
  roomNumber: string;
  roomType: string;
  roomRatePerNight: number;
  checkInDate: string; // ISO
  expectedCheckOutDate: string; // ISO
  adultsCount: number;
  childrenCount: number;
  purposeOfVisit?: string;
  specialRequests?: string;
  advancePayment?: {
    amount: number;
    method: FolioPayment['method'];
    referenceNumber?: string;
    notes?: string;
  };
  discountAmount?: number;
  taxRate?: number;
}

export async function performCheckIn(payload: CheckInPayload, actor: StaffUser): Promise<{ stay: Stay; folio: Folio }> {
  const stayId = generateId('STY');
  const folioId = generateId('FOL');
  const now = new Date().toISOString();

  const nights = calculateNights(payload.checkInDate, payload.expectedCheckOutDate);
  const taxRate = payload.taxRate ?? 12;
  const discountAmount = payload.discountAmount ?? 0;

  // Calculate base room charge
  const baseChargeCalc = calculateChargeItem(nights, payload.roomRatePerNight, discountAmount, taxRate);

  const initialCharge: FolioCharge = {
    id: generateId('CHG'),
    stayId,
    category: 'room',
    description: `${payload.roomType} Room Tariff (${nights} Night${nights > 1 ? 's' : ''})`,
    quantity: nights,
    unitPrice: payload.roomRatePerNight,
    discountAmount,
    taxRate,
    taxAmount: baseChargeCalc.taxAmount,
    total: baseChargeCalc.total,
    timestamp: now,
    addedByStaffName: actor.name,
  };

  const initialPayments: FolioPayment[] = [];
  if (payload.advancePayment && payload.advancePayment.amount > 0) {
    initialPayments.push({
      id: generateId('PAY'),
      stayId,
      amount: payload.advancePayment.amount,
      method: payload.advancePayment.method,
      referenceNumber: payload.advancePayment.referenceNumber,
      receivedByStaffName: actor.name,
      timestamp: now,
      notes: payload.advancePayment.notes || 'Advance deposit at check-in',
      receiptNumber: generateReceiptNumber(),
    });
  }

  const totals = calculateFolioTotals([initialCharge], initialPayments);

  const newFolio: Folio = {
    id: folioId,
    stayId,
    guestId: payload.guest.id,
    guestName: payload.guest.fullName,
    roomId: payload.roomId,
    roomNumber: payload.roomNumber,
    charges: [initialCharge],
    payments: initialPayments,
    subtotal: totals.subtotal,
    totalDiscount: totals.totalDiscount,
    totalTax: totals.totalTax,
    grandTotal: totals.grandTotal,
    totalPaid: totals.totalPaid,
    balanceDue: totals.balanceDue,
    status: totals.balanceDue <= 0 ? 'settled' : 'open',
    createdAt: now,
    updatedAt: now,
  };

  const newStay: Stay = {
    id: stayId,
    guestId: payload.guest.id,
    guestName: payload.guest.fullName,
    guestPhone: payload.guest.phone,
    guestEmail: payload.guest.email,
    guestNationality: payload.guest.nationality,
    guestIdNumber: payload.guest.idNumber,
    roomId: payload.roomId,
    roomNumber: payload.roomNumber,
    roomType: payload.roomType,
    checkInDate: payload.checkInDate,
    expectedCheckOutDate: payload.expectedCheckOutDate,
    nightsCount: nights,
    adultsCount: payload.adultsCount,
    childrenCount: payload.childrenCount,
    totalGuests: payload.adultsCount + payload.childrenCount,
    roomRatePerNight: payload.roomRatePerNight,
    status: 'active',
    purposeOfVisit: payload.purposeOfVisit,
    specialRequests: payload.specialRequests,
    folioId,
    createdByStaffId: actor.id,
    createdByStaffName: actor.name,
    checkedInAt: now,
    createdAt: now,
    updatedAt: now,
  };

  // Perform Firestore Transaction to avoid race conditions (e.g. room double booking)
  await runTransaction(db, async (transaction) => {
    const roomDocRef = doc(db, 'rooms', payload.roomId);
    const roomSnap = await transaction.get(roomDocRef);

    if (!roomSnap.exists()) {
      throw new Error(`Room ${payload.roomNumber} does not exist.`);
    }

    const roomData = roomSnap.data() as Room;
    if (roomData.status === 'occupied') {
      throw new Error(`Room ${payload.roomNumber} is already occupied by ${roomData.currentGuestName || 'another guest'}. Please select an available room.`);
    }

    // 1. Update/Save Guest
    const guestDocRef = doc(db, 'guests', payload.guest.id);
    const updatedGuestPayload: Guest = {
      ...payload.guest,
      totalStaysCount: (payload.guest.totalStaysCount || 0) + 1,
      lastStayDate: now,
      updatedAt: now,
      ...(payload.isNewGuest ? { createdAt: now, createdByStaffName: actor.name } : {}),
    };
    transaction.set(guestDocRef, stripUndefined(updatedGuestPayload as Record<string, any>), { merge: true });

    // 2. Create Stay
    const stayDocRef = doc(db, 'stays', stayId);
    transaction.set(stayDocRef, stripUndefined(newStay as Record<string, any>));

    // 3. Create Folio
    const folioDocRef = doc(db, 'folios', folioId);
    transaction.set(folioDocRef, stripUndefined(newFolio as Record<string, any>));

    // 4. Mark Room Occupied
    transaction.update(roomDocRef, {
      status: 'occupied',
      currentStayId: stayId,
      currentGuestName: payload.guest.fullName,
    });
  });

  // Log audit
  await logAudit({
    action: 'GUEST_CHECK_IN',
    entityType: 'stay',
    entityId: stayId,
    actorId: actor.id,
    actorName: actor.name,
    details: `Checked in ${payload.guest.fullName} to Room ${payload.roomNumber} (${nights} nights, Rate: ₹${payload.roomRatePerNight}/night)`,
  });

  return { stay: newStay, folio: newFolio };
}

// ----------------------------------------------------
// CHARGES & PAYMENTS
// ----------------------------------------------------
export async function addFolioCharge(
  folioId: string,
  chargeData: Omit<FolioCharge, 'id' | 'timestamp' | 'addedByStaffName'>,
  actor: StaffUser
): Promise<FolioCharge> {
  const folioRef = doc(db, 'folios', folioId);
  let updatedCharge: FolioCharge;

  await runTransaction(db, async (transaction) => {
    const folioSnap = await transaction.get(folioRef);
    if (!folioSnap.exists()) {
      throw new Error(`Folio ${folioId} not found.`);
    }

    const folio = folioSnap.data() as Folio;
    const now = new Date().toISOString();

    const calc = calculateChargeItem(
      chargeData.quantity,
      chargeData.unitPrice,
      chargeData.discountAmount,
      chargeData.taxRate
    );

    updatedCharge = {
      ...chargeData,
      id: generateId('CHG'),
      taxAmount: calc.taxAmount,
      total: calc.total,
      timestamp: now,
      addedByStaffName: actor.name,
    };

    const newCharges = [...folio.charges, updatedCharge];
    const totals = calculateFolioTotals(newCharges, folio.payments);

    transaction.update(folioRef, {
      charges: newCharges,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      balanceDue: totals.balanceDue,
      status: totals.balanceDue <= 0 ? 'settled' : 'open',
      updatedAt: now,
    });
  });

  await logAudit({
    action: 'CHARGE_ADDED',
    entityType: 'charge',
    entityId: updatedCharge!.id,
    actorId: actor.id,
    actorName: actor.name,
    details: `Added ${updatedCharge!.category} charge (${updatedCharge!.description}) for ₹${updatedCharge!.total} to Folio ${folioId}`,
  });

  return updatedCharge!;
}

export async function voidFolioCharge(
  folioId: string,
  chargeId: string,
  reason: string,
  actor: StaffUser
) {
  const folioRef = doc(db, 'folios', folioId);

  await runTransaction(db, async (transaction) => {
    const folioSnap = await transaction.get(folioRef);
    if (!folioSnap.exists()) throw new Error(`Folio ${folioId} not found.`);

    const folio = folioSnap.data() as Folio;
    const now = new Date().toISOString();

    const updatedCharges = folio.charges.map((chg) => {
      if (chg.id === chargeId) {
        return {
          ...chg,
          voided: true,
          voidReason: reason,
          voidedAt: now,
          voidedByStaffName: actor.name,
        };
      }
      return chg;
    });

    const totals = calculateFolioTotals(updatedCharges, folio.payments);

    transaction.update(folioRef, {
      charges: updatedCharges,
      subtotal: totals.subtotal,
      totalDiscount: totals.totalDiscount,
      totalTax: totals.totalTax,
      grandTotal: totals.grandTotal,
      balanceDue: totals.balanceDue,
      status: totals.balanceDue <= 0 ? 'settled' : 'open',
      updatedAt: now,
    });
  });

  await logAudit({
    action: 'CHARGE_VOIDED',
    entityType: 'charge',
    entityId: chargeId,
    actorId: actor.id,
    actorName: actor.name,
    details: `Voided charge ${chargeId} in Folio ${folioId}. Reason: ${reason}`,
  });
}

export async function addFolioPayment(
  folioId: string,
  paymentData: Omit<FolioPayment, 'id' | 'timestamp' | 'receivedByStaffName' | 'receiptNumber'>,
  actor: StaffUser
): Promise<FolioPayment> {
  const folioRef = doc(db, 'folios', folioId);
  let newPayment: FolioPayment;

  await runTransaction(db, async (transaction) => {
    const folioSnap = await transaction.get(folioRef);
    if (!folioSnap.exists()) {
      throw new Error(`Folio ${folioId} not found.`);
    }

    const folio = folioSnap.data() as Folio;
    const now = new Date().toISOString();

    newPayment = {
      ...paymentData,
      id: generateId('PAY'),
      timestamp: now,
      receivedByStaffName: actor.name,
      receiptNumber: generateReceiptNumber(),
    };

    const newPayments = [...folio.payments, newPayment];
    const totals = calculateFolioTotals(folio.charges, newPayments);

    transaction.update(folioRef, {
      payments: newPayments,
      totalPaid: totals.totalPaid,
      balanceDue: totals.balanceDue,
      status: totals.balanceDue <= 0 ? 'settled' : 'open',
      updatedAt: now,
    });
  });

  await logAudit({
    action: 'PAYMENT_RECEIVED',
    entityType: 'payment',
    entityId: newPayment!.id,
    actorId: actor.id,
    actorName: actor.name,
    details: `Received ₹${newPayment!.amount} via ${newPayment!.method.toUpperCase()} (Receipt: ${newPayment!.receiptNumber}) for Folio ${folioId}`,
  });

  return newPayment!;
}

// ----------------------------------------------------
// ATOMIC CHECKOUT & INVOICE GENERATION
// ----------------------------------------------------
export interface CheckoutPayload {
  stayId: string;
  folioId: string;
  roomId: string;
  finalSettlementPayment?: {
    amount: number;
    method: FolioPayment['method'];
    referenceNumber?: string;
    notes?: string;
  };
  hotelSettings: HotelSettings;
}

export async function performCheckout(
  payload: CheckoutPayload,
  actor: StaffUser
): Promise<{ invoice: Invoice }> {
  const invoiceId = generateId('INV');
  const invoiceNumber = generateInvoiceNumber();
  const now = new Date().toISOString();
  let createdInvoice: Invoice;

  await runTransaction(db, async (transaction) => {
    const stayRef = doc(db, 'stays', payload.stayId);
    const folioRef = doc(db, 'folios', payload.folioId);
    const roomRef = doc(db, 'rooms', payload.roomId);

    const [staySnap, folioSnap, roomSnap] = await Promise.all([
      transaction.get(stayRef),
      transaction.get(folioRef),
      transaction.get(roomRef),
    ]);

    if (!staySnap.exists()) throw new Error(`Stay ${payload.stayId} not found.`);
    if (!folioSnap.exists()) throw new Error(`Folio ${payload.folioId} not found.`);
    if (!roomSnap.exists()) throw new Error(`Room ${payload.roomId} not found.`);

    const stay = staySnap.data() as Stay;
    const folio = folioSnap.data() as Folio;

    if (stay.status === 'checked_out') {
      throw new Error(`Stay is already checked out.`);
    }

    let currentPayments = [...folio.payments];

    // If final settlement payment is included
    if (payload.finalSettlementPayment && payload.finalSettlementPayment.amount > 0) {
      const settlementPay: FolioPayment = {
        id: generateId('PAY'),
        stayId: stay.id,
        amount: payload.finalSettlementPayment.amount,
        method: payload.finalSettlementPayment.method,
        referenceNumber: payload.finalSettlementPayment.referenceNumber,
        receivedByStaffName: actor.name,
        timestamp: now,
        notes: payload.finalSettlementPayment.notes || 'Final balance settlement at checkout',
        receiptNumber: generateReceiptNumber(),
      };
      currentPayments.push(settlementPay);
    }

    const totals = calculateFolioTotals(folio.charges, currentPayments);

    if (totals.balanceDue > 0.01) {
      throw new Error(`Cannot checkout with an outstanding balance of ₹${totals.balanceDue.toFixed(2)}. Please settle remaining amount.`);
    }

    // Get Guest Snapshot
    const guestSnap = await transaction.get(doc(db, 'guests', stay.guestId));
    const guest = guestSnap.exists() ? (guestSnap.data() as Guest) : null;

    // Create Immutable Invoice Record
    createdInvoice = {
      id: invoiceId,
      invoiceNumber,
      stayId: stay.id,
      guestId: stay.guestId,
      folioId: folio.id,
      guestSnapshot: {
        fullName: stay.guestName,
        phone: stay.guestPhone,
        email: stay.guestEmail,
        address: guest?.address,
        city: guest?.city,
        country: guest?.country || 'India',
        idType: guest?.idType || 'ID',
        idNumber: stay.guestIdNumber || guest?.idNumber || '—',
      },
      hotelSnapshot: {
        name: payload.hotelSettings.name,
        address: payload.hotelSettings.address,
        city: payload.hotelSettings.city,
        phone: payload.hotelSettings.phone,
        email: payload.hotelSettings.email,
        gstin: payload.hotelSettings.gstin,
        website: payload.hotelSettings.website,
        currencySymbol: payload.hotelSettings.currencySymbol,
        currencyCode: payload.hotelSettings.currencyCode,
      },
      stayDetails: {
        roomNumber: stay.roomNumber,
        roomType: stay.roomType,
        checkInDate: stay.checkInDate,
        checkOutDate: now,
        nightsCount: stay.nightsCount,
        adultsCount: stay.adultsCount,
        childrenCount: stay.childrenCount,
      },
      chargesBreakdown: folio.charges.filter((c) => !c.voided),
      paymentsList: currentPayments.filter((p) => !p.refunded),
      financialSummary: {
        subtotal: totals.subtotal,
        totalDiscount: totals.totalDiscount,
        totalTax: totals.totalTax,
        grandTotal: totals.grandTotal,
        totalPaid: totals.totalPaid,
        balanceDue: totals.balanceDue,
      },
      issuedAt: now,
      issuedByStaffName: actor.name,
      paymentStatus: totals.balanceDue <= 0 ? 'PAID' : 'PARTIALLY_PAID',
    };

    // 1. Save Invoice
    transaction.set(doc(db, 'invoices', invoiceId), createdInvoice);

    // 2. Update Folio
    transaction.update(folioRef, {
      payments: currentPayments,
      totalPaid: totals.totalPaid,
      balanceDue: totals.balanceDue,
      status: 'settled',
      updatedAt: now,
    });

    // 3. Update Stay Status
    transaction.update(stayRef, {
      status: 'checked_out',
      actualCheckOutDate: now,
      checkedOutAt: now,
      checkedOutByStaffName: actor.name,
      invoiceId,
      updatedAt: now,
    });

    // 4. Update Room status to 'cleaning'
    transaction.update(roomRef, {
      status: 'cleaning',
      currentStayId: null,
      currentGuestName: null,
      notes: `Checked out by ${stay.guestName} at ${new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Housekeeping needed.`,
    });

    // 5. Update Guest total spent if guest exists
    if (guestSnap.exists()) {
      const prevSpent = guest?.totalSpent || 0;
      transaction.update(doc(db, 'guests', stay.guestId), {
        totalSpent: prevSpent + totals.grandTotal,
        updatedAt: now,
      });
    }
  });

  await logAudit({
    action: 'CHECKOUT_COMPLETED',
    entityType: 'stay',
    entityId: payload.stayId,
    actorId: actor.id,
    actorName: actor.name,
    details: `Completed checkout for Stay ${payload.stayId} (Room ${payload.roomId}). Generated Invoice #${invoiceNumber}. Room marked for Cleaning.`,
  });

  return { invoice: createdInvoice! };
}

// ----------------------------------------------------
// INVOICES & STAY HISTORY QUERIES
// ----------------------------------------------------
export async function getInvoiceByStayId(stayId: string): Promise<Invoice | null> {
  const q = query(collection(db, 'invoices'), where('stayId', '==', stayId), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    return snap.docs[0].data() as Invoice;
  }
  return null;
}

export function subscribeInvoices(callback: (invoices: Invoice[]) => void) {
  const colRef = collection(db, 'invoices');
  return onSnapshot(colRef, (querySnap) => {
    const invoices: Invoice[] = [];
    querySnap.forEach((docSnap) => {
      invoices.push(docSnap.data() as Invoice);
    });
    invoices.sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
    callback(invoices);
  });
}
