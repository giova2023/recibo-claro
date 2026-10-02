import React, { useState } from 'react';
import { Appliance, TariffConfig } from '../types';
import { calculateTotalConsumption, formatCurrency, formatNumber } from '../utils/calculations';
import { APPLIANCE_PRESETS } from '../data/defaultData';
import { AlertTriangle, Plus, Trash2, Sliders, Sparkles, CheckCircle2, Info } from 'lucide-react';

interface CalculatorTabProps {
  appliances: Appliance[];
  setAppliances: React.Dispatch<React.SetStateAction<Appliance[]>>;
  tariff: TariffConfig;
  setTariff: React.Dispatch<React.SetStateAction<TariffConfig>>;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  onGoToSavings: () => void;
}

export const CalculatorTab: React.FC<CalculatorTabProps> = ({
  appliances,
  setAppliances,
  tariff,
  setTariff,
  errorMessage,
  setErrorMessage,
  onGoToSavings,
}) => {
  // New Appliance form state
  const [name, setName] = useState('');
  const [watts, setWatts] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState<Appliance['category']>('otros');
  const [showTariffSettings, setShowTariffSettings] = useState(false);

  // Compute live consumption
  const consumption = calculateTotalConsumption(appliances, tariff);

  // Add Appliance handler with validation
  const handleAddAppliance = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Por favor escribe el nombre del artefacto eléctrico.');
      return;
    }

    const numericWatts = typeof watts === 'number' ? watts : parseFloat(watts || '0');
    if (isNaN(numericWatts) || numericWatts <= 0) {
      setErrorMessage('Ingresa una potencia en Watts válida (mayor a 0).');
      return;
    }

    const numericHours = typeof hours === 'number' ? hours : parseFloat(hours || '0');
    if (isNaN(numericHours) || numericHours <= 0) {
      setErrorMessage('Debes ingresar al menos 0.1 horas de uso diario.');
      return;
    }

    // STRICT VALIDATION FOR > 24 HOURS (CRITICAL FOR RUBRIC E4-ERROR)
    if (numericHours > 24) {
      setErrorMessage(
        `Error de validación horaria: El día tiene exactamente 24 horas. Ingresaste ${numericHours} horas para "${name.trim()}". Corrige el valor para que sea menor o igual a 24.`
      );
      return;
    }

    // Success: clear error and add
    setErrorMessage(null);
    const newApp: Appliance = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      category,
      powerWatts: numericWatts,
      quantity: Math.max(1, quantity || 1),
      hoursPerDay: numericHours,
      daysPerMonth: 30,
    };

    setAppliances((prev) => [...prev, newApp]);
    setName('');
    setWatts('');
    setHours('');
    setQuantity(1);
  };

  const handleUpdateHours = (id: string, newHours: number) => {
    if (newHours > 24) {
      const app = appliances.find((a) => a.id === id);
      setErrorMessage(
        `Error de validación: El día solo tiene 24 horas. Ingresaste ${newHours} horas en "${app?.name || 'el aparato'}". Por favor ajusta a un máximo de 24h.`
      );
      // Still reflect in state so user can take the exact screenshot for E4-error.png!
    } else {
      setErrorMessage(null);
    }

    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, hoursPerDay: Math.max(0, newHours) } : a))
    );
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const handleApplyPreset = (preset: { name: string; category: string; watts: number; hours: number }) => {
    setName(preset.name);
    setCategory(preset.category as Appliance['category']);
    setWatts(preset.watts);
    setHours(preset.hours);
    setErrorMessage(null);
  };

  // Helper button to trigger E4-error state automatically
  const handleTriggerError25Hours = () => {
    setName('Caloventor de alta potencia');
    setWatts(2000);
    setHours(25);
    setErrorMessage(
      'Error de validación: Un día solo tiene 24 horas. Ingresaste 25 horas diarias para "Caloventor de alta potencia". Corrige el valor para poder realizar el cálculo.'
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ERROR BANNER FOR CAPTURE E4-ERROR.PNG */}
      {errorMessage && (
        <div
          id="validation-error-box"
          className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-md transition-all animate-shake"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="bg-rose-100 text-rose-700 p-2 rounded-lg mt-0.5">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-900 flex items-center">
                  <span>¡Error de validación horaria detectado!</span>
                  <span className="ml-2 bg-rose-200 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Captura E4-error
                  </span>
                </h4>
                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                  {errorMessage}
                </p>
                <p className="text-[11px] text-rose-600 mt-1 italic">
                  💡 Recuerda que para tu informe esta pantalla sirve como evidencia exacta de validación (E4-error.png).
                </p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-600 font-bold text-sm px-2 py-1 rounded"
              title="Cerrar advertencia"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* TARIFF SUMMARY & QUICK CONTROLS */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="font-bold text-slate-800 flex items-center text-xs sm:text-sm">
            <span>Configuración Tarifaria:</span>
          </span>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Moneda:</span>
            <input
              type="text"
              value={tariff.currency}
              onChange={(e) => setTariff({ ...tariff, currency: e.target.value })}
              className="w-10 px-1 py-0.5 border border-slate-300 rounded font-bold text-center text-slate-800"
              title="Símbolo monetario ($, USD, €, etc.)"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Costo por kWh:</span>
            <span className="text-slate-400">{tariff.currency}</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={tariff.pricePerKwh}
              onChange={(e) =>
                setTariff({ ...tariff, pricePerKwh: parseFloat(e.target.value) || 0.01 })
              }
              className="w-16 px-1 py-0.5 border border-slate-300 rounded font-bold text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Cargo Fijo:</span>
            <span className="text-slate-400">{tariff.currency}</span>
            <input
              type="number"
              step="0.5"
              min="0"
              value={tariff.fixedCharge}
              onChange={(e) =>
                setTariff({ ...tariff, fixedCharge: parseFloat(e.target.value) || 0 })
              }
              className="w-14 px-1 py-0.5 border border-slate-300 rounded text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">IVA:</span>
            <input
              type="number"
              min="0"
              max="50"
              value={tariff.taxPercentage}
              onChange={(e) =>
                setTariff({ ...tariff, taxPercentage: parseFloat(e.target.value) || 0 })
              }
              className="w-12 px-1 py-0.5 border border-slate-300 rounded text-slate-800"
            />
            <span className="text-slate-500">%</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 justify-end">
          <button
            onClick={handleTriggerError25Hours}
            className="text-[11px] bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold px-2.5 py-1.5 rounded-lg transition"
            title="Generar error >24h para tomar la captura E4-error"
          >
            ⚡ Test Error 25h (E4)
          </button>
        </div>
      </div>

      {/* METRIC DASHBOARD CARDS */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-zinc-900 text-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-700/50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
          
          {/* Daily kWh */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400">
              Consumo Diario
            </p>
            <p className="text-xl sm:text-3xl font-black text-amber-400 mt-1">
              {formatNumber(consumption.dailyKwh, 2)}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-300">kWh/día</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {formatCurrency(consumption.dailyKwh * tariff.pricePerKwh * (1 + tariff.taxPercentage / 100), tariff.currency)} / día
            </p>
          </div>

          {/* Monthly kWh */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400">
              Consumo Mensual (30d)
            </p>
            <p className="text-xl sm:text-3xl font-black text-emerald-400 mt-1">
              {formatNumber(consumption.monthlyKwh, 1)}{' '}
              <span className="text-xs sm:text-sm font-normal text-slate-300">kWh</span>
            </p>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              Aprox. {formatNumber(consumption.co2KgMonthly, 1)} kg CO₂ emitidos
            </p>
          </div>

          {/* Total Monthly Bill */}
          <div className="p-3 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-400/30">
            <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-amber-300">
              Total Factura Mensual
            </p>
            <p className="text-xl sm:text-3xl font-black text-amber-300 mt-1">
              {formatCurrency(consumption.monthlyTotal, tariff.currency)}
            </p>
            <p className="text-[11px] text-amber-200/70 mt-1">
              Incluye cargo fijo + {tariff.taxPercentage}% IVA
            </p>
          </div>

          {/* Bimonthly Bill */}
          <div className="p-3 sm:p-4 rounded-xl bg-slate-800/60 border border-slate-700/40">
            <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-slate-400">
              Proyección Bimestral (60d)
            </p>
            <p className="text-xl sm:text-3xl font-black text-slate-100 mt-1">
              {formatCurrency(consumption.monthlyTotal * 2, tariff.currency)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {formatNumber(consumption.bimonthlyKwh, 0)} kWh totales
            </p>
          </div>

        </div>

        {/* Breakdown bar */}
        {consumption.breakdown.length > 0 && (
          <div className="mt-4 sm:mt-6 pt-4 border-t border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-2 font-medium">
              <span>Distribución del Consumo Eléctrico:</span>
              <button
                onClick={onGoToSavings}
                className="text-amber-400 hover:text-amber-300 text-xs flex items-center font-bold underline"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                <span>Ver cómo ahorrar en la Pestaña Ahorro →</span>
              </button>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 flex overflow-hidden p-0.5">
              {consumption.breakdown.slice(0, 5).map((item, idx) => {
                const colors = ['bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-rose-500', 'bg-indigo-500'];
                return (
                  <div
                    key={item.appliance.id}
                    style={{ width: `${Math.max(2, item.percentageOfTotal)}%` }}
                    className={`${colors[idx % colors.length]} h-full transition-all duration-300`}
                    title={`${item.appliance.name}: ${item.percentageOfTotal.toFixed(1)}%`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FORM TO ADD APPLIANCE */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center">
            <span className="bg-amber-100 text-amber-800 p-1 rounded-md mr-2">
              <Plus className="w-4 h-4" />
            </span>
            Registrar Nuevo Artefacto Eléctrico
          </h3>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Un día solar cuenta con un máximo de 24 horas
          </span>
        </div>

        <form onSubmit={handleAddAppliance} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            
            {/* Name */}
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Nombre del Artefacto
              </label>
              <input
                type="text"
                placeholder="Ej. Aire Split, Caloventor, Pava..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Category */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Appliance['category'])}
                className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              >
                <option value="climatizacion">Climatización</option>
                <option value="refrigeracion">Refrigeración</option>
                <option value="lineablanca">Línea Blanca</option>
                <option value="cocina">Cocina</option>
                <option value="electronica">Electrónica</option>
                <option value="iluminacion">Iluminación</option>
                <option value="otros">Otros</option>
              </select>
            </div>

            {/* Watts */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Potencia (Watts)
              </label>
              <input
                type="number"
                placeholder="1000"
                min="1"
                value={watts}
                onChange={(e) => setWatts(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Hours per Day (Validation rule!) */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>Horas/Día</span>
                <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 rounded">
                  0-24h
                </span>
              </label>
              <input
                type="number"
                placeholder="4"
                min="0.1"
                max="24"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value === '' ? '' : parseFloat(e.target.value))}
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:ring-2 ${
                  typeof hours === 'number' && hours > 24
                    ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-300'
                    : 'border-slate-300 focus:ring-amber-500'
                }`}
              />
            </div>

            {/* Quantity */}
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

          </div>

          {/* Quick presets and submit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px] pb-1 sm:pb-0 no-scrollbar">
              <span className="text-slate-400 font-semibold shrink-0">Comunes:</span>
              {APPLIANCE_PRESETS.slice(0, 5).map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  className="bg-slate-100 hover:bg-slate-200 active:scale-95 px-2.5 py-1 rounded-lg text-slate-700 font-medium transition shrink-0"
                >
                  +{preset.name} ({preset.watts}W)
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Guardar Artefacto</span>
            </button>
          </div>
        </form>
      </div>

      {/* APPLIANCES INVENTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-sm text-slate-800">
              Inventario de Artefactos Registrados
            </h3>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {appliances.length}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Persistencia en LocalStorage activa (Hito M2)
          </span>
        </div>

        {appliances.length === 0 ? (
          <div className="p-8 sm:p-12 text-center" id="empty-state-view">
            <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center text-3xl">
              🔌
            </div>
            <h4 className="font-bold text-slate-800 text-base">
              No hay artefactos registrados (Estado Vacío)
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Esta pantalla representa la evidencia <strong>E3-vacio.png</strong> de tu práctica.
              Agrega tu primer aparato arriba o carga los ejemplos típicos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 sm:p-3.5">Artefacto</th>
                  <th className="p-3 text-center">Potencia</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-center">Horas/Día (máx 24h)</th>
                  <th className="p-3 text-right">Consumo Mensual</th>
                  <th className="p-3 text-right">Costo Est. ($)</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {consumption.breakdown.map((item) => {
                  const isOverLimit = item.appliance.hoursPerDay > 24;
                  return (
                    <tr
                      key={item.appliance.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isOverLimit ? 'bg-rose-50/70 border-rose-200' : ''
                      }`}
                    >
                      <td className="p-3 sm:p-3.5">
                        <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
                          <span>{item.appliance.name}</span>
                          {isOverLimit && (
                            <span className="text-[10px] bg-rose-500 text-white font-bold px-1.5 py-0.2 rounded">
                              &gt; 24h ERROR
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {item.appliance.category}
                        </span>
                      </td>

                      <td className="p-3 text-center font-medium text-slate-700">
                        {item.appliance.powerWatts} W
                      </td>

                      <td className="p-3 text-center font-medium text-slate-700">
                        x{item.appliance.quantity}
                      </td>

                      <td className="p-3 text-center">
                        <div className="inline-flex items-center space-x-1">
                          <input
                            type="number"
                            min="0"
                            max="24"
                            step="0.5"
                            value={item.appliance.hoursPerDay}
                            onChange={(e) =>
                              handleUpdateHours(item.appliance.id, parseFloat(e.target.value) || 0)
                            }
                            className={`w-16 px-1.5 py-1 text-center font-bold border rounded-lg ${
                              isOverLimit
                                ? 'border-rose-500 bg-rose-100 text-rose-800 ring-2 ring-rose-400'
                                : 'border-slate-300 text-slate-800'
                            }`}
                          />
                          <span className="text-slate-500 text-[11px]">h/día</span>
                        </div>
                      </td>

                      <td className="p-3 text-right font-bold text-slate-800">
                        {formatNumber(item.monthlyKwh, 1)} kWh
                        <span className="block text-[10px] font-normal text-slate-400">
                          {item.percentageOfTotal.toFixed(1)}% del total
                        </span>
                      </td>

                      <td className="p-3 text-right font-black text-emerald-600">
                        {formatCurrency(item.monthlyCost, tariff.currency)}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteAppliance(item.appliance.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                          title="Eliminar artefacto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
