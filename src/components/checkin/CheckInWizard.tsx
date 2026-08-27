import React, { useState, useRef } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Room, Guest, GuestDocument, IdType, PaymentMethod } from '../../types/hotel';
import {
  UserPlus,
  Search,
  BedDouble,
  CreditCard,
  CheckCircle2,
  Calendar,
  X,
  Upload,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { calculateNights } from '../../utils/date';
import { formatCurrency } from '../../utils/format';
import { generateId } from '../../utils/id';

interface CheckInWizardProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedRoom?: Room | null;
  onSuccessStayCreated: (stayId: string) => void;
}

export const CheckInWizard: React.FC<CheckInWizardProps> = ({
  isOpen,
  onClose,
  preSelectedRoom,
  onSuccessStayCreated,
}) => {
  const { rooms, guests, settings, checkIn, findDuplicateGuests } = useHotel();

  // Wizard Step Control (1: Guest Lookup, 2: KYC & Details, 3: Room Selection, 4: Folio & Confirmation)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // STEP 1: Guest Search / Mode
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExistingGuest, setSelectedExistingGuest] = useState<Guest | null>(null);
  const [isNewGuest, setIsNewGuest] = useState(true);

  // STEP 2: Guest Details & KYC
  const [guestId, setGuestId] = useState<string>(() => generateId('GST'));
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'unspecified'>('male');
  const [nationality, setNationality] = useState('Indian');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [idType, setIdType] = useState<IdType>('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [idExpiryDate, setIdExpiryDate] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [documents, setDocuments] = useState<GuestDocument[]>([]);
  const [notes, setNotes] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<Guest[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // STEP 3: Room & Stay Config
  const [selectedRoomId, setSelectedRoomId] = useState<string>(preSelectedRoom?.id || '');
  const [checkInDateTime, setCheckInDateTime] = useState<string>(
    () => new Date().toISOString().slice(0, 16)
  );
  const [expectedCheckOutDateTime, setExpectedCheckOutDateTime] = useState<string>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(11, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [customRate, setCustomRate] = useState<number | ''>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(settings.taxPercentage || 12);
  const [purposeOfVisit, setPurposeOfVisit] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // STEP 4: Folio & Advance Payment
  const [collectAdvance, setCollectAdvance] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [advanceMethod, setAdvanceMethod] = useState<PaymentMethod>('upi');
  const [advanceRefNumber, setAdvanceRefNumber] = useState('');
  const [advanceNotes, setAdvanceNotes] = useState('');

  if (!isOpen) return null;

  // Selected Room Object
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const roomBaseRate = typeof customRate === 'number' && customRate >= 0 ? customRate : (selectedRoom?.baseRate || 3000);
  const nights = calculateNights(checkInDateTime, expectedCheckOutDateTime);

  // Estimated Room Total
  const roomSubtotal = nights * roomBaseRate;
  const taxableBase = Math.max(0, roomSubtotal - discountAmount);
  const estTaxAmount = Math.round((taxableBase * (taxRate / 100)) * 100) / 100;
  const estGrandTotal = Math.round((taxableBase + estTaxAmount) * 100) / 100;

  // Search Results for Existing Guests
  const matchingGuests = guests.filter((g) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      g.fullName.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      g.id.toLowerCase().includes(q) ||
      g.idNumber.toLowerCase().includes(q)
    );
  });

  // Select an existing guest profile
  const handleSelectExistingGuest = (g: Guest) => {
    setSelectedExistingGuest(g);
    setIsNewGuest(false);
    setGuestId(g.id);
    setFullName(g.fullName);
    setPhone(g.phone);
    setEmail(g.email || '');
    setDateOfBirth(g.dateOfBirth || '');
    setGender(g.gender || 'male');
    setNationality(g.nationality || 'Indian');
    setAddress(g.address || '');
    setCity(g.city || '');
    setState(g.state || '');
    setCountry(g.country || 'India');
    setIdType(g.idType || 'aadhaar');
    setIdNumber(g.idNumber || '');
    setIdExpiryDate(g.idExpiryDate || '');
    setEmergencyName(g.emergencyContact?.name || '');
    setEmergencyPhone(g.emergencyContact?.phone || '');
    setEmergencyRelationship(g.emergencyContact?.relationship || '');
    setDocuments(g.documents || []);
    setNotes(g.notes || '');
    setDuplicateWarning([]);
    setCurrentStep(2); // Proceed to details confirmation
  };

  // Perform Duplicate Check before proceeding from new guest
  const handleCheckDuplicatesAndProceed = async () => {
    if (!fullName.trim()) {
      alert('Please enter guest full name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter guest phone number.');
      return;
    }

    if (isNewGuest) {
      const duplicates = await findDuplicateGuests({
        phone,
        idNumber: idNumber.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (duplicates.length > 0) {
        setDuplicateWarning(duplicates);
        return;
      }
    }

    setCurrentStep(3); // Proceed to Room Selection
  };

  // Handle Document Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert('Document file size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newDoc: GuestDocument = {
        id: generateId('DOC'),
        name: `${idType.toUpperCase()} - ${file.name}`,
        type: idType,
        documentNumber: idNumber || 'DOC-' + Math.floor(1000 + Math.random() * 9000),
        fileDataUrl: reader.result as string,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedByStaffName: 'Front Desk',
        verified: true,
      };

      setDocuments((prev) => [...prev, newDoc]);
    };
    reader.readAsDataURL(file);
  };

  // Final Form Submit: Check In
  const handleFinalSubmit = async () => {
    if (!selectedRoomId) {
      alert('Please select a room.');
      setCurrentStep(3);
      return;
    }

    try {
      setIsSubmitting(true);

      const guestPayload: Guest = {
        id: guestId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender,
        nationality: nationality.trim(),
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || 'India',
        idType,
        idNumber: idNumber.trim() || 'UNSPECIFIED',
        idExpiryDate: idExpiryDate || undefined,
        documents,
        emergencyContact: emergencyName
          ? {
              name: emergencyName.trim(),
              phone: emergencyPhone.trim(),
              relationship: emergencyRelationship.trim() || 'Family',
            }
          : undefined,
        notes: notes.trim() || undefined,
        totalStaysCount: selectedExistingGuest?.totalStaysCount || 0,
        totalSpent: selectedExistingGuest?.totalSpent || 0,
        createdAt: selectedExistingGuest?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdByStaffName: 'Front Desk',
      };

      const checkInPayload = {
        guest: guestPayload,
        isNewGuest,
        roomId: selectedRoomId,
        roomNumber: selectedRoom?.roomNumber || selectedRoomId,
        roomType: selectedRoom?.type || 'Deluxe King',
        roomRatePerNight: roomBaseRate,
        checkInDate: checkInDateTime,
        expectedCheckOutDate: expectedCheckOutDateTime,
        adultsCount,
        childrenCount,
        purposeOfVisit: purposeOfVisit.trim() || undefined,
        specialRequests: specialRequests.trim() || undefined,
        discountAmount,
        taxRate,
        advancePayment:
          collectAdvance && advanceAmount > 0
            ? {
                amount: advanceAmount,
                method: advanceMethod,
                referenceNumber: advanceRefNumber.trim() || undefined,
                notes: advanceNotes.trim() || undefined,
              }
            : undefined,
      };

      const result = await checkIn(checkInPayload);
      onSuccessStayCreated(result.stay.id);
      onClose();
    } catch (err: any) {
      console.error('Check-in error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="checkin-wizard-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs overflow-y-auto select-none"
    >
      <div className="bg-slate-900 max-w-4xl w-full rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Header */}
        <div className="bg-slate-850 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-indigo-400">Front Desk Operations</div>
              <h2 className="text-base font-bold text-white">Guest Check-In Wizard</h2>
              <p className="text-xs text-slate-400 font-mono-numbers">
                Step {currentStep} of 4 • Guest Onboarding & Room Allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3 flex items-center justify-between text-xs">
          {[
            { step: 1, label: 'Guest Lookup' },
            { step: 2, label: 'KYC & Identity' },
            { step: 3, label: 'Room & Tariff' },
            { step: 4, label: 'Folio & Confirm' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => {
                if (s.step < currentStep) setCurrentStep(s.step);
              }}
              className={`flex items-center gap-2 transition-colors cursor-pointer ${
                currentStep === s.step
                  ? 'text-white font-bold'
                  : currentStep > s.step
                  ? 'text-emerald-400 font-medium'
                  : 'text-slate-500'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === s.step
                    ? 'bg-indigo-600 text-white'
                    : currentStep > s.step
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span className="hidden sm:inline font-medium text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body Steps */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-white text-xs">
          {/* STEP 1: GUEST LOOKUP */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400">Step 1 of 4</span>
                <h3 className="text-base font-bold text-white mt-0.5">Search Returning Guest or Walk-In</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Search the guest repository to link past stay history and avoid duplicate records.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, phone (+91...), email, or ID number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Matching Existing Guests Table */}
              {searchQuery.trim() && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-400">
                    Search Results ({matchingGuests.length})
                  </div>
                  {matchingGuests.length > 0 ? (
                    <div className="border border-slate-700 rounded-xl divide-y divide-slate-800 bg-slate-850 overflow-hidden">
                      {matchingGuests.map((g) => (
                        <div
                          key={g.id}
                          className="p-3.5 hover:bg-slate-800 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-700 text-white font-bold flex items-center justify-center text-xs">
                              {g.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-xs flex items-center gap-2">
                                {g.fullName}
                                {g.isVip && (
                                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-medium">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5 font-mono-numbers">
                                <span>Phone: {g.phone}</span>
                                <span>{g.idType.toUpperCase()}: {g.idNumber}</span>
                                <span>{g.totalStaysCount} Stays</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectExistingGuest(g)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <span>Select Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-700 rounded-xl">
                      No matching guest found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}

              {/* Or Create New Guest Walk-In Box */}
              <div className="p-5 bg-slate-800/80 border border-slate-700 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">First-time walk-in guest?</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Proceed to capture contact, KYC ID, and address details.
                  </p>
                </div>
                <button
                  id="btn-create-new-guest"
                  onClick={() => {
                    setIsNewGuest(true);
                    setSelectedExistingGuest(null);
                    setGuestId(generateId('GST'));
                    setCurrentStep(2);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Guest Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS & KYC */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-indigo-400">Step 2 of 4</span>
                  <h3 className="text-base font-bold text-white mt-0.5">Guest Information & KYC Documents</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isNewGuest
                      ? 'Capture new guest contact details and identification credentials.'
                      : `Updating profile for ${fullName} (${guestId})`}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  ID: {guestId}
                </span>
              </div>

              {/* Duplicate Alert if triggered */}
              {duplicateWarning.length > 0 && (
                <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-xl text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Possible Existing Guest Record Found</span>
                  </div>
                  <p className="text-xs text-amber-300/80">
                    A record with matching phone number or ID number exists in the database.
                  </p>

                  <div className="space-y-2">
                    {duplicateWarning.map((dg) => (
                      <div
                        key={dg.id}
                        className="bg-slate-900/80 p-3 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-white">{dg.fullName} ({dg.id})</div>
                          <div className="text-slate-400 text-[11px]">
                            Phone: {dg.phone} • {dg.idType.toUpperCase()}: {dg.idNumber}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectExistingGuest(dg)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-xs cursor-pointer"
                        >
                          Use This Profile
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setDuplicateWarning([]);
                        setCurrentStep(3);
                      }}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Ignore & continue creating as new guest →
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Mobile Phone <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Unspecified</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block font-medium text-slate-300 mb-1">Permanent Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street / House / Colony"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                {/* City & State */}
                <div>
                  <label className="block font-medium text-slate-300 mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* KYC Document Section */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-xs font-semibold text-white">Identity Document & Verification</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">Government ID</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Document Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="aadhaar">Aadhaar Card (UIDAI)</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID Card</option>
                      <option value="national_id">Government National ID</option>
                      <option value="other">Other Photo ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Document Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 4829 3810 9482"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-numbers placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-300 mb-1">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={idExpiryDate}
                      onChange={(e) => setIdExpiryDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload & Attached Documents */}
                <div className="pt-2">
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-medium text-xs rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload ID Scan / PDF</span>
                    </button>
                    <span className="text-[11px] text-slate-500">JPG, PNG, or PDF (Max 5MB)</span>
                  </div>

                  {documents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                      {documents.map((docItem) => (
                        <div
                          key={docItem.id}
                          className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div className="truncate">
                              <div className="font-medium text-white truncate">{docItem.name}</div>
                              <div className="text-[10px] text-emerald-400">Verified Attachment</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDocuments(documents.filter((d) => d.id !== docItem.id))}
                            className="text-slate-400 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Emergency Contact (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-numbers placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROOM SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400">Step 3 of 4</span>
                <h3 className="text-base font-bold text-white mt-0.5">Select Room & Stay Duration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick an available room and configure dates, rate, and guest occupancy.
                </p>
              </div>

              {/* Stay Dates & Guest Counts */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Check-In Date & Time</label>
                  <input
                    type="datetime-local"
                    value={checkInDateTime}
                    onChange={(e) => setCheckInDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Expected Checkout</label>
                  <input
                    type="datetime-local"
                    value={expectedCheckOutDateTime}
                    onChange={(e) => setExpectedCheckOutDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Adults (18+)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold font-mono-numbers focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Children (0-17)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-semibold font-mono-numbers focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Room Grid Picker */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-indigo-400" />
                    Available Rooms Matrix
                  </h4>
                  <span className="text-xs text-indigo-400 font-semibold font-mono-numbers">
                    {nights} Night{nights > 1 ? 's' : ''} Stay Duration
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {rooms.map((room) => {
                    const isAvail = room.status === 'available';
                    const isSelected = selectedRoomId === room.id;

                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          if (isAvail) setSelectedRoomId(room.id);
                        }}
                        className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-between h-28 relative ${
                          !isAvail
                            ? 'opacity-40 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-950/30 shadow-sm cursor-pointer'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-base font-bold font-mono-numbers text-white">
                              #{room.roomNumber}
                            </div>
                            <div className="text-[11px] font-medium text-slate-300 mt-0.5">
                              {room.type}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                          <span className="font-semibold text-white font-mono-numbers">
                            {formatCurrency(room.baseRate, settings.currencySymbol)}
                            <span className="text-[10px] text-slate-400 font-normal">/nt</span>
                          </span>
                          <span className="text-[11px] text-slate-400">Fl {room.floor}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pricing Customization & Special Requests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Room Rate Per Night ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    placeholder={`Default: ${selectedRoom?.baseRate || 3000}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">
                    Total Discount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">GST / Tax Rate (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="12">12% Standard Hotel GST</option>
                    <option value="18">18% Luxury Suite GST</option>
                    <option value="0">0% Zero Tax / Exempt</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block font-medium text-slate-300 mb-1">Purpose of Visit & Special Requests</label>
                <input
                  type="text"
                  placeholder="e.g. Business conference, high floor, quiet room"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-indigo-400">Step 4 of 4</span>
                <h3 className="text-base font-bold text-white mt-0.5">Review Folio & Confirm Check-In</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verify reservation parameters and optionally collect an advance deposit.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-700 pb-3">
                  <div>
                    <div className="text-xs font-semibold text-indigo-400">Guest & Stay Allocation</div>
                    <div className="text-base font-bold text-white mt-0.5">{fullName}</div>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono-numbers">
                      Phone: {phone} • ID: {idType.toUpperCase()} ({idNumber || 'Verified'})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold font-mono-numbers text-white">
                      Room #{selectedRoom?.roomNumber}
                    </div>
                    <div className="text-xs text-slate-400">{selectedRoom?.type} (Floor {selectedRoom?.floor})</div>
                  </div>
                </div>

                {/* Stay Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Check-In</span>
                    <span className="font-medium text-white">{new Date(checkInDateTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Exp. Checkout</span>
                    <span className="font-medium text-white">{new Date(expectedCheckOutDateTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Duration</span>
                    <span className="font-medium text-white font-mono-numbers">{nights} Night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Guests</span>
                    <span className="font-medium text-white">{adultsCount} Adults{childrenCount > 0 ? `, ${childrenCount} Ch.` : ''}</span>
                  </div>
                </div>

                {/* Folio Financial Estimate */}
                <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 text-slate-300">
                    <div>
                      Tariff: {nights} nights × {formatCurrency(roomBaseRate, settings.currencySymbol)} = {formatCurrency(roomSubtotal, settings.currencySymbol)}
                    </div>
                    {discountAmount > 0 && (
                      <div className="text-emerald-400">Discount: -{formatCurrency(discountAmount, settings.currencySymbol)}</div>
                    )}
                    <div>GST ({taxRate}%): +{formatCurrency(estTaxAmount, settings.currencySymbol)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Estimated Grand Total</span>
                    <span className="text-lg font-bold text-white font-mono-numbers">
                      {formatCurrency(estGrandTotal, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advance Payment Option */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    <h4 className="font-semibold text-white">Collect Advance Deposit / Payment?</h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={collectAdvance}
                      onChange={(e) => {
                        setCollectAdvance(e.target.checked);
                        if (e.target.checked && advanceAmount === 0) {
                          setAdvanceAmount(Math.round(estGrandTotal / 2));
                        }
                      }}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span className="font-medium text-white">Record Advance Now</span>
                  </label>
                </div>

                {collectAdvance && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">
                        Advance Amount ({settings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono-numbers focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Payment Method</label>
                      <select
                        value={advanceMethod}
                        onChange={(e) => setAdvanceMethod(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="upi">UPI / QR Code</option>
                        <option value="card">Credit / Debit Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-300 mb-1">Transaction Ref / Note</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI/2026/9842"
                        value={advanceRefNumber}
                        onChange={(e) => setAdvanceRefNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-850 border-t border-slate-800 px-6 py-4 flex items-center justify-between text-xs">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-3">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  setIsNewGuest(true);
                  setSelectedExistingGuest(null);
                  setCurrentStep(2);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                id="btn-step2-next"
                onClick={handleCheckDuplicatesAndProceed}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Select Room</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                id="btn-step3-next"
                onClick={() => {
                  if (!selectedRoomId) {
                    alert('Please select a room.');
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <span>Review Stay & Folio</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                id="btn-confirm-checkin-final"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Allocating Room & Checking In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Check In Guest</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
