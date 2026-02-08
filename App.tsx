
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Person } from './types';
import Header from './components/Header';
import AddPersonModal from './components/AddPersonModal';
import BirthdayCalendarModal from './components/BirthdayCalendarModal';
import SettingsModal from './components/SettingsModal';
import { PersonCard } from './components/PersonCard';
import { StarIcon, AlertTriangleIcon, XIcon, GiftIcon, UserPlusIcon, CakeIcon } from './components/icons';
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
  
  const [isGoogleLinked, setIsGoogleLinked] = useState(!!localStorage.getItem('google_sheet_id'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error' | 'success'>('idle');
  const [spreadsheetId, setSpreadsheetId] = useState(localStorage.getItem('google_sheet_id'));
  const [authError, setAuthError] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    googleService.initGoogleAuth(() => {
        console.log('Google Services Ready');
    });
  }, []);

  // Efecto principal de guardado: LocalStorage + Nube (Debounced)
  useEffect(() => {
    localStorage.setItem('giftify_people', JSON.stringify(people));
    
    if (isGoogleLinked && spreadsheetId) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        
        // Esperar 2 segundos de inactividad antes de subir a la nube
        debounceTimerRef.current = setTimeout(() => {
            syncToCloud(people);
        }, 2000);
    }
  }, [people, isGoogleLinked, spreadsheetId]);

  const syncToCloud = async (data: Person[]) => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
        await googleService.syncToSheets(spreadsheetId!, data);
        setSyncStatus('success');
        // Quitar el check de éxito después de 3 segundos
        setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (e: any) {
        console.error('Cloud Sync Error:', e.message);
        setSyncStatus('error');
        if (e.message.includes('SESION_CADUCADA')) {
            setAuthError(e.message.replace('SESION_CADUCADA: ', ''));
        }
    } finally {
        setIsSyncing(false);
    }
  };

  const handleGoogleLink = async () => {
    if (isSyncing) return;
    
    setAuthError(null);
    if (!googleService.isGoogleApiReady()) {
        alert("Los servicios de Google aún no están listos. Espera un segundo...");
        return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
        await googleService.signIn();
        const sid = await googleService.findOrCreateDatabase();
        setSpreadsheetId(sid);
        localStorage.setItem('google_sheet_id', sid);

        const cloudData = await googleService.loadFromSheets(sid);
        if (cloudData && cloudData.length > 0) {
            if (window.confirm('¡Vínculo correcto! Hemos encontrado datos en tu Drive. ¿Quieres usarlos para reemplazar tu lista local?')) {
                setPeople(cloudData);
            } else {
                // Si elige no, sincronizamos lo local arriba de inmediato
                await googleService.syncToSheets(sid, people);
            }
        } else {
            // Si el Excel está vacío, subimos lo que tenemos ahora
            await googleService.syncToSheets(sid, people);
        }
        
        setIsGoogleLinked(true);
        setSyncStatus('success');
        setAuthError(null);
    } catch (e: any) {
        const errorMsg = e.message || String(e);
        if (errorMsg.includes('USER_CANCELLED')) {
            setSyncStatus('idle');
        } else {
            setAuthError(errorMsg);
            setSyncStatus('error');
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
        syncStatus={syncStatus}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {authError && (
            <div className="mb-6 bg-rose-50 border border-rose-200 p-5 rounded-[2.5rem] flex items-center justify-between animate-fade-in shadow-xl shadow-rose-100/50">
                <div className="flex items-center gap-5 text-rose-900 text-sm">
                    <div className="bg-rose-500 p-3 rounded-2xl flex-shrink-0 shadow-lg shadow-rose-200">
                      <AlertTriangleIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 pr-4">
                        <p className="font-black text-xl leading-tight mb-1">Atención</p>
                        <p className="opacity-80 text-xs font-bold uppercase tracking-wide">
                            {authError}
                        </p>
                    </div>
                </div>
                <button onClick={() => setAuthError(null)} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <XIcon className="w-5 h-5" />
                </button>
            </div>
        )}

        {people.length === 0 && !isSyncing ? (
          <div className="text-center py-24 bg-white border-2 border-dashed border-slate-200 rounded-[3.5rem] mt-8 shadow-sm">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8">
                <GiftIcon className="h-12 w-12 text-slate-300" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tighter">Tu lista está vacía</h2>
            <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium text-lg leading-relaxed">Crea tarjetas para tus personas favoritas y no vuelvas a olvidar un regalo.</p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-3 px-10 py-5 bg-indigo-600 text-white font-black rounded-3xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <UserPlusIcon className="h-7 w-7" />
              Crear Primera Tarjeta
            </button>
          </div>
        ) : (
          <div className="space-y-20">
            {favorites.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-10">
                  <div className="bg-amber-100 p-3 rounded-2xl shadow-sm">
                    <StarIcon className="h-7 w-7 text-amber-500" fill="currentColor" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Favoritos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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

            <section>
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600 shadow-sm">
                  <CakeIcon className="h-7 w-7" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
                  {favorites.length > 0 ? 'Otros cumpleañeros' : 'Próximos Cumpleaños'}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      />
    </div>
  );
};

export default App;
