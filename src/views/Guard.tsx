import React, { useState, useEffect, useRef } from 'react';
import { useStore, VisitorRequest, Parcel } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, UserPlus, Clock, Package as PackageIcon, Car, X, Loader2, QrCode, Barcode, CheckCircle2, ScanLine } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';

export default function Guard() {
  const { currentUser, parcels, visitorRequests, addVisitorRequest, addParcel, updateParcelStatus, updateVisitorStatus, permanentPasses } = useStore();
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'guard';

  const [activePassViewer, setActivePassViewer] = useState<VisitorRequest | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [reason, setReason] = useState<'GUEST' | 'FOOD_DELIVERY' | 'TECHNICIAN'>('GUEST');

  const [visitorPhoto, setVisitorPhoto] = useState<string | null>(null);
  const [vehiclePhoto, setVehiclePhoto] = useState<string | null>(null);
  const [vehicleId, setVehicleId] = useState('');
  const [isExtractingVehicle, setIsExtractingVehicle] = useState(false);

  // Permanent Pass State
  const [permPassName, setPermPassName] = useState('');
  const [permPassRole, setPermPassRole] = useState('Househelp');
  const [permPassMobile, setPermPassMobile] = useState('');
  const [permPassPhoto, setPermPassPhoto] = useState<string | null>(null);
  const permPhotoRef = useRef<HTMLInputElement>(null);

  const [carrierName, setCarrierName] = useState('');
  const [parcelFlatNo, setParcelFlatNo] = useState('');
  const [parcelPhoto, setParcelPhoto] = useState<string | null>(null);

  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const myParcels = (parcels || []).filter(p => p.societyId === currentUser?.societyId);
  const myVisitorRequests = (visitorRequests || []).filter(v => v.societyId === currentUser?.societyId);
  const myPasses = (permanentPasses || []).filter(p => p.societyId === currentUser?.societyId);

  // Hidden file inputs for hardware camera capture
  const visitorPhotoRef = useRef<HTMLInputElement>(null);
  const vehiclePhotoRef = useRef<HTMLInputElement>(null);
  const parcelPhotoRef = useRef<HTMLInputElement>(null);

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureVehicle = () => {
    vehiclePhotoRef.current?.click();
  };

  const handleAddVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if(!name || !flatNo || !visitorPhoto || !mobileNo || !currentUser?.societyId) return alert("Missing required fields or society context.");

    const newId = `vis_${Date.now()}`;
    addVisitorRequest({
      id: newId,
      visitorName: name,
      flatNo,
      photoUrl: visitorPhoto,
      vehiclePhotoUrl: vehiclePhoto || undefined,
      vehicleId: vehicleId || "",
      mobileNo,
      guestCount,
      reason,
      status: 'PENDING',
      timestamp: new Date().toISOString(),
      societyId: currentUser.societyId,
    });

    setName('');
    setFlatNo('');
    setMobileNo('');
    setGuestCount(1);
    setReason('GUEST');
    setVehicleId('');
    setVisitorPhoto(null);
    setVehiclePhoto(null);
  };

  const handleAddPermanentPass = (e: React.FormEvent) => {
    e.preventDefault();
    if(!permPassName || !permPassMobile || !permPassRole || !currentUser?.societyId) return alert("Missing required fields");
    
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);

    useStore.getState().addPermanentPass({
      id: `perm_${Date.now()}`,
      name: permPassName,
      role: permPassRole,
      mobileNo: permPassMobile,
      validUntil: validUntil.toISOString(),
      photoUrl: permPassPhoto || undefined,
      societyId: currentUser.societyId,
    });

    setPermPassName('');
    setPermPassMobile('');
    setPermPassPhoto(null);
    alert("Permanent Pass Valid for 3 Months created successfully!");
  };

  const handleAddParcel = (e: React.FormEvent) => {
    e.preventDefault();
    if(!carrierName || !parcelFlatNo || !parcelPhoto || !currentUser?.societyId) return alert("Missing required fields.");

    const newId = `par_${Date.now()}`;
    addParcel({
      id: newId,
      carrierName,
      flatNo: parcelFlatNo,
      photoUrl: parcelPhoto,
      timeAdded: new Date().toISOString(),
      status: 'AT_GATE',
      societyId: currentUser.societyId,
    });

    setCarrierName('');
    setParcelFlatNo('');
    setParcelPhoto(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] fade-in">
        {currentTab === 'parcels' ? (
          <>
            <div className="lg:col-span-4 space-y-[24px]">
              <Card className="border-border shadow-none">
                <CardHeader>
                  <CardTitle>Log New Parcel</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddParcel} className="space-y-[16px]">
                    <div 
                      className="aspect-video bg-gray-100 rounded-[8px] flex flex-col items-center justify-center text-text-muted relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => parcelPhotoRef.current?.click()}
                    >
                      <input type="file" accept="image/*" className="hidden" ref={parcelPhotoRef} onChange={(e) => handleFileCapture(e, setParcelPhoto)} />
                      {parcelPhoto ? (
                        <img src={parcelPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Parcel" />
                      ) : (
                        <>
                          <Camera className="h-[24px] w-[24px] mb-[8px] opacity-70" />
                          <span className="text-[12px] font-[600]">Click to Upload/Capture Parcel</span>
                        </>
                      )}
                    </div>
                    <div>
                      <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Carrier/Courier</label>
                      <Input value={carrierName} onChange={(e)=>setCarrierName(e.target.value)} placeholder="e.g. Amazon, FedEx" required />
                    </div>
                    <div>
                      <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Destination Flat</label>
                      <Input value={parcelFlatNo} onChange={(e)=>setParcelFlatNo(e.target.value)} placeholder="e.g. 101" required />
                    </div>
                    <Button type="submit" className="w-full h-[40px]">
                      <PackageIcon className="mr-2 h-[16px] w-[16px]" /> Log Parcel via Cloud
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card className="h-full border-border shadow-none">
                <CardHeader>
                  <CardTitle>Parcel Log (Live)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-[12px]">
                    {myParcels.length === 0 ? (
                      <div className="text-center py-[40px] text-text-muted">
                        <PackageIcon className="h-[32px] w-[32px] mx-auto mb-[12px] opacity-30" />
                        <p className="text-[14px]">No parcels at gate.</p>
                      </div>
                    ) : (
                      myParcels.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-[16px] bg-white border border-border rounded-[8px]">
                          <div className="flex items-center gap-[16px]">
                            <img 
                              src={p.photoUrl} 
                              alt="parcel" 
                              className="w-[48px] h-[48px] rounded-[6px] object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity" 
                              onClick={() => setZoomedImage(p.photoUrl)}
                            />
                            <div>
                              <h4 className="font-[600] text-text-main">{p.carrierName}</h4>
                              <p className="text-[12px] text-text-muted">
                                For Flat <span className="font-mono text-accent font-[600]">{p.flatNo}</span> • {format(new Date(p.timeAdded), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div>
                            {p.status === 'AT_GATE' ? (
                              <Button size="sm" variant="outline" className="text-xs h-7 border-accent text-accent hover:bg-accent-soft" onClick={()=>updateParcelStatus(p.id, 'COLLECTED')}>
                                Mark Collected
                              </Button>
                            ) : (
                              <span className="px-[8px] py-[4px] rounded-[4px] text-[10px] font-[700] uppercase bg-[#dcfce7] text-[#166534]">Collected</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : currentTab === 'vehicles' ? (
          <div className="lg:col-span-12 fade-in">
            <Card className="border-border shadow-none">
              <CardHeader>
                <CardTitle>Vehicle Search & Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 w-full max-w-sm mb-4">
                   <Input placeholder="Enter Vehicle ID (e.g. DL 01 AB 1234)" />
                   <Button onClick={()=>alert("Vehicle marked as entered!")}>Log Entry</Button>
                </div>
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-sm font-semibold text-text-main">No recent vehicles logged.</p>
                  <p className="text-xs text-text-muted mt-1">Camera ALPR scanner currently offline. Please log manually.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : currentTab === 'passes' ? (
          <div className="lg:col-span-12 fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
              <Card className="shadow-none border-border h-fit">
                <CardHeader className="border-b border-border pb-[16px]">
                  <CardTitle className="flex items-center gap-2">Create Permanent Pass</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Holder Name</label>
                    <Input placeholder="e.g. Rahul Kumar" value={permPassName} onChange={e => setPermPassName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Mobile No.</label>
                    <Input placeholder="10 Digits" value={permPassMobile} onChange={e => setPermPassMobile(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold">Role / Type</label>
                    <Input placeholder="e.g. Househelp, Delivery" value={permPassRole} onChange={e => setPermPassRole(e.target.value)} />
                  </div>
                  <Button onClick={handleAddPermanentPass} className="w-full">Generate 3-Month Pass</Button>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border">
                <CardHeader className="border-b border-border pb-[16px]">
                  <CardTitle>Active Permanent Passes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {myPasses.length === 0 && <p className="p-4 text-sm text-text-muted">No permanent passes issued.</p>}
                    {myPasses.map(p => (
                      <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent-soft rounded-full flex items-center justify-center text-accent font-bold">
                            <QrCode className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-text-main">{p.name}</p>
                            <p className="text-xs text-text-muted">Mobile: {p.mobileNo}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] uppercase tracking-wide font-bold rounded-md">
                             {p.role}
                           </span>
                           <span className="text-[10px] text-text-muted">Valid till: {format(new Date(p.validUntil), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <>
            {/* Entry Panel */}
            <div className="lg:col-span-4 space-y-[24px]">
              <Card className="border-border shadow-none">
                <CardHeader>
                  <CardTitle>Visitor Entry Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddVisitor} className="space-y-[16px]">
                    
                    <div 
                      className="aspect-video bg-gray-100 rounded-[8px] flex flex-col items-center justify-center text-text-muted relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                      onClick={() => visitorPhotoRef.current?.click()}
                    >
                      <input type="file" accept="image/*" className="hidden" ref={visitorPhotoRef} onChange={(e) => handleFileCapture(e, setVisitorPhoto)} />
                      {visitorPhoto ? (
                        <img src={visitorPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Visitor" />
                      ) : (
                        <>
                          <Camera className="h-[24px] w-[24px] mb-[8px] opacity-70" />
                          <span className="text-[12px] font-[600] text-center">Click to Upload/Capture<br/>Visitor Photo</span>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div 
                        className="aspect-square bg-gray-100 rounded-[8px] flex flex-col items-center justify-center text-text-muted relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
                        onClick={handleCaptureVehicle}
                      >
                        <input type="file" accept="image/*" className="hidden" ref={vehiclePhotoRef} onChange={(e) => handleFileCapture(e, setVehiclePhoto)} />
                        {vehiclePhoto ? (
                          <img src={vehiclePhoto} className="absolute inset-0 w-full h-full object-cover" alt="Vehicle" />
                        ) : (
                          <>
                            {isExtractingVehicle ? (
                              <Loader2 className="h-[20px] w-[20px] mb-[4px] animate-spin text-accent" />
                            ) : (
                              <Car className="h-[20px] w-[20px] mb-[4px] opacity-70" />
                            )}
                            <span className="text-[10px] font-[600] text-center px-2">Upload/Capture Vehicle <span className="opacity-60">(Opt)</span></span>
                          </>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                         <label className="text-[10px] font-[600] text-text-muted uppercase mb-[4px] block flex items-center gap-1">
                           Vehicle No. {isExtractingVehicle && <Loader2 className="w-3 h-3 animate-spin"/>}
                         </label>
                         <Input value={vehicleId} onChange={(e)=>setVehicleId(e.target.value)} placeholder="MH01..." className="h-[32px] text-[12px]" disabled={isExtractingVehicle} />
                      </div>
                    </div>

                    <div>
                      <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Visitor Name</label>
                      <Input value={name} onChange={(e)=>setName(e.target.value)} placeholder="e.g. John Doe" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Mobile No.</label>
                        <Input value={mobileNo} onChange={(e)=>setMobileNo(e.target.value)} placeholder="10 Digits" required />
                      </div>
                      <div>
                        <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">No. of People</label>
                        <Input type="number" min="1" value={guestCount} onChange={(e)=>setGuestCount(Number(e.target.value))} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Destination Flat</label>
                        <Input value={flatNo} onChange={(e)=>setFlatNo(e.target.value)} placeholder="e.g. 101" required />
                      </div>
                      <div>
                        <label className="text-[12px] font-[600] text-text-muted uppercase mb-[8px] block">Reason / Type</label>
                        <select 
                          value={reason} 
                          onChange={e => setReason(e.target.value as any)}
                          className="w-full h-10 border border-border rounded-md px-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 bg-white"
                        >
                          <option value="GUEST">Guest</option>
                          <option value="FOOD_DELIVERY">Food Delivery</option>
                          <option value="TECHNICIAN">Technician</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button type="submit" className="w-full h-[40px]">
                      <UserPlus className="mr-2 h-[16px] w-[16px]" /> Send Approval via Cloud
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Log & Approvals */}
            <div className="lg:col-span-8">
              <Card className="h-full border-border shadow-none">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Live Approval Loop</CardTitle>
                  <Button size="sm" variant="outline" className="text-accent border-accent" onClick={() => setShowQRScanner(true)}>
                    <ScanLine className="w-4 h-4 mr-2" /> Scan Resident QR
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-[12px]">
                    {myVisitorRequests.length === 0 ? (
                      <div className="text-center py-[40px] text-text-muted">
                        <Clock className="h-[32px] w-[32px] mx-auto mb-[12px] opacity-30" />
                        <p className="text-[14px]">No recent visitors.</p>
                      </div>
                    ) : (
                      <>
                        <p className="text-[10px] text-text-muted mb-2 font-semibold uppercase tracking-wider italic">
                          Showing recent {Math.min(myVisitorRequests.length, 50)} of {myVisitorRequests.length} logs
                        </p>
                        {myVisitorRequests.slice(0, 50).map(req => (
                          <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-[16px] bg-white border border-border rounded-[8px] gap-4 transition-all">
                          <div className="flex items-center gap-[16px]">
                            <div className="relative shrink-0">
                              <img 
                                src={req.photoUrl} 
                                alt="visitor" 
                                className="w-[48px] h-[48px] rounded-full object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity" 
                                onClick={() => setZoomedImage(req.photoUrl)}
                              />
                              {req.vehiclePhotoUrl && (
                                <img 
                                  src={req.vehiclePhotoUrl} 
                                  alt="vehicle" 
                                  className="absolute -bottom-2 -right-2 w-[24px] h-[24px] rounded-full object-cover border-[2px] border-white cursor-pointer hover:scale-110 transition-transform" 
                                  onClick={() => setZoomedImage(req.vehiclePhotoUrl!)}
                                />
                              )}
                            </div>
                            <div>
                              <h4 className="font-[600] text-text-main flex items-center gap-2">
                                {req.visitorName}
                                {req.vehicleId && <span className="text-[10px] font-mono bg-gray-100 text-text-muted px-1 rounded">{req.vehicleId}</span>}
                              </h4>
                              <p className="text-[12px] text-text-muted flex items-center">
                                To Flat <span className="font-mono font-[600] text-accent bg-accent-soft px-[4px] ml-[4px] rounded-[4px]">{req.flatNo}</span>
                                <span className="mx-[8px]">•</span>
                                {format(new Date(req.timestamp), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="sm:text-right shrink-0">
                            {req.status === 'PENDING' && (
                              <span className="inline-flex items-center px-[10px] py-[4px] rounded-[99px] text-[11px] font-[600] bg-[#fef9c3] text-[#854d0e] animate-pulse">
                                Awaiting Resident...
                              </span>
                            )}
                            {req.status === 'APPROVED' && (
                              <div className="flex flex-col items-end gap-2">
                                <span className="inline-flex items-center px-[10px] py-[4px] rounded-[99px] text-[11px] font-[600] bg-[#dcfce7] text-[#166534]">
                                  Approved
                                </span>
                                <Button size="sm" variant="outline" className="h-7 text-xs border-accent text-accent" onClick={() => setActivePassViewer(req)}>
                                  <QrCode className="w-3 h-3 mr-1"/> View Pass
                                </Button>
                              </div>
                            )}
                            {req.status === 'EXITED' && (
                              <span className="inline-flex items-center px-[10px] py-[4px] rounded-[99px] text-[11px] font-[600] bg-gray-100 text-gray-500">
                                Exited
                              </span>
                            )}
                            {req.status === 'DECLINED' && (
                              <span className="inline-flex items-center px-[10px] py-[4px] rounded-[99px] text-[11px] font-[600] bg-[#fee2e2] text-[#991b1b]">
                                Declined
                              </span>
                            )}
                          </div>
                        </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      {activePassViewer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
           <div className="relative bg-white w-full max-w-sm rounded-[16px] overflow-hidden shadow-2xl flex flex-col items-center p-6 space-y-6">
             <button 
               className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
               onClick={() => setActivePassViewer(null)}
             >
               <X className="w-5 h-5" />
             </button>
             
             <div className="text-center w-full border-b border-gray-100 pb-4">
               <h3 className="font-bold text-xl text-text-main flex items-center justify-center gap-2">
                 <CheckCircle2 className="text-success w-6 h-6"/> Gate Pass
               </h3>
               <p className="text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                 {activePassViewer.reason === 'GUEST' ? 'Valid for 4 Hours' : activePassViewer.reason === 'FOOD_DELIVERY' ? 'Valid for 15 Mins' : 'Valid for 1 Hour'}
               </p>
             </div>

             <div className="w-40 h-40 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center p-2">
               <QrCode className="w-full h-full text-text-main" strokeWidth={1} style={{ opacity: 0.8 }} />
             </div>

             <div className="w-full bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-text-main">
               <div className="flex justify-between">
                 <span className="text-text-muted font-medium">Name:</span>
                 <span className="font-bold">{activePassViewer.visitorName}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-text-muted font-medium">Mobile:</span>
                 <span className="font-semibold">{activePassViewer.mobileNo || 'N/A'}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-text-muted font-medium">Guests:</span>
                 <span className="font-semibold">{activePassViewer.guestCount || 1}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-text-muted font-medium">Flat No:</span>
                 <span className="font-bold text-accent">{activePassViewer.flatNo}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-text-muted font-medium">Type:</span>
                 <span className="font-semibold">{activePassViewer.reason || 'GUEST'}</span>
               </div>
             </div>

             <div className="w-full pt-4 border-t border-gray-100 flex flex-col items-center">
                <Barcode className="w-3/4 h-12 text-text-main mb-2" strokeWidth={1} style={{ opacity: 0.8 }} />
                <Button 
                  className="w-full mt-2 bg-text-main hover:bg-black" 
                  onClick={() => {
                    updateVisitorStatus(activePassViewer.id, 'EXITED');
                    setActivePassViewer(null);
                    alert("Visitor checked out successfully.");
                  }}
                >
                  Scan Out & Expire Pass
                </Button>
             </div>
           </div>
        </div>
      )}

      {showQRScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
           <div className="relative bg-white w-full max-w-md rounded-[16px] overflow-hidden shadow-2xl flex flex-col items-center">
             <div className="w-full bg-slate-900 flex justify-between items-center p-4">
               <h3 className="text-white font-bold flex items-center gap-2"><ScanLine className="w-5 h-5"/> Scan QR / Barcode</h3>
               <button className="text-gray-400 hover:text-white transition-colors" onClick={() => setShowQRScanner(false)}>
                 <X className="w-6 h-6" />
               </button>
             </div>
             <div className="w-full aspect-square bg-black relative">
               <Scanner
                 onScan={(result) => {
                   if (result && result.length > 0) {
                     alert(`Scanned successfully: ${result[0].rawValue}`);
                     setShowQRScanner(false);
                   }
                 }}
               />
             </div>
             <div className="p-4 text-center text-sm text-text-muted">
               Hold the resident's mobile device steady within the frame.
             </div>
           </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-200">
           <div className="relative max-w-[90vw] max-h-[90vh]">
             <button 
               className="absolute -top-12 right-0 md:-right-12 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
               onClick={() => setZoomedImage(null)}
             >
               <X className="w-6 h-6" />
             </button>
             <img src={zoomedImage} className="w-full h-full object-contain rounded-lg shadow-2xl" alt="Previewing" />
           </div>
        </div>
      )}
    </>
  );
}
