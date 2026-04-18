import { useStore, Society, User } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingUp, Users, Plus, Pencil, XCircle, CheckCircle2, Wallet, CreditCard, Activity, ArrowUpRight, Mail, ArrowDownToLine, Image as ImageIcon, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const VIBRANT_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const exportCSV = (data: any[], filename: string) => {
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
  const { societies, users, emailTemplates, updateEmailTemplate, addSociety, updateSociety, addUser, updateUser, registrationCharge, activityLogs, subscriptions, addSubscription, updateSubscription, payrolls, addPayrollRecord } = useStore();
  const location = useLocation();

  const totalRevenue = societies.reduce((acc, soc) => acc + soc.totalRevenue, 0);
  const currentTab = location.pathname.split('/').pop() || 'super-admin';
  
  // Registration Form Wizard State
  const [wizardStep, setWizardStep] = useState(0); // 0 = list, 1 = basic, 2 = infra, 3 = confirm
  const [newSocName, setNewSocName] = useState('');
  const [newSocAddress, setNewSocAddress] = useState('');
  const [newSocCity, setNewSocCity] = useState('');
  const [newSocState, setNewSocState] = useState('');
  const [newSocZip, setNewSocZip] = useState('');
  const [newSocRegNo, setNewSocRegNo] = useState('');
  const [newSocEmail, setNewSocEmail] = useState('');
  const [newSocPhone, setNewSocPhone] = useState('');
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

    const socId = `soc_${Date.now()}`;
    const finalTowers = isMultipleTowers ? Math.max(newSocTowers, 2) : 1;
    
    // Create new society
    addSociety({
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
    });

    // Auto-generate users for this society
    // 1 Secretary
    addUser({
      id: `u_${Date.now()}_sec`,
      loginId: `${newSocName.substring(0, 3).toUpperCase()}-ADMIN-${Math.floor(Math.random() * 10000)}`,
      password: generateRandomPassword(),
      name: `${newSocName} Secretary`,
      role: 'SECRETARY',
      societyId: socId
    });

    // N Residents (Distributed by AI/algorithm across towers and floors)
    const towerLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const activeTowers = finalTowers;
    const activeFloors = Math.max(newSocFloors, 1);
    
    // Distribute flats equally
    const totalFloorsOverall = activeTowers * activeFloors;
    // Total no of flats should be divided by no of floors
    const flatsPerFloor = Math.ceil(newSocFlats / totalFloorsOverall);
    
    let userIndex = 1;
    let addedCount = 0;
    const MAX_AUTO_RESIDENTS = 20; // Bound the array creation so preview iframe won't crash
    for (let t = 0; t < activeTowers && addedCount < MAX_AUTO_RESIDENTS; t++) {
      const towerStr = activeTowers > 1 ? towerLabels[t % 26] : '';
      
      for (let f = 1; f <= activeFloors && addedCount < MAX_AUTO_RESIDENTS; f++) {
        for (let i = 1; i <= flatsPerFloor && userIndex <= newSocFlats && addedCount < MAX_AUTO_RESIDENTS; i++) {
          // Format as FloorNum + FlatIndex (e.g. 101, 102, 201...)
          const flatNum = (f * 100) + i; 
          const flatNo = towerStr ? `${towerStr}-${flatNum}` : `${flatNum}`;
          
          const residentId = generateRandomResidentId(newSocName, flatNo);
          addUser({
            id: `u_${Date.now()}_res_${userIndex}`,
            loginId: residentId,
            password: generateRandomPassword(),
            name: `Resident ${flatNo}`,
            role: 'RESIDENT',
            societyId: socId,
            flatNo: flatNo
          });
          userIndex++;
          addedCount++;
        }
      }
    }

    setNewSocName(''); setNewSocAddress(''); setNewSocCity(''); setNewSocState('');
    setNewSocZip(''); setNewSocRegNo(''); setNewSocEmail(''); setNewSocPhone('');
    setIsMultipleTowers(false); setNewSocTowers(2); setNewSocFloors(1); setNewSocFlats(0);
    setWizardStep(0);
    alert(`Society registered! Auto-generated 1 Secretary and ${addedCount} Residents (limited for preview). Go to Onboarding to view credentials.`);
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
    alert(`Credentials sent via email to: ${email}\n(Simulated functionality for ${userId})`);
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

  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
  const staff = users.filter(u => u.role === 'SECRETARY' || u.role === 'GUARD' || u.role === 'HOUSEKEEPING');

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

  if (currentTab === 'onboarding') {
    return (
      <div className="space-y-6 fade-in relative">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-slate-900">User Directory</h2>
             <p className="text-sm text-slate-500">View all auto-generated Resident IDs and manage passwords.</p>
           </div>
        </div>

        <Card className="border-border shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle>Global User Directory</CardTitle>
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
                  {users.map((u) => (
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
    const { purchaseOrders, addPurchaseOrder } = useStore();

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
      
      const expiry = new Date();
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
      
      // Update society status
      updateSociety(selectedSocId, {
        subscriptionActive: true,
        subscriptionPlanId: selectedPlanId,
        subscriptionExpiry: expiry.toISOString()
      });

      alert("Purchase Order processed! Society activated until " + expiry.toLocaleDateString());
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

        {purchaseOrders && purchaseOrders.length > 0 && (
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

  if (currentTab !== 'super-admin' && currentTab !== 'societies') {
    return (
      <div className="flex h-full items-center justify-center fade-in">
        <div className="text-center space-y-2 text-text-muted">
          <h2 className="text-lg font-[600] capitalize">{currentTab.replace('-', ' ')}</h2>
          <p className="text-sm">This module is part of the future YogiSentry roadmap.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white border border-border p-[20px] rounded-[16px] shadow-sm">
          <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Total Societies</p>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded bg-accent-soft flex items-center justify-center">
               <Building2 className="h-4 w-4 text-accent" />
             </div>
             <h3 className="text-[24px] font-[700] text-text-main">{societies.length}</h3>
          </div>
        </div>
        <div className="bg-white border border-border p-[20px] rounded-[16px] shadow-sm">
          <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Global Revenue</p>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded bg-[#dcfce7] flex items-center justify-center">
               <TrendingUp className="h-4 w-4 text-[#166534]" />
             </div>
             <h3 className="text-[24px] font-[700] text-text-main">₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white border border-border p-[20px] rounded-[16px] shadow-sm">
          <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Active Subscriptions</p>
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 rounded bg-[#eff6ff] flex items-center justify-center">
               <Users className="h-4 w-4 text-accent" />
             </div>
             <h3 className="text-[24px] font-[700] text-text-main">
               {societies.filter(s => s.subscriptionActive).length}
             </h3>
          </div>
        </div>
      </div>

      <Card className="border-border shadow-none">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle>Society Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={societies} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val) => `₹${val}`} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Total Revenue']}
                />
                <Bar dataKey="totalRevenue" radius={[4, 4, 0, 0]}>
                  {societies.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {wizardStep > 0 && (
        <Card className="border-indigo-100 shadow-sm border-2 overflow-hidden fade-in">
          <div className="bg-indigo-50/50 p-4 border-b flex items-center justify-between">
            <CardTitle className="text-lg text-indigo-900">Step-by-Step Society Onboarding Wizard</CardTitle>
            <div className="flex gap-2">
               <span className={`h-2 w-8 rounded-full ${wizardStep === 1 ? 'bg-indigo-600' : 'bg-indigo-200'}`}></span>
               <span className={`h-2 w-8 rounded-full ${wizardStep === 2 ? 'bg-indigo-600' : 'bg-indigo-200'}`}></span>
               <span className={`h-2 w-8 rounded-full ${wizardStep === 3 ? 'bg-indigo-600' : 'bg-indigo-200'}`}></span>
            </div>
          </div>
          <CardContent className="pt-6">
            <form onSubmit={(e) => {
               e.preventDefault();
               if(wizardStep < 3) setWizardStep(wizardStep + 1);
               else handleRegisterSociety(e);
            }} className="flex flex-col gap-6">
              
              {/* Wizard Step 1: Basic Information */}
              {wizardStep === 1 && (
                <div className="space-y-4 fade-in">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 1: General Information & Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Society Name</label>
                      <Input required value={newSocName} onChange={e => setNewSocName(e.target.value)} placeholder="E.g., Moonlight Towers" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Number</label>
                      <Input value={newSocRegNo} onChange={e => setNewSocRegNo(e.target.value)} placeholder="E.g., REG-2026/MH/01" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address</label>
                      <Input required value={newSocAddress} onChange={e => setNewSocAddress(e.target.value)} placeholder="E.g., 400 Street, Sector 1" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                      <Input value={newSocCity} onChange={e => setNewSocCity(e.target.value)} placeholder="E.g., Mumbai" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">State / Zip</label>
                      <div className="flex gap-2">
                         <Input className="w-1/2" value={newSocState} onChange={e => setNewSocState(e.target.value)} placeholder="State" />
                         <Input className="w-1/2" value={newSocZip} onChange={e => setNewSocZip(e.target.value)} placeholder="Zip" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Step 2: Contact Details */}
              {wizardStep === 2 && (
                <div className="space-y-4 fade-in">
                  <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 2: Contact Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Email</label>
                      <Input type="email" value={newSocEmail} onChange={e => setNewSocEmail(e.target.value)} placeholder="E.g., admin@moonlight.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                      <Input type="tel" value={newSocPhone} onChange={e => setNewSocPhone(e.target.value)} placeholder="E.g., +91 9876543210" />
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Step 3: Infrastructure */}
              {wizardStep === 3 && (
                <div className="space-y-4 fade-in">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-bold text-slate-800">Step 3: Infrastructure Map (AI Generation)</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Auto-Generate Mode</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">The platform will allocate residents, guards, and secretary nodes based on the limits provided here.</p>
                  
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Structure Details</label>
                    <div className="flex gap-3 mb-4">
                      <Button type="button" variant={!isMultipleTowers ? "default" : "outline"} onClick={() => setIsMultipleTowers(false)} className="w-1/2 shadow-sm">
                        Single Tower
                      </Button>
                      <Button type="button" variant={isMultipleTowers ? "default" : "outline"} onClick={() => setIsMultipleTowers(true)} className="w-1/2 shadow-sm">
                        Multiple Towers
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {isMultipleTowers && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Total Towers</label>
                          <Input required type="number" min="2" value={newSocTowers || ''} onChange={e => setNewSocTowers(Number(e.target.value))} placeholder="2" />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">{isMultipleTowers ? 'Floors/Tower' : 'Total Floors'}</label>
                        <Input required type="number" min="1" value={newSocFloors || ''} onChange={e => setNewSocFloors(Number(e.target.value))} placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Total Flats</label>
                        <Input required type="number" min="1" value={newSocFlats || ''} onChange={e => setNewSocFlats(Number(e.target.value))} placeholder="50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t justify-between">
                <div>
                   {wizardStep > 1 && <Button variant="outline" type="button" onClick={() => setWizardStep(wizardStep - 1)}>Back</Button>}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" type="button" onClick={() => setWizardStep(0)}>Cancel Form</Button>
                  {wizardStep < 3 ? (
                     <Button type="button" onClick={() => setWizardStep(wizardStep + 1)} className="bg-indigo-600 hover:bg-indigo-700">Next Step</Button>
                  ) : (
                     <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Finalize & Provision Society</Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Societies List */}
      <Card className="border-border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <div>
            <CardTitle>Registered Societies</CardTitle>
            <p className="text-sm text-text-muted mt-1">Manage and register multi-tenant society partitions.</p>
          </div>
          <Button onClick={() => setWizardStep(1)} size="default" className="shadow-sm bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" /> Start Onboarding Wizard
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[11px] text-text-muted uppercase bg-sidebar border-b border-border">
                <tr>
                  <th className="px-[20px] py-[12px] font-[600]">Society Name</th>
                  <th className="px-[20px] py-[12px] font-[600]">Address</th>
                  <th className="px-[20px] py-[12px] font-[600]">Revenue</th>
                  <th className="px-[20px] py-[12px] font-[600]">Status</th>
                  <th className="px-[20px] py-[12px] font-[600] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {societies.map((soc) => (
                  <tr key={soc.id} className="hover:bg-gray-50 transition-colors text-[13px]">
                    <td className="px-[20px] py-[16px]">
                      <div className="flex items-center gap-3">
                        {soc.logoUrl ? (
                          <img src={soc.logoUrl} alt="Logo" className="w-8 h-8 rounded object-cover border" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-slate-200 border flex items-center justify-center text-slate-500 font-bold">{soc.name[0]}</div>
                        )}
                        <span className="font-[600] text-text-main">{soc.name}</span>
                      </div>
                    </td>
                    <td className="px-[20px] py-[16px] text-text-muted">{soc.address}</td>
                    <td className="px-[20px] py-[16px] font-mono font-[500]">₹{soc.totalRevenue.toLocaleString()}</td>
                    <td className="px-[20px] py-[16px]">
                      {soc.subscriptionActive ? (
                        <span className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] text-[10px] font-[700] bg-[#dcfce7] text-[#166534] uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-[8px] py-[4px] rounded-[4px] text-[10px] font-[700] bg-[#fee2e2] text-[#991b1b] uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-[20px] py-[16px] text-right space-x-2">
                       <label className="inline-flex items-center px-3 py-1 bg-white border border-border text-xs font-semibold rounded-md shadow-sm hover:bg-gray-50 cursor-pointer transition-colors">
                         Branding
                         <input 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => updateSociety(soc.id, { logoUrl: reader.result as string });
                               reader.readAsDataURL(file);
                             }
                           }}
                         />
                       </label>
                      <Button variant="outline" size="sm">Manage</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
