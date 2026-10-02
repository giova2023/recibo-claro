/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { CalculatorTab } from './components/CalculatorTab';
import { ComparatorTab } from './components/ComparatorTab';
import { SavingsTab } from './components/SavingsTab';
import { GitHubAssistantTab } from './components/GitHubAssistantTab';
import { DEFAULT_APPLIANCES, DEFAULT_TARIFF } from './data/defaultData';
import { Appliance, TariffConfig } from './types';

const STORAGE_KEY_APPLIANCES = 'reciboclaro_appliances_v2';
const STORAGE_KEY_TARIFF = 'reciboclaro_tariff_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparator' | 'savings' | 'github_kit'>('calculator');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize appliances from localStorage or defaults
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_APPLIANCES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading appliances from localStorage', e);
    }
    return DEFAULT_APPLIANCES;
  });

  // Initialize tariff config
  const [tariff, setTariff] = useState<TariffConfig>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TARIFF);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading tariff from localStorage', e);
    }
    return DEFAULT_TARIFF;
  });

  // Persist appliances to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_APPLIANCES, JSON.stringify(appliances));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }, [appliances]);

  // Persist tariff to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TARIFF, JSON.stringify(tariff));
    } catch (e) {
      console.error('Failed saving tariff to localStorage', e);
    }
  }, [tariff]);

  // Global Actions
  const handleExportJson = () => {
    const exportData = {
      app: 'ReciboClaro (Ejercicio 35 - 3DS-A)',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appliances,
      tariff,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo-claro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.1 } });
  };

  const handleResetEmpty = () => {
    if (window.confirm('¿Deseas vaciar la lista de artefactos? (Útil para la captura E3-vacio.png)')) {
      setAppliances([]);
      setErrorMessage(null);
      setActiveTab('calculator');
    }
  };

  const handleLoadDefaults = () => {
    setAppliances(DEFAULT_APPLIANCES);
    setErrorMessage(null);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.1 } });
  };

  // Automated State triggers for Evidence Captures (E0 - E5)
  const handleTriggerE0 = () => {
    setAppliances(DEFAULT_APPLIANCES);
    setErrorMessage(null);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE1Before = () => {
    setActiveTab('comparator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE1After = () => {
    setActiveTab('comparator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE2Before = () => {
    setAppliances([
      ...DEFAULT_APPLIANCES,
      {
        id: 'custom-caloventor',
        name: 'Caloventor baño',
        category: 'climatizacion',
        powerWatts: 1800,
        quantity: 1,
        hoursPerDay: 3,
        daysPerMonth: 30,
      },
    ]);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE2After = () => {
    // Shows the data retained
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE3Empty = () => {
    setAppliances([]);
    setErrorMessage(null);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE4Error = () => {
    setActiveTab('calculator');
    setErrorMessage(
      'Error de validación horaria: El día tiene exactamente 24 horas. Ingresaste 25 horas diarias para "Caloventor". Corrige el valor para que sea menor o igual a 24.'
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE5App = () => {
    setActiveTab('savings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerE5Fail = () => {
    setActiveTab('savings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportJson={handleExportJson}
        onResetEmpty={handleResetEmpty}
        onLoadDefaults={handleLoadDefaults}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {activeTab === 'calculator' && (
          <CalculatorTab
            appliances={appliances}
            setAppliances={setAppliances}
            tariff={tariff}
            setTariff={setTariff}
            errorMessage={errorMessage}
            setErrorMessage={setErrorMessage}
            onGoToSavings={() => setActiveTab('savings')}
          />
        )}

        {activeTab === 'comparator' && (
          <ComparatorTab
            currentAppliances={appliances}
            tariff={tariff}
            onApplySavingsPreset={() => {
              setActiveTab('savings');
            }}
          />
        )}

        {activeTab === 'savings' && (
          <SavingsTab
            appliances={appliances}
            setAppliances={setAppliances}
            tariff={tariff}
            onGoToComparator={() => setActiveTab('comparator')}
          />
        )}

        {activeTab === 'github_kit' && (
          <GitHubAssistantTab
            onTriggerE0={handleTriggerE0}
            onTriggerE1Before={handleTriggerE1Before}
            onTriggerE1After={handleTriggerE1After}
            onTriggerE2Before={handleTriggerE2Before}
            onTriggerE2After={handleTriggerE2After}
            onTriggerE3Empty={handleTriggerE3Empty}
            onTriggerE4Error={handleTriggerE4Error}
            onTriggerE5App={handleTriggerE5App}
            onTriggerE5Fail={handleTriggerE5Fail}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong>ReciboClaro ⚡</strong> · Ejercicio 35 · Práctica 1: Prompt a App (3DS-A)
          </p>
          <div className="flex items-center space-x-3 text-[11px]">
            <button
              onClick={() => setActiveTab('github_kit')}
              className="text-amber-700 hover:text-amber-800 font-bold underline"
            >
              Kit de Entrega GitHub
            </button>
            <span>·</span>
            <button
              onClick={handleExportJson}
              className="text-slate-600 hover:text-slate-900 underline"
            >
              Respaldar Datos
            </button>
            <span>·</span>
            <span>Carlos (carlosseguridadelectronica@gmail.com)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
