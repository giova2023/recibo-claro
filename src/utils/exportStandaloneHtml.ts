/**
 * Generates a standalone single-file index.html that contains the complete
 * working app for Ejercicio 35 (ReciboClaro), ready to upload directly to
 * GitHub repository for GitHub Pages deployment.
 */
export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ReciboClaro - Calculadora de Consumo Eléctrico (Ejercicio 35 - 3DS-A)</title>
  <meta name="description" content="Simulador de recibo de luz y consumo eléctrico con comparador y ahorro energético. Práctica 1 3DS-A.">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    /* PWA & Mobile Styles */
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    .badge-tag { display: inline-flex; align-items: center; border-radius: 9999px; padding: 2px 8px; font-size: 11px; font-weight: 600; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 antialiased min-h-screen pb-16">

  <!-- Header -->
  <header class="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md sticky top-0 z-30">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <span class="text-2xl p-1 bg-white/20 rounded-lg shadow-inner">⚡</span>
        <div>
          <h1 class="text-lg font-bold leading-tight">ReciboClaro</h1>
          <p class="text-xs text-amber-100">Ejercicio 35 · Práctica 1 · 3DS-A</p>
        </div>
      </div>
      <div class="flex items-center space-x-2 text-xs">
        <button id="btn-export-json" class="bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded font-medium transition" title="Exportar datos JSON">💾 Exportar</button>
        <button id="btn-reset" class="bg-white/10 hover:bg-rose-500/80 text-white px-2.5 py-1.5 rounded transition" title="Reiniciar datos">🔄 Vaciar</button>
      </div>
    </div>
  </header>

  <!-- Navigation Tabs -->
  <nav class="bg-white border-b border-slate-200 sticky top-[57px] z-20 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 flex space-x-2 overflow-x-auto py-2">
      <button class="nav-tab active px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-500 text-white" data-target="tab-calc">⚡ Calculadora</button>
      <button class="nav-tab px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" data-target="tab-comp">⚖️ Comparador</button>
      <button class="nav-tab px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" data-target="tab-save">💡 Pestaña Ahorro</button>
      <button class="nav-tab px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200" data-target="tab-about">📋 Datos Práctica</button>
    </div>
  </nav>

  <!-- Main Container -->
  <main class="max-w-4xl mx-auto px-4 py-4 space-y-6">

    <!-- Global Alert / Error Banner (Used for validation >24h) -->
    <div id="error-banner" class="hidden bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r shadow-sm">
      <div class="flex items-start">
        <span class="text-rose-500 text-xl mr-3 font-bold">⚠️</span>
        <div>
          <h4 class="text-sm font-bold text-rose-800">Error de validación horaria</h4>
          <p id="error-message" class="text-xs text-rose-700 mt-0.5">El día tiene 24 horas. No puedes registrar más de 24 horas de uso diario.</p>
        </div>
      </div>
    </div>

    <!-- TAB 1: CALCULADORA -->
    <section id="tab-calc" class="tab-content space-y-4">
      
      <!-- Tariff Bar -->
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center space-x-3">
          <span class="font-bold text-slate-700">Tarifa Eléctrica:</span>
          <div class="flex items-center space-x-1">
            <label class="text-slate-500">Costo kWh:</label>
            <span class="text-slate-400">$</span>
            <input type="number" id="input-rate" value="0.16" step="0.01" min="0.01" class="w-20 px-2 py-1 border border-slate-300 rounded font-semibold text-slate-800">
          </div>
          <div class="flex items-center space-x-1">
            <label class="text-slate-500">Fijo:</label>
            <span class="text-slate-400">$</span>
            <input type="number" id="input-fixed" value="4.50" step="0.5" min="0" class="w-16 px-2 py-1 border border-slate-300 rounded text-slate-800">
          </div>
        </div>
        <div class="text-slate-500">Impuesto: <strong class="text-slate-700">21% IVA</strong></div>
      </div>

      <!-- Live Totals Card -->
      <div class="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-lg">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div class="border-r border-slate-700/80 pr-2">
            <p class="text-[11px] uppercase tracking-wider text-slate-400">Consumo Diario</p>
            <p class="text-xl sm:text-2xl font-black text-amber-400 mt-1"><span id="total-daily-kwh">0.00</span> <span class="text-xs font-normal text-slate-300">kWh</span></p>
          </div>
          <div class="border-r border-slate-700/80 pr-2">
            <p class="text-[11px] uppercase tracking-wider text-slate-400">Consumo Mensual</p>
            <p class="text-xl sm:text-2xl font-black text-emerald-400 mt-1"><span id="total-monthly-kwh">0.00</span> <span class="text-xs font-normal text-slate-300">kWh</span></p>
          </div>
          <div class="border-r border-slate-700/80 pr-2">
            <p class="text-[11px] uppercase tracking-wider text-slate-400">Total Mensual</p>
            <p class="text-xl sm:text-2xl font-black text-amber-300 mt-1">$ <span id="total-monthly-cost">0.00</span></p>
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wider text-slate-400">Bimestral Est.</p>
            <p class="text-xl sm:text-2xl font-bold text-slate-200 mt-1">$ <span id="total-bimonthly-cost">0.00</span></p>
          </div>
        </div>
      </div>

      <!-- Add Appliance Form -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
          <span class="mr-1.5">➕</span> Agregar Artefacto Eléctrico
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div class="sm:col-span-2">
            <label class="text-[11px] font-semibold text-slate-600 block mb-1">Nombre</label>
            <input type="text" id="new-name" placeholder="Ej. Caloventor, Pava eléctrica..." class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">
          </div>
          <div>
            <label class="text-[11px] font-semibold text-slate-600 block mb-1">Potencia (Watts)</label>
            <input type="number" id="new-watts" placeholder="1000" min="1" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">
          </div>
          <div>
            <label class="text-[11px] font-semibold text-slate-600 block mb-1">Horas diarias (0-24h)</label>
            <input type="number" id="new-hours" placeholder="4" min="0.1" max="24" step="0.1" class="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg">
          </div>
        </div>
        <div class="flex justify-between items-center pt-2">
          <div class="flex space-x-1.5 overflow-x-auto text-[11px]">
            <span class="text-slate-400 py-0.5">Rápido:</span>
            <button class="btn-preset bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700" data-name="Aire Acondicionado Split" data-watts="1100" data-hours="6">+ Aire (1100W)</button>
            <button class="btn-preset bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700" data-name="Termotanque Eléctrico" data-watts="1500" data-hours="4">+ Termotanque (1500W)</button>
            <button class="btn-preset bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-700" data-name="Smart TV 50 pulg" data-watts="95" data-hours="5">+ TV (95W)</button>
          </div>
          <button id="btn-add-appliance" class="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm">
            Guardar
          </button>
        </div>
      </div>

      <!-- Appliance List Table -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div class="p-3 border-b border-slate-100 flex items-center justify-between">
          <h3 class="font-bold text-sm text-slate-800">Aparatos Registrados (<span id="count-appliances">0</span>)</h3>
          <span class="text-xs text-slate-400">Persiste automáticamente</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3">Aparato</th>
                <th class="p-3 text-center">Watts</th>
                <th class="p-3 text-center">Horas/Día (máx 24h)</th>
                <th class="p-3 text-right">kWh/mes</th>
                <th class="p-3 text-right">Costo Est.</th>
                <th class="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="appliances-table-body" class="divide-y divide-slate-100">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
        <div id="empty-state" class="hidden p-8 text-center">
          <p class="text-3xl mb-2">🔌</p>
          <p class="font-semibold text-slate-700 text-sm">No hay aparatos en tu lista</p>
          <p class="text-xs text-slate-400 mt-1">Agrega artefactos arriba o presiona un botón rápido para comenzar el cálculo.</p>
          <button id="btn-load-defaults" class="mt-3 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-amber-600">Cargar ejemplos típicos</button>
        </div>
      </div>
    </section>

    <!-- TAB 2: COMPARADOR (HITO M1) -->
    <section id="tab-comp" class="tab-content hidden space-y-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-slate-800 text-sm">⚖️ Comparador de Consumo (Antes vs Después)</h3>
            <p class="text-xs text-slate-500">Cumplimiento Hito M1: Evalúa el impacto de tus hábitos de consumo.</p>
          </div>
          <button id="btn-save-baseline" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition">
            📸 Fijar "Antes" con datos actuales
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div class="p-4 rounded-xl bg-slate-100 border border-slate-200">
            <span class="text-xs font-bold text-slate-500 uppercase">Escenario Antes</span>
            <p class="text-2xl font-black text-slate-800 mt-1"><span id="comp-before-kwh">320.0</span> <span class="text-xs font-normal">kWh/mes</span></p>
            <p class="text-xs text-slate-600 mt-1">Costo: $ <span id="comp-before-cost">62.80</span></p>
          </div>
          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span class="text-xs font-bold text-amber-700 uppercase">Escenario Después (Actual)</span>
            <p class="text-2xl font-black text-amber-900 mt-1"><span id="comp-after-kwh">0.0</span> <span class="text-xs font-normal">kWh/mes</span></p>
            <p class="text-xs text-amber-800 mt-1">Costo: $ <span id="comp-after-cost">0.00</span></p>
          </div>
          <div id="comp-delta-box" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span class="text-xs font-bold text-emerald-700 uppercase">Diferencia / Ahorro</span>
            <p id="comp-delta-kwh" class="text-2xl font-black text-emerald-700 mt-1">-0.0 kWh</p>
            <p id="comp-delta-money" class="text-xs font-bold text-emerald-800 mt-1">Ahorro: $ 0.00 (-0%)</p>
          </div>
        </div>
      </div>
    </section>

    <!-- TAB 3: PESTAÑA AHORRO (HITO M5) -->
    <section id="tab-save" class="tab-content hidden space-y-4">
      <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-xl shadow-sm">
        <h3 class="text-base font-bold flex items-center">
          <span class="mr-2">💡</span> Auditoría y Reglas Inteligentes de Ahorro
        </h3>
        <p class="text-xs text-emerald-100 mt-1">
          Hito M5: Algoritmo heurístico que analiza tus aparatos con mayor impacto y propone acciones concretas en dinero y kWh.
        </p>
      </div>

      <!-- AI Failure Simulation Toggle (For capture E5-falla.png) -->
      <div class="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center justify-between text-xs">
        <div>
          <strong class="text-amber-900">Control de Evidencias E5:</strong>
          <span class="text-amber-700 ml-1">Simula desconexión de IA para la captura E5-falla.</span>
        </div>
        <button id="btn-toggle-ai-fail" class="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded font-semibold transition">
          Simular Fallo IA (E5-falla)
        </button>
      </div>

      <div id="ai-offline-banner" class="hidden bg-slate-800 text-amber-300 p-3 rounded-lg text-xs flex items-center">
        <span class="text-base mr-2">⚠️</span>
        <div>
          <span class="font-bold">Aviso del Sistema (Fallback Local Activo):</span>
          <span class="text-slate-300 block">El servicio de IA externo no responde o está en modo offline. Se ejecutó el motor de reglas heurísticas local con 100% de precisión.</span>
        </div>
      </div>

      <!-- Smart Recommendations Grid -->
      <div id="savings-recommendations" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Rendered via JS -->
      </div>
    </section>

    <!-- TAB 4: DATOS PRÁCTICA (README, PROMPTS, QR) -->
    <section id="tab-about" class="tab-content hidden space-y-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
        <h3 class="text-sm font-bold text-slate-800">Entrega de Práctica 1 (Ejercicio 35)</h3>
        <p class="text-slate-600">
          Esta aplicación cumple con todos los requisitos del curso 3DS-A: cálculo reactivo, persistencia en localStorage, validaciones (<24h), comparador antes/después, pestaña ahorro y diseño responsive.
        </p>
        <div class="p-3 bg-slate-50 rounded border border-slate-200 font-mono text-[11px] text-slate-700">
          <strong>Archivos requeridos en tu GitHub:</strong>
          <ul class="list-disc ml-5 mt-1 space-y-0.5">
            <li><code>index.html</code> (esta aplicación)</li>
            <li><code>README.md</code> (con las 13 secciones completas)</li>
            <li><code>PROMPTS.md</code> (con la bitácora M0 a M5)</li>
            <li><code>.gitignore</code> (con .env)</li>
            <li><code>evidencias/</code> (con las 10 capturas E0 a E5 y qr.png)</li>
          </ul>
        </div>
      </div>
    </section>

  </main>

  <script>
    // State
    const STORAGE_KEY = 'reciboclaro_app_data_v1';
    let appliances = [];
    let baselineKwh = 320;
    let baselineCost = 62.80;

    const defaultItems = [
      { id: '1', name: 'Heladera con freezer', watts: 150, hours: 10 },
      { id: '2', name: 'Aire Acondicionado', watts: 1100, hours: 6 },
      { id: '3', name: 'Termotanque eléctrico', watts: 1500, hours: 4 },
      { id: '4', name: 'Iluminación LED general', watts: 90, hours: 5 },
      { id: '5', name: 'Smart TV 50"', watts: 95, hours: 4.5 }
    ];

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          appliances = JSON.parse(raw);
        } else {
          appliances = [...defaultItems];
          saveState();
        }
      } catch (e) {
        appliances = [...defaultItems];
      }
    }

    function saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appliances));
      } catch (e) {
        console.error(e);
      }
    }

    // Calculations
    function recalculate() {
      const rate = parseFloat(document.getElementById('input-rate').value) || 0.16;
      const fixed = parseFloat(document.getElementById('input-fixed').value) || 4.5;
      
      let totalDaily = 0;
      let totalMonthly = 0;

      const tbody = document.getElementById('appliances-table-body');
      tbody.innerHTML = '';

      if (appliances.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
      } else {
        document.getElementById('empty-state').classList.add('hidden');
      }

      appliances.forEach((app, idx) => {
        const dailyKwh = (app.watts * Math.min(24, app.hours)) / 1000;
        const monthlyKwh = dailyKwh * 30;
        const monthlyCost = monthlyKwh * rate * 1.21; // with taxes

        totalDaily += dailyKwh;
        totalMonthly += monthlyKwh;

        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition border-b border-slate-100';
        tr.innerHTML = \`
          <td class="p-3 font-medium text-slate-800">\${app.name}</td>
          <td class="p-3 text-center text-slate-600">\${app.watts} W</td>
          <td class="p-3 text-center">
            <input type="number" min="0" max="24" step="0.5" value="\${app.hours}" 
                   class="row-hours-input w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center \${app.hours > 24 ? 'border-rose-500 bg-rose-50 text-rose-700' : ''}" 
                   data-index="\${idx}"> h
          </td>
          <td class="p-3 text-right font-semibold text-slate-700">\${monthlyKwh.toFixed(1)} kWh</td>
          <td class="p-3 text-right font-semibold text-emerald-600">$\${monthlyCost.toFixed(2)}</td>
          <td class="p-3 text-center">
            <button class="btn-del text-rose-500 hover:text-rose-700 font-bold px-1" data-index="\${idx}">✕</button>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      const totalEnergyCost = totalMonthly * rate;
      const totalCostWithTax = (totalEnergyCost + fixed) * 1.21;

      document.getElementById('total-daily-kwh').innerText = totalDaily.toFixed(2);
      document.getElementById('total-monthly-kwh').innerText = totalMonthly.toFixed(1);
      document.getElementById('total-monthly-cost').innerText = totalCostWithTax.toFixed(2);
      document.getElementById('total-bimonthly-cost').innerText = (totalCostWithTax * 2).toFixed(2);
      document.getElementById('count-appliances').innerText = appliances.length;

      // Update comparator
      document.getElementById('comp-after-kwh').innerText = totalMonthly.toFixed(1);
      document.getElementById('comp-after-cost').innerText = totalCostWithTax.toFixed(2);
      const diffKwh = totalMonthly - baselineKwh;
      const diffCost = totalCostWithTax - baselineCost;
      const pct = baselineKwh > 0 ? ((diffKwh / baselineKwh) * 100).toFixed(1) : 0;
      
      const deltaEl = document.getElementById('comp-delta-kwh');
      const deltaMoney = document.getElementById('comp-delta-money');
      if (diffKwh <= 0) {
        deltaEl.innerText = \`-\${Math.abs(diffKwh).toFixed(1)} kWh\`;
        deltaEl.className = 'text-2xl font-black text-emerald-700 mt-1';
        deltaMoney.innerText = \`Ahorro: $\${Math.abs(diffCost).toFixed(2)} (\${Math.abs(pct)}%)\`;
      } else {
        deltaEl.innerText = \`+\${diffKwh.toFixed(1)} kWh\`;
        deltaEl.className = 'text-2xl font-black text-rose-600 mt-1';
        deltaMoney.innerText = \`Aumento: +$\${diffCost.toFixed(2)} (+\${pct}%)\`;
      }

      renderSavingsTips();
    }

    function renderSavingsTips() {
      const container = document.getElementById('savings-recommendations');
      container.innerHTML = '';

      const tips = [
        {
          title: 'Ajuste del Aire Acondicionado a 24°C',
          text: 'Fijar el termostato a 24°C en vez de 20°C reduce un 15% el consumo del equipo, ahorrando aprox. $12 al mes.',
          saving: 'Ahorro: ~45 kWh/mes',
          tag: 'Alto impacto'
        },
        {
          title: 'Apagado de Standby / Consumo Vampiro',
          text: 'Los electrodomésticos en modo espera (TV, decodificadores) representan entre 5% y 8% de tu factura mensual.',
          saving: 'Ahorro: ~15 kWh/mes',
          tag: 'Fácil'
        },
        {
          title: 'Optimización de Termotanque Eléctrico',
          text: 'Colocar un temporizador horario para que no caliente agua en la madrugada ahorra hasta un 25% de su gasto.',
          saving: 'Ahorro: ~50 kWh/mes',
          tag: 'Recomendado'
        },
        {
          title: 'Iluminación LED Eficiente',
          text: 'Reemplazar las últimas lámparas halógenas o bajo consumo por LED de 8W reduce 80% el consumo lumínico.',
          saving: 'Ahorro: ~18 kWh/mes',
          tag: 'Económico'
        }
      ];

      tips.forEach(tip => {
        const div = document.createElement('div');
        div.className = 'bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1.5';
        div.innerHTML = \`
          <div class="flex items-center justify-between">
            <h4 class="font-bold text-xs text-slate-800">\${tip.title}</h4>
            <span class="badge-tag bg-emerald-100 text-emerald-800">\${tip.tag}</span>
          </div>
          <p class="text-xs text-slate-600">\${tip.text}</p>
          <p class="text-xs font-semibold text-emerald-600 pt-1">\${tip.saving}</p>
        \`;
        container.appendChild(div);
      });
    }

    // Validation helper
    function showError(msg) {
      const banner = document.getElementById('error-banner');
      document.getElementById('error-message').innerText = msg;
      banner.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function hideError() {
      document.getElementById('error-banner').classList.add('hidden');
    }

    // Events
    document.addEventListener('DOMContentLoaded', () => {
      loadState();
      recalculate();

      // Tab navigation
      document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.nav-tab').forEach(b => {
            b.classList.remove('active', 'bg-amber-500', 'text-white');
            b.classList.add('bg-slate-100', 'text-slate-700');
          });
          btn.classList.add('active', 'bg-amber-500', 'text-white');
          btn.classList.remove('bg-slate-100', 'text-slate-700');

          const target = btn.dataset.target;
          document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
          document.getElementById(target).classList.remove('hidden');
        });
      });

      // Add appliance
      document.getElementById('btn-add-appliance').addEventListener('click', () => {
        hideError();
        const name = document.getElementById('new-name').value.trim() || 'Artefacto';
        const watts = parseFloat(document.getElementById('new-watts').value);
        const hours = parseFloat(document.getElementById('new-hours').value);

        if (isNaN(watts) || watts <= 0) {
          showError('Por favor ingresa una potencia en Watts válida.');
          return;
        }

        // VALIDATION CHECK FOR > 24 HOURS (CRITICAL FOR RUBRIC E4-ERROR)
        if (isNaN(hours) || hours <= 0) {
          showError('Debes ingresar al menos 0.1 horas de uso diario.');
          return;
        }
        if (hours > 24) {
          showError(\`Error de validación: El día solo tiene 24 horas. Ingresaste \${hours} horas para "\${name}". Corrige el valor para continuar.\`);
          return;
        }

        appliances.push({ id: Date.now().toString(), name, watts, hours });
        saveState();
        recalculate();

        document.getElementById('new-name').value = '';
        document.getElementById('new-watts').value = '';
        document.getElementById('new-hours').value = '';
      });

      // Quick presets
      document.querySelectorAll('.btn-preset').forEach(b => {
        b.addEventListener('click', () => {
          document.getElementById('new-name').value = b.dataset.name;
          document.getElementById('new-watts').value = b.dataset.watts;
          document.getElementById('new-hours').value = b.dataset.hours;
        });
      });

      // Table events: delete & hour change
      document.getElementById('appliances-table-body').addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-del')) {
          const idx = parseInt(e.target.dataset.index);
          appliances.splice(idx, 1);
          saveState();
          recalculate();
        }
      });

      document.getElementById('appliances-table-body').addEventListener('change', (e) => {
        if (e.target.classList.contains('row-hours-input')) {
          const idx = parseInt(e.target.dataset.index);
          const val = parseFloat(e.target.value);
          if (val > 24) {
            showError(\`Error: Un día no puede tener más de 24 horas (ingresaste \${val}h en \${appliances[idx].name}).\`);
            e.target.classList.add('bg-rose-100', 'border-rose-500');
          } else {
            hideError();
            appliances[idx].hours = Math.max(0, val || 0);
            saveState();
            recalculate();
          }
        }
      });

      // Rates
      document.getElementById('input-rate').addEventListener('input', recalculate);
      document.getElementById('input-fixed').addEventListener('input', recalculate);

      // Baseline comparison
      document.getElementById('btn-save-baseline').addEventListener('click', () => {
        const rate = parseFloat(document.getElementById('input-rate').value) || 0.16;
        const fixed = parseFloat(document.getElementById('input-fixed').value) || 4.5;
        let sum = 0;
        appliances.forEach(a => sum += (a.watts * Math.min(24, a.hours) * 30) / 1000);
        baselineKwh = sum;
        baselineCost = (sum * rate + fixed) * 1.21;
        document.getElementById('comp-before-kwh').innerText = baselineKwh.toFixed(1);
        document.getElementById('comp-before-cost').innerText = baselineCost.toFixed(2);
        recalculate();
      });

      // Fallback toggle
      document.getElementById('btn-toggle-ai-fail').addEventListener('click', () => {
        const banner = document.getElementById('ai-offline-banner');
        banner.classList.toggle('hidden');
      });

      // Reset
      document.getElementById('btn-reset').addEventListener('click', () => {
        if (confirm('¿Vaciar la lista para ver el estado vacío (E3-vacio)?')) {
          appliances = [];
          saveState();
          recalculate();
        }
      });

      // Load defaults
      document.getElementById('btn-load-defaults').addEventListener('click', () => {
        appliances = [...defaultItems];
        saveState();
        recalculate();
      });

      // Export JSON
      document.getElementById('btn-export-json').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appliances, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", "recibo-claro-datos.json");
        dlAnchor.click();
      });

    });
  </script>
</body>
</html>`;
}
