
import React, { useState, useMemo, useEffect } from 'react';
import { Person, PersonColor, GiftPriority, Gift } from '../types';
import GiftItem from './GiftItem';
import { PlusIcon, CakeIcon, TrashIcon, PencilIcon, ShareIcon, CheckIcon, ChevronDownIcon, ChevronUpIcon, EuroIcon, LinkIcon, BellIcon, StarIcon, FireIcon, SparklesIcon, CoffeeIcon, XIcon } from './icons';
import { getDaysUntilBirthday, parseBirthdayString, MONTHS } from '../utils/dateUtils';

interface PersonCardProps {
  person: Person;
  onUpdate: (updatedPerson: Person) => void;
  onDelete: (id: string) => void;
}

const COLORS: { [key in PersonColor]: string } = {
  slate: 'bg-slate-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  violet: 'bg-violet-500',
};

const COLOR_STYLES: { [key in PersonColor]: { bg: string, border: string, text: string, textLight: string, button: string } } = {
  slate: { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800', textLight: 'text-slate-600', button: 'bg-slate-600 hover:bg-slate-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-900', textLight: 'text-rose-700', button: 'bg-rose-600 hover:bg-rose-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900', textLight: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900', textLight: 'text-emerald-700', button: 'bg-emerald-600 hover:bg-emerald-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', textLight: 'text-blue-700', button: 'bg-blue-600 hover:bg-blue-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-900', textLight: 'text-violet-700', button: 'bg-violet-600 hover:bg-violet-700' },
};

