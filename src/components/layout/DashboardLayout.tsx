import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '@/store';
import { 
  Building2, Users, LayoutDashboard, ShieldCheck, 
  Wrench, FileText, Bell, LogOut, Package, Image as ImageIcon,
  Wallet, Settings, Menu, X, BarChart, Mail, ShieldAlert
} from 'lucide-react';

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, setCurrentUser } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const getNavItems = (): SidebarItem[] => {
    let items: SidebarItem[] = [];
    switch (currentUser.role) {
      case 'SUPER_ADMIN':
        items = [
          { icon: LayoutDashboard, label: 'Global Dashboard', path: '/super-admin' },
          { icon: Building2, label: 'Societies', path: '/super-admin/societies' },
          { icon: ShieldAlert, label: 'Admins', path: '/super-admin/admins' },
          { icon: BarChart, label: 'Reports', path: '/super-admin/reports' },
          { icon: Mail, label: 'Email Templates', path: '/super-admin/templates' },
          { icon: Users, label: 'Onboarding', path: '/super-admin/onboarding' },
          { icon: Wallet, label: 'Payments', path: '/super-admin/payments' },
          { icon: FileText, label: 'Subscriptions', path: '/super-admin/subscriptions' },
          { icon: Wrench, label: 'Issues', path: '/super-admin/issues' },
          { icon: Wallet, label: 'Payroll', path: '/super-admin/payroll' },
        ];
        break;
      case 'SECRETARY':
        items = [
          { icon: LayoutDashboard, label: 'Dashboard', path: '/secretary' },
          { icon: Wallet, label: 'Financial Hub', path: '/secretary/financials' },
          { icon: Users, label: 'Staff Mgmt', path: '/secretary/staff' },
          { icon: Wrench, label: 'Complaints', path: '/secretary/complaints' },
          { icon: FileText, label: 'Communication', path: '/secretary/communication' },
          { icon: Building2, label: 'Facilities', path: '/secretary/facilities' },
          { icon: BarChart, label: 'Reports & QR', path: '/secretary/reports' },
          { icon: Mail, label: 'Templates', path: '/secretary/templates' },
        ];
        break;
      case 'GUARD':
        items = [
          { icon: ShieldCheck, label: 'Visitor Mgmt', path: '/guard' },
          { icon: Package, label: 'Parcels', path: '/guard/parcels' },
          { icon: FileText, label: 'Vehicles', path: '/guard/vehicles' },
          { icon: FileText, label: 'Permanent Passes', path: '/guard/passes' },
        ];
        break;
      case 'HOUSEKEEPING':
        items = [
          { icon: ImageIcon, label: 'Proof of Work', path: '/housekeeping' },
        ];
        break;
      case 'RESIDENT':
        items = [
          { icon: Bell, label: 'Gate Alerts', path: '/resident' },
          { icon: FileText, label: 'Vehicles', path: '/resident/vehicles' },
          { icon: Wallet, label: 'Dues', path: '/resident/dues' },
          { icon: Building2, label: 'Facilities', path: '/resident/facilities' },
          { icon: FileText, label: 'Communication', path: '/resident/communication' },
        ];
        break;
    }
    items.push({ icon: Settings, label: 'Settings', path: '/settings' });
    return items;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-bg font-sans text-text-main relative">
      
      {/* Mobile Overlay */}
      {!isSidebarOpen && window.innerWidth <= 768 && (
        <div className="absolute inset-0 bg-black/20 z-20 hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      {isSidebarOpen && window.innerWidth <= 768 && (
        <div className="absolute inset-0 bg-black/20 z-20" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative flex flex-col z-30 h-full w-[240px] bg-sidebar border-r border-border transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-[0]' : 'translate-x-[-100%] md:translate-x-0 md:w-[0] hidden md:flex border-none opacity-0'}
      `}>
        <div className="px-[24px] pt-[24px] pb-[32px] text-[22px] font-[800] tracking-[-0.02em] text-accent flex items-center justify-between">
          <img src="/logo.png" alt="YogiSentry" className="h-[40px] w-auto" referrerPolicy="no-referrer" />
          <button className="md:hidden text-text-muted cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-[20px] h-[20px]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-0">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if(window.innerWidth <= 768) setIsSidebarOpen(false); }}
                className={`flex items-center px-[24px] py-[12px] text-[14px] font-[500] transition-colors gap-[12px] ${
                  location.pathname === item.path
                    ? 'bg-accent-soft text-accent border-r-[3px] border-accent'
                    : 'text-text-muted hover:bg-gray-50'
                }`}
              >
                <item.icon className={`h-[18px] w-[18px] ${
                  location.pathname === item.path ? 'text-accent' : 'text-text-muted'
                }`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-border mt-auto">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center px-[24px] py-[8px] text-[14px] font-[500] text-text-muted rounded-[6px] hover:bg-gray-50 transition-colors gap-[12px] cursor-pointer"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-bg p-[16px] md:p-[32px] gap-[16px] md:gap-[24px]">
        <header className="flex justify-between items-start mb-[8px]">
          <div className="header-title border-none outline-none flex items-center gap-[12px]">
            <button 
              className="p-[8px] -ml-[8px] rounded-[6px] hover:bg-gray-100 cursor-pointer"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="w-[20px] h-[20px] text-text-main" />
            </button>
            <div>
              <h1 className="text-[20px] md:text-[24px] font-[700] mb-[2px] md:mb-[4px] text-text-main">
                {navItems.find(i => location.pathname === i.path)?.label || 'Dashboard'}
              </h1>
              <p className="text-text-muted text-[12px] md:text-[14px]">
                {currentUser.societyId ? `Society: ${currentUser.societyId} ${currentUser.flatNo ? `| Flat: ${currentUser.flatNo}` : ''}` : 'System Overview'}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-[12px] bg-sidebar px-[16px] py-[8px] border border-border rounded-[99px] text-[13px] font-[600]">
            <span className="w-[8px] h-[8px] bg-success rounded-full"></span>
            {currentUser.role.replace('_', ' ')} Admin: {currentUser.name}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto rounded-[12px] border-none">
          <div className="w-full h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
