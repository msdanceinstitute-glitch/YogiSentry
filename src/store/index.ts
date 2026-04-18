import { create } from 'zustand';

// --- Types ---
export type Role = 'SUPER_ADMIN' | 'SECRETARY' | 'GUARD' | 'HOUSEKEEPING' | 'RESIDENT';

export interface User {
  id: string;
  loginId: string;
  password?: string;
  name: string;
  role: Role;
  societyId?: string;
  flatNo?: string;
  avatar?: string;
  upiId?: string;
  email?: string;
  gender?: string;
  employeeId?: string;
  preferences?: {
    gateAlerts: boolean;
    parcelDeliveries: boolean;
    maintenanceDues: boolean;
  };
}

export interface Society {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  registrationNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  totalTowers?: number;
  totalFloors?: number;
  totalFlats?: number;
  totalRevenue: number;
  subscriptionActive: boolean;
  subscriptionPlanId?: string;
  subscriptionExpiry?: string; // ISO Date
  logoUrl?: string;
  faviconUrl?: string;
  upiId?: string;
}

export interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  cities: string[]; // Coverage cities
  features: string[];
  maxUsers?: number;
}

export interface PurchaseOrder {
  id: string;
  societyId: string;
  planId: string;
  amount: number;
  date: string;
  validityMonths: number;
  expiryDate: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface PayrollRecord {
  id: string;
  date: string;
  staffName: string;
  staffId: string;
  amount: number;
  societyId: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'OPEN' | 'CLOSED';
  userId: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  date: string;
  action: string;
  user: string;
  societyId: string;
}

export interface VisitorRequest {
  id: string;
  visitorName: string;
  mobileNo?: string;
  guestCount?: number;
  reason?: 'GUEST' | 'FOOD_DELIVERY' | 'TECHNICIAN';
  flatNo: string;
  photoUrl: string;
  vehiclePhotoUrl?: string;
  vehicleId?: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'EXITED';
  timestamp: string;
  societyId: string;
}

export interface PermanentPass {
  id: string;
  name: string;
  role: string;
  mobileNo: string;
  validUntil: string;
  photoUrl?: string;
  societyId: string;
}

export interface Parcel {
  id: string;
  carrierName: string;
  flatNo: string;
  photoUrl: string;
  timeAdded: string;
  status: 'AT_GATE' | 'COLLECTED';
  societyId: string;
}

export interface MaintenanceDue {
  id: string;
  flatNo: string;
  amount: number;
  status: 'PAID' | 'UNPAID';
  month: string;
  societyId: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  societyId: string;
}

export interface Complaint {
  id: string;
  flatNo: string;
  title: string;
  description: string;
  status: 'OPEN' | 'RESOLVED';
  resolutionPicUrl?: string;
  societyId: string;
}

export interface CleaningProof {
  id: string;
  staffName: string;
  location: string;
  photoUrl: string;
  timestamp: string;
  societyId: string;
}

export interface Vehicle {
  id: string;
  flatNo: string;
  vehicleId: string;
  frontPhoto: string;
  backPhoto: string;
  societyId: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  societyId: string;
}

export interface ClubhouseBooking {
  id: string;
  societyId: string;
  flatNo: string;
  facilityName: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  requestedBy: string;
}

export interface EventRequest {
  id: string;
  societyId: string;
  flatNo: string;
  title: string;
  description: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED';
  requestedBy: string;
}

interface AppState {
  registrationCharge: number;
  setRegistrationCharge: (charge: number) => void;
  users: User[];
  updateUser: (id: string, updates: Partial<User>) => void;
  addUser: (user: User) => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  societies: Society[];
  addSociety: (s: Society) => void;
  updateSociety: (id: string, updates: Partial<Society>) => void;
  deleteSociety: (id: string) => void;
  registerSocietyFull: (society: Society, staff: User[], residents: User[]) => void;
  // Guard loop
  visitorRequests: VisitorRequest[];
  addVisitorRequest: (req: VisitorRequest) => void;
  updateVisitorStatus: (id: string, status: 'APPROVED' | 'DECLINED' | 'EXITED') => void;
  // Permanent Passes
  permanentPasses: PermanentPass[];
  addPermanentPass: (pass: PermanentPass) => void;
  // Parcel
  parcels: Parcel[];
  addParcel: (p: Parcel) => void;
  updateParcelStatus: (id: string, status: 'COLLECTED') => void;
  // Housekeeping
  cleaningProofs: CleaningProof[];
  addCleaningProof: (cp: CleaningProof) => void;
  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (v: Vehicle) => void;
  // Maintenance / Financials
  maintenanceDues: MaintenanceDue[];
  markMaintenancePaid: (id: string) => void;
  addMaintenanceDue: (due: MaintenanceDue) => void;
  expenses: Expense[];
  addExpense: (e: Expense) => void;
  // Complaints
  complaints: Complaint[];
  resolveComplaint: (id: string, picUrl: string) => void;
  // Communication
  notices: Notice[];
  addNotice: (n: Notice) => void;
  // Facilities
  clubhouseBookings: ClubhouseBooking[];
  addClubhouseBooking: (b: ClubhouseBooking) => void;
  updateClubhouseBookingStatus: (id: string, status: 'APPROVED' | 'DECLINED') => void;
  eventRequests: EventRequest[];
  addEventRequest: (e: EventRequest) => void;
  updateEventRequestStatus: (id: string, status: 'APPROVED' | 'DECLINED') => void;

