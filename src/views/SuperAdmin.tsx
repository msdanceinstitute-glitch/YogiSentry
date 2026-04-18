import { useStore, Society, User, Role } from '@/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, TrendingUp, Users, Plus, Pencil, XCircle, CheckCircle2, Wallet, CreditCard, Activity, ArrowUpRight, Mail, ArrowDownToLine, Image as ImageIcon, Smartphone, Trash2, Search, Filter, ShieldCheck, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';

const exportCSV = (data: any[], filename: string) => {
  if (!data?.length) return;
  const headers = Object.keys(data[0] || {}).join(',');
  const rows = data.map(obj => Object.values(obj).map(v => `"${v}"`).join(','));
  const csvStr = [headers, ...rows].join('\n');
  const blob = new Blob([csvStr], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};

export default function SuperAdmin() {
  const { 
    societies, users, emailTemplates, updateEmailTemplate, 
    addSociety, updateSociety, deleteSociety, addUser, updateUser, 
    registrationCharge, activityLogs, subscriptions, addSubscription, 
    updateSubscription, payrolls, addPayrollRecord, purchaseOrders, addPurchaseOrder 
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const totalRevenue = useMemo(() => societies.reduce((acc, soc) => acc + (soc.totalRevenue || 0), 0), [societies]);
  const currentTab = location.pathname.split('/').pop() || 'super-admin';
  
  // States and Handlers...
  const [searchQuery, setSearchQuery] = useState('');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState<Role | ''>('');
  
  // Registration Form Wizard State
  const [wizardStep, setWizardStep] = useState(0); 
  const [newSocName, setNewSocName] = useState('');
  const [newSocAddress, setNewSocAddress] = useState('');
  const [newSocCity, setNewSocCity] = useState('');
  const [newSocState, setNewSocState] = useState('');
  const [newSocZip, setNewSocZip] = useState('');
  const [newSocRegNo, setNewSocRegNo] = useState('');
  const [newSocEmail, setNewSocEmail] = useState('');
  const [newSocPhone, setNewSocPhone] = useState('');
  const [sendCredentialsToSoc, setSendCredentialsToSoc] = useState(true);
  const [isMultipleTowers, setIsMultipleTowers] = useState(false);
  const [newSocTowers, setNewSocTowers] = useState<number>(2);
  const [newSocFloors, setNewSocFloors] = useState<number>(1);
  const [newSocFlats, setNewSocFlats] = useState<number>(0);
  
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState('');
  
  // Subscription Tab States
  const [planName, setPlanName] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planDuration, setPlanDuration] = useState('1');
  const [planCities, setPlanCities] = useState('');
  const [planFeatures, setPlanFeatures] = useState('');

  // PO States
  const [selectedSocId, setSelectedSocId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [poAmount, setPoAmount] = useState('');
  const [poPeriod, setPoPeriod] = useState('12'); // Months

  // Payroll Tab States - reuse tempPassword or define new? 
  // Let's define specific ones if needed, but the original used tempPassword.
  
  // Super Admin Tab States
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('');
  const [newAdminGender, setNewAdminGender] = useState('');

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-6).toUpperCase();
  };

  const generateRandomResidentId = (socName: string, flatNo: string) => {
    const prefix = socName.substring(0, 3).toUpperCase();
    return `${prefix}-${flatNo}`;
  };

  const handleRegisterSociety = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocName || !newSocAddress || newSocFlats <= 0) return;

    const { registerSocietyFull, registrationCharge } = useStore.getState();
    const socId = `soc_${Date.now()}`;
    const finalTowers = isMultipleTowers ? Math.max(newSocTowers, 2) : 1;
    
    // 1. Create Society Object
    const newSoc: Society = {
      id: socId,
      name: newSocName,
      address: newSocAddress,
      city: newSocCity,
      state: newSocState,
      zipCode: newSocZip,
      registrationNumber: newSocRegNo,
      contactEmail: newSocEmail,
      contactPhone: newSocPhone,
      totalTowers: finalTowers,
      totalFloors: newSocFloors,
      totalFlats: newSocFlats,
      totalRevenue: registrationCharge,
      subscriptionActive: true,
    };

    // 2. Prepare Staff
    const staff: User[] = [
      {
        id: `u_${Date.now()}_sec`,
        loginId: `${newSocName.substring(0, 3).toUpperCase()}-ADMIN-${Math.floor(Math.random() * 10000)}`,
        password: generateRandomPassword(),
        name: `${newSocName} Secretary`,
        role: 'SECRETARY',
        societyId: socId
      },
      {
        id: `u_${Date.now()}_guard`,
        loginId: `${newSocName.substring(0, 3).toUpperCase()}-GUARD-${Math.floor(Math.random() * 1000)}`,
        password: '123',
        name: `${newSocName} Main Guard`,
        role: 'GUARD',
        societyId: socId
      },
      {
        id: `u_${Date.now()}_hk`,
        loginId: `${newSocName.substring(0, 3).toUpperCase()}-HK-${Math.floor(Math.random() * 1000)}`,
        password: '123',
        name: `${newSocName} Head Housekeeping`,
        role: 'HOUSEKEEPING',
        societyId: socId
      }
    ];

    // 3. Prepare Residents
    const towerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const activeTowers = finalTowers;
    const activeFloors = Math.max(newSocFloors, 1);
    const totalFloorsOverall = activeTowers * activeFloors;
    const flatsPerFloor = Math.ceil(newSocFlats / totalFloorsOverall);
    
    const residents: User[] = [];
    let userIndex = 1;
    const MAX_AUTO_RESIDENTS = 50; 
    let credentialSummary = `\nAdmin Login: ${staff[0].loginId} / ${staff[0].password}\nGuard Login: ${staff[1].loginId} / 123`;
    
    for (let t = 0; t < activeTowers && residents.length < MAX_AUTO_RESIDENTS; t++) {
      const towerStr = activeTowers > 1 ? towerLabels[t % 26] : '';
      for (let f = 1; f <= activeFloors && residents.length < MAX_AUTO_RESIDENTS; f++) {
        for (let i = 1; i <= flatsPerFloor && userIndex <= newSocFlats && residents.length < MAX_AUTO_RESIDENTS; i++) {
          const flatNum = (f * 100) + i; 
          const flatNo = towerStr ? `${towerStr}-${flatNum}` : `${flatNum}`;
          const residentId = generateRandomResidentId(newSocName, flatNo);
          const password = generateRandomPassword();
          residents.push({
            id: `u_${Date.now()}_res_${userIndex}`,
            loginId: residentId,
            password: password,
            name: `Resident ${flatNo}`,
            role: 'RESIDENT',
            societyId: socId,
            flatNo: flatNo
          });
          
          if (residents.length < 5) {
            credentialSummary += `\nFlat ${flatNo}: ID: ${residentId} / Pass: ${password}`;
          }
          userIndex++;
        }
      }
    }

    // 4. Batch Commit to Store
    registerSocietyFull(newSoc, staff, residents);

    setNewSocName(''); setNewSocAddress(''); setNewSocCity(''); setNewSocState('');
    setNewSocZip(''); setNewSocRegNo(''); setNewSocEmail(''); setNewSocPhone('');
    setIsMultipleTowers(false); setNewSocTowers(2); setNewSocFloors(1); setNewSocFlats(0);
    setWizardStep(0);
    
    let msg = `Society Registered Successfully!\n\nAuto-generated ${staff.length} Staff and ${residents.length} Residents.`;
    if (sendCredentialsToSoc && newSocPhone) {
      msg += `\n\n[SMS SENT TO ${newSocPhone}]\nSample Directory:${credentialSummary}\n... and remaining residents.`;
    }
    alert(msg);
  };

  const handleEditPassword = (userId: string, currPass: string) => {
    setEditingUserId(userId);
    setTempPassword(currPass);
  };

  const handleSavePassword = (userId: string) => {
    updateUser(userId, { password: tempPassword });
    setEditingUserId(null);
  };

  const handleSendCredentials = (userId: string, email: string) => {
    if (!email) return alert("Please enter an email address first.");
    const userObj = users.find(u => u.id === userId);
    alert(`[SIMULATED SMS/EMAIL SENT]\nRecipient: ${email}\n\nMember: ${userObj?.name}\nResident ID: ${userObj?.loginId}\nPassword: ${userObj?.password}\n\nCredentials successfully delivered.`);
  };

  const handleAddSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return alert("Name and Email required");
    const eId = `EMP-${Math.floor(Math.random() * 1000000)}`;
    addUser({
      id: `sa_${Date.now()}`,
      loginId: newAdminEmail,
      password: generateRandomPassword(),
      name: newAdminName,
      role: 'SUPER_ADMIN',
      email: newAdminEmail,
      employeeId: eId,
      gender: newAdminGender,
    });
    setNewAdminName(''); setNewAdminEmail(''); setNewAdminPhone(''); setNewAdminGender('');
    alert(`Super Admin Added!\nEmployee ID: ${eId}`);
  };

  const superAdmins = (users || []).filter(u => u.role === 'SUPER_ADMIN');
  const staff = (users || []).filter(u => u.role === 'SECRETARY' || u.role === 'GUARD' || u.role === 'HOUSEKEEPING');

  if (currentTab === 'admins') {
    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Manage Super Admins</h2>
        <Card className="border-border shadow-sm">
          <CardHeader><CardTitle>Add New Super Admin</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleAddSuperAdmin} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                <Input value={newAdminName} onChange={e=>setNewAdminName(e.target.value)} placeholder="Full Name" required/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <Input type="email" value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} placeholder="Email Address" required/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile No.</label>
                <Input type="tel" value={newAdminPhone} onChange={e=>setNewAdminPhone(e.target.value)} placeholder="Mobile No."/>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                <select className="w-full h-10 px-3 py-2 border rounded-md text-sm" value={newAdminGender} onChange={e=>setNewAdminGender(e.target.value)}>
                  <option value="">Select Gender</option><option value="M">Male</option><option value="F">Female</option><option value="O">Other</option>
                </select>
              </div>
              <Button type="submit" className="md:col-span-2 lg:col-span-4 mt-2">Create Global Admin</Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="border-border shadow-sm mt-6">
          <CardHeader><CardTitle>Current Super Administrators</CardTitle></CardHeader>
          <CardContent className="p-0">
             <table className="w-full text-left text-sm">
               <thead className="bg-slate-50 border-b"><tr><th className="p-4">EMP ID</th><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Gender</th></tr></thead>
               <tbody className="divide-y">{superAdmins.map(sa => (
                 <tr key={sa.id}><td className="p-4 font-mono font-medium">{sa.employeeId || 'N/A'}</td><td className="p-4 font-bold">{sa.name}</td><td className="p-4 text-slate-500">{sa.email || sa.loginId}</td><td className="p-4">{sa.gender || '-'}</td></tr>
               ))}</tbody>
             </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTab === 'reports') {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-slate-900">Advanced Analytics & Reports</h2>
             <p className="text-sm text-slate-500">Download system-wide CSV reports for audit.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle>Financial & Revenue Export</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Export detailed CSV containing society-wise revenue breakdowns and subscription statuses.</p>
              <Button onClick={() => exportCSV(societies.map(s => ({ Name: s.name, Address: s.address, Revenue: s.totalRevenue, Status: s.subscriptionActive ? 'Active' : 'Inactive' })), 'financial_report.csv')}><ArrowDownToLine className="w-4 h-4 mr-2"/> Export Society Revenue CSV</Button>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle>System Activity Logs</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Export complete global system activity logs for security auditing.</p>
              <Button variant="outline" onClick={() => exportCSV(activityLogs.length ? activityLogs : [{ action: 'No logs yet', date: '-' }], 'activity_logs.csv')}><ArrowDownToLine className="w-4 h-4 mr-2"/> Export Activity Logs CSV</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentTab === 'templates') {
    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Email Comm Templates</h2>
        <p className="text-sm text-slate-500 mb-6">Manage automated email templates dispatched by the system.</p>
        <div className="grid gap-6">
          {emailTemplates?.map(tpl => (
            <Card key={tpl.id} className="border-border shadow-sm">
              <CardHeader className="bg-slate-50 border-b pb-4"><CardTitle className="text-base text-slate-800">{tpl.type}</CardTitle></CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Template Subject Line</label>
                  <Input value={tpl.subject} onChange={e => updateEmailTemplate(tpl.id, { subject: e.target.value })}/>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Body (Supports variables like {'{name}'})</label>
                  <textarea className="w-full border rounded-md p-3 text-sm font-mono focus:ring-2 outline-none h-32" value={tpl.body} onChange={e => updateEmailTemplate(tpl.id, { body: e.target.value })}/>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const [directorySocFilter, setDirectorySocFilter] = useState('');

  if (currentTab === 'onboarding') {
    const filteredUsers = directorySocFilter 
      ? users.filter(u => u.societyId === directorySocFilter)
      : users;

    return (
      <div className="space-y-6 fade-in relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl border border-border shadow-sm gap-4">
           <div>
             <h2 className="text-lg font-bold text-slate-900">User Directory</h2>
             <p className="text-sm text-slate-500">View all auto-generated Resident IDs and manage passwords.</p>
           </div>
           <div className="flex items-center gap-2 w-full md:w-auto">
             <label className="text-xs font-semibold text-slate-700 shrink-0">Filter by Society:</label>
             <select 
               className="h-9 px-3 border rounded-md text-sm bg-slate-50 w-full md:w-[200px]"
               value={directorySocFilter}
               onChange={(e) => setDirectorySocFilter(e.target.value)}
             >
               <option value="">All Societies</option>
               {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
             </select>
           </div>
        </div>

        <Card className="border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle>Global User Directory ({filteredUsers.length} Users)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[11px] text-text-muted uppercase bg-sidebar border-b border-border">
                  <tr>
                    <th className="px-[20px] py-[12px] font-[600]">Name / Role</th>
                    <th className="px-[20px] py-[12px] font-[600]">Resident ID</th>
                    <th className="px-[20px] py-[12px] font-[600]">Society</th>
                    <th className="px-[20px] py-[12px] font-[600]">Email / Password</th>
                    <th className="px-[20px] py-[12px] font-[600] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors text-[13px]">
                      <td className="px-[20px] py-[16px] text-text-main">
                        <div className="font-[600]">{u.name}</div>
                        <div className="text-[11px] text-text-muted uppercase tracking-wider">{u.role}</div>
                      </td>
                      <td className="px-[20px] py-[16px] font-mono font-medium text-slate-800">{u.loginId}</td>
                      <td className="px-[20px] py-[16px]">
                        <div>{societies.find(s => s.id === u.societyId)?.name || u.societyId || 'System'}</div>
                        <div className="text-xs text-slate-500">{u.flatNo ? `Flat: ${u.flatNo}` : ''}</div>
                      </td>
                      <td className="px-[20px] py-[16px] space-y-2">
                        {editingUserId === u.id ? (
                          <>
                            <Input 
                              value={u.email || ''} 
                              onChange={(e) => updateUser(u.id, { email: e.target.value })}
                              placeholder="Email address"
                              className="h-[28px] text-[12px] w-[180px] mb-2"
                            />
                            <Input 
                              value={tempPassword} 
                              onChange={(e) => setTempPassword(e.target.value)}
                              placeholder="Password"
                              className="h-[28px] text-[12px] w-[140px]"
                            />
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-slate-500 mb-1">{u.email || 'No Email Set'}</div>
                            <div className="font-mono text-slate-600">{u.password || 'Not Set'}</div>
                          </>
                        )}
                      </td>
                      <td className="px-[20px] py-[16px] text-right">
                        {editingUserId === u.id ? (
                          <div className="space-y-2 flex flex-col items-end">
                            <Button size="sm" onClick={() => handleSavePassword(u.id)}>Save Changes</Button>
                          </div>
                        ) : (
                          <div className="space-y-2 flex flex-col items-end">
                            <Button variant="outline" size="sm" onClick={() => handleEditPassword(u.id, u.password || '')}>
                              <Pencil className="h-3 w-3 mr-2" /> Edit Info
                            </Button>
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => handleSendCredentials(u.id, u.email || '')}>
                              <Mail className="h-3 w-3 mr-2" /> Send Credentials
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                     <tr>
                       <td colSpan={5} className="text-center py-8 text-slate-500">No users found in store. Register a Society!</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTab === 'payments') {
    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Global Payment Gateway</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-md">Recent Transactions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center"><ArrowUpRight className="h-4 w-4 text-emerald-600"/></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Society Subscription #{100+i}</p>
                        <p className="text-xs text-slate-500">Processed successfully</p>
                      </div>
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-700">+₹2,400.00</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
             <CardHeader><CardTitle className="text-md">Payment Methods</CardTitle></CardHeader>
             <CardContent>
               <div className="p-6 border rounded-xl border-dashed text-center space-y-3">
                 <CreditCard className="h-8 w-8 text-slate-400 mx-auto" />
                 <p className="text-sm text-slate-500">View and configure Stripe/Razorpay accounts here.</p>
                 <Button variant="outline" size="sm" onClick={() => alert("Opening Gateway Configuration...")}>Manage Gateways</Button>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentTab === 'subscriptions') {
    const handleAddPlan = (e: React.FormEvent) => {
      e.preventDefault();
      addSubscription({
        id: `sub_${Date.now()}`,
        name: planName,
        price: Number(planPrice),
        durationMonths: Number(planDuration),
        cities: planCities.split(',').map(c => c.trim()),
        features: planFeatures.split(',').map(f => f.trim())
      });
      setPlanName(''); setPlanPrice(''); setPlanCities(''); setPlanFeatures('');
    };

    const handleCreatePO = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSocId || !selectedPlanId || !poAmount) return alert("Select all fields");
      
      const targetSoc = societies.find(s => s.id === selectedSocId);
      
      // Renewal logic: if society has a future expiry, extend from it. Otherwise extend from today.
      let baseDate = new Date();
      if (targetSoc?.subscriptionExpiry && new Date(targetSoc.subscriptionExpiry) > new Date()) {
        baseDate = new Date(targetSoc.subscriptionExpiry);
      }
      
      const expiry = new Date(baseDate);
      expiry.setMonth(expiry.getMonth() + Number(poPeriod));

      const newPo = {
        id: `po_${Date.now()}`,
        societyId: selectedSocId,
        planId: selectedPlanId,
        amount: Number(poAmount),
        date: new Date().toISOString(),
        validityMonths: Number(poPeriod),
        expiryDate: expiry.toISOString(),
        status: 'COMPLETED' as const
      };

      addPurchaseOrder(newPo);
      
      // Update society status and revenue
      updateSociety(selectedSocId, {
        subscriptionActive: true,
        subscriptionPlanId: selectedPlanId,
        subscriptionExpiry: expiry.toISOString(),
        totalRevenue: (targetSoc?.totalRevenue || 0) + Number(poAmount)
      });

      alert(`Purchase Order processed!\nAmount: ₹${poAmount}\nSociety: ${targetSoc?.name}\nNew Expiry: ${expiry.toLocaleDateString()}`);
      
      // Clear form
      setPoAmount(''); setPoPeriod('12'); setSelectedSocId(''); setSelectedPlanId('');
    };

    return (
      <div className="space-y-6 fade-in pb-20">
        <h2 className="text-xl font-bold text-slate-800">Subscription Plans & PO Billing</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <Card className="border-border shadow-sm">
             <CardHeader className="bg-slate-50 border-b"><CardTitle>Create New Plan</CardTitle></CardHeader>
             <CardContent className="pt-4">
               <form onSubmit={handleAddPlan} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
                      <Input required value={planName} onChange={e=>setPlanName(e.target.value)} placeholder="e.g. Enterprise Tier" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Duration (Months)</label>
                      <Input required type="number" value={planDuration} onChange={e=>setPlanDuration(e.target.value)} />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Base Price (₹)</label>
                      <Input required type="number" value={planPrice} onChange={e=>setPlanPrice(e.target.value)} placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Available Cities (Comma separated)</label>
                      <Input required value={planCities} onChange={e=>setPlanCities(e.target.value)} placeholder="Mumbai, Pune" />
                    </div>
                 </div>
                 <div>
                   <label className="block text-xs font-semibold text-slate-700 mb-1">Accessible Features (Comma separated)</label>
                   <Input required value={planFeatures} onChange={e=>setPlanFeatures(e.target.value)} placeholder="Visitor, Financial, Payroll" />
                 </div>
                 <Button type="submit" className="w-full">Create Master Plan</Button>
               </form>
             </CardContent>
           </Card>

           <Card className="border-border shadow-sm">
             <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
                <CardTitle>Purchase Order (Society Activation)</CardTitle>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
             </CardHeader>
             <CardContent className="pt-4">
               <form onSubmit={handleCreatePO} className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Select Society</label>
                      <select value={selectedSocId} onChange={e=>setSelectedSocId(e.target.value)} className="w-full h-10 border rounded-md px-3 text-sm bg-white">
                        <option value="">Choose Society</option>
                        {societies.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Select Plan</label>
                      <select value={selectedPlanId} onChange={e=>setSelectedPlanId(e.target.value)} className="w-full h-10 border rounded-md px-3 text-sm bg-white">
                        <option value="">Choose Plan</option>
                        {subscriptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Final Amount (₹)</label>
                      <Input required type="number" value={poAmount} onChange={e=>setPoAmount(e.target.value)} placeholder="Negotiated price" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Validity (Months)</label>
                      <Input required type="number" value={poPeriod} onChange={e=>setPoPeriod(e.target.value)} />
                    </div>
                 </div>
                 <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Create PO & Activate Logins</Button>
                 <p className="text-[10px] text-center text-slate-500 italic">Creating a PO automatically extends the society's platform access validity.</p>
               </form>
             </CardContent>
           </Card>
        </div>

        <Card className="border-border shadow-sm mt-6">
            <CardHeader className="bg-slate-50 border-b"><CardTitle>Available Master Plans</CardTitle></CardHeader>
            <CardContent className="p-0">
               <table className="w-full text-left text-sm">
                 <thead className="bg-[#f8fafc] border-b text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                   <tr><th className="p-4">Plan Name</th><th className="p-4">Price</th><th className="p-4">Coverage</th><th className="p-4">Features</th></tr>
                 </thead>
                 <tbody className="divide-y text-[13px]">
                   {subscriptions.map(plan => (
                     <tr key={plan.id}>
                       <td className="p-4 font-semibold text-slate-800">{plan.name}</td>
                       <td className="p-4 font-mono font-bold text-emerald-600">₹{plan.price} / {plan.durationMonths}m</td>
                       <td className="p-4 text-slate-500">{plan.cities?.join(', ') || 'Global'}</td>
                       <td className="p-4 text-slate-500 italic">{plan.features.join(', ')}</td>
                     </tr>
                   ))}
                   {subscriptions.length === 0 && (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-400">No master plans found. Create one above!</td></tr>
                   )}
                 </tbody>
               </table>
            </CardContent>
        </Card>

        <Card className="border-border shadow-none mt-6">
          <CardHeader className="border-b bg-slate-50">
            <CardTitle>Society Platform Status & Validity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
             <table className="w-full text-left">
              <thead className="text-[11px] text-text-muted uppercase bg-sidebar border-b border-border">
                <tr>
                  <th className="px-[20px] py-[12px] font-[600]">Society</th>
                  <th className="px-[20px] py-[12px] font-[600]">Expiry Date</th>
                  <th className="px-[20px] py-[12px] font-[600]">Status</th>
                  <th className="px-[20px] py-[12px] font-[600] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {societies.map((soc) => (
                  <tr key={soc.id} className="hover:bg-gray-50 text-[13px]">
                    <td className="px-[20px] py-[16px]">
                      <div className="font-[600]">{soc.name}</div>
                      <div className="text-[10px] text-slate-500">{soc.city || 'TBD'}</div>
                    </td>
                    <td className="px-[20px] py-[16px]">
                       <span className={`font-mono ${soc.subscriptionExpiry && new Date(soc.subscriptionExpiry) < new Date() ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                         {soc.subscriptionExpiry ? new Date(soc.subscriptionExpiry).toLocaleDateString() : 'No PO Recorded'}
                       </span>
                    </td>
                    <td className="px-[20px] py-[16px]">
                      {soc.subscriptionActive && (!soc.subscriptionExpiry || new Date(soc.subscriptionExpiry) > new Date()) ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">ACTIVE</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold">FREEZED</span>
                      )}
                    </td>
                    <td className="px-[20px] py-[16px] text-right">
                      <Button size="sm" variant="outline" onClick={() => {
                         setSelectedSocId(soc.id);
                         setSelectedPlanId(soc.subscriptionPlanId || '');
                         // Find previous PO for this society to suggest amount?
                         const lastPo = (purchaseOrders || []).filter(p=>p.societyId === soc.id)[0];
                         if (lastPo) {
                           setPoAmount(lastPo.amount.toString());
                           setPoPeriod(lastPo.validityMonths.toString());
                         }
                         
                         window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}>
                        Update PO
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
             </table>
          </CardContent>
        </Card>

        {purchaseOrders && (
           <Card className="border-border shadow-none mt-6">
           <CardHeader className="border-b bg-slate-50">
             <CardTitle>PO History / Audit Log</CardTitle>
           </CardHeader>
           <CardContent className="p-0">
              <table className="w-full text-left">
               <thead className="text-[11px] text-text-muted uppercase bg-sidebar border-b border-border">
                 <tr>
                   <th className="px-[20px] py-[12px] font-[600]">PO ID</th>
                   <th className="px-[20px] py-[12px] font-[600]">Society</th>
                   <th className="px-[20px] py-[12px] font-[600]">Amount</th>
                   <th className="px-[20px] py-[12px] font-[600]">Expiry</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border">
                 {purchaseOrders.map(po => (
                   <tr key={po.id} className="text-[13px]">
                     <td className="px-[20px] py-[16px] font-mono text-[11px]">{po.id}</td>
                     <td className="px-[20px] py-[16px]">{societies.find(s=>s.id === po.societyId)?.name || po.societyId}</td>
                     <td className="px-[20px] py-[16px] font-bold text-emerald-700">₹{po.amount}</td>
                     <td className="px-[20px] py-[16px] font-mono">{new Date(po.expiryDate).toLocaleDateString()}</td>
                   </tr>
                 ))}
                 {purchaseOrders.length === 0 && (
                   <tr>
                     <td colSpan={4} className="p-8 text-center text-slate-400 font-medium italic">
                       Audit log is clean. No purchase orders recorded yet.
                     </td>
                   </tr>
                 )}
               </tbody>
              </table>
           </CardContent>
         </Card>
        )}
      </div>
    );
  }

  if (currentTab === 'issues') {
    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Global System Diagnostics & Issues</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-red-200 bg-red-50">
             <CardContent className="p-4 flex flex-col items-center justify-center text-center">
               <Activity className="h-8 w-8 text-red-500 mb-2" />
               <h3 className="font-bold text-red-900">0 Critical Issues</h3>
               <p className="text-xs text-red-700">All systems operational</p>
             </CardContent>
          </Card>
        </div>
        <Card className="border-border">
          <CardContent className="p-8 text-center text-slate-500">
            No system-level errors or society-level platform complaints have been escalated.
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentTab === 'payroll') {
    return (
       <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-slate-900">Admin Staff Payroll</h2>
             <p className="text-sm text-slate-500">Manage payroll and UPI payouts for system-level administrators and operators.</p>
           </div>
        </div>
        <Card className="border-border shadow-none">
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="text-[11px] text-text-muted uppercase bg-sidebar border-b border-border">
                <tr>
                  <th className="px-[20px] py-[12px] font-[600]">Staff Name</th>
                  <th className="px-[20px] py-[12px] font-[600]">Role</th>
                  <th className="px-[20px] py-[12px] font-[600]">UPI ID</th>
                  <th className="px-[20px] py-[12px] font-[600] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 text-[13px]">
                    <td className="px-[20px] py-[16px] font-[600]">{u.name}</td>
                    <td className="px-[20px] py-[16px]">{u.role}</td>
                    <td className="px-[20px] py-[16px] font-mono">
                      {editingUserId === `upi_${u.id}` ? (
                        <Input 
                          value={tempPassword} 
                          onChange={(e) => setTempPassword(e.target.value)}
                          placeholder="user@upi"
                          className="h-[28px] text-[12px] w-[160px]"
                        />
                      ) : (
                        <span>{u.upiId || 'Not Set'}</span>
                      )}
                    </td>
                    <td className="px-[20px] py-[16px] text-right flex justify-end gap-2">
                       {editingUserId === `upi_${u.id}` ? (
                         <Button size="sm" onClick={() => {
                           updateUser(u.id, { upiId: tempPassword });
                           setEditingUserId(null);
                         }}>Save</Button>
                       ) : (
                         <Button variant="outline" size="sm" onClick={() => {
                           setEditingUserId(`upi_${u.id}`);
                           setTempPassword(u.upiId || '');
                         }}>
                           <Pencil className="h-3 w-3 mr-1" /> Edit UPI
                         </Button>
                       )}
                       <Button size="sm" variant="default" onClick={() => {
                           const amt = prompt("Enter payout amount for " + u.name);
                           if (!amt) return;
                           alert(`UPI Intent Opening: upi://pay?pa=${u.upiId || 'test@ybl'}&pn=${u.name}&am=${amt}`);
                           addPayrollRecord({
                             id: `pay_${Date.now()}`, date: new Date().toISOString(), staffName: u.name, staffId: u.id, amount: Number(amt), societyId: u.societyId || 'GLOBAL'
                           });
                         }}>
                         Pay via UPI
                       </Button>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                   <tr>
                     <td colSpan={4} className="text-center py-8 text-slate-500">No staff found. Auto-generate a society to populate staff.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
        
        <div className="flex justify-between items-center mt-6">
          <h3 className="text-lg font-bold text-slate-800">Payroll Reports</h3>
          <Button variant="outline" onClick={() => exportCSV(payrolls.length ? payrolls : [{ action: 'No records' }], 'payroll_report.csv')}><ArrowDownToLine className="w-4 h-4 mr-2"/> Download Report CSV</Button>
        </div>
      </div>
    );
  }
  const handledTabs = ['onboarding', 'payments', 'subscriptions', 'issues', 'payroll', 'super-admin', 'societies', 'admins', 'reports', 'templates'];
  
  if (!handledTabs.includes(currentTab)) {
    return (
      <div className="flex h-full items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-sm">
          <div className="p-4 bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
             <ShieldCheck className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h2>
          <p className="text-slate-500 text-sm">This module is part of the future YogiSentry deployment roadmap or requires higher privilege levels.</p>
          <Button variant="outline" onClick={() => navigate('/super-admin')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Operations Control</h1>
          <p className="text-slate-500 font-medium">Global SaaS Multi-tenant Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 border-slate-200">
             <CreditCard className="mr-2 h-4 w-4" /> Billing Settings
          </Button>
          <Button className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50" onClick={() => setWizardStep(1)}>
             <Plus className="mr-2 h-4 w-4" /> Provision Society
          </Button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Network Societies', value: societies.length, icon: Building2, color: 'emerald', trend: '+12%' },
          { label: 'Active Subscription', value: societies.filter(s => s.subscriptionActive).length, icon: ShieldCheck, color: 'blue', trend: 'Stable' },
          { label: 'Global Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: Wallet, color: 'indigo', trend: '+₹45k' },
          { label: 'Platform Uptime', value: '99.9%', icon: Activity, color: 'rose', trend: 'Optimal' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded bg-${stat.color}-50 text-${stat.color}-600`}>{stat.trend}</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Analytics Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden bg-white">
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Revenue Performance</CardTitle>
                <CardDescription>Historical society onboarding revenue distribution</CardDescription>
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold bg-slate-50">WEEKLY</Button>
                 <Button variant="ghost" size="sm" className="h-8 text-[11px] font-bold">MONTHLY</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={societies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="totalRevenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Distribution */}
        <Card className="border-none shadow-sm bg-[#0f172a] text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Client Segments</CardTitle>
            <CardDescription className="text-slate-400">Distribution by city and plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             {[
               { city: 'Mumbai', count: 12, pct: 45, color: 'emerald' },
               { city: 'Pune', count: 8, pct: 30, color: 'blue' },
               { city: 'Delhi', count: 4, pct: 15, color: 'rose' },
               { city: 'Others', count: 3, pct: 10, color: 'slate' },
             ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full bg-${item.color}-400`} /> {item.city}</span>
                    <span className="text-slate-400">{item.count} Soc</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
             ))}
             <div className="pt-4 border-t border-slate-800">
                <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none h-11">
                   <PieChart className="mr-2 h-4 w-4" /> Comprehensive Audit
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Wizard Modal-Style UI */}
      {wizardStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0f172a]/40 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl border-none shadow-2xl overflow-hidden bg-white">
            <div className="bg-[#0f172a] p-8 text-white relative">
              <button onClick={() => setWizardStep(0)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors">
                <XCircle size={24} />
              </button>
              <h2 className="text-2xl font-black mb-1">Onboarding Wizard</h2>
              <p className="text-slate-400 text-sm font-medium">Provisioning instance {wizardStep} of 3</p>
              
              <div className="flex gap-2 mt-6">
                {[1,2,3].map(s => (
                  <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${wizardStep >= s ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <CardContent className="p-8">
              <form onSubmit={(e) => {
                 e.preventDefault();
                 if(wizardStep < 3) setWizardStep(wizardStep + 1);
                 else handleRegisterSociety(e);
              }} className="space-y-6">
                
                {wizardStep === 1 && (
                  <div className="space-y-5 animate-in slide-in-from-right duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Society Name</label>
                        <Input required value={newSocName} onChange={e => setNewSocName(e.target.value)} className="h-11 border-slate-200" placeholder="Moonlight Enclave" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Registration ID</label>
                        <Input value={newSocRegNo} onChange={e => setNewSocRegNo(e.target.value)} className="h-11 border-slate-200" placeholder="SOC-2026-BH" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Street Address</label>
                      <Input required value={newSocAddress} onChange={e => setNewSocAddress(e.target.value)} className="h-11 border-slate-200" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       <Input value={newSocCity} onChange={e => setNewSocCity(e.target.value)} placeholder="City" className="h-11 border-slate-200" />
                       <Input value={newSocState} onChange={e => setNewSocState(e.target.value)} placeholder="State" className="h-11 border-slate-200" />
                       <Input value={newSocZip} onChange={e => setNewSocZip(e.target.value)} placeholder="Zip" className="h-11 border-slate-200" />
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-5 animate-in slide-in-from-right duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
                        <Input type="email" value={newSocEmail} onChange={e => setNewSocEmail(e.target.value)} className="h-11 border-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Contact Phone</label>
                        <Input type="tel" value={newSocPhone} onChange={e => setNewSocPhone(e.target.value)} className="h-11 border-slate-200" />
                      </div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                       <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Smartphone size={18}/></div>
                       <div className="space-y-1">
                          <label className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                            <input type="checkbox" checked={sendCredentialsToSoc} onChange={e => setSendCredentialsToSoc(e.target.checked)} className="rounded text-emerald-600" />
                            Enable Instant SMS Dispatch
                          </label>
                          <p className="text-xs text-emerald-700/70 leading-relaxed">System will automatically broadcast login credentials to all provisioned admins and residents via Twilio integration.</p>
                       </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-5 animate-in slide-in-from-right duration-300">
                    <div className="flex gap-4 mb-4">
                      <Button type="button" variant={!isMultipleTowers ? "default" : "outline"} onClick={() => setIsMultipleTowers(false)} className="flex-1 h-12 shadow-sm font-bold">SINGLE TOWER</Button>
                      <Button type="button" variant={isMultipleTowers ? "default" : "outline"} onClick={() => setIsMultipleTowers(true)} className="flex-1 h-12 shadow-sm font-bold">MEGA TOWERS</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       {isMultipleTowers && (
                         <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">TOWERS</label>
                            <Input required type="number" min="2" value={newSocTowers} onChange={e => setNewSocTowers(Number(e.target.value))} className="h-14 text-lg font-bold text-center border-slate-200" />
                         </div>
                       )}
                       <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500">{isMultipleTowers ? 'FLOORS/T' : 'FLOORS'}</label>
                          <Input required type="number" min="1" value={newSocFloors} onChange={e => setNewSocFloors(Number(e.target.value))} className="h-14 text-lg font-bold text-center border-slate-200" />
                       </div>
                       <div className="space-y-2 col-span-1">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Total Capacity</label>
                          <Input required type="number" min="1" value={newSocFlats} onChange={e => setNewSocFlats(Number(e.target.value))} className="h-14 text-lg font-bold text-center border-emerald-500 bg-emerald-50" />
                       </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6">
                  {wizardStep > 1 && (
                    <Button variant="outline" type="button" onClick={() => setWizardStep(wizardStep - 1)} className="h-12 px-8 font-bold text-slate-600">PREVIOUS</Button>
                  )}
                  <Button type="submit" className="flex-1 h-12 bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-lg tracking-tight uppercase shadow-xl transition-all">
                    {wizardStep < 3 ? 'Proceed to Infrastructure' : 'Authorize & Provision Partition'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modern Societies Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Provisioned Societies</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search societies..." className="pl-10 h-10 w-[240px] border-none shadow-sm bg-white" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
           <Card className="border-none shadow-sm bg-white overflow-hidden">
             <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-100">
                     <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-4">Society Identity</th>
                       <th className="px-8 py-4">Infra Snapshot</th>
                       <th className="px-8 py-4">Financial Yield</th>
                       <th className="px-8 py-4">Runtime Status</th>
                       <th className="px-8 py-4 text-right">Administrative Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {societies.map((soc) => (
                       <tr key={soc.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-8 py-6">
                           <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                               {soc.logoUrl ? (
                                 <img src={soc.logoUrl} className="w-full h-full object-cover" />
                               ) : (
                                 <Building2 className="text-slate-400" size={20} />
                               )}
                             </div>
                             <div className="space-y-0.5">
                               <p className="font-bold text-slate-900 tracking-tight">{soc.name}</p>
                               <p className="text-xs font-semibold text-slate-400">{soc.city || 'Location Pending'}</p>
                             </div>
                           </div>
                         </td>
                         <td className="px-8 py-6 text-[13px] font-bold text-slate-600">
                            {soc.totalTowers || 1} Towers • {soc.totalFlats || 0} Flats
                         </td>
                         <td className="px-8 py-6">
                            <span className="font-black text-slate-900">₹{soc.totalRevenue.toLocaleString()}</span>
                         </td>
                         <td className="px-8 py-6">
                           {soc.subscriptionActive && (!soc.subscriptionExpiry || new Date(soc.subscriptionExpiry) > new Date()) ? (
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                               <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Live
                             </div>
                           ) : (
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100">
                               <div className="w-1 h-1 rounded-full bg-rose-500" /> Frozen
                             </div>
                           )}
                         </td>
                         <td className="px-8 py-6 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Button variant="ghost" size="sm" className="h-9 px-4 font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" onClick={() => navigate(`/super-admin/onboarding?societyId=${soc.id}`)}>Manage Users</Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl" onClick={() => {
                                if (confirm(`DESTRUCTIVE ACTION: Remove instance ${soc.name}?`)) deleteSociety(soc.id);
                             }}>
                                <Trash2 size={16} />
                             </Button>
                           </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
