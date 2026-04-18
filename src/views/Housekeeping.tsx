import React, { useState, useRef } from 'react';
import { useStore, CleaningProof } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

export default function Housekeeping() {
  const { currentUser, cleaningProofs, addCleaningProof } = useStore();
  const [locationName, setLocationName] = useState('');
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop() || 'housekeeping';

  const [photo, setPhoto] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if(!locationName || !photo || !currentUser?.societyId) return alert("Photo and location required");

    const proof: CleaningProof = {
      id: `cp_${Date.now()}`,
      staffName: currentUser?.name || 'Staff',
      location: locationName,
      photoUrl: photo,
      timestamp: new Date().toISOString(),
      societyId: currentUser.societyId
    };
    addCleaningProof(proof);
    setLocationName('');
    setPhoto(null);
  };

  if (currentTab !== 'housekeeping') {
    return (
      <div className="flex h-full items-center justify-center fade-in">
        <div className="text-center space-y-2 text-text-muted">
          <h2 className="text-[18px] font-[600] capitalize text-text-main">{currentTab.replace('-', ' ')}</h2>
          <p className="text-[14px]">This module is part of the future YogiSentry roadmap.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] fade-in">
      <Card className="border-border shadow-none">
        <CardHeader className="border-b border-border pb-[16px]">
          <CardTitle>Submit Proof of Work</CardTitle>
        </CardHeader>
        <CardContent className="pt-[16px]">
          <form onSubmit={handleUpload} className="space-y-[16px]">
            <div 
              className="aspect-[4/3] bg-gray-100 rounded-[8px] flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border relative overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={() => photoRef.current?.click()}
            >
              <input type="file" accept="image/*" className="hidden" ref={photoRef} onChange={handleFileCapture} />
              {photo ? (
                <img src={photo} className="absolute inset-0 w-full h-full object-cover" alt="Cleaning Proof" />
              ) : (
                <>
                  <Camera className="h-[32px] w-[32px] mb-[8px] opacity-50" />
                  <span className="font-[600] text-[13px]">Tap to capture photo</span>
                </>
              )}
            </div>

            <div>
               <label className="text-[12px] font-[600] text-text-muted uppercase tracking-wide block mb-[8px]">Cleaned Area / Location</label>
               <Input 
                 placeholder="e.g., A-Wing Lobby, 2nd Floor Corridor" 
                 value={locationName} 
                 onChange={(e)=>setLocationName(e.target.value)}
                 className="h-[40px]"
                 required 
               />
            </div>

            <Button type="submit" className="w-full h-[40px]" size="lg">
              <Send className="mr-[8px] h-[16px] w-[16px]" /> Submit to Audit Queue
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border shadow-none">
        <CardHeader className="border-b border-border pb-[16px]">
          <CardTitle>My Submissions</CardTitle>
        </CardHeader>
        <CardContent className="pt-[16px]">
           <div className="space-y-[12px]">
             {cleaningProofs.filter(p => p.societyId === currentUser?.societyId && p.staffName === currentUser?.name).length === 0 ? (
               <p className="text-text-muted text-[13px] text-center py-[24px]">No submissions today.</p>
             ) : (
               cleaningProofs.filter(p => p.societyId === currentUser?.societyId && p.staffName === currentUser?.name).map(proof => (
                 <div key={proof.id} className="flex gap-[16px] bg-[#f9fafb] p-[12px] rounded-[8px] border border-border">
                   <img src={proof.photoUrl} alt="proof" className="w-[80px] h-[60px] rounded-[4px] object-cover" />
                   <div className="flex flex-col justify-center">
                     <p className="font-[600] text-[14px] text-text-main">{proof.location}</p>
                     <p className="text-[12px] text-text-muted mt-[2px]">{format(new Date(proof.timestamp), 'MMM dd, h:mm a')}</p>
                     <span className="inline-block mt-[4px] px-[8px] py-[2px] bg-[#dcfce7] text-[#166534] text-[10px] font-[700] uppercase rounded-[4px] tracking-[0.05em] w-max">Submitted</span>
                   </div>
                 </div>
               ))
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
