import React, { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Wallet, ShieldAlert, CheckCircle2, Upload, Users, Megaphone, FileText, Plus, Bell, UserPlus, ArrowDownToLine, QrCode } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

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

export default function Secretary() {
  const { 
    currentUser, 
    maintenanceDues, 
    expenses, 
    complaints, 
    resolveComplaint, 
    users, 
    addUser,
    addMaintenanceDue,
    notices,
    addNotice,
    emailTemplates,
    updateEmailTemplate,
    activityLogs,
    clubhouseBookings,
    updateClubhouseBookingStatus,
    eventRequests,
    updateEventRequestStatus,
    societies,
    updateSociety
  } = useStore();
  
  const currentSociety = societies.find(s => s.id === currentUser?.societyId);

  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'secretary';

  const [resPicUrl, setResPicUrl] = useState('');
  
  // Notice state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  // Maintenance generation state
  const [maintenanceMonth, setMaintenanceMonth] = useState('');
  const [maintenanceAmount, setMaintenanceAmount] = useState('');

  // Staff state
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState<'GUARD' | 'HOUSEKEEPING' | 'SECRETARY'>('GUARD');
  const [staffLoginId, setStaffLoginId] = useState('');

  const totalCollected = maintenanceDues.filter(m => m.status === 'PAID').reduce((acc, m) => acc + m.amount, 0);
  const totalDue = maintenanceDues.filter(m => m.status === 'UNPAID').reduce((acc, m) => acc + m.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  const staffMembers = users.filter(u => u.societyId === currentUser?.societyId && (u.role === 'GUARD' || u.role === 'HOUSEKEEPING' || u.role === 'SECRETARY'));
  const openComplaints = complaints.filter(c => c.status === 'OPEN').length;

  const handleAddNotice = () => {
    if (!noticeTitle || !noticeContent) return alert("Title and Content required!");
    addNotice({
      id: `notice_${Date.now()}`,
      title: noticeTitle,
      content: noticeContent,
      author: currentUser?.name || 'Secretary',
      date: new Date().toISOString()
    });
    setNoticeTitle('');
    setNoticeContent('');
    alert("Notice broadcasted successfully!");
  };

  const handleAddStaff = () => {
    if (!staffName || !staffLoginId) return alert("Name and Login ID required");
    addUser({
      id: `u_${Date.now()}`,
      loginId: staffLoginId,
      password: 'password123',
      name: staffName,
      role: staffRole,
      societyId: currentUser?.societyId
    });
    setStaffName('');
    setStaffLoginId('');
    alert(`${staffRole === 'SECRETARY' ? 'Admin' : 'Staff'} member added successfully! Default password is 'password123'`);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentUser?.societyId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSociety(currentUser.societyId!, { logoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateMaintenance = () => {
    if (!maintenanceMonth || !maintenanceAmount) return alert("Month and amount required");
    const amount = Number(maintenanceAmount);
    if (isNaN(amount) || amount <= 0) return alert("Valid amount required");
    
    const residents = users.filter(u => u.societyId === currentUser?.societyId && u.role === 'RESIDENT');
    if (residents.length === 0) return alert("No residents found to bill.");
    
    let generated = 0;
    residents.forEach(r => {
      if (r.flatNo) {
        addMaintenanceDue({
          id: `m_${Date.now()}_${r.flatNo}_${Math.floor(Math.random() * 1000)}`,
          flatNo: r.flatNo,
          amount: amount,
          status: 'UNPAID',
          month: maintenanceMonth
        });
        generated++;
      }
    });

    setMaintenanceMonth('');
    setMaintenanceAmount('');
    alert(`Successfully generated ₹${amount} dues for ${generated} residents!`);
  };

  if (currentTab === 'templates') {
    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Email Comm Templates</h2>
        <p className="text-sm text-slate-500 mb-6">Manage automated email templates dispatched to residents.</p>
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

  if (currentTab === 'reports') {
    const socActivity = activityLogs?.filter(l => l.societyId === currentUser?.societyId) || [];
    return (
      <div className="space-y-6 fade-in">
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-border shadow-sm">
           <div>
             <h2 className="text-lg font-bold text-slate-900">Society Analytics & QR</h2>
             <p className="text-sm text-slate-500">Download activity reports and generate the resident login / pass QR code.</p>
           </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle>Society Financial Export</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Export detailed CSV containing flat-wise maintenance collection data.</p>
              <Button onClick={() => exportCSV(maintenanceDues, 'maintenance_collection.csv')}><ArrowDownToLine className="w-4 h-4 mr-2"/> Export Outstanding Dues</Button>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle>Society QR Code</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="p-4 bg-white border rounded-xl shadow-inner mb-4">
                 <QRCodeSVG 
                   value={`https://yogisentry.app/login?socId=${currentUser?.societyId}`}
                   size={160}
                   bgColor={"#ffffff"}
                   fgColor={"#0f172a"}
                   level={"Q"}
                 />
              </div>
              <p className="text-xs text-slate-500 text-center mb-4">Join URL: https://yogisentry.app/login?socId={currentUser?.societyId}</p>
              <Button variant="outline" className="w-full" onClick={() => window.print()}><QrCode className="w-4 h-4 mr-2"/> Print Resident QR</Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader><CardTitle>Branding & Logo</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 overflow-hidden">
                  {currentSociety?.logoUrl ? (
                    <img src={currentSociety.logoUrl} className="w-full h-full object-contain" />
                  ) : (
                    <Plus className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Society Logo</h4>
                  <p className="text-xs text-slate-500">Visible on Resident Dashboard & Passes.</p>
                </div>
              </div>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentTab === 'facilities') {
    const pendingClub = clubhouseBookings.filter(b => b.societyId === currentUser?.societyId && b.status === 'PENDING');
    const pendingEvents = eventRequests.filter(e => e.societyId === currentUser?.societyId && e.status === 'PENDING');

    return (
      <div className="space-y-6 fade-in">
        <h2 className="text-xl font-bold text-slate-800">Facilities & Events Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border shadow-none">
            <CardHeader className="border-b"><CardTitle>Clubhouse Bookings</CardTitle></CardHeader>
            <CardContent className="pt-4 divide-y">
              {pendingClub.length === 0 && <p className="text-sm text-slate-500 py-4">No pending bookings.</p>}
              {pendingClub.map(b => (
                <div key={b.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{b.facilityName}</h4>
                    <p className="text-xs text-slate-500">By Flat {b.flatNo} on {format(new Date(b.date), 'MMM dd')} ({b.timeSlot})</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => updateClubhouseBookingStatus(b.id, 'DECLINED')}>Deny</Button>
                    <Button size="sm" onClick={() => updateClubhouseBookingStatus(b.id, 'APPROVED')}>Approve</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border shadow-none">
            <CardHeader className="border-b"><CardTitle>Event Requests</CardTitle></CardHeader>
            <CardContent className="pt-4 divide-y">
              {pendingEvents.length === 0 && <p className="text-sm text-slate-500 py-4">No pending events.</p>}
              {pendingEvents.map(e => (
                <div key={e.id} className="py-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-900">{e.title}</h4>
                    <p className="text-xs text-slate-500">By Flat {e.flatNo} on {format(new Date(e.date), 'MMM dd')}</p>
                    <p className="text-[11px] mt-1 italic text-slate-400">{e.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => updateEventRequestStatus(e.id, 'DECLINED')}>Deny</Button>
                    <Button size="sm" onClick={() => updateEventRequestStatus(e.id, 'APPROVED')}>Approve</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentTab === 'financials') {
    return (
        <div className="space-y-6 fade-in flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-[24px]">
            <Card className="flex flex-col border-border shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle>Financial Hub Overview</CardTitle>
                <span className="text-[12px] text-accent font-[600]">Generate Reports</span>
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px] p-[20px]">
                <div className="bg-[#f9fafb] p-[16px] rounded-[8px]">
                  <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Maintenance Collected</p>
                  <p className="text-[20px] font-[700] text-text-main">₹{totalCollected.toLocaleString()}</p>
                </div>
                <div className="bg-[#f9fafb] p-[16px] rounded-[8px]">
                  <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Pending Dues</p>
                  <p className="text-[20px] font-[700] text-danger">₹{totalDue.toLocaleString()}</p>
                </div>
                <div className="bg-[#f9fafb] p-[16px] rounded-[8px]">
                  <p className="text-[12px] text-text-muted uppercase tracking-[0.05em] mb-[8px]">Monthly Expenses</p>
                  <p className="text-[20px] font-[700] text-text-main">₹{totalExpenses.toLocaleString()}</p>
                </div>
              </div>

              <div className="px-[20px] pb-[20px] flex-1">
                
                <div className="bg-gray-50 border border-border p-4 rounded-lg mb-6">
                  <h4 className="text-[13px] font-[700] text-text-main mb-3">Generate Monthly Dues</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input 
                      placeholder="e.g. May 2026" 
                      value={maintenanceMonth} 
                      onChange={e => setMaintenanceMonth(e.target.value)} 
                      className="flex-1 bg-white"
                    />
                    <Input 
                      type="number"
                      placeholder="Amount (₹)" 
                      value={maintenanceAmount} 
                      onChange={e => setMaintenanceAmount(e.target.value)} 
                      className="w-full sm:w-32 bg-white"
                    />
                    <Button onClick={handleGenerateMaintenance} className="shrink-0">Issue All</Button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-[12px]">
                  <h4 className="text-[13px] text-text-muted">Recent Maintenance Requests</h4>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex text-[11px] font-normal text-text-muted uppercase pb-[12px]">
                    <div className="flex-1">Flat No</div>
                    <div className="w-[80px]">Status</div>
                    <div className="w-[80px] text-right">Amount</div>
                  </div>
                  {maintenanceDues.map(due => (
                    <div key={due.id} className="flex items-center py-[10px] border-t border-[#f3f4f6]">
                      <div className="flex-1 text-[13px]">Flat {due.flatNo}</div>
                      <div className="w-[80px] text-[13px]">
                        <span className={`px-[8px] py-[4px] rounded-[4px] text-[10px] font-[700] uppercase inline-block ${due.status === 'PAID' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-[#fee2e2] text-[#991b1b]'}`}>
                          {due.status}
                        </span>
                      </div>
                      <div className="w-[80px] text-[13px] font-[500] text-right">₹{due.amount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="flex flex-col border-border shadow-none">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border">
                <CardTitle>Expense Tracker</CardTitle>
                <span className="px-[8px] py-[4px] rounded-[4px] text-[10px] font-[700] uppercase bg-accent text-white">Live</span>
              </CardHeader>
              <CardContent className="flex-1 p-[16px] flex flex-col gap-[16px]">
                <div className="text-[11px] uppercase font-[700] text-text-muted">Recent Expenses</div>
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between items-center bg-white border border-border p-[12px] rounded-[8px]">
                    <div className="flex items-center gap-[12px] flex-1">
                      <div className="hidden sm:flex w-[32px] h-[32px] bg-gray-100 rounded-[6px] items-center justify-center text-[8px] text-gray-400 text-center uppercase font-[600]">
                         LOG
                      </div>
                      <div>
                        <p className="font-[600] text-[14px] text-text-main">{e.category}</p>
                        <p className="text-[12px] text-text-muted">{format(new Date(e.date), 'MMM dd, yyyy')}</p>
                      </div>
                    </div>
                    <p className="font-[600] text-[14px]">₹{e.amount.toLocaleString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
    );
  }

  if (currentTab === 'complaints') {
    return (
        <div className="space-y-6 fade-in">
          <Card className="border-border shadow-none">
            <CardHeader className="border-b border-border pb-[16px]">
              <CardTitle>Complaint Resolution Queue</CardTitle>
            </CardHeader>
            <CardContent className="pt-[16px]">
              <div className="divide-y divide-border">
                {complaints.length === 0 && <p className="text-text-muted text-sm pb-4">No complaints logged.</p>}
                {complaints.map(c => (
                  <div key={c.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-[600] bg-gray-100 text-text-muted px-2 py-1 rounded">FLAT {c.flatNo}</span>
                        <h4 className="font-[600] text-text-main">{c.title}</h4>
                      </div>
                      <p className="text-[13px] text-text-muted mt-1">{c.description}</p>
                    </div>
                    
                    <div className="shrink-0 flex items-center space-x-2">
                      {c.status === 'OPEN' ? (
                        <div className="bg-gray-50 border border-border p-3 rounded-lg flex items-center space-x-2">
                          <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 border rounded-md text-xs hover:bg-gray-50 transition-colors">
                            <Upload className="h-3 w-3" />
                            <span>{resPicUrl ? 'Photo Selected' : 'Choose Proof'}</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setResPicUrl(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          <Button 
                            size="sm" 
                            className="h-8"
                            disabled={!resPicUrl}
                            onClick={() => {
                              resolveComplaint(c.id, resPicUrl);
                              setResPicUrl('');
                            }}
                          >
                            Submit Resolution
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center text-success text-[13px] font-[600]">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Resolved
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    );
  }

  if (currentTab === 'communication') {
    return (
      <div className="space-y-6 fade-in max-w-4xl">
        <Card className="border-border shadow-none">
          <CardHeader className="border-b border-border pb-[16px]">
            <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-accent" /> New Notice / Broadcast</CardTitle>
          </CardHeader>
          <CardContent className="pt-[16px] space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">Notice Title</label>
              <Input placeholder="e.g. Water Supply Interruption" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-main">Message Content</label>
              <textarea 
                className="w-full min-h-[100px] border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                placeholder="Write your announcement here..."
                value={noticeContent}
                onChange={e => setNoticeContent(e.target.value)}
              />
            </div>
            <Button onClick={handleAddNotice} className="w-full sm:w-auto"><Bell className="w-4 h-4 mr-2"/> Publish Notice to All Residents</Button>
          </CardContent>
        </Card>

        <h3 className="text-lg font-bold text-text-main">Recent Announcements</h3>
        <div className="space-y-4">
          {notices.length === 0 && <p className="text-sm text-text-muted">No notices found.</p>}
          {notices.map(n => (
            <Card key={n.id} className="shadow-none border-border">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-text-main">{n.title}</h4>
                  <span className="text-xs text-text-muted">{format(new Date(n.date), 'MMM dd, hh:mm a')}</span>
                </div>
                <p className="text-sm text-text-muted mb-2">{n.content}</p>
                <div className="text-xs font-semibold text-accent">- Published by {n.author}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (currentTab === 'staff') {
    return (
      <div className="space-y-6 fade-in max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <Card className="shadow-none border-border h-fit">
            <CardHeader className="border-b border-border pb-[16px]">
              <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5" /> Add Staff Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Staff Name</label>
                <Input placeholder="e.g. Rahul Kumar" value={staffName} onChange={e => setStaffName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Login ID (Unique)</label>
                <Input placeholder="e.g. guard_gate2" value={staffLoginId} onChange={e => setStaffLoginId(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Role</label>
                <select 
                  className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white"
                  value={staffRole}
                  onChange={e => setStaffRole(e.target.value as any)}
                >
                  <option value="GUARD">Security Guard</option>
                  <option value="HOUSEKEEPING">Housekeeping</option>
                  <option value="SECRETARY">Assistant Admin (Sub-Admin)</option>
                </select>
              </div>
              <Button onClick={handleAddStaff} className="w-full">Create Account</Button>
            </CardContent>
          </Card>

          <Card className="shadow-none border-border">
            <CardHeader className="border-b border-border pb-[16px]">
              <CardTitle>Active Staff Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {staffMembers.map(u => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-text-muted font-bold">
                        {u.name.substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-text-main">{u.name}</p>
                        <p className="text-xs text-text-muted font-mono">{u.loginId}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-accent-soft text-accent text-xs font-bold rounded-md">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[24px] fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-none border border-border bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-muted">Total Run Rate</h3>
              <Wallet className="w-5 h-5 text-accent" />
            </div>
            <p className="text-3xl font-bold text-text-main">₹{totalCollected.toLocaleString()}</p>
            <p className="text-sm text-text-muted mt-2">Dues collected this month</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-border bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-muted">Active Complaints</h3>
              <ShieldAlert className="w-5 h-5 text-danger" />
            </div>
            <p className="text-3xl font-bold text-danger">{openComplaints}</p>
            <p className="text-sm text-text-muted mt-2">Needs your attention</p>
          </CardContent>
        </Card>
        <Card className="shadow-none border border-border bg-gradient-to-br from-white to-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text-muted">Staff Active</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{staffMembers.length}</p>
            <p className="text-sm text-text-muted mt-2">Guards & HK in roster</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none border-border">
           <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              {complaints.slice(0, 3).map(c => (
                <div key={c.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-bold">Flat {c.flatNo}</span> logged a complaint: {c.title}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${c.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{c.status}</span>
                </div>
              ))}
              {expenses.slice(0, 3).map(e => (
                 <div key={e.id} className="flex justify-between items-center text-sm border-t border-border pt-4">
                  <div>
                    Spent on <span className="font-bold">{e.category}</span>
                  </div>
                  <span className="font-bold">₹{e.amount}</span>
                 </div>
              ))}
           </CardContent>
        </Card>
        
        <Card className="shadow-none border-border bg-accent text-white">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <Button variant="secondary" className="w-full h-32 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm whitespace-normal" onClick={() => window.location.hash = '#/secretary/financials'}>
               <FileText className="w-6 h-6" />
               Generate<br/>Maintenance Dues
             </Button>
             <Button variant="secondary" className="w-full h-32 flex flex-col items-center justify-center gap-2 text-center text-xs sm:text-sm whitespace-normal" onClick={() => window.location.hash = '#/secretary/staff'}>
               <Users className="w-6 h-6" />
               Add New<br/>Staff Member
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
