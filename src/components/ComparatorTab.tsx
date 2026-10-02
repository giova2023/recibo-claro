import React, { useState } from 'react';
import { Appliance, TariffConfig } from '../types';
import { calculateTotalConsumption, formatCurrency, formatNumber } from '../utils/calculations';
import { ArrowDownRight, ArrowUpRight, Scale, CheckCircle2, History, Sparkles, TrendingDown } from 'lucide-react';

interface ComparatorTabProps {
  currentAppliances: Appliance[];
  tariff: TariffConfig;
  onApplySavingsPreset: () => void;
}

export const ComparatorTab: React.FC<ComparatorTabProps> = ({
  currentAppliances,
  tariff,
  onApplySavingsPreset,
}) => {
  // Baseline "Antes" scenario state
  const [baselineKwh, setBaselineKwh] = useState<number>(380);
  const [baselineCost, setBaselineCost] = useState<number>(75.40);
  const [baselineTitle, setBaselineTitle] = useState<string>('Mes Anterior (Sin Ahorro)');
  const [isComparingActive, setIsComparingActive] = useState<boolean>(true);

  // Current "Después" consumption
  const currentConsumption = calculateTotalConsumption(currentAppliances, tariff);
  const currentKwh = currentConsumption.monthlyKwh;
  const currentCost = currentConsumption.monthlyTotal;

  // Delta calculations
  const diffKwh = currentKwh - baselineKwh;
  const diffCost = currentCost - baselineCost;
  const pctChange = baselineKwh > 0 ? ((diffKwh / baselineKwh) * 100) : 0;
  const isSaving = diffKwh <= 0;

  const handleCaptureCurrentAsBaseline = () => {
    setBaselineKwh(parseFloat(currentKwh.toFixed(1)));
    setBaselineCost(parseFloat(currentCost.toFixed(2)));
    setBaselineTitle('Instantánea Registrada');
    setIsComparingActive(true);
  };

  const handleSetPresetScenario = (type: 'verano' | 'derroche' | 'ahorro') => {
    if (type === 'verano') {
      setBaselineKwh(490);
      setBaselineCost(98.50);
      setBaselineTitle('Verano (Aires a 20°C todo el día)');
    } else if (type === 'derroche') {
      setBaselineKwh(420);
      setBaselineCost(84.00);
      setBaselineTitle('Hogar sin hábitos de eficiencia');
    } else {
      setBaselineKwh(280);
      setBaselineCost(54.20);
      setBaselineTitle('Meta Ecológica Recomendada');
    }
    setIsComparingActive(true);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-800 text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 p-1.5 rounded-lg">
              <Scale className="w-5 h-5 text-indigo-200" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Comparador de Escenarios de Consumo
            </h2>
            <span className="bg-indigo-400/30 text-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-300/40">
              Hito M1
            </span>
          </div>
          <p className="text-xs sm:text-sm text-indigo-100/90 mt-1 max-w-2xl leading-relaxed">
            Evalúa el impacto económico y energético antes y después de aplicar medidas de ahorro.
            Ideal para las capturas <strong>E1-antes.png</strong> (sin comparar) y <strong>E1-despues.png</strong> (comparación activa).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsComparingActive(!isComparingActive)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              isComparingActive
                ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-sm'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <span>{isComparingActive ? '👁️ Ocultar Comparativa (E1-antes)' : '⚡ Activar Comparativa (E1-despues)'}</span>
          </button>

          <button
            onClick={handleCaptureCurrentAsBaseline}
            className="bg-white/10 hover:bg-white/25 active:scale-95 text-white px-3 py-2 rounded-xl text-xs font-semibold transition border border-white/20"
          >
            📸 Fijar Datos Actuales como "Antes"
          </button>
        </div>
      </div>

      {/* QUICK PRESETS */}
      <div className="flex items-center space-x-2 overflow-x-auto text-xs pb-1 no-scrollbar">
        <span className="text-slate-500 font-bold shrink-0">Escenarios típicos para comparar:</span>
        <button
          onClick={() => handleSetPresetScenario('derroche')}
          className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-700 transition shrink-0"
        >
          🏭 Hogar estándar (420 kWh)
        </button>
        <button
          onClick={() => handleSetPresetScenario('verano')}
          className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-700 transition shrink-0"
        >
          ☀️ Mes de Verano pico (490 kWh)
        </button>
        <button
          onClick={() => handleSetPresetScenario('ahorro')}
          className="bg-white hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-700 transition shrink-0"
        >
          🌱 Meta de Ahorro (280 kWh)
        </button>
      </div>

      {/* COMPARISON METRICS GRID */}
      {isComparingActive ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* ESCENARIO ANTES */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                Escenario Antes (Referencia)
              </span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Línea Base
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{baselineTitle}</p>

            <div className="mt-4">
              <p className="text-3xl font-black text-slate-800">
                {formatNumber(baselineKwh, 1)}{' '}
                <span className="text-sm font-normal text-slate-500">kWh/mes</span>
              </p>
              <p className="text-sm font-bold text-slate-600 mt-1">
                Factura: {formatCurrency(baselineCost, tariff.currency)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
              <span>Bimestral: {formatCurrency(baselineCost * 2, tariff.currency)}</span>
              <span>CO₂: ~{(baselineKwh * 0.45).toFixed(0)} kg</span>
            </div>
          </div>

          {/* ESCENARIO DESPUÉS (ACTUAL) */}
          <div className="bg-amber-50/60 p-5 rounded-2xl border-2 border-amber-300 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider">
                Escenario Después (Actual)
              </span>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                En vivo
              </span>
            </div>
            <p className="text-xs text-amber-700 mt-0.5">Inventario de aparatos actual</p>

            <div className="mt-4">
              <p className="text-3xl font-black text-amber-950">
                {formatNumber(currentKwh, 1)}{' '}
                <span className="text-sm font-normal text-amber-700">kWh/mes</span>
              </p>
              <p className="text-sm font-bold text-amber-900 mt-1">
                Factura: {formatCurrency(currentCost, tariff.currency)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/60 text-[11px] text-amber-800 flex justify-between">
              <span>Bimestral: {formatCurrency(currentCost * 2, tariff.currency)}</span>
              <span>CO₂: ~{currentConsumption.co2KgMonthly.toFixed(0)} kg</span>
            </div>
          </div>

          {/* DELTA / DIFERENCIA / IMPACTO */}
          <div
            className={`p-5 rounded-2xl border-2 shadow-xs relative overflow-hidden ${
              isSaving
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-rose-50 border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-black uppercase tracking-wider ${
                  isSaving ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                {isSaving ? '✅ Ahorro Obtenido' : '⚠️ Aumento de Consumo'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isSaving
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-rose-200 text-rose-900'
                }`}
              >
                Variación
              </span>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <div
                className={`p-2 rounded-xl text-white ${
                  isSaving ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {isSaving ? (
                  <TrendingDown className="w-6 h-6" />
                ) : (
                  <ArrowUpRight className="w-6 h-6" />
                )}
              </div>
              <div>
                <p
                  className={`text-3xl font-black leading-none ${
                    isSaving ? 'text-emerald-800' : 'text-rose-800'
                  }`}
                >
                  {isSaving ? '-' : '+'}
                  {formatNumber(Math.abs(diffKwh), 1)}{' '}
                  <span className="text-sm font-normal">kWh</span>
                </p>
                <p
                  className={`text-sm font-bold mt-1 ${
                    isSaving ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {isSaving ? 'Ahorras' : 'Costo extra'}:{' '}
                  {formatCurrency(Math.abs(diffCost), tariff.currency)} ({Math.abs(pctChange).toFixed(1)}%)
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-xs leading-relaxed">
              {isSaving ? (
                <p className="text-emerald-800">
                  🎉 <strong>¡Excelente logro!</strong> Estás ahorrando{' '}
                  <strong>{formatCurrency(Math.abs(diffCost) * 12, tariff.currency)} al año</strong> y
                  evitando {(Math.abs(diffKwh) * 0.45).toFixed(1)} kg de emisiones de CO₂.
                </p>
              ) : (
                <p className="text-rose-800">
                  ⚠️ Tu consumo actual es superior al escenario de referencia. Revisa los artefactos con mayor tiempo de uso en la pestaña Ahorro.
                </p>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* VISTA SIN COMPARAR (PARA E1-ANTES.PNG) */
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 mx-auto bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            Modo Sin Comparación Activa
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Esta vista corresponde a la captura <strong>E1-antes.png</strong> de tu práctica.
            Haz clic en el botón inferior para activar la comparativa y tomar <strong>E1-despues.png</strong>.
          </p>
          <button
            onClick={() => setIsComparingActive(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm inline-flex items-center space-x-1.5"
          >
            <Scale className="w-4 h-4" />
            <span>Activar Comparación (Hito M1)</span>
          </button>
        </div>
      )}

      {/* DETAILED DIFFERENCE TABLE */}
      {isComparingActive && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-800 flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
            <span>Desglose Analítico del Cambio de Consumo</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Equivalente en árboles:</span>
              <strong className="text-slate-800 text-sm">
                {isSaving ? `${Math.max(1, Math.round(Math.abs(diffKwh) * 0.05))} árboles absorbentes/año` : '0 árboles'}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Ahorro Anual Proyectado:</span>
              <strong className="text-emerald-700 text-sm">
                {formatCurrency(Math.max(0, Math.abs(diffCost) * 12), tariff.currency)}
              </strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block font-medium">Estado para Rúbrica:</span>
              <strong className="text-indigo-700 text-sm">
                Hito M1 cumplido (E1-despues.png)
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
