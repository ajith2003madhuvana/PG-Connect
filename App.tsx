import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  LifeBuoy, 
  LogOut, 
  Menu, 
  Bell, 
  Home, 
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  X,
  MapPin,
  Lock,
  User,
  Key,
  ChevronRight,
  Smartphone,
  Check
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { UserRole, Resident, Room, FeeRecord, SupportTicket, TicketStatus, PaymentStatus } from './types';
import { generateAdminInsight } from './services/geminiService';

// --- Configuration & Constants ---
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi"
];

// --- Mock Data Initialization ---
// In a real production build, these would be fetched from the Java Spring Boot backend.
const generateRooms = () => {
  const baseRooms = [
    { room_id: 101, room_number: "101", max_capacity: 4, current_occupancy: 2 },
    { room_id: 102, room_number: "102", max_capacity: 4, current_occupancy: 1 },
    { room_id: 103, room_number: "103", max_capacity: 4, current_occupancy: 3 },
    { room_id: 104, room_number: "104", max_capacity: 4, current_occupancy: 0 },
  ];
  
  const rooms = [...baseRooms];
  for (let i = 105; i <= 125; i++) {
    rooms.push({
      room_id: i,
      room_number: i.toString(),
      max_capacity: 4,
      current_occupancy: 0
    });
  }
  return rooms;
};

const MOCK_ROOMS: Room[] = generateRooms();

const MOCK_RESIDENTS: Resident[] = [
  { resident_id: 1, room_id: 101, name: "Aarav Patel", phone: "9876543210", email: "aarav.p@example.com", join_date: "2023-08-15", state: "Gujarat" },
  { resident_id: 2, room_id: 101, name: "Rohan Sharma", phone: "9876543211", email: "rohan.s@example.com", join_date: "2023-09-01", state: "Delhi" },
  { resident_id: 3, room_id: 102, name: "Arjun Reddy", phone: "9876543212", email: "arjun.r@example.com", join_date: "2023-10-10", state: "Telangana" },
  { resident_id: 4, room_id: 103, name: "Vikram Singh", phone: "9876543213", email: "vikram.s@example.com", join_date: "2023-11-01", state: "Punjab" },
  { resident_id: 5, room_id: 103, name: "Aditya Kumar", phone: "9876543214", email: "aditya.k@example.com", join_date: "2023-11-05", state: "Bihar" },
  { resident_id: 6, room_id: 103, name: "Karthik Nair", phone: "9876543215", email: "karthik.n@example.com", join_date: "2023-11-12", state: "Kerala" },
];

const MOCK_FEES: FeeRecord[] = [
  { fee_id: 1, resident_id: 1, amount: 5000, due_date: "2023-10-01", payment_date: "2023-10-02", status: PaymentStatus.PAID },
  { fee_id: 2, resident_id: 2, amount: 5000, due_date: "2023-10-01", status: PaymentStatus.PENDING },
  { fee_id: 3, resident_id: 3, amount: 6000, due_date: "2023-09-01", status: PaymentStatus.OVERDUE },
  { fee_id: 4, resident_id: 1, amount: 5000, due_date: "2023-09-01", payment_date: "2023-09-01", status: PaymentStatus.PAID },
  { fee_id: 5, resident_id: 4, amount: 5500, due_date: "2023-10-15", status: PaymentStatus.PAID },
];

const MOCK_TICKETS: SupportTicket[] = [
  { ticket_id: 1, resident_id: 1, category: "Plumbing", description: "Leaky faucet in bathroom", status: TicketStatus.OPEN, created_at: "2023-10-25" },
  { ticket_id: 2, resident_id: 2, category: "Wifi", description: "Internet is slow", status: TicketStatus.RESOLVED, created_at: "2023-10-20" },
  { ticket_id: 3, resident_id: 1, category: "Electrical", description: "Light flickering", status: TicketStatus.RESOLVED, created_at: "2023-09-15" },
];

interface ChatMessage {
  id: number;
  roomId: number;
  sender: 'ADMIN' | 'RESIDENT';
  text: string;
  timestamp: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, roomId: 101, sender: 'RESIDENT', text: "Hi, is the main gate locked at 10pm?", timestamp: "10:30 AM" },
  { id: 2, roomId: 101, sender: 'ADMIN', text: "Yes, please use your key card after 10pm.", timestamp: "10:32 AM" },
  { id: 3, roomId: 102, sender: 'RESIDENT', text: "My wifi is down again.", timestamp: "09:15 AM" },
];

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

