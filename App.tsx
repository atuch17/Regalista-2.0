
import React, { useState, useEffect, useMemo } from 'react';
import { Person } from './types';
import Header from './components/Header';
import AddPersonModal from './components/AddPersonModal';
import BirthdayCalendarModal from './components/BirthdayCalendarModal';
import { PersonCard } from './components/PersonCard';
import { StarIcon } from './components/icons';
import { getDaysUntilBirthday } from './utils/dateUtils';
import * as googleService from './services/googleSheetsService';

const App: React.FC = () => {
  const [people, setPeople] = useState<Person[]>(() => {
    const saved = localStorage.getItem('giftify_people');
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Google Auth State
  const [isGoogleLinked, setIsGoogleLinked] = useState(!!localStorage.getItem('google_sheet_id'));
  const [isSyncing, setIsSyncing] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState(localStorage.getItem('google_sheet_id'));

  useEffect(() => {
    googleService.initGoogleAuth(() => {
        console.log('Google APIs loaded');
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('giftify_people', JSON.stringify(people));
    
    // Sync to Google Sheets if linked
    if (isGoogleLinked && spreadsheetId) {
        syncToCloud(people);
    }
  }, [people, isGoogleLinked, spreadsheetId]);

  const syncToCloud = async (data: Person[]) => {
    setIsSyncing(true);
    try {
        await googleService.syncToSheets(spreadsheetId!, data);
    } catch (e) {
        console.error('Sync failed', e);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleGoogleLink = async () => {
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
        if (cloudData.length > 0) {
            if (window.confirm('Se han encontrado datos en tu cuenta de Google. ¿Quieres sobrescribir tu lista local con los datos de la nube?')) {
                setPeople(cloudData);
            }
        }
        setIsGoogleLinked(true);
    } catch (e) {
        console.error('Google link failed', e);
        alert('No se pudo vincular con Google. Revisa tu conexión o permisos.');
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
            {/* Sync Indicator for Desktop */}
            {isSyncing && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce">
                    <div className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                        Sincronizando con Google...
                    </div>
                </div>
            )}

            {/* Favorites Section */}
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

            {/* General Section */}
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

      <footer className="max-w-7xl mx-auto px-4 text-center mt-20 text-slate-400 text-sm">
        <p>Tus datos se guardan de forma segura en tu propio Google Drive.</p>
        <p className="mt-1">Archivo: RegalistaDB_AppData.xlsx</p>
      </footer>
    </div>
  );
};

export default App;
