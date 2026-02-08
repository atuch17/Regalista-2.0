
import React from 'react';
import { GiftIcon, UserPlusIcon, CalendarIcon, GoogleIcon, CheckIcon, AlertTriangleIcon } from './icons';
import { IS_PRODUCTION } from '../services/googleSheetsService';

interface HeaderProps {
  onAddPersonClick: () => void;
  onCalendarClick: () => void;
  onGoogleLinkClick: () => void;
  isGoogleLinked: boolean;
  isSyncing: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

const Header: React.FC<HeaderProps> = ({ 
    onAddPersonClick, 
    onCalendarClick, 
    onGoogleLinkClick, 
    isGoogleLinked, 
    isSyncing,
    syncStatus
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-100 relative">
                <GiftIcon className="h-6 w-6 text-white" />
                {syncStatus === 'syncing' && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 border border-white"></span>
                  </span>
                )}
                {syncStatus === 'success' && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-white"></span>
                  </span>
                )}
                {syncStatus === 'error' && (
                   <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white"></span>
                  </span>
                )}
            </div>
            <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Regalista</h1>
                {isGoogleLinked && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 animate-fade-in ${
                      syncStatus === 'error' ? 'text-rose-500' : 
                      syncStatus === 'syncing' ? 'text-blue-500' : 'text-emerald-600'
                    }`}>
                        {syncStatus === 'syncing' ? 'Subiendo cambios...' : 
                         syncStatus === 'error' ? 'Error al guardar' : 'Sincronizado'}
                    </span>
                )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
                onClick={onGoogleLinkClick} 
                title={isGoogleLinked ? 'Sesión conectada' : 'Pulsa para vincular con Google'}
                className={`inline-flex items-center gap-2 px-3 py-2 border rounded-xl text-sm font-bold transition-all ${
                    isGoogleLinked 
                    ? syncStatus === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
            >
                {isSyncing ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                ) : syncStatus === 'error' ? (
                    <AlertTriangleIcon className="h-4 w-4" />
                ) : (
                    <GoogleIcon className="h-4 w-4" />
                )}
                <span className="hidden md:inline">{isGoogleLinked ? 'Google Cloud' : 'Vincular Google'}</span>
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
