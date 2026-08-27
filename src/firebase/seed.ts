import { db } from './config';
import { collection, doc, writeBatch, getDocs, limit, query } from 'firebase/firestore';
import { Room, Guest, Stay, Folio, HotelSettings, StaffUser } from '../types/hotel';

export const DEFAULT_HOTEL_SETTINGS: HotelSettings = {
  name: 'Grand Horizon Royale Luxury Hotel & Suites',
  tagline: 'Excellence in Hospitality & Luxury Living',
  address: '42 Heritage Boulevard, Civil Lines, Bund Road',
  city: 'New Delhi',
  state: 'Delhi',
  country: 'India',
  zipCode: '110054',
  phone: '+91 11 4982 7000',
  email: 'reception@grandhorizonroyale.com',
  gstin: '07AAAAA0000A1Z5',
  website: 'https://grandhorizonroyale.com',
  currencySymbol: '₹',
  currencyCode: 'INR',
  defaultCheckInTime: '14:00',
  defaultCheckOutTime: '11:00',
  standardTaxRate: 12,
  luxuryTaxRate: 18,
  allowNegativeBalance: false,
  documentTypes: [
    { key: 'aadhaar', label: 'Aadhaar Card (UIDAI)', requiresExpiry: false },
    { key: 'passport', label: 'Passport', requiresExpiry: true },
    { key: 'driving_license', label: 'Driving License', requiresExpiry: true },
    { key: 'voter_id', label: 'Voter ID Card', requiresExpiry: false },
    { key: 'national_id', label: 'Government National ID', requiresExpiry: true },
    { key: 'other', label: 'Other Photo ID', requiresExpiry: false },
  ],
  chargeCategories: [
    { key: 'room', label: 'Room Tariff / Night', defaultTaxRate: 12 },
    { key: 'food', label: 'Fine Dining & Buffet', defaultTaxRate: 5 },
    { key: 'room_service', label: 'In-Room Dining / Service', defaultTaxRate: 5 },
    { key: 'restaurant', label: 'Restaurant & Bar', defaultTaxRate: 5 },
    { key: 'laundry', label: 'Laundry & Dry Cleaning', defaultTaxRate: 18 },
    { key: 'extra_bed', label: 'Extra Bed / Rollaway', defaultTaxRate: 12 },
    { key: 'spa', label: 'Ayurvedic Spa & Wellness', defaultTaxRate: 18 },
    { key: 'parking', label: 'Valet / Chauffeur Service', defaultTaxRate: 18 },
    { key: 'minibar', label: 'Minibar Beverages & Snacks', defaultTaxRate: 18 },
    { key: 'misc', label: 'Miscellaneous / Concierge', defaultTaxRate: 18 },
  ],
};

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-1',
    name: 'Sarah Jenkins',
    email: 'sarah.reception@grandhorizon.com',
    role: 'receptionist',
    employeeId: 'EMP-REC-104',
    active: true,
  },
  {
    id: 'staff-2',
    name: 'Robert Vance',
    email: 'robert.mgr@grandhorizon.com',
    role: 'manager',
    employeeId: 'EMP-MGR-002',
    active: true,
  },
  {
    id: 'staff-3',
    name: 'Elena Rostova',
    email: 'elena.admin@grandhorizon.com',
    role: 'admin',
    employeeId: 'EMP-ADM-001',
    active: true,
  },
];