/**
 * Custom Hook: useStickyState
 * Provides persistence for state variables using localStorage.
 * This mimics database persistence in a frontend-only environment.
 */
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  React.useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

// --- Sub-Components ---

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {trend && <p className="text-xs text-green-600 mt-2 font-medium">{trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
  </div>
);

interface RoomStatusCardProps {
  room: Room;
  status: string;
  color: string;
  occupancy: number;
  onClick: () => void;
}

const RoomStatusCard: React.FC<RoomStatusCardProps> = ({ room, status, color, occupancy, onClick }) => (
  <div onClick={onClick} className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${color}`}>
    <div className="flex justify-between items-start mb-2">
      <span className="font-bold text-slate-700">RM-{room.room_number}</span>
      {status === 'ATTENTION' && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
      {status === 'GOOD' && <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>}
    </div>
    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
      <Users className="w-3 h-3" />
      <span>{occupancy}/{room.max_capacity} Residents</span>
    </div>
    <div className={`text-xs font-semibold px-2 py-1 rounded inline-block ${
      status === 'ATTENTION' ? 'bg-red-100 text-red-700' : 
      status === 'GOOD' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
    }`}>
      {status === 'ATTENTION' ? 'Fees Pending' : status === 'GOOD' ? 'All Clear' : 'Vacant'}
    </div>
  </div>
);

// --- Main Application Component ---
const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.ADMIN);
  const [loggedInResidentId, setLoggedInResidentId] = useState<number | null>(null);

  // App State
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [insight, setInsight] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [selectedChatRoom, setSelectedChatRoom] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Data State with Persistence (Simulating Database)
  const [tickets, setTickets] = useStickyState<SupportTicket[]>(MOCK_TICKETS, 'pg_connect_tickets');
  const [residents, setResidents] = useStickyState<Resident[]>(MOCK_RESIDENTS, 'pg_connect_residents');
  const [messages, setMessages] = useStickyState<ChatMessage[]>(MOCK_MESSAGES, 'pg_connect_messages');
  const [fees, setFees] = useStickyState<FeeRecord[]>(MOCK_FEES, 'pg_connect_fees');
  const [newMessage, setNewMessage] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate AI Insight on load if admin
    if (isAuthenticated && currentRole === UserRole.ADMIN && activeView === 'dashboard') {
      const dataContext = `
        Occupancy: 75%. 
        Pending Fees: ₹11000. 
        Open Tickets: 1 (Plumbing).
        Most common issue: Wifi.
      `;
      generateAdminInsight(dataContext).then(setInsight);
    }
  }, [isAuthenticated, currentRole, activeView]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChatRoom, activeView]);

  // Login Logic
  const handleLogin = (role: UserRole, id: string, pass: string) => {
    if (role === UserRole.ADMIN) {
      if (id.trim().toLowerCase() === 'admin' && pass === 'admin123') {
        setIsAuthenticated(true);
        setCurrentRole(UserRole.ADMIN);
        setActiveView('dashboard');
      } else {
        alert("Invalid Admin Credentials. Please try 'admin' and 'admin123'.");
      }
    } else {
      // Direct Login for Residents (Simulated Auth)
      const resident = residents.find(r => r.phone === id);
      if (resident) { 
        setIsAuthenticated(true);
        setCurrentRole(UserRole.RESIDENT);
        setLoggedInResidentId(resident.resident_id);
        setActiveView('home');
      } else {
        alert("Phone number not found in directory. Please contact Admin.");
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedInResidentId(null);
    setCurrentRole(UserRole.ADMIN);
    setIsNotificationsOpen(false);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const newTicket: SupportTicket = {
      ticket_id: tickets.length + 1,
      resident_id: loggedInResidentId || 1, // Use logged in ID
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      status: TicketStatus.OPEN,
      created_at: new Date().toISOString().split('T')[0]
    };
    setTickets([...tickets, newTicket]);
    form.reset();
    alert("Ticket Created Successfully");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    let roomId = 0;
    if (currentRole === UserRole.RESIDENT) {
      const resident = residents.find(r => r.resident_id === loggedInResidentId);
      roomId = resident ? resident.room_id : 101;
    } else {
      roomId = selectedChatRoom || 0;
    }
    
    if (!roomId) return;

    const msg: ChatMessage = {
      id: messages.length + 1,
      roomId,
      sender: currentRole === UserRole.ADMIN ? 'ADMIN' : 'RESIDENT',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const roomId = parseInt(formData.get('room_id') as string);
    const newResident: Resident = {
      resident_id: residents.length + 1 + Math.floor(Math.random() * 1000),
      room_id: roomId,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      join_date: formData.get('join_date') as string || new Date().toISOString().split('T')[0],
      state: formData.get('state') as string,
    };

    setResidents([...residents, newResident]);
    
    // Add initial fee record for the new resident
    const newFee: FeeRecord = {
      fee_id: fees.length + 1,
      resident_id: newResident.resident_id,
      amount: 5000, // Default amount
      due_date: new Date().toISOString().split('T')[0],
      status: PaymentStatus.PENDING
    };
    setFees([...fees, newFee]);

    setIsAddModalOpen(false);
    form.reset();
    alert("Resident Added Successfully");
  };

  const handleUpdateFeeStatus = (feeId: number, newStatus: PaymentStatus) => {
    const updatedFees = fees.map(fee => 
      fee.fee_id === feeId ? { 
        ...fee, 
        status: newStatus,
        payment_date: newStatus === PaymentStatus.PAID ? new Date().toISOString().split('T')[0] : undefined 
      } : fee
    );
    setFees(updatedFees);
  };

  const handleResidentClick = (id: number) => {
    setSelectedResidentId(id);
    setActiveView('resident-detail');
  };

  const getOccupancy = (roomId: number) => residents.filter(r => r.room_id === roomId).length;

  const getRoomResidentStates = (roomId: number) => {
    const roomResidents = residents.filter(r => r.room_id === roomId);
    if (roomResidents.length === 0) return "Empty";
    const states = roomResidents.map(r => r.state);
    const uniqueStates = [...new Set(states)];
    return uniqueStates.join(", ");
  };

  const getRoomStatus = (room: Room) => {
    const occupants = residents.filter(r => r.room_id === room.room_id);
    if (occupants.length === 0) return { status: 'VACANT', color: 'bg-slate-50 border-slate-200' };
    
    const hasPendingFees = occupants.some(r => {
      const residentFees = fees.filter(f => f.resident_id === r.resident_id);
      return residentFees.some(f => f.status === PaymentStatus.PENDING || f.status === PaymentStatus.OVERDUE);
    });
  
    return hasPendingFees 
      ? { status: 'ATTENTION', color: 'bg-red-50 border-red-200' }
      : { status: 'GOOD', color: 'bg-emerald-50 border-emerald-200' };
  };

  // --- Notifications Logic ---
  const getNotifications = () => {
    if (currentRole === UserRole.ADMIN) {
      return tickets.filter(t => t.status === TicketStatus.OPEN);
    } else {
      return tickets.filter(t => t.resident_id === loggedInResidentId && t.status === TicketStatus.OPEN);
    }
  };

  const notifications = getNotifications();

  // --- Login View ---
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  // --- Main Render Logic ---
  const renderContent = () => {
    if (currentRole === UserRole.ADMIN) {
      switch (activeView) {
        case 'dashboard':
          const residentsWithFeeStatus = residents.map(r => {
             const residentFees = fees.filter(f => f.resident_id === r.resident_id);
             const pendingFees = residentFees.filter(f => f.status === PaymentStatus.PENDING || f.status === PaymentStatus.OVERDUE);
             const totalPendingAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);
             const isPending = pendingFees.length > 0;
             const roomNum = MOCK_ROOMS.find(rm => rm.room_id === r.room_id)?.room_number;
             const pendingFeeIds = pendingFees.map(f => f.fee_id);
             return { ...r, isPending, totalPendingAmount, roomNum, pendingFeeIds };
          });
          
          const pendingList = residentsWithFeeStatus.filter(r => r.isPending);
          const clearList = residentsWithFeeStatus.filter(r => !r.isPending);

          return (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
                  <p className="text-slate-500">Overview of hostel performance</p>
                </div>
                {insight && (
                  <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 max-w-lg shadow-sm">
                     <span className="mt-0.5">✨</span>
                     <p>{insight}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Residents" value={residents.length} icon={Users} color="bg-blue-500" trend="+12% from last month" />
                <StatCard title="Total Revenue" value={`₹${fees.filter(f => f.status === PaymentStatus.PAID).reduce((a,b) => a + b.amount, 0).toLocaleString()}`} icon={CreditCard} color="bg-green-500" trend="+5% from last month" />
                <StatCard title="Open Tickets" value={tickets.filter(t => t.status === TicketStatus.OPEN).length} icon={LifeBuoy} color="bg-orange-500" />
                <StatCard title="Occupancy Rate" value={`${Math.round((residents.length / (MOCK_ROOMS.length * 4)) * 100)}%`} icon={Home} color="bg-indigo-500" />
              </div>

              {/* Room Grid */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Room Status Grid</h3>
                  <div className="flex gap-4 text-xs text-slate-500">
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> All Paid</div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Fees Pending</div>
                     <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300"></div> Vacant</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                   {MOCK_ROOMS.map(room => {
                     const { status, color } = getRoomStatus(room);
                     const currentOccupancy = getOccupancy(room.room_id);
                     return (
                       <RoomStatusCard 
                        key={room.room_id} 
                        room={room} 
                        status={status} 
                        color={color}
                        occupancy={currentOccupancy}
                        onClick={() => {
                          const occupants = residents.filter(r => r.room_id === room.room_id);
                          if(occupants.length > 0) handleResidentClick(occupants[0].resident_id);
                        }}
                       />
                     );
                   })}
                </div>
              </div>

              {/* Fee Status Grouping */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Pending Dues ({pendingList.length})
                  </h3>
                  <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                     {pendingList.map(r => (
                       <div 
                        key={r.resident_id} 
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100 transition-colors"
                      >
                          <div onClick={() => handleResidentClick(r.resident_id)} className="cursor-pointer">
                             <p className="font-semibold text-slate-800">{r.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-red-200 text-slate-600 font-medium">Room {r.roomNum}</span>
                               <span className="text-xs text-slate-500">{r.phone}</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <div className="text-right">
                                <p className="font-bold text-red-600">₹{r.totalPendingAmount}</p>
                                <span className="text-[10px] uppercase font-bold text-red-400">Overdue</span>
                             </div>
                             <button 
                               title="Mark all as Paid"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 if(confirm(`Mark all fees for ${r.name} as PAID?`)) {
                                   r.pendingFeeIds.forEach(id => handleUpdateFeeStatus(id, PaymentStatus.PAID));
                                 }
                               }}
                               className="p-2 bg-white border border-red-200 rounded-full text-red-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors"
                             >
                                <Check className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                     ))}
                     {pendingList.length === 0 && (
                        <div className="text-center py-8 text-slate-400 italic">
                          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-500" />
                          No pending dues. Excellent!
                        </div>
                     )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> All Clear ({clearList.length})
                  </h3>
                  <div className="flex-1 space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                     {clearList.map(r => (
                       <div 
                        key={r.resident_id} 
                        onClick={() => handleResidentClick(r.resident_id)} 
                        className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors"
                      >
                          <div>
                             <p className="font-semibold text-slate-800">{r.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-slate-600 font-medium">Room {r.roomNum}</span>
                               <span className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> {r.state}</span>
                             </div>
                          </div>
                           <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold border border-emerald-200">PAID</span>
                       </div>
                     ))}
                     {clearList.length === 0 && <p className="text-slate-400 text-sm italic">No residents found.</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Revenue Overview</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Jan', amount: 400000 }, { name: 'Feb', amount: 300000 },
                        { name: 'Mar', amount: 200000 }, { name: 'Apr', amount: 278000 },
                        { name: 'May', amount: 189000 }, { name: 'Jun', amount: 239000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Occupancy Distribution</h3>
                  <div className="h-64">
                     <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Occupied', value: residents.length },
                            { name: 'Vacant', value: (MOCK_ROOMS.length * 4) - residents.length },
                          ]}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {['Occupied', 'Vacant'].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-indigo-600"></div>Occupied</div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Vacant</div>
                  </div>
                </div>
              </div>
            </div>
          );
        case 'residents':
          return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800">Resident Directory</h2>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4" /> Add Resident
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                  <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Room</th>
                      <th className="px-6 py-3">Native State</th>
                      <th className="px-6 py-3">Contact</th>
                      <th className="px-6 py-3">Join Date</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {residents.map((r) => (
                      <tr 
                        key={r.resident_id} 
                        onClick={() => handleResidentClick(r.resident_id)}
                        className="bg-white border-b hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-slate-900">{r.name}</td>
                        <td className="px-6 py-4">#{MOCK_ROOMS.find(room => room.room_id === r.room_id)?.room_number}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">
                             <MapPin className="w-3 h-3" /> {r.state}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span>{r.email}</span>
                            <span className="text-xs text-slate-400">{r.phone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{r.join_date}</td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Add Resident Modal */}
              {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                      <h3 className="font-bold text-slate-800">Add New Resident</h3>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <form onSubmit={handleAddResident} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                          <input type="text" name="name" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Aarav Patel" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Native State</label>
                            <select name="state" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                              <option value="">-- Select State --</option>
                              {INDIAN_STATES.map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </select>
                         </div>
                         <div className="col-span-1">
                           <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                           <input type="date" name="join_date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Room (Grouped by Roommates)</label>
                        <select name="room_id" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                          <option value="">-- Choose a Room --</option>
                          {MOCK_ROOMS.filter(r => getOccupancy(r.room_id) < r.max_capacity).map(room => {
                            const occupancy = getOccupancy(room.room_id);
                            const roommateStates = getRoomResidentStates(room.room_id);
                            return (
                              <option key={room.room_id} value={room.room_id}>
                                Room {room.room_number} ({occupancy}/{room.max_capacity}) - State Mix: {roommateStates}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">💡 Pro Tip: Select a room with roommates from your state if preferred.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Phone (+91)</label>
                          <input type="tel" name="phone" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="9876543210" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                           <input type="email" name="email" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="resident@example.com" />
                        </div>
                      </div>

                      <div className="pt-4 flex gap-3 justify-end">
                        <button 
                          type="button" 
                          onClick={() => setIsAddModalOpen(false)}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          Save Resident
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          );
        case 'resident-detail':
          const resident = residents.find(r => r.resident_id === selectedResidentId);
          if (!resident) return <div>Resident not found</div>;
          
          const residentFees = fees.filter(f => f.resident_id === resident.resident_id);
          const residentTickets = tickets.filter(t => t.resident_id === resident.resident_id);
          const roomNumber = MOCK_ROOMS.find(r => r.room_id === resident.room_id)?.room_number;

          return (
            <div className="space-y-6">
              <button 
                onClick={() => setActiveView('residents')}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Directory
              </button>

              {/* Profile Header */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                      {resident.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">{resident.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-semibold border border-slate-200">
                          Room {roomNumber}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold border border-indigo-100 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {resident.state}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </button>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                       <Phone className="w-4 h-4" /> Call
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Email Address</p>
                      <p className="text-slate-800 text-sm">{resident.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Phone Number</p>
                      <p className="text-slate-800 text-sm">{resident.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Join Date</p>
                      <p className="text-slate-800 text-sm">{resident.join_date}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fee History */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" /> Fee History
                      </h3>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                          <tr>
                            <th className="px-5 py-3">Due Date</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {residentFees.length > 0 ? residentFees.map(fee => (
                            <tr key={fee.fee_id} className="border-b last:border-0 hover:bg-slate-50">
                              <td className="px-5 py-3">{fee.due_date}</td>
                              <td className="px-5 py-3 font-medium text-slate-900">₹{fee.amount}</td>
                              <td className="px-5 py-3">
                                {currentRole === UserRole.ADMIN ? (
                                   <select 
                                     value={fee.status}
                                     onChange={(e) => handleUpdateFeeStatus(fee.fee_id, e.target.value as PaymentStatus)}
                                     className={`px-2 py-1 rounded text-xs font-bold border outline-none cursor-pointer ${
                                       fee.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200' : 
                                       fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-red-100 text-red-700 border-red-200'
                                     }`}
                                   >
                                      <option value={PaymentStatus.PAID}>PAID</option>
                                      <option value={PaymentStatus.PENDING}>PENDING</option>
                                      <option value={PaymentStatus.OVERDUE}>OVERDUE</option>
                                   </select>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    fee.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                    fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                  }`}>
                                    {fee.status}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={3} className="px-5 py-8 text-center text-slate-400">No fee records found.</td>
                            </tr>
                          )}
                        </tbody>
                     </table>
                   </div>
                </div>

                {/* Support Tickets */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                   <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <LifeBuoy className="w-5 h-5 text-orange-500" /> Support Tickets
                      </h3>
                   </div>
                   <div className="p-0">
                      {residentTickets.length > 0 ? (
                        <div className="divide-y divide-slate-100">
                          {residentTickets.map(ticket => (
                            <div key={ticket.ticket_id} className="p-5 hover:bg-slate-50 transition-colors">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-slate-800 text-sm">{ticket.category}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                }`}>{ticket.status}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock className="w-3 h-3" />
                                {ticket.created_at}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No support tickets found.
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </div>
          );
        case 'messages':
          // Get list of rooms that have messages
          const roomsWithMessages = Array.from(new Set(messages.map(m => m.roomId)));
          
          return (
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex overflow-hidden">
                {/* Chat Sidebar */}
                <div className="w-1/3 border-r border-slate-200 bg-slate-50">
                   <div className="p-4 border-b border-slate-200">
                      <h3 className="font-bold text-slate-700">Conversations</h3>
                   </div>
                   <div className="overflow-y-auto h-full">
                      {MOCK_ROOMS.filter(r => getOccupancy(r.room_id) > 0).slice(0, 10).map(room => (
                         <div 
                           key={room.room_id}
                           onClick={() => setSelectedChatRoom(room.room_id)}
                           className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors ${selectedChatRoom === room.room_id ? 'bg-indigo-50' : ''}`}
                         >
                            <div className="flex justify-between items-start">
                               <span className="font-semibold text-slate-800">Room {room.room_number}</span>
                               <span className="text-[10px] text-slate-400">10:30 AM</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mt-1">
                               {[...messages].reverse().find(m => m.roomId === room.room_id)?.text || "No messages yet"}
                            </p>
                         </div>
                      ))}
                   </div>
                </div>
                
                {/* Chat Window */}
                <div className="w-2/3 flex flex-col bg-slate-50">
                   {selectedChatRoom ? (
                      <>
                        <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center">
                           <h3 className="font-bold text-slate-800">Room {MOCK_ROOMS.find(r => r.room_id === selectedChatRoom)?.room_number}</h3>
                           <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                           </span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                           {messages.filter(m => m.roomId === selectedChatRoom).map(msg => (
                              <div key={msg.id} className={`flex ${msg.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                                    msg.sender === 'ADMIN' 
                                       ? 'bg-indigo-600 text-white rounded-br-none' 
                                       : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                                 }`}>
                                    <p>{msg.text}</p>
                                    <p className={`text-[10px] mt-1 text-right ${msg.sender === 'ADMIN' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                       {msg.timestamp}
                                    </p>
                                 </div>
                              </div>
                           ))}
                           <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
                           <div className="flex gap-2">
                              <input 
                                 type="text" 
                                 value={newMessage}
                                 onChange={(e) => setNewMessage(e.target.value)}
                                 placeholder="Type a message..."
                                 className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
                                 <Send className="w-5 h-5" />
                              </button>
                           </div>
                        </form>
                      </>
                   ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                         <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                         <p>Select a room to start chatting</p>
                      </div>
                   )}
                </div>
             </div>
          );
        default:
          return <div>Select a view</div>;
      }
    } else {
      // RESIDENT VIEW
      const loggedInResident = residents.find(r => r.resident_id === loggedInResidentId);
      const residentRoomId = loggedInResident?.room_id || 101;
      const residentName = loggedInResident?.name || "Resident";
      const roomNum = MOCK_ROOMS.find(r => r.room_id === residentRoomId)?.room_number;

      switch (activeView) {
         case 'messages':
            return (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-[calc(100vh-140px)] flex flex-col">
                  <div className="p-4 border-b border-slate-200 bg-white shadow-sm flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                           <Users className="w-5 h-5" />
                        </div>
                        <div>
                           <h3 className="font-bold text-slate-800">Admin Support</h3>
                           <p className="text-xs text-slate-500">Usually replies within 1 hour</p>
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                     {messages.filter(m => m.roomId === residentRoomId).map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'RESIDENT' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                              msg.sender === 'RESIDENT' 
                                 ? 'bg-indigo-600 text-white rounded-br-none' 
                                 : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                           }`}>
                              <p>{msg.text}</p>
                              <p className={`text-[10px] mt-1 text-right ${msg.sender === 'RESIDENT' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                 {msg.timestamp}
                              </p>
                           </div>
                        </div>
                     ))}
                     <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
                     <div className="flex gap-2">
                        <input 
                           type="text" 
                           value={newMessage}
                           onChange={(e) => setNewMessage(e.target.value)}
                           placeholder="Type a message to admin..."
                           className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors">
                           <Send className="w-5 h-5" />
                        </button>
                     </div>
                  </form>
              </div>
            );
         default:
            return (
               <div className="space-y-6">
                 <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                   <h1 className="text-3xl font-bold mb-2">Hello, {residentName.split(' ')[0]}!</h1>
                   <p className="opacity-90">Room #{roomNum} • Rent Due: 1st of every month</p>
                 </div>
       
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Create Ticket */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <LifeBuoy className="w-5 h-5 text-indigo-600" /> Report an Issue
                     </h3>
                     <form onSubmit={handleCreateTicket} className="space-y-4">
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                         <select name="category" className="w-full bg-slate-50 rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none">
                           <option>Plumbing</option>
                           <option>Electrical</option>
                           <option>Internet</option>
                           <option>Cleaning</option>
                           <option>Other</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                         <textarea name="description" rows={3} className="w-full bg-slate-50 rounded-lg border-slate-200 border p-2 text-sm text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Describe the issue..."></textarea>
                       </div>
                       <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">Submit Ticket</button>
                     </form>
                   </div>
       
                   {/* Fee History */}
                   <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <CreditCard className="w-5 h-5 text-indigo-600" /> Payment History
                     </h3>
                     <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                       {fees.filter(f => f.resident_id === loggedInResidentId).length > 0 ? (
                         fees.filter(f => f.resident_id === loggedInResidentId).map(fee => (
                           <div key={fee.fee_id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                             <div>
                               <p className="font-medium text-slate-900">₹{fee.amount}</p>
                               <p className="text-xs text-slate-500">Due: {fee.due_date}</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <span className={`px-2 py-1 rounded text-xs font-bold ${
                                 fee.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                                 fee.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                               }`}>
                                 {fee.status}
                               </span>
                               {(fee.status === 'PENDING' || fee.status === 'OVERDUE') && (
                                  <button
                                    onClick={() => {
                                      if(confirm("Simulate Payment via UPI/Card?")) {
                                        handleUpdateFeeStatus(fee.fee_id, PaymentStatus.PAID);
                                        alert("Payment Successful!");
                                      }
                                    }}
                                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors"
                                  >
                                    Pay Now
                                  </button>
                               )}
                             </div>
                           </div>
                         ))
                       ) : (
                          <p className="text-sm text-slate-400 text-center py-4">No payment history.</p>
                       )}
                     </div>
                   </div>
                 </div>
                 
                  {/* Ticket History */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="text-lg font-bold text-slate-800 mb-4">My Tickets</h3>
                     <div className="space-y-4">
                        {tickets.filter(t => t.resident_id === loggedInResidentId).length > 0 ? (
                          tickets.filter(t => t.resident_id === loggedInResidentId).map(ticket => (
                             <div key={ticket.ticket_id} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                 <div className="flex justify-between items-start mb-1">
                                     <span className="font-semibold text-slate-700">{ticket.category}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                         ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                      }`}>{ticket.status}</span>
                                 </div>
                                 <p className="text-sm text-slate-600">{ticket.description}</p>
                                 <p className="text-xs text-slate-400 mt-2">{ticket.created_at}</p>
                             </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-400 text-center py-4">No tickets raised yet.</p>
                        )}
                     </div>
                  </div>
               </div>
             );
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-6 h-6 text-indigo-500" /> PG-Connect
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {currentRole === UserRole.ADMIN ? (
            <>
              <button onClick={() => setActiveView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                <LayoutDashboard className="w-5 h-5" /> Dashboard
              </button>
              <button onClick={() => setActiveView('residents')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'residents' || activeView === 'resident-detail' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                <Users className="w-5 h-5" /> Residents
              </button>
              <button onClick={() => setActiveView('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'messages' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                <MessageSquare className="w-5 h-5" /> Messages
              </button>
            </>
          ) : (
             <>
               <button onClick={() => setActiveView('home')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'home' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                 <Home className="w-5 h-5" /> My Home
               </button>
               <button onClick={() => setActiveView('messages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'messages' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                 <MessageSquare className="w-5 h-5" /> Chat with Admin
               </button>
             </>
          )}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
           <div className="mb-4 px-4">
              <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                      {currentRole === UserRole.ADMIN ? 'A' : 'R'}
                  </div>
                  <div>
                      <p className="text-sm font-semibold text-white">{currentRole === UserRole.ADMIN ? 'Administrator' : 'Resident'}</p>
                      <p className="text-xs text-slate-500">Logged In</p>
                  </div>
              </div>
           </div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-white transition-colors w-full">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 relative z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-slate-500">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5">
               <Search className="w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm text-slate-600 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full outline-none focus:bg-slate-100"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                {/* Notification Dropdown */}
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                     <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{notifications.length} Open</span>
                     </div>
                     <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                           notifications.map(ticket => {
                              const resident = residents.find(r => r.resident_id === ticket.resident_id);
                              const room = MOCK_ROOMS.find(rm => rm.room_id === resident?.room_id);
                              return (
                                <div key={ticket.ticket_id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                  <div className="flex justify-between items-start mb-1">
                                      <span className="font-medium text-slate-700 text-sm">{ticket.category} Ticket</span>
                                      <span className="text-[10px] text-slate-400">{ticket.created_at}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-2 mb-2">{ticket.description}</p>
                                  {currentRole === UserRole.ADMIN && resident && (
                                     <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-100">
                                          {resident.name}
                                        </span>
                                        <span className="text-[10px] text-slate-400">Room {room?.room_number}</span>
                                     </div>
                                  )}
                                </div>
                              );
                           })
                        ) : (
                           <div className="p-8 text-center text-slate-400">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                              <p className="text-sm">No new notifications</p>
                              <p className="text-xs mt-1 opacity-70">You're all caught up!</p>
                           </div>
                        )}
                     </div>
                  </div>
                )}
             </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6" onClick={() => setIsNotificationsOpen(false)}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// --- Login View Component ---
interface LoginViewProps {
  onLogin: (role: UserRole, id: string, pass: string) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'resident'>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'admin') {
      onLogin(UserRole.ADMIN, identifier, password);
    } else {
      // Direct login simulation by checking phone number
      const resident = MOCK_RESIDENTS.find(r => r.phone === phoneNumber);
      if (resident) {
         onLogin(UserRole.RESIDENT, phoneNumber, '');
      } else {
         alert("Phone number not found in our records. Please try one of the demo numbers below.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 shadow-lg">
             <Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">PG-Connect</h1>
          <p className="text-slate-400 text-sm">Secure Accommodation Management</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => { setActiveTab('admin'); setIdentifier(''); setPassword(''); }}
            className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'admin' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            Admin Portal
          </button>
          <button 
            onClick={() => { setActiveTab('resident'); setPhoneNumber(''); }}
             className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'resident' ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-transparent text-slate-500 hover:bg-slate-50'
            }`}
          >
            Resident Portal
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
           {activeTab === 'admin' ? (
             <>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                     </div>
                     <input 
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter username"
                     />
                  </div>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Key className="h-5 w-5 text-slate-400" />
                     </div>
                     <input 
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter password"
                     />
                  </div>
               </div>

               <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700 flex items-start gap-2">
                 <Lock className="w-3 h-3 mt-0.5" />
                 <div>
                   <span className="font-bold">Demo Credentials:</span>
                   <div className="mt-1">
                     User: <code className="bg-blue-100 px-1 rounded">admin</code> &nbsp;
                     Pass: <code className="bg-blue-100 px-1 rounded">admin123</code>
                   </div>
                 </div>
               </div>
             </>
           ) : (
             <>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Registered Phone Number</label>
                   <p className="text-xs text-slate-500 mb-2">Direct login without password for easy access.</p>
                   <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Smartphone className="h-5 w-5 text-slate-400" />
                     </div>
                     <input 
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 9876543210"
                     />
                  </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                   <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Quick Login (Click to fill)</p>
                   <div className="flex flex-wrap gap-2">
                      {MOCK_RESIDENTS.slice(0, 3).map(r => (
                        <button
                          key={r.resident_id}
                          type="button"
                          onClick={() => onLogin(UserRole.RESIDENT, r.phone, '')}
                          className="px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-sm"
                        >
                           {r.name}
                        </button>
                      ))}
                   </div>
                </div>
             </>
           )}

           <button 
             type="submit" 
             className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
           >
             {activeTab === 'admin' ? <Lock className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
             {activeTab === 'admin' ? 'Secure Login' : 'Direct Login'}
           </button>
        </form>
      </div>
    </div>
  );
};

export default App;