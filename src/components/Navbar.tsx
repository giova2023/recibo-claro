import React from 'react';
import { Zap, Download, RefreshCw, Smartphone, GitBranch, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  activeTab: 'calculator' | 'comparator' | 'savings' | 'github_kit';
  setActiveTab: (tab: 'calculator' | 'comparator' | 'savings' | 'github_kit') => void;
  onExportJson: () => void;
  onResetEmpty: () => void;
  onLoadDefaults: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onExportJson,
  onResetEmpty,
  onLoadDefaults,
}) => {
  return (
    <header className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center space-x-2.5">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-xs shadow-inner flex items-center justify-center text-amber-100">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-300 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight leading-none text-white">
                  ReciboClaro
                </h1>
                <span className="bg-amber-400/30 text-amber-100 border border-amber-300/40 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  Ejercicio 35
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-medium">
                Práctica 1: Prompt a App · Grupo 3DS-A
              </p>
            </div>
          </div>

          {/* Mobile Quick Action */}
          <div className="sm:hidden flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveTab('github_kit')}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center space-x-1 ${
                activeTab === 'github_kit'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Kit Entrega</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-1.5 sm:space-x-2 text-xs">
          <button
            onClick={onExportJson}
            title="Exportar respaldo de datos en formato JSON"
            className="flex items-center space-x-1 bg-white/15 hover:bg-white/25 active:scale-95 text-white px-2.5 py-1.5 rounded-lg font-medium transition text-[11px] sm:text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Exportar JSON</span>
            <span className="xs:hidden">JSON</span>
          </button>

          <button
            onClick={onResetEmpty}
            title="Vaciar lista (Ideal para captura E3-vacio.png)"
            className="flex items-center space-x-1 bg-white/10 hover:bg-rose-500/80 active:scale-95 text-white px-2 py-1.5 rounded-lg font-medium transition text-[11px] sm:text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Vaciar</span>
          </button>

          <button
            onClick={onLoadDefaults}
            title="Cargar electrodomésticos típicos"
            className="bg-white/10 hover:bg-white/20 active:scale-95 text-amber-100 px-2 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition"
          >
            Cargar Ejemplo
          </button>

          <button
            onClick={() => setActiveTab('github_kit')}
            className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-bold transition shadow-sm ${
              activeTab === 'github_kit'
                ? 'bg-white text-amber-700 shadow-md ring-2 ring-white/50'
                : 'bg-amber-800/50 hover:bg-amber-800/70 text-amber-100 border border-amber-400/40'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Kit GitHub & Entrega</span>
            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.2 rounded-full uppercase font-black">
              13 Partes
            </span>
          </button>
        </div>

      </div>

      {/* Tabs Menu */}
      <nav className="bg-amber-600/90 backdrop-blur-xs border-t border-amber-400/30">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 flex space-x-1 sm:space-x-2 overflow-x-auto py-1.5 no-scrollbar">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-amber-100 hover:bg-amber-700/60'
            }`}
          >
            <span>⚡ Calculadora & Recibo</span>
          </button>

          <button
            onClick={() => setActiveTab('comparator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'comparator'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-amber-100 hover:bg-amber-700/60'
            }`}
          >
            <span>⚖️ Comparador (Hito M1)</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'savings'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-amber-100 hover:bg-amber-700/60'
            }`}
          >
            <span>💡 Pestaña Ahorro (Hito M5)</span>
          </button>

          <button
            onClick={() => setActiveTab('github_kit')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition whitespace-nowrap ${
              activeTab === 'github_kit'
                ? 'bg-white text-amber-800 shadow-sm'
                : 'text-amber-100 hover:bg-amber-700/60'
            }`}
          >
            <span>📦 Asistente de Entrega & QR</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
