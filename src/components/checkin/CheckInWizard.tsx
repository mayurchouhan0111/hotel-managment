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
  preselectedRoom?: Room | null;
  preselectedGuest?: Guest | null;
  onSuccessStayCreated?: (stayId: string) => void;
}

export const CheckInWizard: React.FC<CheckInWizardProps> = ({
  isOpen,
  onClose,
  preselectedRoom,
  preselectedGuest,
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
  const [selectedRoomId, setSelectedRoomId] = useState<string>(preselectedRoom?.id || '');
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
  const [taxRate, setTaxRate] = useState<number>(settings.standardTaxRate || 12);
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
      if (onSuccessStayCreated) {
        onSuccessStayCreated(result.stay.id);
      }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-900/40 backdrop-blur-xs overflow-y-auto select-none"
    >
      <div className="bg-white max-w-3xl w-full rounded-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center justify-between border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-semibold text-zinc-700">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-900">Guest Check-In</h2>
              <p className="text-xs text-zinc-400 font-mono-numbers">
                Step {currentStep} of 4 • Guest details & room allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Steps Navigation Bar */}
        <div className="bg-zinc-50 border-b border-zinc-200 px-5 py-2.5 flex items-center justify-between text-xs">
          {[
            { step: 1, label: 'Lookup' },
            { step: 2, label: 'Guest & KYC' },
            { step: 3, label: 'Room & Rate' },
            { step: 4, label: 'Confirm' },
          ].map((s) => (
            <div
              key={s.step}
              onClick={() => {
                if (s.step < currentStep) setCurrentStep(s.step);
              }}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentStep === s.step
                  ? 'text-zinc-900 font-semibold'
                  : currentStep > s.step
                  ? 'text-zinc-600 font-medium'
                  : 'text-zinc-400'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  currentStep === s.step
                    ? 'bg-zinc-900 text-white'
                    : currentStep > s.step
                    ? 'bg-zinc-200 text-zinc-700'
                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                }`}
              >
                {currentStep > s.step ? '✓' : s.step}
              </div>
              <span className="hidden sm:inline text-xs">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Body Steps */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-zinc-900 text-xs">
          {/* STEP 1: GUEST LOOKUP */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Find Guest or Add Walk-In</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Search existing guest profiles to preserve stay history and loyalty notes.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, phone, email, or ID number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                />
              </div>

              {/* Matching Existing Guests Table */}
              {searchQuery.trim() && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-zinc-500">
                    Results ({matchingGuests.length})
                  </div>
                  {matchingGuests.length > 0 ? (
                    <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white overflow-hidden shadow-xs">
                      {matchingGuests.map((g) => (
                        <div
                          key={g.id}
                          className="p-3 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-700 font-semibold flex items-center justify-center text-xs">
                              {g.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-zinc-900 text-xs flex items-center gap-1.5">
                                {g.fullName}
                                {g.isVip && (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1 rounded font-medium">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-zinc-400 flex items-center gap-3 mt-0.5 font-mono-numbers">
                                <span>{g.phone}</span>
                                <span>{g.idType.toUpperCase()}: {g.idNumber}</span>
                                <span>{g.totalStaysCount} stays</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectExistingGuest(g)}
                            className="px-3 py-1 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Select</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 rounded-xl">
                      No matching guest found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}

              {/* Or Create New Guest Walk-In Box */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-zinc-900 text-xs">First-time walk-in guest?</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Proceed to capture contact information, KYC ID, and address details.
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
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>New Guest Profile</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GUEST DETAILS & KYC */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">Guest Information & KYC</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isNewGuest
                      ? 'Capture guest contact details and identification credentials.'
                      : `Updating profile for ${fullName}`}
                  </p>
                </div>
                <span className="text-xs font-mono-numbers px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {guestId}
                </span>
              </div>

              {/* Duplicate Alert if triggered */}
              {duplicateWarning.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Possible Existing Guest Found</span>
                  </div>
                  <p className="text-zinc-600">
                    A record with matching phone or ID number already exists.
                  </p>

                  <div className="space-y-1.5">
                    {duplicateWarning.map((dg) => (
                      <div
                        key={dg.id}
                        className="bg-white p-2.5 rounded-lg border border-amber-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-zinc-900">{dg.fullName} ({dg.id})</div>
                          <div className="text-zinc-500 text-[11px]">
                            {dg.phone} • {dg.idType.toUpperCase()}: {dg.idNumber}
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectExistingGuest(dg)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded text-xs cursor-pointer"
                        >
                          Use Profile
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
                      className="text-xs text-zinc-700 hover:underline cursor-pointer font-medium"
                    >
                      Ignore and create as new guest →
                    </button>
                  </div>
                </div>
              )}

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-medium text-zinc-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikramaditya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Mobile Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Nationality */}
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Nationality</label>
                  <input
                    type="text"
                    placeholder="e.g. Indian"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="unspecified">Unspecified</option>
                  </select>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block font-medium text-zinc-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="Street / House / Area"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                {/* City & State */}
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">City / State</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai, Maharashtra"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* KYC Document Section */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <h4 className="text-xs font-semibold text-zinc-900">Identity Verification</h4>
                  </div>
                  <span className="text-[11px] text-zinc-400">Government ID</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Document Type</label>
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
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
                    <label className="block font-medium text-zinc-700 mb-1">Document Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 4829 3810 9482"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-zinc-700 mb-1">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={idExpiryDate}
                      onChange={(e) => setIdExpiryDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Upload & Attached Documents */}
                <div className="pt-1">
                  <div className="flex items-center gap-2.5">
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
                      className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload Document</span>
                    </button>
                    <span className="text-[11px] text-zinc-400">JPG, PNG, or PDF (Max 5MB)</span>
                  </div>

                  {documents.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {documents.map((docItem) => (
                        <div
                          key={docItem.id}
                          className="p-2 bg-white border border-zinc-200 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            <div className="truncate">
                              <div className="font-medium text-zinc-900 truncate">{docItem.name}</div>
                              <div className="text-[10px] text-emerald-700 font-medium">Verified</div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDocuments(documents.filter((d) => d.id !== docItem.id))}
                            className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                <h4 className="text-xs font-semibold text-zinc-800 mb-2">Emergency Contact (Optional)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <input
                    type="text"
                    placeholder="Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Emergency Phone"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse)"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ROOM SELECTION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Select Room & Duration</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pick an available room and configure dates, rate, and guest occupancy.
                </p>
              </div>

              {/* Stay Dates & Guest Counts */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Check-In</label>
                  <input
                    type="datetime-local"
                    value={checkInDateTime}
                    onChange={(e) => setCheckInDateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Expected Checkout</label>
                  <input
                    type="datetime-local"
                    value={expectedCheckOutDateTime}
                    onChange={(e) => setExpectedCheckOutDateTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Adults (18+)</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-semibold font-mono-numbers focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Children (0-17)</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-semibold font-mono-numbers focus:border-zinc-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Room Grid Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                    <BedDouble className="w-3.5 h-3.5 text-zinc-600" />
                    Available Rooms
                  </h4>
                  <span className="text-xs text-zinc-600 font-medium font-mono-numbers">
                    {nights} Night{nights > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {rooms.map((room) => {
                    const isAvail = room.status === 'available';
                    const isSelected = selectedRoomId === room.id;
                    const totalGuests = adultsCount + childrenCount;
                    const fitsCapacity = totalGuests <= room.maxOccupancy;
                    const isOverCapacity = isAvail && !fitsCapacity;

                    return (
                      <div
                        key={room.id}
                        onClick={() => {
                          if (isAvail) setSelectedRoomId(room.id);
                        }}
                        className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between h-28 relative ${
                          !isAvail
                            ? 'opacity-40 bg-zinc-100 border-zinc-200 cursor-not-allowed'
                            : isOverCapacity
                            ? 'bg-rose-50/50 border-rose-200 cursor-pointer hover:border-rose-300'
                            : isSelected
                            ? 'border-zinc-900 bg-zinc-50 shadow-xs cursor-pointer ring-1 ring-zinc-900'
                            : 'bg-white border-zinc-200 hover:border-zinc-400 cursor-pointer shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-sm font-semibold font-mono-numbers text-zinc-900">
                              #{room.roomNumber}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {room.type}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-zinc-900 shrink-0" />
                          )}
                        </div>

                        <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-zinc-900 font-mono-numbers">
                            {formatCurrency(room.baseRate, settings.currencySymbol)}
                            <span className="text-[10px] text-zinc-400 font-normal">/nt</span>
                          </span>
                          <span className={`font-medium ${isOverCapacity ? 'text-rose-600' : 'text-zinc-400'}`}>
                            {room.maxOccupancy} max
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capacity Warning */}
              {selectedRoomId && selectedRoom && (adultsCount + childrenCount) > selectedRoom.maxOccupancy && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-rose-800">Exceeds Room Capacity</div>
                    <p className="text-rose-700 mt-0.5">
                      {selectedRoom.type} (Room #{selectedRoom.roomNumber}) allows max {selectedRoom.maxOccupancy} guest{selectedRoom.maxOccupancy > 1 ? 's' : ''}.
                      You have {adultsCount + childrenCount} guest{(adultsCount + childrenCount) > 1 ? 's' : ''} ({adultsCount} adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} child${childrenCount > 1 ? 'ren' : ''}` : ''}).
                      Please select a larger room or reduce the guest count.
                    </p>
                  </div>
                </div>
              )}

              {/* Pricing Customization & Special Requests */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Room Rate ({settings.currencySymbol}/night)
                  </label>
                  <input
                    type="number"
                    placeholder={`Default: ${selectedRoom?.baseRate || 3000}`}
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : '')}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">
                    Discount ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:bg-white focus:border-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-zinc-700 mb-1">Tax / GST Rate (%)</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 focus:bg-white focus:border-zinc-900 focus:outline-none"
                  >
                    <option value="12">12% Standard Hotel GST</option>
                    <option value="18">18% Luxury Suite GST</option>
                    <option value="0">0% Exempt</option>
                  </select>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block font-medium text-zinc-700 mb-1">Special Requests & Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Early check-in, quiet room, extra key card"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none text-xs"
                />
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Review & Confirm Check-In</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Verify reservation details and optionally collect an advance deposit.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3.5">
                <div className="flex items-start justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <div className="text-[11px] font-medium text-zinc-500">Guest & Reservation</div>
                    <div className="text-sm font-semibold text-zinc-900 mt-0.5">{fullName}</div>
                    <div className="text-xs text-zinc-500 mt-0.5 font-mono-numbers">
                      {phone} • {idType.toUpperCase()}: {idNumber || 'Verified'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold font-mono-numbers text-zinc-900">
                      Room #{selectedRoom?.roomNumber}
                    </div>
                    <div className="text-xs text-zinc-500">{selectedRoom?.type} (Fl {selectedRoom?.floor})</div>
                  </div>
                </div>

                {/* Stay Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-zinc-600">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Check-In</span>
                    <span className="font-medium text-zinc-900">{new Date(checkInDateTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Exp. Checkout</span>
                    <span className="font-medium text-zinc-900">{new Date(expectedCheckOutDateTime).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Duration</span>
                    <span className="font-medium text-zinc-900 font-mono-numbers">{nights} night{nights > 1 ? 's' : ''}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Occupancy</span>
                    <span className="font-medium text-zinc-900">{adultsCount} Adults{childrenCount > 0 ? `, ${childrenCount} Ch.` : ''}</span>
                  </div>
                </div>

                {/* Folio Financial Estimate */}
                <div className="bg-white p-3 rounded-lg border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="space-y-0.5 text-zinc-600">
                    <div>
                      Tariff: {nights} nights × {formatCurrency(roomBaseRate, settings.currencySymbol)} = {formatCurrency(roomSubtotal, settings.currencySymbol)}
                    </div>
                    {discountAmount > 0 && (
                      <div className="text-emerald-700">Discount: -{formatCurrency(discountAmount, settings.currencySymbol)}</div>
                    )}
                    <div>GST ({taxRate}%): +{formatCurrency(estTaxAmount, settings.currencySymbol)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">Estimated Total</span>
                    <span className="text-base font-semibold text-zinc-900 font-mono-numbers">
                      {formatCurrency(estGrandTotal, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advance Payment Option */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-700" />
                    <h4 className="font-semibold text-zinc-900">Collect Advance Deposit?</h4>
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
                      className="rounded text-zinc-900 border-zinc-300 focus:ring-0"
                    />
                    <span className="font-medium text-zinc-700">Record Advance Now</span>
                  </label>
                </div>

                {collectAdvance && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1.5">
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">
                        Advance Amount ({settings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={advanceAmount}
                        onChange={(e) => setAdvanceAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 font-mono-numbers focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">Payment Method</label>
                      <select
                        value={advanceMethod}
                        onChange={(e) => setAdvanceMethod(e.target.value as any)}
                        className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      >
                        <option value="upi">UPI / QR</option>
                        <option value="card">Credit / Debit Card</option>
                        <option value="cash">Cash</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-zinc-700 mb-1">Transaction Ref / Note</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI/2026/9842"
                        value={advanceRefNumber}
                        onChange={(e) => setAdvanceRefNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:border-zinc-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-zinc-100 px-5 py-3 flex items-center justify-between text-xs">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1 transition-colors cursor-pointer font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer font-medium"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => {
                  setIsNewGuest(true);
                  setSelectedExistingGuest(null);
                  setCurrentStep(2);
                }}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                id="btn-step2-next"
                onClick={handleCheckDuplicatesAndProceed}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Select Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
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
                  const room = rooms.find(r => r.id === selectedRoomId);
                  if (room && (adultsCount + childrenCount) > room.maxOccupancy) {
                    alert(`Cannot proceed: ${room.type} (Room #${room.roomNumber}) allows max ${room.maxOccupancy} guest${room.maxOccupancy > 1 ? 's' : ''}, but you have ${adultsCount + childrenCount} guest${(adultsCount + childrenCount) > 1 ? 's' : ''}. Please select a larger room or reduce guest count.`);
                    return;
                  }
                  setCurrentStep(4);
                }}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Review Folio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                id="btn-confirm-checkin-final"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Checking In...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Check In</span>
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
