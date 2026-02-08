
import React, { useState, useEffect, useMemo } from 'react';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, CakeIcon } from './icons';
import { Person } from '../types';
import { MONTHS } from '../utils/dateUtils';

interface BirthdayCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  people: Person[];
}

const DAYS_OF_WEEK = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

const parseBirthday = (birthdayStr: string): { day: number; monthIndex: number } | null => {
  if (!birthdayStr) return null;
  try {
    const parts = birthdayStr.toLowerCase().replace(/,/g, '').split(' de ');
    if (parts.length !== 2) return null;
    const day = parseInt(parts[0]);
    const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === parts[1].trim());
    if (isNaN(day) || monthIndex === -1) return null;
    return { day, monthIndex };
  } catch (e) { return null; }
};

const BirthdayCalendarModal: React.FC<BirthdayCalendarModalProps> = ({ isOpen, onClose, people }) => {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => { if (isOpen) setCurrentDate(new Date()); }, [isOpen]);

  const currentMonthIndex = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonthIndex + 1, 1));

  const birthdaysInMonth = useMemo(() => {
    const map: { [day: number]: Person[] } = {};
    people.forEach(person => {
      const parsed = parseBirthday(person.birthday);
      if (parsed && parsed.monthIndex === currentMonthIndex) {
        if (!map[parsed.day]) map[parsed.day] = [];
        map[parsed.day].push(person);
      }
    });
    return map;
  }, [people, currentMonthIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button onClick={handlePrevMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"><ChevronLeftIcon className="w-5 h-5" /></button>
                <button onClick={handleNextMonth} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"><ChevronRightIcon className="w-5 h-5" /></button>
            </div>
            <h2 className="text-xl font-bold text-slate-800 capitalize flex items-baseline gap-2">
              {MONTHS[currentMonthIndex]} <span className="text-slate-400 font-normal text-lg">{currentYear}</span>
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100"><XIcon className="h-6 w-6" /></button>
        </div>

        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center">
          {DAYS_OF_WEEK.map(day => <div key={day} className="py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>)}
        </div>

        <div className="overflow-y-auto flex-grow bg-slate-100">
            <div className="grid grid-cols-7 bg-white min-h-full">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className="min-h-[5rem] bg-slate-50/50 border-b border-r border-slate-100"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const bdays = birthdaysInMonth[day];
                    const isToday = day === today.getDate() && currentMonthIndex === today.getMonth() && currentYear === today.getFullYear();
                    return (
                        <div key={day} className={`min-h-[5rem] border-b border-r border-slate-100 p-1 transition-colors hover:bg-slate-50 ${isToday ? 'bg-indigo-50/60' : 'bg-white'}`}>
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${isToday ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>{day}</span>
                          {bdays && <div className="mt-1 flex flex-col gap-1 overflow-hidden">{bdays.map(p => <div key={p.id} className="bg-amber-100 text-amber-800 text-[10px] px-1 py-0.5 rounded border border-amber-200 truncate flex items-center gap-1"><CakeIcon className="w-2.5 h-2.5" /><span className="truncate">{p.name}</span></div>)}</div>}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BirthdayCalendarModal;
