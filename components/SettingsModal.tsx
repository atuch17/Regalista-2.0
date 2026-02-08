
import React from 'react';
import { XIcon, LinkIcon, GoogleIcon, AlertTriangleIcon, SettingsIcon, CheckIcon, TrashIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, clientId }) => {
  const currentOrigin = window.location.origin;
  const localOrigin = "http://localhost:3000";

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copiado al portapapeles: " + text);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-fade-in border border-slate-100" onClick={(e) => e.stopPropagation()}>
        
        <div className="bg-indigo-600 p-8 text-white relative">
            <button onClick={onClose} className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                <XIcon className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-4 mb-2">
                <div className="bg-white p-3 rounded-2xl text-indigo-600">
                    <GoogleIcon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black tracking-tight">Configuración Google</h2>
            </div>
            <p className="text-indigo-100 font-medium">Copia estas URLs en tu Consola de Google Cloud</p>
        </div>
        
        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          
          <div className="space-y-6">
            
            {/* Paso 1: Orígenes Autorizados */}
            <div className="relative pl-10 border-l-2 border-indigo-100 py-2">
                <div className="absolute -left-[11px] top-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">1</div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">Orígenes de JavaScript autorizados</h3>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed text-balance">
                  Debes añadir <b>AMBAS</b> URLs en la primera sección de tu ID de cliente:
                </p>
                
                <div className="space-y-3">
                  {/* URL Producción */}
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex-grow min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">URL Online</span>
                        <code className="text-xs font-bold text-indigo-600 truncate block">{currentOrigin}</code>
                      </div>
                      <button onClick={() => copyToClipboard(currentOrigin)} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                          <LinkIcon className="w-4 h-4" />
                      </button>
                  </div>

                  {/* URL Localhost */}
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <div className="flex-grow min-w-0">
                        <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">URL Local (PC)</span>
                        <code className="text-xs font-bold text-slate-600 truncate block">{localOrigin}</code>
                      </div>
                      <button onClick={() => copyToClipboard(localOrigin)} className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm">
                          <LinkIcon className="w-4 h-4" />
                      </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">* Repite lo mismo en la sección de "URIs de redireccionamiento autorizados".</p>
            </div>

            {/* Paso 2: Usuarios */}
            <div className="relative pl-10 border-l-2 border-indigo-100 py-2">
                <div className="absolute -left-[11px] top-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">2</div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-2">Usuario de prueba</h3>
                <p className="text-xs text-slate-500 leading-relaxed bg-amber-50 p-4 rounded-2xl border border-amber-100 border-dashed">
                    Asegúrate de que <b>aturielcharro@gmail.com</b> esté en la lista de usuarios permitidos en la pestaña de "Pantalla de consentimiento".
                </p>
            </div>

          </div>

          <div className="pt-4 flex flex-col items-center gap-4">
              <button 
                onClick={() => { localStorage.clear(); window.location.reload(); }}
                className="text-[10px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest flex items-center gap-2 transition-colors border border-slate-200 px-4 py-2 rounded-full"
              >
                <TrashIcon className="w-3 h-3" /> Limpiar memoria de la app
              </button>
          </div>

        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-center">
            <button onClick={onClose} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95">
                Entendido, cerrar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
