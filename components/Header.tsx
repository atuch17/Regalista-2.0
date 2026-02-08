
import React from 'react';
import { GiftIcon, UserPlusIcon, CalendarIcon, GoogleIcon, CheckIcon } from './icons';

interface HeaderProps {
  onAddPersonClick: () => void;
  onCalendarClick: () => void;
  onGoogleLinkClick: () => void;
  isGoogleLinked: boolean;
  isSyncing: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onAddPersonClick, 
    onCalendarClick, 
    onGoogleLinkClick, 
    isGoogleLinked, 
    isSyncing 
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100">
                <GiftIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Regalista 2.0<span className="text-indigo-600">.</span></h1>
                {isGoogleLinked && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 animate-fade-in">
                        <CheckIcon className="w-3 h-3" /> Conectado a Drive
                    </span>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
                onClick={onGoogleLinkClick} 
                className={`inline-flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-bold transition-all ${
                    isGoogleLinked 
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
            >
                {isSyncing ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : (
                    <GoogleIcon className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{isGoogleLinked ? 'Sincronizado' : 'Vincular Google'}</span>
            </button>

            <button onClick={onCalendarClick} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border border-slate-200 text-sm font-bold text-slate-700 bg-white rounded-xl shadow-sm hover:bg-slate-50 transition-all">
                <CalendarIcon className="h-5 w-5 text-indigo-600" />
                <span className="hidden sm:inline">Calendario</span>
            </button>
            <button onClick={onAddPersonClick} className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-sm font-bold text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                <UserPlusIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Añadir</span>
                <span className="sm:hidden">+</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
