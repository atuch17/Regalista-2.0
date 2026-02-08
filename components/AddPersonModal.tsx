
import React, { useState, useMemo, useEffect } from 'react';
import { XIcon, UserPlusIcon, CheckIcon } from './icons';
import { Person, PersonColor } from '../types';
import { MONTHS } from '../utils/dateUtils';

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPerson: (person: Person) => void;
}

const COLORS: { [key in PersonColor]: string } = {
  slate: 'bg-slate-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
};

const BORDER_COLORS: { [key in PersonColor]: string } = {
  slate: 'border-slate-500',
  rose: 'border-rose-500',
  orange: 'border-orange-500',
  emerald: 'border-emerald-500',
  blue: 'border-blue-500',
  violet: 'border-violet-500',
};

const BUTTON_COLORS: { [key in PersonColor]: string } = {
  slate: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
  rose: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
  orange: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  violet: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500',
};

const RING_COLORS: { [key in PersonColor]: string } = {
  slate: 'focus:ring-slate-500 focus:border-slate-500',
  rose: 'focus:ring-rose-500 focus:border-rose-500',
  orange: 'focus:ring-orange-500 focus:border-orange-500',
  emerald: 'focus:ring-emerald-500 focus:border-emerald-500',
  blue: 'focus:ring-blue-500 focus:border-blue-500',
  violet: 'focus:ring-violet-500 focus:border-violet-500',
};

const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onAddPerson }) => {
  const [name, setName] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>('Enero');
  const [selectedColor, setSelectedColor] = useState<PersonColor>('slate');
  const [formError, setFormError] = useState<string | null>(null);

  const daysInMonth = useMemo(() => {
    const monthIndex = MONTHS.indexOf(selectedMonth);
    if (monthIndex === 1) return 29;
    if ([3, 5, 8, 10].includes(monthIndex)) return 30;
    return 31;
  }, [selectedMonth]);

  useEffect(() => { 
    if (selectedDay > daysInMonth) setSelectedDay(daysInMonth); 
  }, [daysInMonth, selectedDay]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setFormError("Por favor, escribe un nombre.");
    const newPerson: Person = {
      id: crypto.randomUUID(),
      name: name.trim(),
      birthday: `${selectedDay} de ${selectedMonth}`,
      color: selectedColor,
      gifts: [],
    };
    onAddPerson(newPerson);
    setName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-all duration-300" onClick={onClose}>
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-100 border-t-8 ${BORDER_COLORS[selectedColor]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Nueva Persona</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre de la persona</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={`mt-1 block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm sm:text-sm transition-all focus:outline-none focus:ring-2 text-slate-900 placeholder:text-slate-400 ${RING_COLORS[selectedColor]}`} 
                placeholder="Ej: Mamá o Juan García" 
                autoFocus 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fecha de Cumpleaños</label>
              <div className="flex gap-3 mt-1">
                 <select 
                    value={selectedDay} 
                    onChange={(e) => setSelectedDay(parseInt(e.target.value))} 
                    className={`w-1/3 px-3 py-3 bg-white border border-slate-200 rounded-xl sm:text-sm focus:outline-none focus:ring-2 transition-all text-slate-900 ${RING_COLORS[selectedColor]}`}
                 >
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
                 <select 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)} 
                    className={`w-2/3 px-3 py-3 bg-white border border-slate-200 rounded-xl sm:text-sm focus:outline-none focus:ring-2 transition-all text-slate-900 ${RING_COLORS[selectedColor]}`}
                 >
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Color de la tarjeta</label>
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {(Object.keys(COLORS) as PersonColor[]).map((color) => (
                    <button 
                      key={color} 
                      type="button" 
                      onClick={() => setSelectedColor(color)} 
                      className={`w-10 h-10 rounded-full ${COLORS[color]} border-4 transition-all duration-200 flex items-center justify-center ${selectedColor === color ? 'border-white scale-125 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'}`}
                    >
                      {selectedColor === color && <CheckIcon className="w-5 h-5 text-white" />}
                    </button>
                ))}
              </div>
            </div>
            
            {formError && (
              <div className="text-sm text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100 flex items-center gap-2 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                {formError}
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-5 flex justify-end items-center space-x-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 ${BUTTON_COLORS[selectedColor]}`}
            >
              <UserPlusIcon className="h-5 w-5" /> 
              Guardar Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonModal;
