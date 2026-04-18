import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, User } from '@/store';
import { Building2, XCircle, Key, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const { users, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Credentials state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    switch (user.role) {
      case 'SUPER_ADMIN': navigate('/super-admin'); break;
      case 'SECRETARY': navigate('/secretary'); break;
      case 'GUARD': navigate('/guard'); break;
      case 'HOUSEKEEPING': navigate('/housekeeping'); break;
      case 'RESIDENT': navigate('/resident'); break;
      default: navigate('/resident'); break;
    }
  };

  const handleCredentialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) return;
    
    setIsLoading(true);
    setError(null);
    
    // Simulate network delay
    setTimeout(() => {
      const foundUser = users.find(u => u.loginId === loginId && u.password === password);
      
      if (foundUser) {
        handleLoginSuccess(foundUser);
      } else {
        setError("Invalid Resident ID or Password.");
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans">
      {/* Visual Left Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex relative w-1/2 bg-slate-950 overflow-hidden">
        <img 
          src="https://picsum.photos/seed/modern_building/1920/1080?blur=4" 
          alt="Modern building architecture" 
          className="absolute inset-0 h-full w-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="h-6 w-6 text-slate-900" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">YogiSentry</span>
          </div>

          <div className="space-y-4 max-w-lg fade-in">
            <h2 className="text-white text-4xl font-semibold tracking-tight leading-tight">
              Cloud-Connected<br/>Society Management
            </h2>
            <p className="text-slate-300 text-lg font-medium">
              Streamlining security, administration, and community engagement into one unified platform.
            </p>
          </div>
        </div>
      </div>

      {/* Login Form Right Panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20 xl:px-28 bg-white relative">
        <div className="flex lg:hidden items-center gap-3 absolute top-8 left-6">
           <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
             <Building2 className="h-5 w-5 text-white" />
           </div>
           <span className="text-slate-900 text-xl font-bold tracking-tight">YogiSentry</span>
        </div>

        <div className="mx-auto w-full max-w-sm shrink-0 mt-12 lg:mt-0 fade-in duration-500">
          <div className="mb-10">
            <h2 className="text-[32px] font-[700] tracking-tight text-slate-900 mb-2">
              Welcome back
            </h2>
            <p className="text-[15px] text-slate-500 font-medium">
              Enter your Resident ID or assigned admin credentials to access the portal.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          <form onSubmit={handleCredentialAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Resident ID / Admin ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="text"
                  placeholder="e.g., A-101 or YogiSentry" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-slate-900 placeholder:text-slate-400 rounded-xl font-medium"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  type="password" 
                  placeholder="Enter your password" 
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-colors text-slate-900 placeholder:text-slate-400 rounded-xl font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 mt-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-[15px] transition-all shadow-sm"
            >
              {isLoading ? "Authenticating securely..." : "Sign in to portal"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
