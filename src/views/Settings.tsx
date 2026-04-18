import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell } from 'lucide-react';

export default function Settings() {
  const { currentUser, updateUser, registrationCharge, setRegistrationCharge } = useStore();
  const [newPassword, setNewPassword] = useState('');
  const [newCharge, setNewCharge] = useState(String(registrationCharge || 5000));
  
  const [prefs, setPrefs] = useState({
    gateAlerts: true,
    parcelDeliveries: true,
    maintenanceDues: true
  });
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const { addSupportTicket } = useStore();

  useEffect(() => {
    if (currentUser?.preferences) {
      setPrefs({
        gateAlerts: currentUser.preferences.gateAlerts ?? true,
        parcelDeliveries: currentUser.preferences.parcelDeliveries ?? true,
        maintenanceDues: currentUser.preferences.maintenanceDues ?? true
      });
    }
  }, [currentUser]);

  if (!currentUser) return null;

  const handlePasswordChange = () => {
    if (!newPassword) return;
    updateUser(currentUser.id, { password: newPassword });
    setNewPassword('');
    alert("Password updated successfully!");
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-[13px] font-[600] text-text-main mb-2">Change Password</label>
            <div className="flex gap-2">
              <Input 
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="max-w-xs"
              />
              <Button onClick={handlePasswordChange}>Update</Button>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Use a strong password to keep your YogiSentry account secure.
            </p>
          </div>
        </CardContent>
      </Card>

      {currentUser.role === 'SUPER_ADMIN' && (
        <Card>
          <CardHeader>
            <CardTitle>Super Admin Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-[13px] font-[600] text-text-main mb-2">New Society Registration Charge (₹)</label>
              <div className="flex gap-2">
                <Input 
                  type="number"
                  value={newCharge}
                  onChange={(e) => setNewCharge(e.target.value)}
                  className="max-w-xs"
                />
                <Button onClick={() => {
                  setRegistrationCharge(Number(newCharge));
                  alert("Registration charge updated successfully!");
                }}>Save</Button>
              </div>
              <p className="text-xs text-text-muted mt-2">
                This charge will be applied the first time a new society is registered.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {currentUser.role === 'RESIDENT' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-accent"/> Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-semibold text-sm">Gate Alerts</p>
                <p className="text-xs text-text-muted">Receive notifications when visitors arrive at the gate.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={prefs.gateAlerts} 
                  onChange={(e) => setPrefs(prev => ({ ...prev, gateAlerts: e.target.checked }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <p className="font-semibold text-sm">Parcel Deliveries</p>
                <p className="text-xs text-text-muted">Get alerted when a package gets delivered to the guard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={prefs.parcelDeliveries} 
                  onChange={(e) => setPrefs(prev => ({ ...prev, parcelDeliveries: e.target.checked }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pb-3">
              <div>
                <p className="font-semibold text-sm">Maintenance Dues</p>
                <p className="text-xs text-text-muted">Receive reminders for generated maintenance invoices.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={prefs.maintenanceDues} 
                  onChange={(e) => setPrefs(prev => ({ ...prev, maintenanceDues: e.target.checked }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
              </label>
            </div>

            <div className="pt-2">
              <Button onClick={() => {
                updateUser(currentUser.id, { preferences: prefs });
                alert("Notification preferences saved successfully!");
              }}>Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <div className="grid grid-cols-[120px_1fr] border-b border-border py-2">
            <span className="text-text-muted font-[500]">Name:</span>
            <span className="font-[600] text-text-main">{currentUser.name}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] border-b border-border py-2">
            <span className="text-text-muted font-[500]">Login ID:</span>
            <span className="font-[600] text-text-main">{currentUser.loginId}</span>
          </div>
          <div className="grid grid-cols-[120px_1fr] border-b border-border py-2">
            <span className="text-text-muted font-[500]">Role:</span>
            <span className="font-[600] text-text-main shrink-0">{currentUser.role}</span>
          </div>
          {currentUser.societyId && (
            <div className="grid grid-cols-[120px_1fr] border-b border-border py-2">
              <span className="text-text-muted font-[500]">Society:</span>
              <span className="font-[600] text-text-main">{currentUser.societyId}</span>
            </div>
          )}
          {currentUser.flatNo && (
            <div className="grid grid-cols-[120px_1fr] border-b border-border py-2">
              <span className="text-text-muted font-[500]">Flat Details:</span>
              <span className="font-[600] text-text-main">{currentUser.flatNo}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support Section for ALL users */}
      <Card>
        <CardHeader>
          <CardTitle>Help & Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="space-y-3">
             <h4 className="font-semibold text-sm text-slate-800">Frequently Asked Questions</h4>
             <div className="space-y-2">
               <details className="p-3 border rounded bg-slate-50 [&_summary::-webkit-details-marker]:hidden cursor-pointer group">
                 <summary className="font-semibold text-sm">How do I reset my password?</summary>
                 <p className="text-xs text-slate-600 mt-2">You can change your password from the top of this Settings page.</p>
               </details>
               <details className="p-3 border rounded bg-slate-50 [&_summary::-webkit-details-marker]:hidden cursor-pointer group">
                 <summary className="font-semibold text-sm">Where can I see my maintenance dues?</summary>
                 <p className="text-xs text-slate-600 mt-2">If you are a Resident, navigate to the 'Dues' tab in your app.</p>
               </details>
             </div>
           </div>

           <div className="space-y-3 border-t pt-4">
             <h4 className="font-semibold text-sm text-slate-800">Contact Support</h4>
             <form onSubmit={(e) => {
                e.preventDefault();
                addSupportTicket({ id: `tick_${Date.now()}`, subject: ticketSubject, description: ticketDesc, userId: currentUser.id, status: 'OPEN', date: new Date().toISOString() });
                setTicketSubject(''); setTicketDesc('');
                alert("Support ticket raised. Our team will contact you shortly.");
             }} className="space-y-3">
               <div>
                  <label className="text-xs font-semibold block mb-1">Subject</label>
                  <Input value={ticketSubject} onChange={e=>setTicketSubject(e.target.value)} required placeholder="Brief description of the issue" />
               </div>
               <div>
                  <label className="text-xs font-semibold block mb-1">Details</label>
                  <textarea value={ticketDesc} onChange={e=>setTicketDesc(e.target.value)} required placeholder="Provide more details..." className="w-full h-24 border p-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-accent" />
               </div>
               <Button type="submit">Submit Ticket</Button>
             </form>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
