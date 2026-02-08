
import React, { useState } from 'react';
import { XIcon, CheckIcon, LinkIcon, GoogleIcon, AlertTriangleIcon } from './icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  onSave: (id: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, clientId, onSave }) => {
  const [value, setValue] = useState(clientId);
  const currentOrigin = window.location.origin;
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(`Copiado: ${text}`);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">Configuración y Diagnóstico</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><XIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <GoogleIcon className="w-4 h-4" /> Google Client ID
            </h3>
            <input 
              type="text" 
              readOnly
              value={value} 
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-mono text-slate-600 focus:outline-none cursor-not-allowed"
            />
          </section>

          <section className="bg-amber-50 p-5 rounded-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <AlertTriangleIcon className="w-5 h-5" />
                <span>Datos para Google Cloud Console</span>
            </div>
            
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-amber-600 uppercase">Origen Autorizado (JavaScript Origin)</label>
                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                        <code className="text-xs font-bold text-slate-800 flex-grow">{currentOrigin}</code>
                        <button onClick={() => copyToClipboard(currentOrigin)} className="text-[10px] bg-amber-600 text-white px-2 py-1 rounded font-bold hover:bg-amber-700">Copiar</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-600 uppercase">Hostname</label>
                        <div className="bg-white p-2 rounded-lg border border-amber-200 text-xs font-mono text-slate-600">{currentHost}</div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-600 uppercase">Puerto</label>
                        <div className="bg-white p-2 rounded-lg border border-amber-200 text-xs font-mono text-slate-600">{currentPort || 'Estándar (80/443)'}</div>
                    </div>
                </div>
            </div>

            <div className="text-xs text-amber-800 leading-relaxed bg-white/50 p-3 rounded-xl border border-amber-100">
                <p className="font-bold mb-1">¿Por qué falla?</p>
                <p>Si usas <code>127.0.0.1</code> en lugar de <code>localhost</code>, Google los trata como distintos. Debes autorizar el que aparezca arriba <b>exactamente</b> (sin barra final).</p>
            </div>
          </section>

          <section className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Pasos para corregir el Error 400:</h4>
            <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside">
              <li>Ve a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-indigo-600 font-bold underline">Google Cloud Credentials</a>.</li>
              <li>Edita tu <b>ID de cliente de OAuth 2.0</b>.</li>
              <li>En <b>"Orígenes de JavaScript autorizados"</b>, añade la URL que copiaste arriba.</li>
              <li><b>IMPORTANTE:</b> Dale al botón "Guardar" al final de la página y espera 5 minutos.</li>
            </ol>
          </section>
        </div>

        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
            Cerrar Diagnóstico
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