export const INITIAL_ROOMS: Room[] = [
  // Floor 1 - Standard & Deluxe
  {
    id: '101',
    roomNumber: '101',
    floor: 1,
    type: 'Deluxe King',
    baseRate: 3500,
    maxOccupancy: 2,
    amenities: ['King Bed', 'City View', 'High-Speed Wi-Fi', 'Coffee Maker', 'Mini Refrigerator'],
    status: 'occupied',
    currentStayId: 'STY-2026-0801',
    currentGuestName: 'Vikramaditya Sharma',
  },
  {
    id: '102',
    roomNumber: '102',
    floor: 1,
    type: 'Standard Twin',
    baseRate: 2800,
    maxOccupancy: 2,
    amenities: ['Twin Beds', 'Garden View', 'Work Desk', 'Wi-Fi', 'Smart TV'],
    status: 'available',
  },
  {
    id: '103',
    roomNumber: '103',
    floor: 1,
    type: 'Deluxe King',
    baseRate: 3500,
    maxOccupancy: 2,
    amenities: ['King Bed', 'Balcony', 'Ensuite Shower', 'Wi-Fi', 'Mini Refrigerator'],
    status: 'cleaning',
    notes: 'Checked out at 10:30 AM, deep cleaning requested',
  },
  {
    id: '104',
    roomNumber: '104',
    floor: 1,
    type: 'Standard Twin',
    baseRate: 2800,
    maxOccupancy: 2,
    amenities: ['Twin Beds', 'Courtyard View', 'Wi-Fi', 'Tea Kettle'],
    status: 'available',
  },

  // Floor 2 - Executive Suites & Deluxe
  {
    id: '201',
    roomNumber: '201',
    floor: 2,
    type: 'Executive Suite',
    baseRate: 6200,
    maxOccupancy: 3,
    amenities: ['King Bed', 'Living Area', 'Bathtub', 'Balcony', 'Mini Bar', 'Espresso Machine'],
    status: 'occupied',
    currentStayId: 'STY-2026-0802',
    currentGuestName: 'Ananya Deshmukh',
  },
  {
    id: '202',
    roomNumber: '202',
    floor: 2,
    type: 'Executive Suite',
    baseRate: 6200,
    maxOccupancy: 3,
    amenities: ['King Bed', 'Lounge Sofa', 'Jacuzzi Bath', 'Balcony', 'Express Laundry Service'],
    status: 'available',
  },
  {
    id: '203',
    roomNumber: '203',
    floor: 2,
    type: 'Deluxe King',
    baseRate: 3800,
    maxOccupancy: 2,
    amenities: ['King Bed', 'Pool View', 'Smart TV', 'Workstation', 'High-Speed Wi-Fi'],
    status: 'maintenance',
    notes: 'HVAC AC thermostat sensor replacement in progress',
  },
  {
    id: '204',
    roomNumber: '204',
    floor: 2,
    type: 'Family Suite',
    baseRate: 7500,
    maxOccupancy: 4,
    amenities: ['1 King + 2 Twin Beds', '2 Bathrooms', 'Dining Table', 'Kitchenette', 'Pool View'],
    status: 'available',
  },

  // Floor 3 - Luxury & Presidential
  {
    id: '301',
    roomNumber: '301',
    floor: 3,
    type: 'Presidential Suite',
    baseRate: 14500,
    maxOccupancy: 4,
    amenities: ['Master Suite', 'Private Terrace', 'Private Jacuzzi', 'Dining Room', 'Butler Service', 'Panoramic Skyline'],
    status: 'available',
  },
  {
    id: '302',
    roomNumber: '302',
    floor: 3,
    type: 'Executive Suite',
    baseRate: 6500,
    maxOccupancy: 3,
    amenities: ['King Bed', 'Skyline View', 'Marble Bath', 'Wine Cooler', 'Sound System'],
    status: 'reserved',
    notes: 'VIP arrival expected today 06:00 PM',
  },
  {
    id: '303',
    roomNumber: '303',
    floor: 3,
    type: 'Deluxe King',
    baseRate: 4000,
    maxOccupancy: 2,
    amenities: ['King Bed', 'High Floor View', 'Workstation', 'Rain Shower'],
    status: 'available',
  },
  {
    id: '304',
    roomNumber: '304',
    floor: 3,
    type: 'Family Suite',
    baseRate: 8000,
    maxOccupancy: 5,
    amenities: ['2 King Bedrooms', 'Living Room', 'Balcony', 'Smart Automation'],
    status: 'available',
  },
];

