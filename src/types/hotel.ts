export type StaffRole = 'admin' | 'manager' | 'receptionist';

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
  employeeId: string;
  active: boolean;
}

export type RoomStatus = 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'reserved' | 'out_of_service';

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  type: string; // "Deluxe King", "Executive Suite", "Standard Twin", "Presidential Suite", "Family Suite"
  baseRate: number; // in currency units (e.g. INR ₹)
  maxOccupancy: number;
  amenities: string[];
  status: RoomStatus;
  currentStayId?: string | null;
  currentGuestName?: string | null;
  lastCleanedAt?: string;
  notes?: string;
}

export type IdType = 'aadhaar' | 'passport' | 'driving_license' | 'voter_id' | 'national_id' | 'other';

export interface GuestDocument {
  id: string;
  name: string;
  type: IdType;
  documentNumber: string;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  mimeType?: string;
  uploadedAt: string;
  uploadedByStaffName: string;
  verified: boolean;
  expiryDate?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Guest {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'unspecified';
  nationality: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  idType: 'aadhaar' | 'passport' | 'driving_license' | 'voter_id' | 'national_id' | 'other';
  idNumber: string;
  idIssueDate?: string;
  idExpiryDate?: string;
  documents: GuestDocument[];
  emergencyContact?: EmergencyContact;
  vipStatus?: boolean;
  isVip?: boolean;
  tags?: string[];
  notes?: string;
  totalStaysCount: number;
  totalStays?: number;
  lastStayDate?: string;
  totalSpent: number;
  totalSpend?: number;
  createdAt: string;
  updatedAt: string;
  createdByStaffName: string;
  archived?: boolean;
}

export type StayStatus = 'active' | 'checked_out' | 'upcoming' | 'cancelled' | 'no_show';

export interface Stay {
  id: string;
  guestId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  guestNationality?: string;
  guestIdNumber?: string;
  roomId: string;
  roomNumber: string;
  roomType: string;
  checkInDate: string; // ISO string
  expectedCheckOutDate: string; // ISO string
  actualCheckOutDate?: string; // ISO string
  nightsCount: number;
  adultsCount: number;
  childrenCount: number;
  totalGuests: number;
  roomRatePerNight: number;
  status: StayStatus;
  purposeOfVisit?: string;
  specialRequests?: string;
  folioId: string;
  invoiceId?: string;
  createdByStaffId: string;
  createdByStaffName: string;
  checkedInAt: string;
  checkedOutAt?: string;
  checkedOutByStaffName?: string;
  createdAt: string;
  updatedAt: string;
}

export type ChargeCategory =
  | 'room'
  | 'food'
  | 'restaurant'
  | 'room_service'
  | 'laundry'
  | 'extra_bed'
  | 'parking'
  | 'minibar'
  | 'spa'
  | 'misc';

export interface FolioCharge {
  id: string;
  stayId: string;
  category: ChargeCategory;
  description: string;
  quantity: number;
  unitPrice: number; // in currency base units
  discountAmount: number;
  taxRate: number; // percentage, e.g. 12 or 18
  taxAmount: number;
  total: number;
  timestamp: string;
  addedByStaffName: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: string;
  voidedByStaffName?: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';

export interface FolioPayment {
  id: string;
  stayId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  receivedByStaffName: string;
  timestamp: string;
  notes?: string;
  receiptNumber: string;
  refunded?: boolean;
  refundReason?: string;
  refundedAt?: string;
}

export interface Folio {
  id: string;
  stayId: string;
  guestId: string;
  guestName: string;
  roomId: string;
  roomNumber: string;
  charges: FolioCharge[];
  payments: FolioPayment[];
  subtotal: number;
  totalDiscount: number;
  totalTax: number;
  grandTotal: number;
  totalPaid: number;
  balanceDue: number;
  status: 'open' | 'settled' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  stayId: string;
  guestId: string;
  folioId: string;
  guestSnapshot: {
    fullName: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    country?: string;
    idType: string;
    idNumber: string;
  };
  hotelSnapshot: {
    name: string;
    address: string;
    city: string;
    phone: string;
    email: string;
    gstin: string;
    website?: string;
    currencySymbol: string;
    currencyCode: string;
  };
  stayDetails: {
    roomNumber: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    nightsCount: number;
    adultsCount: number;
    childrenCount: number;
  };
  chargesBreakdown: FolioCharge[];
  paymentsList: FolioPayment[];
  financialSummary: {
    subtotal: number;
    totalDiscount: number;
    totalTax: number;
    grandTotal: number;
    totalPaid: number;
    balanceDue: number;
  };
  issuedAt: string;
  issuedByStaffName: string;
  paymentStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID';
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: 'guest' | 'stay' | 'room' | 'folio' | 'charge' | 'payment' | 'invoice' | 'settings' | 'auth';
  entityId: string;
  actorId: string;
  actorName: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface HotelSettings {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  gstin: string;
  website: string;
  currencySymbol: string;
  currencyCode: string;
  defaultCheckInTime: string; // "14:00"
  defaultCheckOutTime: string; // "11:00"
  standardTaxRate: number; // 12%
  luxuryTaxRate: number; // 18%
  allowNegativeBalance: boolean;
  documentTypes: Array<{ key: string; label: string; requiresExpiry?: boolean }>;
  chargeCategories: Array<{ key: ChargeCategory; label: string; defaultTaxRate: number; icon?: string }>;
}