  emailTemplates: EmailTemplate[];
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>) => void;

  subscriptions: SubscriptionPlan[];
  addSubscription: (plan: SubscriptionPlan) => void;
  updateSubscription: (id: string, updates: Partial<SubscriptionPlan>) => void;

  purchaseOrders: PurchaseOrder[];
  addPurchaseOrder: (po: PurchaseOrder) => void;

  payrolls: PayrollRecord[];
  addPayrollRecord: (p: PayrollRecord) => void;

  supportTickets: SupportTicket[];
  addSupportTicket: (t: SupportTicket) => void;

  activityLogs: ActivityLog[];
  logActivity: (action: string, user: string, societyId: string) => void;
}

const MOCK_SOCIETIES: Society[] = [
  { id: 'soc_1', name: 'Sunrise Apartments', totalRevenue: 15400, subscriptionActive: true, address: '100 Main St' },
  { id: 'soc_2', name: 'Oceanview Towers', totalRevenue: 8200, subscriptionActive: true, address: '200 Ocean Ave' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', loginId: 'YogiSentry', password: '123456', name: 'YogiSentry Admin', role: 'SUPER_ADMIN' },
  { id: 'u2', loginId: 'sec_sunrise', password: '123', name: 'Sunrise Secretary', role: 'SECRETARY', societyId: 'soc_1' },
  { id: 'u3', loginId: 'guard_main', password: '123', name: 'Main Gate Guard', role: 'GUARD', societyId: 'soc_1' },
  { id: 'u4', loginId: 'hk_staff', password: '123', name: 'Cleaning Staff', role: 'HOUSEKEEPING', societyId: 'soc_1' },
  { id: 'u5', loginId: '101', password: '123', name: 'Resident 101', role: 'RESIDENT', societyId: 'soc_1', flatNo: '101' },
];

export const useStore = create<AppState>((set) => ({
  registrationCharge: 5000, 
  setRegistrationCharge: (charge) => set({ registrationCharge: charge }),
  registerSocietyFull: (society: Society, staff: User[], residents: User[]) => set((state) => ({
    societies: [...state.societies, society],
    users: [...state.users, ...staff, ...residents]
  })),
  users: MOCK_USERS,
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map(u => u.id === id ? { ...u, ...updates } : u),
    currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...updates } : state.currentUser
  })),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),

  currentUser: MOCK_USERS[0],
  setCurrentUser: (user) => set({ currentUser: user }),

  societies: MOCK_SOCIETIES,
  addSociety: (s) => set((state) => ({ societies: [...state.societies, s] })),
  updateSociety: (id, updates) => set((state) => ({ societies: state.societies.map(s => s.id === id ? { ...s, ...updates } : s) })),
  deleteSociety: (id) => set((state) => ({
    societies: state.societies.filter(s => s.id !== id),
    users: state.users.filter(u => u.societyId !== id),
    visitorRequests: state.visitorRequests.filter(v => v.societyId !== id),
    permanentPasses: state.permanentPasses.filter(p => p.societyId !== id),
    parcels: state.parcels.filter(p => p.societyId !== id),
    cleaningProofs: state.cleaningProofs.filter(c => c.societyId !== id),
    vehicles: state.vehicles.filter(v => v.societyId !== id),
    maintenanceDues: state.maintenanceDues.filter(m => m.societyId !== id),
    expenses: state.expenses.filter(e => e.societyId !== id),
    complaints: state.complaints.filter(c => c.societyId !== id),
    notices: state.notices.filter(n => n.societyId !== id),
    clubhouseBookings: state.clubhouseBookings.filter(b => b.societyId !== id),
    eventRequests: state.eventRequests.filter(e => e.societyId !== id),
    activityLogs: state.activityLogs.filter(a => a.societyId !== id),
    purchaseOrders: state.purchaseOrders.filter(po => po.societyId !== id),
  })),

  visitorRequests: [],
  addVisitorRequest: (req) => set((state) => ({ visitorRequests: [req, ...state.visitorRequests] })),
  updateVisitorStatus: (id, status) => set((state) => ({
    visitorRequests: state.visitorRequests.map(r => r.id === id ? { ...r, status } : r)
  })),

  permanentPasses: [],
  addPermanentPass: (pass) => set((state) => ({ permanentPasses: [pass, ...state.permanentPasses] })),

  parcels: [],
  addParcel: (p) => set((state) => ({ parcels: [p, ...state.parcels] })),
  updateParcelStatus: (id, status) => set((state) => ({
    parcels: state.parcels.map(p => p.id === id ? { ...p, status } : p)
  })),

  cleaningProofs: [],
  addCleaningProof: (cp) => set((state) => ({ cleaningProofs: [cp, ...state.cleaningProofs] })),

  vehicles: [{ id: 'v1', flatNo: '101', vehicleId: 'MH01AB1234', frontPhoto: 'https://picsum.photos/seed/car/200/200', backPhoto: 'https://picsum.photos/seed/car_back/200/200', societyId: 'soc_1' }],
  addVehicle: (v) => set((state) => ({ vehicles: [v, ...state.vehicles] })),

  maintenanceDues: [
    { id: 'm1', flatNo: '101', amount: 3500, status: 'UNPAID', month: 'April 2026', societyId: 'soc_1' },
    { id: 'm2', flatNo: '204', amount: 3500, status: 'PAID', month: 'April 2026', societyId: 'soc_1' },
  ],
  markMaintenancePaid: (id) => set((state) => ({
    maintenanceDues: state.maintenanceDues.map(m => m.id === id ? { ...m, status: 'PAID' } : m)
  })),
  addMaintenanceDue: (due) => set((state) => ({ maintenanceDues: [due, ...state.maintenanceDues] })),

  expenses: [
    { id: 'e1', category: 'Electricity', amount: 12000, date: '2026-04-10', description: 'Common area lightning', societyId: 'soc_1' },
    { id: 'e2', category: 'Repairs', amount: 4500, date: '2026-04-12', description: 'Lift maintenance', societyId: 'soc_1' }
  ],
  addExpense: (e) => set((state) => ({ expenses: [e, ...state.expenses] })),

  complaints: [
    { id: 'c1', flatNo: '101', title: 'Water Leak', description: 'Pipe leaking in kitchen', status: 'OPEN', societyId: 'soc_1' }
  ],
  resolveComplaint: (id, picUrl) => set((state) => ({
    complaints: state.complaints.map(c => c.id === id ? { ...c, status: 'RESOLVED', resolutionPicUrl: picUrl } : c)
  })),

  notices: [],
  addNotice: (n) => set((state) => ({ notices: [n, ...state.notices] })),
  
  clubhouseBookings: [],
  addClubhouseBooking: (b) => set((state) => ({ clubhouseBookings: [b, ...state.clubhouseBookings] })),
  updateClubhouseBookingStatus: (id, status) => set((state) => ({
    clubhouseBookings: state.clubhouseBookings.map(b => b.id === id ? { ...b, status } : b)
  })),
  eventRequests: [],
  addEventRequest: (e) => set((state) => ({ eventRequests: [e, ...state.eventRequests] })),
  updateEventRequestStatus: (id, status) => set((state) => ({
    eventRequests: state.eventRequests.map(e => e.id === id ? { ...e, status } : e)
  })),

  emailTemplates: [
    { id: 't1', type: 'Welcome Email', subject: 'Welcome to YogiSentry!', body: 'Hello {name},\n\nYour account has been created successfully.\nLogin ID: {loginId}\nPassword: {password}\n\nRegards,\nYogiSentry Team' },
    { id: 't2', type: 'Payment Reminder', subject: 'Pending Maintenance Due', body: 'Dear Resident,\n\nThis is a reminder that your maintenance due of {amount} is pending.\n\nPlease pay at the earliest.\n\nThank you.' },
    { id: 't3', type: 'Password Reset', subject: 'Password Reset Request', body: 'Hello {name},\n\nYour new password is: {password}\n\nPlease change it after logging in.' }
  ],
  updateEmailTemplate: (id, updates) => set((state) => ({
    emailTemplates: state.emailTemplates.map(t => t.id === id ? { ...t, ...updates } : t)
  })),

  subscriptions: [
    { id: 'sub_1', name: 'Basic Tier', price: 0, durationMonths: 1, cities: ['Global'], features: ['Visitor Tracking', 'Basic Notices'] },
    { id: 'sub_2', name: 'Premium Tier', price: 5000, durationMonths: 1, cities: ['Global'], features: ['Visitor Tracking', 'Financial Hub', 'Communication', 'Payroll'] }
  ],
  addSubscription: (plan) => set((state) => ({ subscriptions: [...state.subscriptions, plan] })),
  updateSubscription: (id, updates) => set((state) => ({
    subscriptions: state.subscriptions.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  purchaseOrders: [],
  addPurchaseOrder: (po) => set((state) => ({ purchaseOrders: [po, ...state.purchaseOrders] })),

  payrolls: [],
  addPayrollRecord: (p) => set((state) => ({ payrolls: [p, ...state.payrolls] })),

  supportTickets: [],
  addSupportTicket: (t) => set((state) => ({ supportTickets: [t, ...state.supportTickets] })),

  activityLogs: [
    { id: 'l1', date: new Date().toISOString(), action: 'System Deployed', user: 'System', societyId: 'GLOBAL' }
  ],
  logActivity: (action, user, societyId) => set((state) => ({
    activityLogs: [{ id: Date.now().toString(), date: new Date().toISOString(), action, user, societyId }, ...state.activityLogs]
  })),
}));
