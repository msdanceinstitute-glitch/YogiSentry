import React, { useState, useRef } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, XCircle, Bell, Car, X, Package as PackageIcon, Info, Megaphone, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';

export default function Resident() {
  const { 
    currentUser, 
    maintenanceDues, 
    markMaintenancePaid, 
    vehicles, 
    visitorRequests, 
    parcels, 
    updateVisitorStatus, 
    addVehicle, 
    notices, 
    addNotice,
    clubhouseBookings,
    addClubhouseBooking,
    eventRequests,
    addEventRequest
  } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.split('/').pop() || 'resident';
  
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Facility Form State
  const [facilityName, setFacilityName] = useState('Gym');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');

  // Vehicle form
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [newVehicleId, setNewVehicleId] = useState('');
  const [frontPhotoUrl, setFrontPhotoUrl] = useState('');
  const [backPhotoUrl, setBackPhotoUrl] = useState('');
  const frontPhotoRef = useRef<HTMLInputElement>(null);
  const backPhotoRef = useRef<HTMLInputElement>(null);

  // Communication form
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  const myVisitors = visitorRequests.filter(v => v.societyId === currentUser?.societyId && v.flatNo === currentUser?.flatNo);
  const myParcels = parcels.filter(p => p.societyId === currentUser?.societyId && p.flatNo === currentUser?.flatNo);
  const myBookings = clubhouseBookings.filter(b => b.societyId === currentUser?.societyId && b.flatNo === currentUser?.flatNo);
  const myEvents = eventRequests.filter(e => e.societyId === currentUser?.societyId && e.flatNo === currentUser?.flatNo);

  const handleUpdateStatus = (requestId: string, newStatus: 'APPROVED' | 'DECLINED') => {
    updateVisitorStatus(requestId, newStatus);
  };

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>, setPhotoUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!bookingDate || !bookingTime) return alert("Please select date and time.");
    addClubhouseBooking({
      id: `bk_${Date.now()}`,
      societyId: currentUser?.societyId || '',
      flatNo: currentUser?.flatNo || '',
      facilityName,
      date: bookingDate,
      timeSlot: bookingTime,
      status: 'PENDING',
      requestedBy: currentUser?.name || ''
    });
    setBookingDate(''); setBookingTime('');
    alert("Booking request sent to secretary!");
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!eventTitle || !eventDate) return alert("Title and Date required.");
    addEventRequest({
      id: `ev_${Date.now()}`,
      societyId: currentUser?.societyId || '',
      flatNo: currentUser?.flatNo || '',
      title: eventTitle,
      description: eventDesc,
      date: eventDate,
      status: 'PENDING',
      requestedBy: currentUser?.name || ''
    });
    setEventTitle(''); setEventDesc(''); setEventDate('');
    alert("Event request submitted for approval!");
  };

  const handleRegisterVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleId || !frontPhotoUrl || !backPhotoUrl) {
      alert("Please provide vehicle ID, front photo, and back photo");
      return;
    }
    
    addVehicle({
      id: `v_${Date.now()}`,
      flatNo: currentUser!.flatNo!,
      vehicleId: newVehicleId,
      frontPhoto: frontPhotoUrl,
      backPhoto: backPhotoUrl,
      societyId: currentUser?.societyId || ''
    });
    
    setNewVehicleId('');
    setFrontPhotoUrl('');
    setBackPhotoUrl('');
    setShowAddVehicle(false);
    alert('Vehicle registered successfully!');
  };

  const handleAddNotice = () => {
    if (!noticeTitle || !noticeContent) return alert("Title and Content required!");
    addNotice({
      id: `notice_${Date.now()}`,
      title: noticeTitle,
      content: noticeContent,
      author: currentUser?.name || 'Resident',
      date: new Date().toISOString(),
      societyId: currentUser?.societyId || ''
    });
    setNoticeTitle('');
    setNoticeContent('');
    alert("Notice posted successfully!");
  };

  if (!currentUser?.flatNo) return <div>Missing Resident Data</div>;

  const myDues = maintenanceDues.filter(m => m.flatNo === currentUser.flatNo);
  const myVehicles = vehicles.filter(v => v.flatNo === currentUser.flatNo);

  const pendingDues = myDues.filter(m => m.status === 'UNPAID');
  const paidDues = myDues.filter(m => m.status === 'PAID');
  
  const showVehiclePrompt = currentTab === 'resident' && myVehicles.length === 0;

  return (
    <>
      <div className="space-y-[32px] fade-in">
        {currentTab === 'vehicles' ? (
          <div className="space-y-[24px]">
            {showAddVehicle ? (
              <Card className="border-border shadow-none fade-in">
                <CardHeader className="border-b border-border pb-[16px]">
                  <CardTitle>Register New Vehicle</CardTitle>
                </CardHeader>
                <CardContent className="pt-[16px]">
                  <form onSubmit={handleRegisterVehicle} className="space-y-4 max-w-md">
                    <div className="space-y-2">
                       <label className="text-sm font-semibold">Vehicle ID (License Plate)</label>
                       <Input placeholder="e.g. DL 01 AB 1234" value={newVehicleId} onChange={e => setNewVehicleId(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-text-muted relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                        onClick={() => frontPhotoRef.current?.click()}
                      >
                       <input type="file" accept="image/*" className="hidden" ref={frontPhotoRef} onChange={(e) => handleFileCapture(e, setFrontPhotoUrl)} />
                       {frontPhotoUrl ? (
                         <img src={frontPhotoUrl} className="absolute inset-0 w-full h-full object-cover" alt="Front" />
                       ) : (
                         <span className="text-xs font-semibold text-center p-2">Front Photo<br/>(Gallery/Camera)</span>
                       )}
                      </div>
                      <div 
                        className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center text-text-muted relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300"
                        onClick={() => backPhotoRef.current?.click()}
                      >
                       <input type="file" accept="image/*" className="hidden" ref={backPhotoRef} onChange={(e) => handleFileCapture(e, setBackPhotoUrl)} />
                       {backPhotoUrl ? (
                         <img src={backPhotoUrl} className="absolute inset-0 w-full h-full object-cover" alt="Back" />
                       ) : (
                         <span className="text-xs font-semibold text-center p-2">Back Photo<br/>(Gallery/Camera)</span>
                       )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <Button type="button" variant="outline" className="flex-1" onClick={() => setShowAddVehicle(false)}>Cancel</Button>
                       <Button type="submit" className="flex-1">Save Vehicle</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border shadow-none fade-in">
                <CardHeader className="border-b border-border pb-[16px] flex flex-row items-center justify-between">
                  <CardTitle>My Vehicles</CardTitle>
                  <Button size="sm" className="h-[32px]" onClick={() => setShowAddVehicle(true)}>
                    <Car className="h-[14px] w-[14px] mr-[4px]"/> Add Vehicle
                  </Button>
                </CardHeader>
                <CardContent className="pt-[16px]">
                    <div className="space-y-[12px]">
                      {myVehicles.map(v => (
                        <div key={v.id} className="flex flex-col sm:flex-row gap-[16px] p-[16px] bg-white border border-border rounded-[8px]">
                          <div className="flex gap-2 shrink-0">
                            <img src={v.frontPhoto} alt="front" className="w-[80px] h-[60px] rounded-[6px] object-cover cursor-pointer hover:opacity-80" onClick={()=>setZoomedImage(v.frontPhoto)} />
                            <img src={v.backPhoto} alt="back" className="w-[80px] h-[60px] rounded-[6px] object-cover cursor-pointer hover:opacity-80" onClick={()=>setZoomedImage(v.backPhoto)} />
                          </div>
                          <div>
                            <p className="text-[11px] uppercase text-text-muted font-[600] tracking-wide mb-[2px]">Vehicle ID</p>
                            <p className="font-mono font-[700] text-text-main text-[16px]">{v.vehicleId}</p>
                            <p className="text-[12px] text-text-muted mt-1">Status: Active</p>
                          </div>
                        </div>
                      ))}
                      {myVehicles.length === 0 && (
                        <div className="text-center py-[40px] text-text-muted border border-dashed border-border rounded-[8px]">
                          <Car className="h-[32px] w-[32px] mx-auto mb-[12px] opacity-30" />
                          <p className="font-[600] mb-[4px] text-text-main text-[15px]">No Vehicles Registered</p>
                          <p className="text-[13px] mb-[16px]">Register your vehicles for faster seamless gate entry.</p>
                          <Button variant="outline" onClick={() => setShowAddVehicle(true)}><Car className="w-4 h-4 mr-2" /> Start Registration</Button>
                        </div>
                      )}
                    </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : currentTab === 'dues' ? (
          <div className="space-y-[24px] fade-in">
            <Card className="border-border shadow-none">
              <CardHeader className="border-b border-border pb-[16px]">
                <CardTitle>Pending Dues</CardTitle>
              </CardHeader>
              <CardContent className="pt-[16px]">
                <div className="space-y-[16px]">
                  {pendingDues.map(due => (
                    <div key={due.id} className={`p-[16px] rounded-[8px] border border-danger bg-red-50/30 shadow-sm flex items-center justify-between`}>
                      <div>
                          <p className="font-[600] text-text-main text-[14px]">Maintenance Due</p>
                          <p className="text-[12px] text-text-muted">{due.month}</p>
                      </div>
                      <div className="flex items-center gap-[16px]">
                          <p className={`font-mono text-[18px] font-[700] text-danger`}>₹{due.amount}</p>
                          <Button size="sm" onClick={() => markMaintenancePaid(due.id)}>Pay via UPI</Button>
                      </div>
                    </div>
                  ))}
                  {pendingDues.length === 0 && <p className="text-[13px] text-text-muted py-[8px]">No pending dues.</p>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none">
              <CardHeader className="border-b border-border pb-[16px]">
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="pt-[16px]">
                <div className="space-y-[16px]">
                  {paidDues.map(due => (
                    <div key={due.id} className={`p-[16px] rounded-[8px] border border-border bg-[#f9fafb] flex items-center justify-between`}>
                      <div>
                          <p className="font-[600] text-text-main text-[14px]">Maintenance</p>
                          <p className="text-[12px] text-text-muted">{due.month}</p>
                      </div>
                      <div className="flex flex-col items-end gap-[4px]">
                          <p className={`font-mono text-[16px] font-[700] text-text-main`}>₹{due.amount}</p>
                          <span className="text-[10px] font-[700] text-success tracking-wider uppercase bg-green-100 px-[6px] py-[2px] rounded-[4px]">Paid</span>
                      </div>
                    </div>
                  ))}
                  {paidDues.length === 0 && <p className="text-[13px] text-text-muted py-[8px]">No payment history recorded.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : currentTab === 'facilities' ? (
          <div className="space-y-6 fade-in max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border shadow-none">
                <CardHeader><CardTitle>Book Clubhouse Facility</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Facility</label>
                      <select className="w-full h-10 border rounded-md px-3 text-sm" value={facilityName} onChange={e=>setFacilityName(e.target.value)}>
                        <option value="Gym">Gymnasium</option>
                        <option value="Pool">Swimming Pool</option>
                        <option value="Hall">Community Hall</option>
                        <option value="Court">Badminton Court</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Date</label>
                      <Input type="date" value={bookingDate} onChange={e=>setBookingDate(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Time Slot</label>
                      <Input placeholder="e.g. 6:00 PM - 7:00 PM" value={bookingTime} onChange={e=>setBookingTime(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full">Request Booking</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none">
                <CardHeader><CardTitle>Request Private Event</CardTitle></CardHeader>
                <CardContent>
                  <form onSubmit={handleEventSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Event Title</label>
                      <Input placeholder="e.g. Birthday Party" value={eventTitle} onChange={e=>setEventTitle(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Date</label>
                      <Input type="date" value={eventDate} onChange={e=>setEventDate(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold mb-1 block">Description</label>
                      <textarea className="w-full border rounded-md p-2 text-sm h-16" value={eventDesc} onChange={e=>setEventDesc(e.target.value)} placeholder="Short details..."/>
                    </div>
                    <Button type="submit" variant="outline" className="w-full">Submit Request</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border shadow-none">
               <CardHeader><CardTitle>My Request Status</CardTitle></CardHeader>
               <CardContent className="p-0">
                 <div className="divide-y">
                   {myBookings.map(b => (
                     <div key={b.id} className="p-4 flex justify-between items-center text-sm">
                       <div>
                         <span className="font-bold">{b.facilityName}</span>
                         <p className="text-xs text-slate-500">{b.date} at {b.timeSlot}</p>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : b.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{b.status}</span>
                     </div>
                   ))}
                   {myEvents.map(e => (
                     <div key={e.id} className="p-4 flex justify-between items-center text-sm">
                       <div>
                         <span className="font-bold italic">{e.title}</span>
                         <p className="text-xs text-slate-500">Event on {e.date}</p>
                       </div>
                       <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${e.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : e.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span>
                     </div>
                   ))}
                   {myBookings.length === 0 && myEvents.length === 0 && <p className="p-8 text-center text-slate-500">No facilities requests yet.</p>}
                 </div>
               </CardContent>
            </Card>
          </div>
        ) : currentTab === 'communication' ? (
          <div className="space-y-6 fade-in max-w-4xl">
            <Card className="border-border shadow-none">
              <CardHeader className="border-b border-border pb-[16px]">
                <CardTitle className="flex items-center gap-2"><Megaphone className="w-5 h-5 text-accent" /> Post to Community Board</CardTitle>
              </CardHeader>
              <CardContent className="pt-[16px] space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Notice Title</label>
                  <Input placeholder="e.g. Hosting a game night" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-text-main">Message Content</label>
                  <textarea 
                    className="w-full min-h-[100px] border border-border rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
                    placeholder="Write your message to the residents..."
                    value={noticeContent}
                    onChange={e => setNoticeContent(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddNotice} className="w-full sm:w-auto"><FileText className="w-4 h-4 mr-2"/> Publish Board Notice</Button>
              </CardContent>
            </Card>

            <h3 className="text-lg font-bold text-text-main">Community Noticeboard</h3>
            <div className="space-y-4">
              {notices.length === 0 && <p className="text-sm text-text-muted">No notices posted yet.</p>}
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
        ) : (
          <>
            {showVehiclePrompt && (
              <div className="bg-accent-soft border border-accent p-4 rounded-[12px] flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-[700] text-accent text-[15px]">Setup your Vehicle Registration</h4>
                    <p className="text-[13px] text-text-muted mt-0.5">You have no vehicles registered. Add them now for seamless gate entry.</p>
                  </div>
                </div>
                <Button onClick={() => navigate('/resident/vehicles')} className="shrink-0 w-full sm:w-auto shadow-sm hover:shadow-md transition-all">Register Now</Button>
              </div>
            )}

            {/* Notifications / Pending Actions */}
            <section>
              <h3 className="text-[18px] font-[700] tracking-[-0.01em] text-text-main mb-[16px] flex items-center gap-[8px]">
                <Bell className="h-[20px] w-[20px] text-accent" /> Action Required
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {/* Visitor Alerts */}
                {myVisitors.filter(v => v.status === 'PENDING').map(req => (
                  <div key={req.id} className="bg-white border-l-[4px] border-[#f59e0b] p-[16px] rounded-[8px] border border-y-border border-r-border shadow-sm flex flex-col sm:flex-row gap-[16px] sm:items-center justify-between">
                    <div className="flex items-center gap-[16px]">
                        <div className="relative shrink-0">
                          <img 
                            src={req.photoUrl} 
                            alt="Visitor" 
                            className="w-[56px] h-[56px] rounded-[8px] object-cover cursor-pointer hover:opacity-80" 
                            onClick={()=>setZoomedImage(req.photoUrl)} 
                          />
                          {req.vehiclePhotoUrl && (
                            <img 
                              src={req.vehiclePhotoUrl} 
                              alt="Vehicle" 
                              className="absolute -bottom-2 -right-2 w-[24px] h-[24px] rounded-full object-cover border-[2px] border-white cursor-pointer hover:scale-110" 
                              onClick={()=>setZoomedImage(req.vehiclePhotoUrl!)}
                            />
                          )}
                        </div>
                       <div>
                         <p className="text-[11px] font-[600] uppercase text-text-muted">Visitor Request</p>
                         <p className="font-[600] text-text-main">{req.visitorName}</p>
                         <p className="text-[12px] text-text-muted">
                          {format(new Date(req.timestamp), 'h:mm a')}
                          {req.vehicleId && ` • Vehicle: ${req.vehicleId}`}
                         </p>
                       </div>
                    </div>
                    <div className="flex gap-[8px] shrink-0">
                      <Button size="sm" variant="outline" className="border-danger text-danger hover:bg-red-50" onClick={() => handleUpdateStatus(req.id, 'DECLINED')}>
                        <XCircle className="mr-[4px] h-[14px] w-[14px]" /> Deny
                      </Button>
                      <Button size="sm" className="bg-success hover:bg-green-700" onClick={() => handleUpdateStatus(req.id, 'APPROVED')}>
                        <CheckCircle2 className="mr-[4px] h-[14px] w-[14px]" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Parcel Alerts */}
                {myParcels.filter(p => p.status === 'AT_GATE').map(parcel => (
                  <div key={parcel.id} className="bg-white border-l-[4px] border-accent p-[16px] rounded-[8px] border border-y-border border-r-border shadow-sm flex flex-col sm:flex-row gap-[16px] sm:items-center justify-between">
                    <div className="flex items-center gap-[16px]">
                       <div className="relative shrink-0">
                          <img 
                            src={parcel.photoUrl} 
                            alt="Parcel" 
                            className="w-[56px] h-[56px] rounded-[8px] object-cover cursor-pointer hover:opacity-80" 
                            onClick={()=>setZoomedImage(parcel.photoUrl)} 
                          />
                       </div>
                       <div>
                         <p className="text-[11px] font-[600] uppercase text-text-muted">Parcel Delivered</p>
                         <p className="font-[600] text-text-main border-b border-dashed border-gray-300 pb-[2px] inline-flex items-center gap-1">
                            {parcel.carrierName} <PackageIcon className="w-3 h-3 text-text-muted" />
                         </p>
                         <p className="text-[12px] text-text-muted mt-1">
                          Received at Gate • {format(new Date(parcel.timeAdded), 'h:mm a')}
                         </p>
                       </div>
                    </div>
                    <div className="shrink-0 flex items-center h-full">
                       <span className="px-3 py-1.5 bg-accent-soft text-accent text-xs font-bold rounded-full border border-accent/20">
                         Awaiting Collection
                       </span>
                    </div>
                  </div>
                ))}

                {/* Unpaid Dues */}
                {pendingDues.map(due => (
                   <div key={due.id} className="bg-white border-l-[4px] border-danger p-[16px] rounded-[8px] border border-y-border border-r-border shadow-sm flex items-center justify-between">
                      <div>
                         <p className="font-[600] text-text-main text-[13px]">Maintenance Due</p>
                         <p className="text-[12px] text-text-muted">{due.month}</p>
                      </div>
                      <div className="flex items-center gap-[16px]">
                         <p className="font-mono text-[18px] font-[700]">₹{due.amount}</p>
                         <Button size="sm" onClick={() => markMaintenancePaid(due.id)}>Pay via UPI</Button>
                      </div>
                   </div>
                ))}

                {myVisitors.filter(v => v.status === 'PENDING').length === 0 && myParcels.filter(p => p.status === 'AT_GATE').length === 0 && pendingDues.length === 0 && (
                  <div className="col-span-full py-8 text-center text-text-muted border border-dashed border-border rounded-[8px] flex flex-col items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success opacity-50" />
                    <p className="text-[14px]">You're all caught up!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
              <Card className="border-border shadow-none">
                <CardHeader className="border-b border-border pb-[16px]">
                  <CardTitle>Recent Gate Alerts</CardTitle>
                </CardHeader>
                <CardContent className="pt-[16px]">
                  <div className="space-y-[8px]">
                    {myVisitors.filter(v => v.status === 'APPROVED' || v.status === 'EXITED').slice(0, 3).map(v => (
                      <div key={v.id} className="flex justify-between items-center p-[8px] hover:bg-gray-50 rounded-[6px] transition-colors border border-border/50 mb-2">
                        <div className="flex items-center gap-[12px]">
                           <img src={v.photoUrl} alt="" className="w-[32px] h-[32px] rounded-full object-cover cursor-pointer hover:opacity-80" onClick={()=>setZoomedImage(v.photoUrl)} />
                           <div>
                             <span className="font-[600] text-[13px] text-text-main block">{v.visitorName}</span>
                             <span className="text-[10px] text-text-muted">{format(new Date(v.timestamp), 'MMM dd, h:mm a')}</span>
                           </div>
                        </div>
                        <span className={`text-[10px] font-[700] uppercase tracking-[0.05em] px-[8px] py-[2px] rounded-full ${v.status === 'APPROVED' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-gray-100 text-gray-600'}`}>
                          {v.status === 'APPROVED' ? 'INSIDE' : 'EXITED'}
                        </span>
                      </div>
                    ))}
                    {myParcels.filter(p => p.status === 'AT_GATE' || p.status === 'COLLECTED').slice(0, 2).map(p => (
                      <div key={p.id} className="flex justify-between items-center p-[8px] hover:bg-gray-50 rounded-[6px] transition-colors border border-border/50 mb-2">
                        <div className="flex items-center gap-[12px]">
                           <div className="w-[32px] h-[32px] rounded-full bg-accent-soft flex items-center justify-center text-accent">
                             <PackageIcon className="w-4 h-4"/>
                           </div>
                           <div>
                             <span className="font-[600] text-[13px] text-text-main block">Package Delivered</span>
                             <span className="text-[10px] text-text-muted">{format(new Date(p.timeAdded), 'MMM dd, h:mm a')}</span>
                           </div>
                        </div>
                        <span className={`text-[10px] font-[700] uppercase tracking-[0.05em] px-[8px] py-[2px] rounded-full bg-[#dcfce7] text-[#166534]`}>
                          Logged
                        </span>
                      </div>
                    ))}
                    {(myVisitors.filter(v => v.status === 'APPROVED' || v.status === 'EXITED').length === 0 && myParcels.length === 0) && <p className="text-[13px] text-text-muted py-[8px]">No recent gate activity.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none group cursor-pointer hover:border-accent transition-colors" onClick={() => navigate('/resident/vehicles')}>
                <CardHeader className="border-b border-border pb-[16px] flex flex-row items-center justify-between group-hover:bg-gray-50 transition-colors">
                  <CardTitle>My Vehicles</CardTitle>
                  <span className="text-[12px] text-text-muted font-[500] group-hover:text-accent transition-colors">View All &rarr;</span>
                </CardHeader>
                <CardContent className="pt-[16px]">
                   <div className="space-y-[12px]">
                     {myVehicles.slice(0, 3).map(v => (
                       <div key={v.id} className="flex gap-[16px] p-[12px] bg-[#f9fafb] border border-border rounded-[8px]">
                          <img src={v.frontPhoto} alt="car" className="w-[64px] h-[48px] rounded-[4px] object-cover" />
                          <div>
                            <p className="text-[10px] uppercase text-text-muted font-[600] tracking-wide mb-[2px]">Vehicle ID</p>
                            <p className="font-mono font-[700] text-text-main text-[14px]">{v.vehicleId}</p>
                          </div>
                       </div>
                     ))}
                     {myVehicles.length === 0 && (
                        <div className="flex flex-col items-center py-[16px]">
                          <Car className="w-8 h-8 text-text-muted opacity-40 mb-2"/>
                          <p className="text-[13px] font-[600] text-text-main">No registered vehicles.</p>
                          <p className="text-xs text-text-muted mt-0.5">Click to add</p>
                        </div>
                     )}
                   </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {zoomModal(zoomedImage, setZoomedImage)}
    </>
  );
}

function zoomModal(imageStr: string | null, setImageFn: (val: string | null) => void) {
  if (!imageStr) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
       <div className="relative max-w-[90vw] max-h-[90vh]">
         <button 
           className="absolute -top-12 right-0 md:-right-12 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
           onClick={() => setImageFn(null)}
         >
           <X className="w-6 h-6" />
         </button>
         <img src={imageStr} className="w-full h-full object-contain rounded-lg shadow-2xl" alt="Previewing" />
       </div>
    </div>
  );
}
