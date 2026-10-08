import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  HelpCircle,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Plus,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react';
import { AppNotification, UserProfile, UserRole } from '../types';

export type NavTab =
  | 'home'
  | 'explore'
  | 'report'
  | 'my-reports'
  | 'admin'
  | 'item-detail';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userProfile: UserProfile | null;
  onSignIn: () => void;
  onSignOut: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotificationItem: (itemId?: string) => void;
  onOpenReportWithType: (type: 'lost' | 'found') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  userProfile,
  onSignIn,
  onSignOut,
  notifications,
  onMarkAllRead,
  onSelectNotificationItem,
  onOpenReportWithType,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'report', label: 'Report' },
    { id: 'my-reports', label: 'My Reports' },
  ];

  if (currentRole === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin' });
  }

  const displayName = userProfile?.name || 'Tanya Garg';

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-200 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-2.5'
          : 'bg-white/80 backdrop-blur-lg border-b border-slate-200/60 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: FindBack Logo (Location Pin + Search/Recovery Symbol) */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0 cursor-pointer"
        >
          <span className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white shadow-sm group-hover:scale-103 transition-transform">
            <MapPin className="w-4 h-4" />
            <Search className="w-2.5 h-2.5 absolute bottom-1.5 right-1.5 text-blue-100" />
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
            FindBack
          </span>
        </button>

        {/* Center Navigation: Home, Explore, Report, My Reports */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                  isActive
                    ? 'text-blue-600 border-blue-600 font-semibold'
                    : 'text-slate-600 border-transparent hover:text-slate-950'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Notification bell, Help, User avatar + dropdown, Prominent + Report Item button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
                setHelpOpen(false);
              }}
              aria-label="Notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-500">
                      No notifications right now.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          setNotifOpen(false);
                          if (n.relatedItemId) {
                            onSelectNotificationItem(n.relatedItemId);
                          }
                        }}
                        className={`w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3 cursor-pointer ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !n.read ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-800 leading-relaxed font-medium">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 tabular-nums">
                            {new Date(n.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Help Popover */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setHelpOpen((prev) => !prev);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              aria-label="Help"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 rounded-xl transition-colors cursor-pointer"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {helpOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 z-50 space-y-2.5 text-xs">
                <p className="font-bold text-slate-900">How FindBack Works</p>
                <p className="text-slate-600 leading-relaxed">
                  1. Report a lost or found item in 4 quick steps.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  2. Our Smart Match system compares category, description, location, and date.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  3. Verify ownership securely to recover your belonging.
                </p>
              </div>
            )}
          </div>

          {/* User Avatar & Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
                setHelpOpen(false);
              }}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-xl hover:bg-slate-100/80 border border-slate-200/70 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <span className="hidden lg:inline text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                {displayName.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{displayName}</p>
                  <p className="text-slate-500 truncate mt-0.5">
                    {userProfile?.email || 'taniyagarg1007@gmail.com'}
                  </p>
                </div>

                <div className="px-3 py-2 space-y-1 border-b border-slate-100">
                  <p className="px-1 text-[11px] font-semibold text-slate-400">Portal View</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('student');
                      setActiveTab('my-reports');
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-2 cursor-pointer ${
                      currentRole === 'student'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Student Dashboard (Tanya)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentRole('admin');
                      setActiveTab('admin');
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-2 cursor-pointer ${
                      currentRole === 'admin'
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>FindBack Admin Console</span>
                  </button>
                </div>

                <div className="px-3 pt-1">
                  {userProfile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSignOut();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        onSignIn();
                      }}
                      className="w-full text-left px-2.5 py-2 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In with Google</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Prominent + Report Item Button */}
          <button
            type="button"
            onClick={() => onOpenReportWithType('lost')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Report Item</span>
          </button>

          {/* Mobile Hamburger Menu */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