export const PersonCard: React.FC<PersonCardProps> = ({ person, onUpdate, onDelete }) => {
  const [isAddingGift, setIsAddingGift] = useState(false);
  const [newGiftName, setNewGiftName] = useState('');
  const [newGiftDescription, setNewGiftDescription] = useState('');
  const [newGiftPrice, setNewGiftPrice] = useState('');
  const [newGiftLink, setNewGiftLink] = useState('');
  const [newGiftPriority, setNewGiftPriority] = useState<GiftPriority>('medium');

  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editedName, setEditedName] = useState(person.name);
  const initialDate = useMemo(() => parseBirthdayString(person.birthday), [person.birthday]);
  const [editedDay, setEditedDay] = useState(initialDate.day);
  const [editedMonth, setEditedMonth] = useState(initialDate.month);
  const [editedColor, setEditedColor] = useState<PersonColor>(person.color || 'slate');
  
  const [isCopied, setIsCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isPurchasedExpanded, setIsPurchasedExpanded] = useState(false);

  const daysUntilBirthday = useMemo(() => getDaysUntilBirthday(person.birthday), [person.birthday]);
  const styles = COLOR_STYLES[person.color || 'slate'];

  const pendingGifts = useMemo(() => {
      const pending = person.gifts.filter(g => g.status === 'pendiente');
      const priorityOrder: { [key in GiftPriority]: number } = { high: 3, medium: 2, low: 1 };
      return pending.sort((a, b) => priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium']);
  }, [person.gifts]);

  const purchasedGifts = person.gifts.filter(g => g.status === 'comprado');
  const totalPurchasedAmount = purchasedGifts.reduce((sum, gift) => sum + (gift.price || 0), 0);

  const handleAddGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGiftName.trim()) {
      const gift: Gift = {
        id: crypto.randomUUID(),
        name: newGiftName.trim(),
        description: newGiftDescription.trim(),
        price: newGiftPrice ? parseFloat(newGiftPrice) : 0,
        link: newGiftLink.trim(),
        priority: newGiftPriority,
        status: 'pendiente'
      };
      onUpdate({ ...person, gifts: [...person.gifts, gift] });
      setNewGiftName('');
      setNewGiftDescription('');
      setNewGiftPrice('');
      setNewGiftLink('');
      setNewGiftPriority('medium');
      setIsAddingGift(false);
    }
  };

  const handleToggleGiftStatus = (giftId: string) => {
    const updatedGifts = person.gifts.map(g => 
      g.id === giftId ? { ...g, status: g.status === 'pendiente' ? 'comprado' : 'pendiente' } : g
    );
    onUpdate({ ...person, gifts: updatedGifts as any });
  };

  const handleEditGift = (giftId: string, name: string, description: string, price?: number, link?: string, priority?: GiftPriority) => {
    const updatedGifts = person.gifts.map(g => 
      g.id === giftId ? { ...g, name, description, price, link, priority } : g
    );
    onUpdate({ ...person, gifts: updatedGifts as any });
  };

  const handleDeleteGift = (giftId: string) => {
    onUpdate({ ...person, gifts: person.gifts.filter(g => g.id !== giftId) });
  };

  const handleSavePerson = () => {
    if (editedName.trim()) {
        const formattedBirthday = `${editedDay} de ${editedMonth}`;
        onUpdate({ ...person, name: editedName.trim(), birthday: formattedBirthday, color: editedColor });
        setIsEditingPerson(false);
    }
  };

  const handleShare = async () => {
    let text = `🎂 Regalos para ${person.name} (${person.birthday})\n`;
    text += `💰 Presupuesto estimado: ${person.gifts.reduce((sum, g) => sum + (g.price || 0), 0)}€\n\n`;
    text += pendingGifts.map(g => `⬜ ${g.name}${g.price ? ` (${g.price}€)` : ''}`).join('\n') + '\n';
    if (purchasedGifts.length > 0) text += '\n✅ Comprados:\n' + purchasedGifts.map(g => `✅ ${g.name}`).join('\n');
    
    try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    } catch (err) { console.error('Failed to copy:', err); }
  };

  const handleAddToCalendar = () => {
    const months: { [key: string]: number } = { 'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5, 'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11 };
    const parts = person.birthday.toLowerCase().split(' de ');
    if (parts.length !== 2) return;
    const day = parseInt(parts[0]);
    const month = months[parts[1].trim()];
    const today = new Date();
    let year = today.getFullYear();
    const date = new Date(year, month, day);
    if (date < today) year += 1;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const start = `${year}${pad(month + 1)}${pad(day)}`;
    const nextDay = new Date(year, month, day + 1);
    const end = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
    const title = encodeURIComponent(`🎂 Cumpleaños de ${person.name}`);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&recur=RRULE:FREQ=YEARLY`;
    window.open(calendarUrl, '_blank');
    onUpdate({ ...person, reminderSet: true });
  };

  const renderDaysLeftText = () => {
    if (daysUntilBirthday === null) return null;
    if (daysUntilBirthday === 0) return '¡Es hoy!';
    if (daysUntilBirthday === 1) return 'Falta 1 día';
    return `Faltan ${daysUntilBirthday} días`;
  };

  const PriorityButton = ({ level, icon: Icon, label, colorClass }: { level: GiftPriority, icon: any, label: string, colorClass: string }) => (
    <button
        type="button"
        onClick={() => setNewGiftPriority(level)}
        className={`flex-1 py-1.5 px-2 rounded-md border text-xs font-medium flex items-center justify-center gap-1 transition-all
            ${newGiftPriority === level ? `${colorClass} border-transparent text-white shadow-sm` : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
    >
        <Icon className="w-3.5 h-3.5" />
        {label}
    </button>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-shadow duration-300 relative border-t-4 ${styles.text} ${styles.border.replace('border', 'border-t')}`}>
      {/* Toast Notification for Clipboard */}
      {isCopied && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-slate-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 backdrop-blur-sm bg-opacity-90">
            <CheckIcon className="w-3 h-3 text-emerald-400" />
            ¡Copiado al portapapeles!
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowDeleteConfirm(false)}>
           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-xs w-full text-center border-t-4 border-red-500 scale-100 transform transition-all" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <TrashIcon className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar a {person.name}?</h4>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">Esta acción borrará la tarjeta y todas las ideas de regalo asociadas. No se puede deshacer.</p>
              <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => { setShowDeleteConfirm(false); onDelete(person.id); }}
                    className="flex-1 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all"
                  >
                    Eliminar
                  </button>
              </div>
           </div>
        </div>
      )}

      {!isEditingPerson && (
        <div className={`absolute top-4 right-4 z-10 flex items-center gap-1 bg-white/50 backdrop-blur-sm rounded-full p-0.5 pl-2 border shadow-sm ${styles.border}`}>
            <button onClick={() => setIsExpanded(!isExpanded)} title={isExpanded ? "Contraer" : "Expandir"} className={`transition-colors p-1 rounded-full hover:bg-white text-slate-400 hover:${styles.text}`}>
                {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
            </button>
            <div className="w-px h-3 bg-slate-300 mx-0.5"></div>
            <button onClick={() => onUpdate({ ...person, isFavorite: !person.isFavorite })} title="Favorito" className={`transition-colors p-1 rounded-full hover:bg-white ${person.isFavorite ? 'text-amber-400' : `text-slate-400 hover:${styles.text}`}`}>
                <StarIcon className="h-4 w-4" fill={person.isFavorite ? "currentColor" : "none"} />
            </button>
            <button onClick={handleAddToCalendar} title="Añadir a Calendario" className={`transition-colors p-1 rounded-full hover:bg-white ${person.reminderSet ? styles.text : `text-slate-400 hover:${styles.text}`}`}>
                <BellIcon className="h-4 w-4" fill={person.reminderSet ? "currentColor" : "none"} />
            </button>
            <button onClick={handleShare} title="Compartir lista" className={`transition-colors p-1 rounded-full hover:bg-white ${isCopied ? 'text-green-600' : `text-slate-400 hover:${styles.text}`}`}>
                {isCopied ? <CheckIcon className="h-4 w-4" /> : <ShareIcon className="h-4 w-4" />}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} title="Eliminar tarjeta" className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-white">
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
      )}

      <div className={`p-5 flex flex-col relative ${styles.bg} ${styles.border} border-b`}>
        {isEditingPerson ? (
           <div className="flex-grow space-y-3 w-full pt-6">
             <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm text-slate-900 placeholder:text-slate-400" placeholder="Nombre" />
             <div className="flex gap-2">
                 <select value={editedDay} onChange={(e) => setEditedDay(parseInt(e.target.value))} className="w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-xl sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
                 <select value={editedMonth} onChange={(e) => setEditedMonth(e.target.value)} className="w-2/3 px-3 py-2 bg-white border border-slate-300 rounded-xl sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
             </div>
             <div className="flex gap-2">
                {(Object.keys(COLORS) as PersonColor[]).map((color) => (
                    <button key={color} type="button" onClick={() => setEditedColor(color)} className={`w-6 h-6 rounded-full ${COLORS[color]} border-2 transition-all ${editedColor === color ? 'border-slate-600 scale-110' : 'border-transparent'}`} />
                ))}
             </div>
             <div className="flex items-center gap-2 mt-2">
                 <button onClick={handleSavePerson} className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-md ${styles.button}`}>Guardar</button>
                 <button onClick={() => setIsEditingPerson(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50">Cancelar</button>
             </div>
           </div>
        ) : (
          <div className="w-full">
            <div className="flex items-center pr-28 group"> 
                {person.isFavorite && <StarIcon className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0" fill="currentColor" />}
                <h3 className={`text-xl font-bold truncate ${styles.text}`}>{person.name}</h3>
                <button onClick={() => setIsEditingPerson(true)} className={`ml-2 text-slate-400 hover:${styles.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <PencilIcon className="h-4 w-4" />
                </button>
            </div>
            <div className={`mt-2 flex justify-between items-center text-sm w-full ${styles.textLight}`}>
                <div className="flex items-center"><CakeIcon className="h-4 w-4 mr-2" /><span>{person.birthday}</span></div>
                {daysUntilBirthday !== null && <div className="text-right"><span className="font-semibold opacity-75">{renderDaysLeftText()}</span></div>}
            </div>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <>
          <div className="p-5 flex-grow animate-fade-in">
            {person.gifts.length === 0 ? (
               <p className="text-slate-500 text-center py-4 italic">No hay ideas de regalos para {person.name}.</p>
            ) : (
              <div className="space-y-4">
                {pendingGifts.length > 0 && (
                   <ul className="divide-y divide-slate-200">
                     {pendingGifts.map(gift => (
                       <GiftItem key={gift.id} gift={gift} onToggleStatus={handleToggleGiftStatus} onEdit={handleEditGift} onDelete={handleDeleteGift} />
                     ))}
                   </ul>
                )}
                {purchasedGifts.length > 0 && (
                    <div className="mt-2">
                        <button onClick={() => setIsPurchasedExpanded(!isPurchasedExpanded)} className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 text-xs font-medium text-slate-500 transition-colors">
                            <span className="flex items-center"><CheckIcon className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />{purchasedGifts.length} comprados</span>
                            <div className="flex items-center gap-3">{totalPurchasedAmount > 0 && <span className="text-slate-600 font-semibold">Total: {totalPurchasedAmount} €</span>}{isPurchasedExpanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}</div>
                        </button>
                        {isPurchasedExpanded && (
                            <ul className="divide-y divide-slate-200 mt-2 pl-2 border-l-2 border-slate-100 animate-fade-in">
                                {purchasedGifts.map(gift => <GiftItem key={gift.id} gift={gift} onToggleStatus={handleToggleGiftStatus} onEdit={handleEditGift} onDelete={handleDeleteGift} />)}
                            </ul>
                        )}
                    </div>
                )}
              </div>
            )}
          </div>
          <div className="p-5 border-t border-slate-200 bg-slate-100/50">
            {!isAddingGift ? (
               <div className="flex gap-2">
                 <button onClick={() => setIsAddingGift(true)} className={`flex-1 py-2 bg-white border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:${styles.text} hover:border-slate-400 transition-all flex items-center justify-center gap-2 font-medium text-sm`}>
                   <PlusIcon className="h-5 w-5" /> Nueva Idea
                 </button>
               </div>
            ) : (
                <form onSubmit={handleAddGiftSubmit} className="space-y-3 animate-fade-in bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <input type="text" value={newGiftName} onChange={(e) => setNewGiftName(e.target.value)} placeholder="¿Qué quieres regalar?" autoFocus className={`block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-inner sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium`} />
                  <textarea value={newGiftDescription} onChange={(e) => setNewGiftDescription(e.target.value)} placeholder="Detalles (talla, tienda...)" rows={2} className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-inner sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400" />
                  <div className="flex gap-3">
                     <div className="relative w-1/3">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><EuroIcon className="h-4 w-4 text-slate-400" /></div>
                        <input type="number" value={newGiftPrice} onChange={(e) => setNewGiftPrice(e.target.value)} placeholder="PVP" className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400" />
                     </div>
                     <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LinkIcon className="h-4 w-4 text-slate-400" /></div>
                        <input type="text" value={newGiftLink} onChange={(e) => setNewGiftLink(e.target.value)} placeholder="URL de la tienda" className="block w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400" />
                     </div>
                  </div>
                  <div className="flex gap-2"><PriorityButton level="high" icon={FireIcon} label="Alta" colorClass="bg-red-500" /><PriorityButton level="medium" icon={SparklesIcon} label="Media" colorClass="bg-amber-500" /><PriorityButton level="low" icon={CoffeeIcon} label="Baja" colorClass="bg-blue-400" /></div>
                  <div className="flex items-center gap-3 pt-2">
                    <button type="submit" className={`flex-grow py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-all active:scale-95 ${styles.button}`}>Guardar Idea</button>
                    <button type="button" onClick={() => setIsAddingGift(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
                  </div>
                </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};
