import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { sfx } from '../services/audio.ts';
import {
  Gamepad2,
  Trophy,
  User,
  LogOut,
  LogIn,
  Menu,
  X,
  Volume2,
  VolumeX,
  Globe,
  Settings,
  Cloud,
  CloudOff,
  Flame,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isGuest, signOut, updatePreferences } = useAuth();
  const { syncStatus, getTotalScore, getTotalStars } = useProgress();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { name: 'Games', nameBn: 'গেমস', path: '/games', icon: Gamepad2 },
    { name: 'Leaderboard', nameBn: 'লিডারবোর্ড', path: '/leaderboard', icon: Trophy },
    { name: 'Dashboard', nameBn: 'ড্যাশবোর্ড', path: '/dashboard', icon: User },
    { name: 'About', nameBn: 'পরিচিতি', path: '/about', icon: Flame },
  ];

  const toggleSound = () => {
    sfx.click();
    if (user) {
      updatePreferences({ soundMuted: !user.preferences.soundMuted });
    }
  };

  const toggleLang = () => {
    sfx.click();
    if (user) {
      const nextLang = user.preferences.language === 'en' ? 'bn' : 'en';
      updatePreferences({ language: nextLang });
    }
  };

  const isMuted = user?.preferences.soundMuted ?? false;
  const currentLang = user?.preferences.language ?? 'en';

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080c16]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => sfx.click()}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-950/40 group-hover:shadow-cyan-500/20 transition-all">
            <div className="w-full h-full bg-[#080c16] rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🗳️</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-lg tracking-wider text-white group-hover:text-cyan-400 transition">
                VOOTER
              </span>
              <span className="font-display font-extrabold text-xs px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ARCADE
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block font-mono">
              ভোটের ফাঁদ & More
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => sfx.click()}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                  active
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{currentLang === 'bn' ? link.nameBn : link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Stats, Audio, Language, Auth */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Quick Score Capsule */}
          <div className="flex items-center gap-3 px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-1 text-amber-400" title="Total Stars">
              <span>★</span>
              <span className="font-bold">{getTotalStars()}</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="flex items-center gap-1 text-cyan-400" title="Total Score">
              <span>⚡</span>
              <span className="font-bold">{getTotalScore()}</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition cursor-pointer font-bold text-xs flex items-center gap-1.5"
            title="Toggle English / বাংলা"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentLang === 'en' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen((o) => !o)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition cursor-pointer"
              >
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate">
                  {user.username}
                </span>
                {isGuest && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Guest
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-800/80 mb-1">
                    <div className="text-xs font-bold text-white truncate">{user.username}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      {syncStatus === 'synced' ? (
                        <>
                          <Cloud className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Cloud Synced</span>
                        </>
                      ) : (
                        <>
                          <CloudOff className="w-3 h-3 text-amber-400" />
                          <span className="text-amber-400">Local Storage Cache</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => {
                      sfx.click();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <User className="w-4 h-4 text-cyan-400" />
                    <span>Player Dashboard</span>
                  </Link>

                  <Link
                    to="/dashboard?tab=settings"
                    onClick={() => {
                      sfx.click();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-slate-800/80 my-1" />

                  {isGuest ? (
                    <Link
                      to="/login"
                      onClick={() => {
                        sfx.click();
                        setUserDropdownOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 transition"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Google</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        sfx.click();
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => sfx.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-lg shadow-cyan-900/30 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#080c16] px-4 pt-2 pb-6 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">★ {getTotalStars()} Stars</span>
              <span className="text-cyan-400 font-bold font-mono">⚡ {getTotalScore()} Pts</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-200"
                title="Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>
              <button
                onClick={toggleLang}
                className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold"
              >
                {currentLang === 'en' ? 'বাংলা' : 'EN'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => {
                    sfx.click();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{currentLang === 'bn' ? link.nameBn : link.name}</span>
                </Link>
              );
            })}
          </div>

          {user && isGuest && (
            <Link
              to="/login"
              onClick={() => {
                sfx.click();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Connect Google Account</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