export const INITIAL_GUESTS: Guest[] = [
  {
    id: 'GST-2026-001',
    fullName: 'Vikramaditya Sharma',
    phone: '+91 98765 43210',
    email: 'vikram.sharma@techcorp.in',
    dateOfBirth: '1988-05-14',
    gender: 'male',
    nationality: 'Indian',
    address: 'Flat 402, Pinnacle Heights, Sector 56',
    city: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    zipCode: '122011',
    idType: 'aadhaar',
    idNumber: '4829 3810 9482',
    documents: [
      {
        id: 'DOC-001',
        name: 'Aadhaar Card Copy',
        type: 'aadhaar',
        documentNumber: '4829 3810 9482',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        uploadedByStaffName: 'Sarah Jenkins',
        verified: true,
        fileName: 'aadhaar_vikram.pdf',
      },
    ],
    emergencyContact: {
      name: 'Pooja Sharma',
      phone: '+91 98765 11223',
      relationship: 'Spouse',
    },
    vipStatus: true,
    tags: ['Corporate', 'Frequent Guest', 'Non-Smoking'],
    notes: 'Prefers quiet corner rooms on high floors with extra pillows.',
    totalStaysCount: 3,
    lastStayDate: new Date().toISOString(),
    totalSpent: 28400,
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
    createdByStaffName: 'Sarah Jenkins',
  },
  {
    id: 'GST-2026-002',
    fullName: 'Ananya Deshmukh',
    phone: '+91 98200 87654',
    email: 'ananya.deshmukh@designstudio.com',
    dateOfBirth: '1993-11-20',
    gender: 'female',
    nationality: 'Indian',
    address: 'B-12, Green Acres Society, Bandra West',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    zipCode: '400050',
    idType: 'passport',
    idNumber: 'Z8920417',
    idExpiryDate: '2031-08-15',
    documents: [
      {
        id: 'DOC-002',
        name: 'Passport Photo Page',
        type: 'passport',
        documentNumber: 'Z8920417',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        uploadedByStaffName: 'Robert Vance',
        verified: true,
        expiryDate: '2031-08-15',
        fileName: 'passport_ananya.jpg',
      },
    ],
    emergencyContact: {
      name: 'Rohan Deshmukh',
      phone: '+91 98200 99887',
      relationship: 'Brother',
    },
    vipStatus: false,
    tags: ['Designer', 'Late Checkout Requested'],
    notes: 'Allergic to feather pillows, vegetarian breakfast required.',
    totalStaysCount: 1,
    lastStayDate: new Date().toISOString(),
    totalSpent: 14200,
    createdAt: '2026-03-01T14:30:00Z',
    updatedAt: new Date().toISOString(),
    createdByStaffName: 'Robert Vance',
  },
  {
    id: 'GST-2026-003',
    fullName: 'David Jonathan Miller',
    phone: '+1 415 555 2671',
    email: 'david.miller@globalventures.io',
    dateOfBirth: '1982-03-09',
    gender: 'male',
    nationality: 'American',
    address: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'California',
    country: 'United States',
    zipCode: '94107',
    idType: 'passport',
    idNumber: 'US84920194',
    idExpiryDate: '2029-12-31',
    documents: [
      {
        id: 'DOC-003',
        name: 'US Passport & Indian Visa',
        type: 'passport',
        documentNumber: 'US84920194',
        uploadedAt: '2026-02-14T09:00:00Z',
        uploadedByStaffName: 'Sarah Jenkins',
        verified: true,
        expiryDate: '2029-12-31',
      },
    ],
    vipStatus: true,
    tags: ['International VIP', 'Early Arrival'],
    totalStaysCount: 2,
    lastStayDate: '2026-02-18T11:00:00Z',
    totalSpent: 42600,
    createdAt: '2026-02-14T09:00:00Z',
    updatedAt: '2026-02-18T11:00:00Z',
    createdByStaffName: 'Sarah Jenkins',
  },
];

