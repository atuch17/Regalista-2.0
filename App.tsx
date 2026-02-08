
import React, { useState, useEffect, useMemo } from 'react';
import { Person } from './types';
import Header from './components/Header';
import AddPersonModal from './components/AddPersonModal';
import BirthdayCalendarModal from './components/BirthdayCalendarModal';
import SettingsModal from './components/SettingsModal';
import { PersonCard } from './components/PersonCard';
import { StarIcon, AlertTriangleIcon, XIcon } from './components/icons';
import { getDaysUntilBirthday } from './utils/dateUtils';
import * as googleService from './services/googleSheetsService';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('giftify_people');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [isGoogleLinked, setIsGoogleLinked] = useState(localStorage.getItem('is_demo_linked') === 'true' || !!localStorage.getItem('google_sheet_id'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState(localStorage.getItem('google_sheet_id'));
  const [isDemoMode, setIsDemoMode] = useState(localStorage.getItem('is_demo_linked') === 'true');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    googleService.initGoogleAuth(() => {
        console.log('Google APIs ready.');
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('giftify_people', JSON.stringify(people));
    
    if (isGoogleLinked && !isSyncing) {
        if (isDemoMode) {
            simulateSync();
        } else if (spreadsheetId) {
            syncToCloud(people);
        }
    }
  }, [people, isGoogleLinked, spreadsheetId, isDemoMode]);

  const simulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const syncToCloud = async (data: Person[]) => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
        await googleService.syncToSheets(spreadsheetId!, data);
    } catch (e) {
        console.error('Cloud Sync failed', e);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleGoogleLink = async () => {
    setAuthError(null);
    if (!googleService.isGoogleApiReady()) {
        alert("Los servicios de Google se están cargando...");
        return;
    }

    setIsSyncing(true);
    try {
        await googleService.signIn();
        
        let sid = spreadsheetId;
        if (!sid) {
            sid = await googleService.findOrCreateDatabase();
            setSpreadsheetId(sid);
            localStorage.setItem('google_sheet_id', sid);
        }

        const cloudData = await googleService.loadFromSheets(sid);
        if (cloudData && cloudData.length > 0) {
            if (window.confirm('¿Restaurar datos de Google Drive?')) {
                setPeople(cloudData);
            }
        }
        
        setIsGoogleLinked(true);
        setIsDemoMode(false);
        localStorage.removeItem('is_demo_linked');
    } catch (e: any) {
        console.log('Sync/Link outcome:', e.message || e);
        const errorMsg = e.message || String(e);
        
        // Si el usuario cerró el popup, simplemente paramos el estado de carga
        if (errorMsg === 'popup_closed_by_user') {
            setIsSyncing(false);
            return;
        }

        if (errorMsg === 'timeout_reached') {
            setAuthError("El proceso ha tardado demasiado o el popup se bloqueó.");
        } else if (errorMsg.includes('idpiframe_initialization_failed') || errorMsg.includes('popup_closed_by_user')) {
            setAuthError("No se pudo completar el login. Revisa la configuración de Orígenes en Google Console.");
            setIsSettingsOpen(true);
        } else {
            alert(`Error al conectar con Google: ${errorMsg}`);
        }
    } finally {
        setIsSyncing(false);
    }
  };

  const sortedPeople = useMemo(() => {
    const list = [...people].sort((a, b) => {
      const daysA = getDaysUntilBirthday(a.birthday);
      const daysB = getDaysUntilBirthday(b.birthday);
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      return daysA - daysB;
    });
    return list;
  }, [people]);

  const favorites = sortedPeople.filter(p => p.isFavorite);
  const others = sortedPeople.filter(p => !p.isFavorite);

  const handleUpdatePerson = (updated: Person) => {
    setPeople(people.map(p => p.id === updated.id ? updated : p));
  };

  const handleDeletePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const handleAddPerson = (newPerson: Person) => {
    setPeople([newPerson, ...people]);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header 
        onAddPersonClick={() => setIsAddModalOpen(true)} 
        onCalendarClick={() => setIsCalendarOpen(true)}
        onGoogleLinkClick={handleGoogleLink}
        isGoogleLinked={isGoogleLinked}
        isSyncing={isSyncing}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {authError && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
                <div className="flex items-center gap-3 text-red-800 text-sm">
                    <AlertTriangleIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <p className="font-bold">Estado de Vinculación</p>
                        <p className="opacity-80">{authError}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-slate-600 px-2 py-1">
                        <XIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsSettingsOpen(true)} className="bg-white px-3 py-1.5 rounded-lg border border-red-200 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors">
                        Diagnóstico
                    </button>
                </div>
            </div>
        )}

        {isDemoMode && isGoogleLinked && (
            <div className="mb-6 bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                    Estás en Modo Demo (Simulación de Nube activa)
                </div>
                <button 
                  onClick={() => {
                    setIsGoogleLinked(false);
                    setIsDemoMode(false);
                    localStorage.removeItem('is_demo_linked');
                  }}
                  className="text-amber-600 text-xs font-bold hover:underline"
                >
                    Desactivar
                </button>
            </div>
        )}

        {people.length === 0 && !isSyncing ? (
          <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-3xl mt-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">¡Tu lista está vacía!</h2>
            <p className="text-slate-500 mt-2">Empieza añadiendo a alguien o vincula tu cuenta de Google.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-100"
                >
                    + Añadir mi primera persona
                </button>
                <button 
                    onClick={handleGoogleLink}
                    className="bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50"
                >
                    Vincular con Google Drive
                </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {isSyncing && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        <span>{isDemoMode ? 'Simulando Sync...' : 'Conectando con Google...'}</span>
                        <button 
                            onClick={() => setIsSyncing(false)} 
                            className="ml-2 pl-2 border-l border-slate-600 text-slate-400 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {favorites.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-amber-400" fill="currentColor" />
                    Personas Especiales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favorites.map(person => (
                        <PersonCard 
                            key={person.id} 
                            person={person} 
                            onUpdate={handleUpdatePerson} 
                            onDelete={handleDeletePerson} 
                        />
                    ))}
                </div>
              </section>
            )}

            {others.length > 0 && (
              <section className="animate-fade-in">
                <h2 className="text-lg font-bold text-slate-500 mb-6 flex items-center gap-2">
                    👥 Todos los Cumples
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {others.map(person => (
                        <PersonCard 
                            key={person.id} 
                            person={person} 
                            onUpdate={handleUpdatePerson} 
                            onDelete={handleDeletePerson} 
                        />
                    ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <AddPersonModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddPerson={handleAddPerson} 
      />

      <BirthdayCalendarModal 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        people={people} 
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        clientId={googleService.CLIENT_ID}
        onSave={(id) => {
            console.log("Nuevo ID guardado:", id);
        }}
      />

      <footer className="max-w-7xl mx-auto px-4 text-center mt-20 text-slate-400 text-sm">
        <p>Tus datos se guardan de forma segura en {isDemoMode ? 'tu Navegador (Demo)' : 'tu propio Google Drive'}.</p>
      </footer>
    </div>
  );
};

export default App;
