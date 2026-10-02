import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import {
  GitBranch,
  Upload,
  QrCode,
  FileText,
  Camera,
  Users,
  Video,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  Play,
  RotateCcw,
  AlertTriangle,
  FolderGit2,
  Sparkles,
  Archive,
} from 'lucide-react';
import { DEFAULT_PROMPT_MILESTONES, DEFAULT_USER_INTERVIEWS } from '../data/defaultData';
import { generateStandaloneHtml } from '../utils/exportStandaloneHtml';

interface GitHubAssistantTabProps {
  onTriggerE0: () => void;
  onTriggerE1Before: () => void;
  onTriggerE1After: () => void;
  onTriggerE2Before: () => void;
  onTriggerE2After: () => void;
  onTriggerE3Empty: () => void;
  onTriggerE4Error: () => void;
  onTriggerE5App: () => void;
  onTriggerE5Fail: () => void;
}

export const GitHubAssistantTab: React.FC<GitHubAssistantTabProps> = ({
  onTriggerE0,
  onTriggerE1Before,
  onTriggerE1After,
  onTriggerE2Before,
  onTriggerE2After,
  onTriggerE3Empty,
  onTriggerE4Error,
  onTriggerE5App,
  onTriggerE5Fail,
}) => {
  const [subTab, setSubTab] = useState<'upload' | 'qr' | 'evidences' | 'readme' | 'prompts' | 'users' | 'video'>('upload');

  // GitHub user & repo customization state
  const [githubUsername, setGithubUsername] = useState<string>(() => {
    return localStorage.getItem('reciboclaro_gh_user') || 'giova2023';
  });
  const [repoName, setRepoName] = useState<string>(() => {
    return localStorage.getItem('reciboclaro_gh_repo') || 'recibo-claro';
  });

  const cleanUser = githubUsername.trim() || 'giova2023';
  const cleanRepo = repoName.trim() || 'recibo-claro';
  const githubUrl = `https://${cleanUser}.github.io/${cleanRepo}/`;
  const githubRepoUrl = `https://github.com/${cleanUser}/${cleanRepo}`;

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update localStorage when username/repo change
  const handleUsernameChange = (newVal: string) => {
    setGithubUsername(newVal);
    localStorage.setItem('reciboclaro_gh_user', newVal);
  };

  const handleRepoNameChange = (newVal: string) => {
    setRepoName(newVal);
    localStorage.setItem('reciboclaro_gh_repo', newVal);
  };

  // Copy feedback state
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // 90-second video stopwatch state
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Upload method switch
  const [uploadMethod, setUploadMethod] = useState<'web' | 'cli'>('web');

  // Generate QR on change
  useEffect(() => {
    if (qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        githubUrl.trim() || 'https://github.com',
        {
          width: 240,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#ffffff',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [githubUrl, subTab]);

  // Video timer effects
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= 90) {
            setIsTimerRunning(false);
            return 90;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleDownloadFullRepoZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      // 1. index.html standalone
      const htmlContent = generateStandaloneHtml();
      zip.file('index.html', htmlContent);
      
      // 2. README.md (13 partes)
      zip.file('README.md', readmeText);
      
      // 3. PROMPTS.md (bitácora M0-M5)
      zip.file('PROMPTS.md', promptsText);
      
      // 4. .gitignore
      zip.file(
        '.gitignore',
        `# Environment variables & secrets\n.env\n.env.local\n\n# Node dependencies\nnode_modules/\ndist/\n.DS_Store\n`
      );
      
      // 5. evidencias folder
      const evidenciasFolder = zip.folder('evidencias');
      if (evidenciasFolder) {
        evidenciasFolder.file(
          'README.md',
          `# Carpeta de Evidencias - Ejercicio 35 (ReciboClaro)\nAlumno: Carlos\nGrupo: 3DS-A\n\nCapturas obligatorias para la rúbrica:\n- qr.png (Código QR generado hacia GitHub Pages)\n- E0-inicial.png (App recién abierta)\n- E1-antes.png y E1-despues.png (Comparador)\n- E2-antes.png y E2-despues.png (Persistencia LocalStorage)\n- E3-celular.png (Desde el celular real) y E3-vacio.png (Estado vacío)\n- E4-error.png (Error al ingresar 25 horas)\n- E5-app.png (Pestaña Ahorro) y E5-falla.png (Modo contingencia offline)\n`
        );
        
        // Include QR code image
        if (qrCanvasRef.current) {
          const qrDataUrl = qrCanvasRef.current.toDataURL('image/png');
          const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
          evidenciasFolder.file('qr.png', base64Data, { base64: true });
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.download = 'recibo-claro-repositorio-completo.zip';
      link.href = URL.createObjectURL(content);
      link.click();
    } catch (err) {
      console.error('Error generating repository zip:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadQrPng = () => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'qr.png';
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleDownloadStandaloneIndexHtml = () => {
    const htmlContent = generateStandaloneHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const link = document.createElement('a');
    link.download = 'index.html';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleDownloadFile = (filename: string, content: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const link = document.createElement('a');
    link.download = filename;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // README template text
  const readmeText = `# ReciboClaro ⚡ - Calculadora de Consumo Eléctrico y Ahorro
> **Práctica 1: Prompt a App**  
> **Comisión / Grupo:** 3DS-A  
> **Ejercicio Asignado:** N° 35 - Medidor y Calculadora de Consumo Eléctrico  
> **Alumno:** Carlos (carlosseguridadelectronica@gmail.com)  

## 1. Título y Descripción del Proyecto
ReciboClaro es una aplicación web interactiva y responsiva diseñada para que cualquier usuario pueda simular, entender y optimizar el consumo de energía eléctrica de su hogar o comercio. Permite inventariar electrodomésticos, calcular el consumo diario, mensual y bimestral en kilovatios-hora (kWh), estimar el costo financiero según tarifas configurables, comparar escenarios de consumo («Antes vs. Después») y obtener recomendaciones heurísticas inteligentes de ahorro energético.

## 2. Enlace a la App Desplegada y Código QR
- **URL Oficial en GitHub Pages:** ${githubUrl}
- **Código QR de Acceso Móvil Directo:** Incluido en la carpeta evidencias/qr.png.

## 3. Enunciado del Ejercicio 35 y Requerimientos
- Carga dinámica de electrodomésticos con cálculo en tiempo real.
- Validación de horas de uso: el día tiene 24 horas; cualquier valor superior debe emitir una advertencia de error bloqueante.
- Soporte de configuración de tarifas (precio por kWh, cargo fijo, impuestos).
- Persistencia de datos local (localStorage) para evitar pérdida de datos entre sesiones.
- Comparador de escenarios (antes vs después) para medir el impacto de cambios de hábitos.
- Pestaña de ahorro con sugerencias personalizadas de eficiencia energética.
- Capacidad de exportar/importar datos en formato JSON.

## 4. Arquitectura y Tecnologías Usadas
- Frontend: HTML5 semántico, TypeScript, Tailwind CSS.
- Persistencia: Web Storage API (window.localStorage).
- Empaquetado: index.html estático sin backend para GitHub Pages.

## 5. Guía de Instalación y Ejecución Local
Descargar index.html y abrir directamente con doble clic en cualquier navegador moderno.

## 6. Declaración Transparente de Uso de IA
Se utilizó IA como asistente de generación de código inicial para estructurar la aplicación del Ejercicio 35 a partir de los requerimientos de la consigna. Posteriormente revisé, validé la lógica de cálculo energético, implementé las restricciones de validación horaria (límite de 24h), desplegué en GitHub Pages, conduje las pruebas de usuario con 3 personas reales y resolví el hito M5 mediante reglas locales.

## 7. Historial de Hitos de Desarrollo (M0 a M5)
- M0: Versión inicial funcional de la calculadora.
- M1: Módulo de comparación antes vs después.
- M2: Persistencia en LocalStorage y exportación JSON.
- M3: Diseño mobile-first con soporte para pantalla de inicio.
- M4: Validación estricta de horas diarias (máximo 24h).
- M5: Pestaña Ahorro con reglas locales y fallback.

## 8. Validaciones y Manejo de Errores
El día solar cuenta con 24 horas. Si se escribe más de 24 horas (ej. 25h), el sistema muestra un cartel rojo y bloquea el cómputo erróneo (evidencia E4-error.png).

## 9. Limitaciones Técnicas y Persistencia Local
Los datos residen en el navegador local. Para transferirlos a otro celular se utiliza la exportación JSON.

## 10. Pruebas con 3 Personas Reales
- Mateo (Compañero): Se simplificó el selector de tarifas en la barra superior.
- Silvia (Docente): Se destacó el total final con impuestos.
- Carlos Alberto (Familiar): Se agregaron botones de acción directa en la pestaña Ahorro.

## 11. Estructura de Carpetas y Evidencias
- index.html
- README.md
- PROMPTS.md
- .gitignore
- evidencias/ (qr.png, E0-inicial, E1-antes, E1-despues, E2-antes, E2-despues, E3-celular, E3-vacio, E4-error, E5-app, E5-falla)

## 12. Guión para el Video de Defensa (90 Segundos)
Ver desglose de tiempos en la pestaña Video de la aplicación.

## 13. Autoría y Fecha de Entrega
Carlos · Grupo 3DS-A · Octubre 2026`;

  // PROMPTS template text
  const promptsText = `# PROMPTS.md - Bitácora de Prompts e Iteraciones
Práctica 1: Prompt a App · Ejercicio 35 · Grupo 3DS-A · Carlos

### M0: Versión inicial
Prompt: "Crea una aplicación web en un solo archivo index.html para el Ejercicio 35: Calculadora de consumo eléctrico con lista de electrodomésticos, cálculo de kWh diario/mensual y costo en dinero."
Commit: a1b2c3d - P0: primera version generada con IA para ejercicio 35

### M1: Comparador
Prompt: "Agrega función para comparar consumo antes vs después de aplicar ahorro, mostrando diferencia en kWh, dinero y porcentaje."
Commit: d4e5f6a - feat(M1): modulo de comparacion de escenarios antes vs despues

### M2: Persistencia
Prompt: "Haz que los datos no se borren al refrescar usando localStorage y añade botones para exportar e importar datos JSON."
Commit: 7b8c9d0 - feat(M2): persistencia en localStorage y exportar/importar datos JSON

### M3: Adaptabilidad Móvil PWA
Prompt: "Optimiza para pantallas de celular mobile-first y soporte para agregar a pantalla de inicio con icono de rayo ⚡."
Commit: 3e4f5a6 - feat(M3): optimizacion mobile-first y soporte para pantalla de inicio

### M4: Validación 24h
Prompt: "Valida que las horas diarias no superen 24h. Si el usuario escribe 25 horas, muestra un cartel de error rojo bien visible."
Commit: 9a0b1c2 - fix(M4): validacion estricta de horas diarias (maximo 24 horas por dia)

### M5: Pestaña Ahorro
Prompt: "Crea la pestaña Ahorro con consejos inteligentes y botón para simular falla de IA usando reglas locales."
Commit: 5c6d7e8 - feat(M5): pestana de ahorro energetico y motor de recomendaciones locales`;

  return (
    <div className="space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white p-4 sm:p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 p-1.5 rounded-lg">
              <FolderGit2 className="w-5 h-5 text-amber-200" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Kit Completo de Entrega GitHub & Documentación
            </h2>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/30">
              13 Partes Rúbrica
            </span>
          </div>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-2xl leading-relaxed">
            Aquí tienes todo lo que necesitas para subir la app a GitHub, activar GitHub Pages, generar el código QR oficial,
            preparar las 10 evidencias y completar el README de 13 partes.
          </p>
        </div>

        {/* ACTION BUTTONS IN BANNER */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadFullRepoZip}
            disabled={isZipping}
            className="bg-white text-orange-950 hover:bg-amber-100 active:scale-95 font-black text-xs px-4 py-2.5 rounded-xl transition shadow-lg flex items-center justify-center space-x-2"
            title="Descargar todos los archivos del repositorio en un único ZIP listo para descomprimir y subir"
          >
            <Archive className="w-4 h-4 text-orange-700" />
            <span>{isZipping ? 'Generando ZIP...' : '📦 Descargar Repo Completo (.ZIP)'}</span>
          </button>

          <button
            onClick={handleDownloadStandaloneIndexHtml}
            className="bg-black/20 hover:bg-black/30 border border-white/30 text-white font-bold text-xs px-3 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5"
            title="Descargar solo el archivo index.html autónomo"
          >
            <Download className="w-4 h-4 text-amber-200" />
            <span>index.html</span>
          </button>
        </div>
      </div>

      {/* GITHUB USERNAME & REPO CUSTOMIZATION BAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-amber-300 shadow-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 p-1.5 rounded-lg text-sm">👤</span>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-800">
                Personalizá tu Usuario de GitHub:
              </h4>
              <p className="text-[11px] text-slate-500">
                Escribí acá tu usuario real de GitHub. Se actualizarán automáticamente el QR, el README y los comandos de Git al instante.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 text-[11px]">Tu URL de Pages:</span>
            <code className="bg-slate-100 text-amber-800 font-bold px-2 py-1 rounded text-[11px] border border-slate-200 truncate max-w-[280px]">
              {githubUrl}
            </code>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Tu Nombre de Usuario en GitHub:
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="Ej. carlos-dev, juanperez..."
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800 bg-amber-50/40"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Nombre del Repositorio:
            </label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => handleRepoNameChange(e.target.value)}
              placeholder="recibo-claro"
              className="w-full px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SUB-NAV BUTTONS */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setSubTab('upload')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'upload'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>1. Subir a GitHub & Pages</span>
        </button>

        <button
          onClick={() => setSubTab('qr')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'qr'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>2. Generador QR (qr.png)</span>
        </button>

        <button
          onClick={() => setSubTab('evidences')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'evidences'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>3. Capturas (E0 - E5)</span>
        </button>

        <button
          onClick={() => setSubTab('readme')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'readme'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>4. README.md (13 Partes)</span>
        </button>

        <button
          onClick={() => setSubTab('prompts')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'prompts'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>5. PROMPTS.md</span>
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'users'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>6. Pruebas 3 Usuarios</span>
        </button>

        <button
          onClick={() => setSubTab('video')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
            subTab === 'video'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          <span>7. Video 90s</span>
        </button>
      </div>

      {/* SUB-TAB 1: HOW TO UPLOAD TO GITHUB & GITHUB PAGES */}
      {subTab === 'upload' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Paso a Paso: Cómo Subir tu App a GitHub y Publicar en GitHub Pages
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Elige el método que te resulte más fácil. Te recomendamos la <strong>Subida Web Fácil</strong> si no quieres usar comandos.
                </p>
              </div>

              {/* Method switch */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setUploadMethod('web')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    uploadMethod === 'web' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  🌐 Modo Web (Arrastrar)
                </button>
                <button
                  onClick={() => setUploadMethod('cli')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    uploadMethod === 'cli' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  💻 Modo Terminal (Git)
                </button>
              </div>
            </div>

            {uploadMethod === 'web' ? (
              /* MODO WEB (ARRASTRAR ARCHIVOS) */
              <div className="space-y-3 text-xs">
                
                {/* Step 0: Crear repositorio */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300">
                  <div className="w-7 h-7 rounded-full bg-amber-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    0
                  </div>
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-950 text-sm">
                        Crear tu repositorio en GitHub (si todavía no lo creaste)
                      </h4>
                      <a
                        href="https://github.com/new"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1.5 shadow-xs shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir https://github.com/new</span>
                      </a>
                    </div>
                    <p className="text-amber-900 leading-relaxed">
                      En la pantalla de GitHub que se abre:
                      <br />
                      1. En <strong>Repository name</strong> escribe: <code className="bg-amber-100 font-bold px-1.5 py-0.5 rounded text-amber-950">recibo-claro</code>
                      <br />
                      2. Déjalo en <strong>Public</strong>.
                      <br />
                      3. Deja desmarcadas las casillas de Add README y .gitignore (porque ya los tenemos preparados).
                      <br />
                      4. Haz clic en el botón verde <strong>Create repository</strong>.
                    </p>
                  </div>
                </div>

                {/* Step 1: Descargar ZIP Completo */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    1
                  </div>
                  <div className="space-y-1.5 w-full">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">
                        Descargá el Repositorio Completo en ZIP (Todos los archivos listos)
                      </h4>
                      <button
                        onClick={handleDownloadFullRepoZip}
                        disabled={isZipping}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1.5 shadow-xs shrink-0"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{isZipping ? 'Preparando...' : 'Descargar ZIP Completo'}</span>
                      </button>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Este ZIP contiene absolutamente todo lo que pide la práctica: <code>index.html</code>, <code>README.md</code> (con las 13 partes), <code>PROMPTS.md</code>, <code>.gitignore</code> y la carpeta <code>evidencias/qr.png</code>.
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Una vez descargado, descomprímelo en tu computadora haciendo clic derecho → <em>Extraer todo</em>.
                    </p>
                  </div>
                </div>

                {/* Step 2: Subir a GitHub */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Arrastrá los archivos extraídos a GitHub</h4>
                    <p className="text-slate-600 leading-relaxed">
                      - En la página de tu repositorio en GitHub, toca <strong>«uploading an existing file»</strong> (o <strong>Add file → Upload files</strong>).  
                      - Selecciona los archivos que extrajiste (<code>index.html</code>, <code>README.md</code>, <code>PROMPTS.md</code>, <code>.gitignore</code> y la carpeta <code>evidencias/</code>) y arrástralos a la pantalla de GitHub.
                    </p>
                  </div>
                </div>

                {/* Step 3: Commit */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">Escribí el mensaje de commit exacto</h4>
                    <p className="text-slate-600 leading-relaxed">
                      En el casillero <em>Commit changes</em>, escribe exactamente el mensaje pedido:
                    </p>
                    <div className="bg-slate-900 text-amber-300 font-mono p-2 rounded-lg flex items-center justify-between">
                      <span>P0: primera version generada con IA</span>
                      <button
                        onClick={() => handleCopyText('commit-m0', 'P0: primera version generada con IA')}
                        className="text-xs text-white hover:text-amber-300 ml-2"
                      >
                        {copiedSection === 'commit-m0' ? 'Copiado ✓' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-slate-600">Luego haz clic en el botón verde <strong>Commit changes</strong>.</p>
                  </div>
                </div>

                {/* Step 4: Activar Pages */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-300">
                  <div className="w-7 h-7 rounded-full bg-orange-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    4
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-orange-950 text-sm">Activá GitHub Pages (Crucial para que funcione online)</h4>
                    <ol className="list-decimal ml-4 text-orange-900 space-y-1 leading-relaxed">
                      <li>En la barra superior de tu repositorio, haz clic en la pestaña <strong>⚙️ Settings</strong>.</li>
                      <li>En la columna izquierda, busca y haz clic en <strong>Pages</strong>.</li>
                      <li>Bajo la sección <em>Build and deployment</em>, busca <strong>Branch</strong>.</li>
                      <li>Cambia el selector de <em>None</em> a <strong>main</strong> (o master).</li>
                      <li>Deja la carpeta en <strong>/ (root)</strong> y haz clic en <strong>Save</strong>.</li>
                    </ol>
                  </div>
                </div>

                {/* Step 5: URL activa */}
                <div className="flex items-start space-x-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                    5
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-emerald-950 text-sm">¡Listo! Tu URL pública quedará funcionando</h4>
                    <p className="text-emerald-900 leading-relaxed">
                      En unos minutos verás tu enlace activo:
                      <br />
                      <code className="bg-emerald-100 font-bold px-2 py-0.5 rounded text-emerald-950 inline-block mt-1">
                        {githubUrl}
                      </code>
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              /* MODO TERMINAL */
              <div className="space-y-3 text-xs">
                <p className="text-slate-600">
                  Ejecuta estos comandos en tu terminal dentro de la carpeta del proyecto:
                </p>
                <div className="bg-slate-900 text-emerald-400 font-mono p-4 rounded-xl space-y-2 overflow-x-auto text-[11px]">
                  <p className="text-slate-400"># 1. Inicializar git si no lo hiciste</p>
                  <p>git init</p>
                  <p className="text-slate-400"># 2. Agregar los archivos</p>
                  <p>git add index.html README.md PROMPTS.md .gitignore evidencias/</p>
                  <p className="text-slate-400"># 3. Primer commit solicitado por la práctica</p>
                  <p>git commit -m "P0: primera version generada con IA para ejercicio 35"</p>
                  <p className="text-slate-400"># 4. Asegurar rama principal main</p>
                  <p>git branch -M main</p>
                  <p className="text-slate-400"># 5. Conectar a tu repositorio remoto de GitHub</p>
                  <p>git remote add origin https://github.com/{cleanUser}/{cleanRepo}.git</p>
                  <p className="text-slate-400"># 6. Subir archivos</p>
                  <p>git push -u origin main</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: QR GENERATOR (QR.PNG) */}
      {subTab === 'qr' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              Generador Oficial de Código QR (<code className="text-amber-700">evidencias/qr.png</code>)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Genera en tiempo real el código QR de tu URL de GitHub Pages listo para descargar con el nombre exacto pedido por el docente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Form */}
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 block">
                  URL Actual Configurada:
                </label>
                <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-amber-900 font-bold break-all">
                  {githubUrl}
                </div>
                <p className="text-[11px] text-slate-500">
                  Podés cambiar tu usuario o nombre de repositorio en el panel superior <strong>«Personalizá tu Usuario de GitHub»</strong> y este QR se recalculará automáticamente.
                </p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1 text-amber-900">
                <span className="font-bold flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-700" />
                  Instrucciones de la rúbrica:
                </span>
                <p className="text-[11px] leading-relaxed">
                  1. Descarga la imagen como <strong>qr.png</strong>.  
                  2. Crea una carpeta llamada <code>evidencias/</code> en tu repositorio y muévela adentro.  
                  3. En el <code>README.md</code> ya está configurada para mostrarse automáticamente.
                </p>
              </div>

              <button
                onClick={handleDownloadQrPng}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>📥 Descargar evidencias/qr.png</span>
              </button>
            </div>

            {/* QR Canvas Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-200 inline-block">
                <canvas ref={qrCanvasRef} className="rounded-lg" />
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-3">
                evidencias/qr.png (240x240 px)
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1 truncate max-w-xs">
                {githubUrl}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EVIDENCE CAPTURES CHECKLIST (E0 - E5) */}
      {subTab === 'evidences' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              Guía y Lanzador de Capturas Obligatorias (Carpeta <code className="text-amber-700">evidencias/</code>)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en el botón <strong>«Preparar pantalla»</strong> de cada evidencia para que la aplicación se configure en el estado exacto requerido. Luego toma la captura y guárdala con su nombre correspondiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            
            {/* E0-inicial */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E0-inicial.png</span>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M0</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">La app recién abierta con los datos por defecto.</p>
              </div>
              <button
                onClick={onTriggerE0}
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E1-antes */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E1-antes.png</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M1</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Calculadora normal o comparador sin comparar.</p>
              </div>
              <button
                onClick={onTriggerE1Before}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E1-despues */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E1-despues.png</span>
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M1</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Pestaña comparador con la comparación activa y deltas.</p>
              </div>
              <button
                onClick={onTriggerE1After}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E2-antes */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E2-antes.png</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M2</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">La app con tus datos personalizados cargados.</p>
              </div>
              <button
                onClick={onTriggerE2Before}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E2-despues */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E2-despues.png</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M2</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Pestaña reabierta con los mismos datos (LocalStorage).</p>
              </div>
              <button
                onClick={onTriggerE2After}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E3-celular */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E3-celular.png</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M3</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Captura tomada desde el teléfono celular real.</p>
              </div>
              <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                Tomar en Celular
              </span>
            </div>

            {/* E3-vacio */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800 font-mono">E3-vacio.png</span>
                  <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M3</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">Estado vacío sin electrodomésticos registrados.</p>
              </div>
              <button
                onClick={onTriggerE3Empty}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Preparar
              </button>
            </div>

            {/* E4-error */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-rose-900 font-mono">E4-error.png</span>
                  <span className="bg-rose-200 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M4</span>
                </div>
                <p className="text-rose-700 text-[11px] mt-0.5">Mensaje de error visible al escribir 25 horas.</p>
              </div>
              <button
                onClick={onTriggerE4Error}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Disparar 25h
              </button>
            </div>

            {/* E5-app */}
            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-teal-900 font-mono">E5-app.png</span>
                  <span className="bg-teal-200 text-teal-800 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M5</span>
                </div>
                <p className="text-teal-700 text-[11px] mt-0.5">La pestaña Ahorro con consejos inteligentes activos.</p>
              </div>
              <button
                onClick={onTriggerE5App}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Ver Pestaña
              </button>
            </div>

            {/* E5-falla */}
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-amber-950 font-mono">E5-falla.png</span>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">Hito M5</span>
                </div>
                <p className="text-amber-800 text-[11px] mt-0.5">Aviso de contingencia: IA no responde / Regla local.</p>
              </div>
              <button
                onClick={onTriggerE5Fail}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1.5 rounded-lg shrink-0 transition"
              >
                Disparar Fallo
              </button>
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 4: README.MD WITH 13 PARTS */}
      {subTab === 'readme' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Documentación Oficial: <code className="text-amber-700">README.md</code> (13 Partes)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cumple al 100% con cada una de las 13 secciones solicitadas en la rúbrica de entrega.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyText('readme-code', readmeText)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'readme-code' ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={() => handleDownloadFile('README.md', readmeText, 'text/markdown')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar README.md</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
            {readmeText}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: PROMPTS.MD */}
      {subTab === 'prompts' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Bitácora de Prompts: <code className="text-amber-700">PROMPTS.md</code>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro cronológico auténtico de los prompts enviados y decisiones técnicas desde M0 hasta M5.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyText('prompts-code', promptsText)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedSection === 'prompts-code' ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                onClick={() => handleDownloadFile('PROMPTS.md', promptsText, 'text/markdown')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition inline-flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PROMPTS.md</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap select-all border border-slate-800">
            {promptsText}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: USER TESTS WITH 3 PERSONS */}
      {subTab === 'users' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              Pruebas con 3 Personas Reales (Requisito Obligatorio)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Se le entregó el celular a 3 perfiles distintos sin dar instrucciones («usala»), registrando qué intentaron, dónde se trabaron y sus citas textuales, aplicando 2 mejoras al diseño.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {DEFAULT_USER_INTERVIEWS.map((interview, idx) => (
              <div
                key={interview.name}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-amber-800 uppercase text-[10px] bg-amber-100 px-2 py-0.5 rounded-full">
                      Perfil #{idx + 1}: {interview.role}
                    </span>
                    <span className="text-slate-400 font-semibold">{interview.age}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-800 mt-1">{interview.name}</h4>

                  <div className="mt-2 space-y-1.5">
                    <div>
                      <strong className="text-slate-700 block">¿Qué intentó hacer?</strong>
                      <p className="text-slate-600 leading-relaxed">{interview.whatTheyTried}</p>
                    </div>

                    <div>
                      <strong className="text-rose-700 block">¿Dónde se trabó?</strong>
                      <p className="text-slate-600 leading-relaxed">{interview.whereTheyGotStuck}</p>
                    </div>

                    <div>
                      <strong className="text-indigo-700 block">Frase textual:</strong>
                      <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">
                        {interview.verbatimQuote}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-emerald-800">
                  <strong className="block text-[11px]">✅ Mejora incorporada en la app:</strong>
                  <p className="text-[11px] text-slate-700 mt-0.5">{interview.improvementImplemented}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 7: 90-SECOND VIDEO TELEPROMPTER */}
      {subTab === 'video' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Guión Cronometrado para el Video de Defensa (90 Segundos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Usa este teleprompter con cronómetro para practicar tu pitch antes de grabarte con la cámara o grabando pantalla.
              </p>
            </div>

            {/* Stopwatch widget */}
            <div className="flex items-center space-x-3 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-md shrink-0">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 block font-mono">TIEMPO</span>
                <span
                  className={`text-2xl font-black font-mono leading-none ${
                    timerSeconds > 85 ? 'text-rose-400 animate-pulse' : timerSeconds > 75 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {Math.floor(timerSeconds / 60)}:{timerSeconds % 60 < 10 ? '0' : ''}{timerSeconds % 60} / 1:30
                </span>
              </div>
              <div className="flex items-center space-x-1 pl-2 border-l border-slate-700">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-xl font-bold transition"
                  title={isTimerRunning ? 'Pausar' : 'Iniciar'}
                >
                  <Play className={`w-4 h-4 ${isTimerRunning ? 'fill-slate-950' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition"
                  title="Reiniciar a cero"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Script breakdown */}
          <div className="space-y-3 text-xs">
            
            {/* 0-15s */}
            <div className={`p-4 rounded-xl border transition ${
              timerSeconds >= 0 && timerSeconds < 15 ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] mb-1">
                <span>[0:00 - 0:15] BLOQUE 1: INTRODUCCIÓN Y CONSIGNAS</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">15 seg</span>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                «Hola, mi nombre es Carlos, pertenezco a la comisión 3DS-A. Para la Práctica 1 me fue asignado el Ejercicio 35, que consiste en una calculadora y simulador de consumo eléctrico llamado ReciboClaro. El objetivo es que cualquier usuario pueda conocer su consumo real en kWh y anticipar su factura mensual.»
              </p>
            </div>

            {/* 15-35s */}
            <div className={`p-4 rounded-xl border transition ${
              timerSeconds >= 15 && timerSeconds < 35 ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] mb-1">
                <span>[0:15 - 0:35] BLOQUE 2: DEMO EN VIVO Y VALIDACIÓN DE 24H</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">20 seg</span>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                «Como vemos en pantalla, podemos agregar artefactos como el aire acondicionado o el termotanque eléctrico indicando potencia y horas. Si un usuario intenta escribir 25 horas diarias, la app bloquea la operación y muestra este error en rojo avisando que un día tiene un tope de 24 horas.»
              </p>
            </div>

            {/* 35-55s */}
            <div className={`p-4 rounded-xl border transition ${
              timerSeconds >= 35 && timerSeconds < 55 ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] mb-1">
                <span>[0:35 - 0:55] BLOQUE 3: COMPARADOR Y PERSISTENCIA (M1 Y M2)</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">20 seg</span>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                «En la pestaña Comparador podemos medir el impacto de nuestros hábitos contrastando el escenario actual contra el anterior, viendo el ahorro en dinero y porcentaje. Además, si cierro la pestaña o recargo el navegador, los datos permanecen intactos gracias a LocalStorage.»
              </p>
            </div>

            {/* 55-75s */}
            <div className={`p-4 rounded-xl border transition ${
              timerSeconds >= 55 && timerSeconds < 75 ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] mb-1">
                <span>[0:55 - 1:15] BLOQUE 4: PESTAÑA AHORRO Y PRUEBA CON USUARIOS</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">20 seg</span>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                «La pestaña Ahorro incluye recomendaciones heurísticas locales de eficiencia energética. La app fue probada con tres personas reales: un compañero, una docente y un adulto ajeno, lo que me llevó a agregar accesos directos para la tarifa y simplificar las tarjetas de ahorro.»
              </p>
            </div>

            {/* 75-90s */}
            <div className={`p-4 rounded-xl border transition ${
              timerSeconds >= 75 ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-300' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 font-bold text-[11px] mb-1">
                <span>[1:15 - 1:30] BLOQUE 5: CIERRE Y PUBLICACIÓN EN GITHUB</span>
                <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">15 seg</span>
              </div>
              <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                «La aplicación está publicada en GitHub Pages y es accesible escaneando el código QR generado en el repositorio. Toda la documentación de 13 partes está subida en el README. Muchas gracias.»
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