export async function checkAndSeedInitialData(): Promise<boolean> {
  try {
    const roomsSnap = await getDocs(query(collection(db, 'rooms'), limit(1)));
    if (!roomsSnap.empty) {
      // Data already seeded
      return false;
    }

    const batch = writeBatch(db);

    // 1. Settings
    const settingsRef = doc(db, 'settings', 'hotelConfig');
    batch.set(settingsRef, DEFAULT_HOTEL_SETTINGS);

    // 2. Staff Users
    for (const staff of INITIAL_STAFF_USERS) {
      const staffRef = doc(db, 'staff', staff.id);
      batch.set(staffRef, staff);
    }

    // 3. Rooms
    for (const room of INITIAL_ROOMS) {
      const roomRef = doc(db, 'rooms', room.id);
      batch.set(roomRef, room);
    }

    // 4. Guests
    for (const guest of INITIAL_GUESTS) {
      const guestRef = doc(db, 'guests', guest.id);
      batch.set(guestRef, guest);
    }

    // 5. Active Stay #1 for Vikramaditya Sharma in Room 101
    const stay1Id = 'STY-2026-0801';
    const folio1Id = 'FOL-2026-0801';
    const checkInDate1 = new Date(Date.now() - 86400000 * 2).toISOString();
    const checkOutDate1 = new Date(Date.now() + 86400000).toISOString();

    const stay1: Stay = {
      id: stay1Id,
      guestId: 'GST-2026-001',
      guestName: 'Vikramaditya Sharma',
      guestPhone: '+91 98765 43210',
      guestEmail: 'vikram.sharma@techcorp.in',
      guestNationality: 'Indian',
      guestIdNumber: '4829 3810 9482',
      roomId: '101',
      roomNumber: '101',
      roomType: 'Deluxe King',
      checkInDate: checkInDate1,
      expectedCheckOutDate: checkOutDate1,
      nightsCount: 3,
      adultsCount: 1,
      childrenCount: 0,
      totalGuests: 1,
      roomRatePerNight: 3500,
      status: 'active',
      purposeOfVisit: 'Business Conference',
      specialRequests: 'High floor, quiet corner, early wake-up call',
      folioId: folio1Id,
      createdByStaffId: 'staff-1',
      createdByStaffName: 'Sarah Jenkins',
      checkedInAt: checkInDate1,
      createdAt: checkInDate1,
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, 'stays', stay1Id), stay1);

    const folio1: Folio = {
      id: folio1Id,
      stayId: stay1Id,
      guestId: 'GST-2026-001',
      guestName: 'Vikramaditya Sharma',
      roomId: '101',
      roomNumber: '101',
      charges: [
        {
          id: 'CHG-101',
          stayId: stay1Id,
          category: 'room',
          description: 'Deluxe King Room Tariff (3 Nights)',
          quantity: 3,
          unitPrice: 3500,
          discountAmount: 500,
          taxRate: 12,
          taxAmount: 1200,
          total: 11200,
          timestamp: checkInDate1,
          addedByStaffName: 'Sarah Jenkins',
        },
        {
          id: 'CHG-102',
          stayId: stay1Id,
          category: 'room_service',
          description: 'Club Sandwich, Cappuccino & Fresh Juice',
          quantity: 1,
          unitPrice: 750,
          discountAmount: 0,
          taxRate: 5,
          taxAmount: 37.5,
          total: 787.5,
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          addedByStaffName: 'Sarah Jenkins',
        },
        {
          id: 'CHG-103',
          stayId: stay1Id,
          category: 'laundry',
          description: 'Express Dry Cleaning (2 Suits + 3 Shirts)',
          quantity: 1,
          unitPrice: 850,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 153,
          total: 1003,
          timestamp: new Date(Date.now() - 36000000).toISOString(),
          addedByStaffName: 'Robert Vance',
        },
      ],
      payments: [
        {
          id: 'PAY-101',
          stayId: stay1Id,
          amount: 5000,
          method: 'upi',
          referenceNumber: 'UPI/20260825/982049182',
          receivedByStaffName: 'Sarah Jenkins',
          timestamp: checkInDate1,
          notes: 'Advance security deposit paid via Google Pay',
          receiptNumber: 'REC-58201',
        },
      ],
      subtotal: 12100,
      totalDiscount: 500,
      totalTax: 1390.5,
      grandTotal: 12990.5,
      totalPaid: 5000,
      balanceDue: 7990.5,
      status: 'open',
      createdAt: checkInDate1,
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, 'folios', folio1Id), folio1);

    // 6. Active Stay #2 for Ananya Deshmukh in Room 201
    const stay2Id = 'STY-2026-0802';
    const folio2Id = 'FOL-2026-0802';
    const checkInDate2 = new Date(Date.now() - 86400000).toISOString();
    const checkOutDate2 = new Date(Date.now() + 86400000 * 2).toISOString();

    const stay2: Stay = {
      id: stay2Id,
      guestId: 'GST-2026-002',
      guestName: 'Ananya Deshmukh',
      guestPhone: '+91 98200 87654',
      guestEmail: 'ananya.deshmukh@designstudio.com',
      guestNationality: 'Indian',
      guestIdNumber: 'Z8920417',
      roomId: '201',
      roomNumber: '201',
      roomType: 'Executive Suite',
      checkInDate: checkInDate2,
      expectedCheckOutDate: checkOutDate2,
      nightsCount: 3,
      adultsCount: 2,
      childrenCount: 0,
      totalGuests: 2,
      roomRatePerNight: 6200,
      status: 'active',
      purposeOfVisit: 'Leisure & Architecture Tour',
      folioId: folio2Id,
      createdByStaffId: 'staff-2',
      createdByStaffName: 'Robert Vance',
      checkedInAt: checkInDate2,
      createdAt: checkInDate2,
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, 'stays', stay2Id), stay2);

    const folio2: Folio = {
      id: folio2Id,
      stayId: stay2Id,
      guestId: 'GST-2026-002',
      guestName: 'Ananya Deshmukh',
      roomId: '201',
      roomNumber: '201',
      charges: [
        {
          id: 'CHG-201',
          stayId: stay2Id,
          category: 'room',
          description: 'Executive Suite Room Tariff (3 Nights)',
          quantity: 3,
          unitPrice: 6200,
          discountAmount: 1000,
          taxRate: 12,
          taxAmount: 2112,
          total: 19712,
          timestamp: checkInDate2,
          addedByStaffName: 'Robert Vance',
        },
      ],
      payments: [
        {
          id: 'PAY-201',
          stayId: stay2Id,
          amount: 10000,
          method: 'card',
          referenceNumber: 'HDFC-POS-84920',
          receivedByStaffName: 'Robert Vance',
          timestamp: checkInDate2,
          notes: 'Mastercard advance authorization',
          receiptNumber: 'REC-58202',
        },
      ],
      subtotal: 18600,
      totalDiscount: 1000,
      totalTax: 2112,
      grandTotal: 19712,
      totalPaid: 10000,
      balanceDue: 9712,
      status: 'open',
      createdAt: checkInDate2,
      updatedAt: new Date().toISOString(),
    };
    batch.set(doc(db, 'folios', folio2Id), folio2);

    // 7. Historical Stay for David Miller (Checked out with full settlement & invoice)
    const stay3Id = 'STY-2026-0710';
    const folio3Id = 'FOL-2026-0710';
    const invoice3Id = 'INV-2026-0089';
    const checkInDate3 = '2026-02-14T14:00:00Z';
    const checkOutDate3 = '2026-02-18T10:45:00Z';

    const stay3: Stay = {
      id: stay3Id,
      guestId: 'GST-2026-003',
      guestName: 'David Jonathan Miller',
      guestPhone: '+1 415 555 2671',
      guestEmail: 'david.miller@globalventures.io',
      guestNationality: 'American',
      guestIdNumber: 'US84920194',
      roomId: '301',
      roomNumber: '301',
      roomType: 'Presidential Suite',
      checkInDate: checkInDate3,
      expectedCheckOutDate: '2026-02-18T11:00:00Z',
      actualCheckOutDate: checkOutDate3,
      nightsCount: 4,
      adultsCount: 2,
      childrenCount: 0,
      totalGuests: 2,
      roomRatePerNight: 14500,
      status: 'checked_out',
      purposeOfVisit: 'Executive Board Meeting',
      folioId: folio3Id,
      invoiceId: invoice3Id,
      createdByStaffId: 'staff-1',
      createdByStaffName: 'Sarah Jenkins',
      checkedInAt: checkInDate3,
      checkedOutAt: checkOutDate3,
      checkedOutByStaffName: 'Sarah Jenkins',
      createdAt: checkInDate3,
      updatedAt: checkOutDate3,
    };
    batch.set(doc(db, 'stays', stay3Id), stay3);

    const folio3: Folio = {
      id: folio3Id,
      stayId: stay3Id,
      guestId: 'GST-2026-003',
      guestName: 'David Jonathan Miller',
      roomId: '301',
      roomNumber: '301',
      charges: [
        {
          id: 'CHG-301',
          stayId: stay3Id,
          category: 'room',
          description: 'Presidential Suite (4 Nights)',
          quantity: 4,
          unitPrice: 14500,
          discountAmount: 2000,
          taxRate: 18,
          taxAmount: 10080,
          total: 66080,
          timestamp: checkInDate3,
          addedByStaffName: 'Sarah Jenkins',
        },
        {
          id: 'CHG-302',
          stayId: stay3Id,
          category: 'spa',
          description: 'Ayurvedic Royal Signature Massage (2 Persons)',
          quantity: 1,
          unitPrice: 6500,
          discountAmount: 0,
          taxRate: 18,
          taxAmount: 1170,
          total: 7670,
          timestamp: '2026-02-16T17:00:00Z',
          addedByStaffName: 'Sarah Jenkins',
        },
      ],
      payments: [
        {
          id: 'PAY-301',
          stayId: stay3Id,
          amount: 73750,
          method: 'card',
          referenceNumber: 'AMEX-US-94021',
          receivedByStaffName: 'Sarah Jenkins',
          timestamp: checkOutDate3,
          notes: 'Full settlement via American Express at checkout',
          receiptNumber: 'REC-57901',
        },
      ],
      subtotal: 64500,
      totalDiscount: 2000,
      totalTax: 11250,
      grandTotal: 73750,
      totalPaid: 73750,
      balanceDue: 0,
      status: 'settled',
      createdAt: checkInDate3,
      updatedAt: checkOutDate3,
    };
    batch.set(doc(db, 'folios', folio3Id), folio3);

    // Initial audit log
    const logRef = doc(db, 'auditLogs', 'LOG-INIT');
    batch.set(logRef, {
      id: 'LOG-INIT',
      action: 'SYSTEM_SEEDED',
      entityType: 'settings',
      entityId: 'hotelConfig',
      actorId: 'system',
      actorName: 'System Setup',
      timestamp: new Date().toISOString(),
      details: 'Hotel management system initialized with seed inventory and demo records',
    });

    await batch.commit();
    return true;
  } catch (error) {
    console.error('Error seeding initial data:', error);
    return false;
  }
}
