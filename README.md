# ReciboClaro ⚡ - Calculadora de Consumo Eléctrico y Ahorro
> **Práctica 1: Prompt a App**  
> **Comisión / Grupo:** 3DS-A  
> **Ejercicio Asignado:** N° 35 - Medidor y Calculadora de Consumo Eléctrico  
> **Alumno:** Carlos (carlosseguridadelectronica@gmail.com)  

---

## 1. Título y Descripción del Proyecto
**ReciboClaro** es una aplicación web progresiva (PWA) interactiva y responsiva diseñada para que cualquier usuario pueda simular, entender y optimizar el consumo de energía eléctrica de su hogar o comercio. Permite inventariar electrodomésticos, calcular el consumo diario, mensual y bimestral en kilovatios-hora (kWh), estimar el costo financiero según tarifas configurables, comparar escenarios de consumo («Antes vs. Después») y obtener recomendaciones heurísticas inteligentes de ahorro energético.

---

## 2. Enlace a la App Desplegada y Código QR
- **URL Oficial en GitHub Pages:** [https://giova2023.github.io/recibo-claro/](https://giova2023.github.io/recibo-claro/)
- **Código QR de Acceso Móvil Directo:**

<p align="center">
  <img src="evidencias/qr.png" alt="Código QR de la Aplicación" width="220"/>
  <br>
  <em>Escaneá el código QR con la cámara de tu celular para abrir e instalar la app directamente.</em>
</p>

---

## 3. Enunciado del Ejercicio 35 y Requerimientos
- **Enunciado:** Construir una aplicación web que permita registrar artefactos eléctricos indicando su potencia en Watts, cantidad y horas de uso diario para calcular el consumo total periódico (kWh) y el importe económico de la factura de luz.
- **Requerimientos Funcionales:**
  - Carga dinámica de electrodomésticos con cálculo en tiempo real.
  - Validación de horas de uso: el día tiene 24 horas; cualquier valor superior debe emitir una advertencia de error bloqueante.
  - Soporte de configuración de tarifas (precio por kWh, cargo fijo, impuestos).
  - Persistencia de datos local (`localStorage`) para evitar pérdida de datos entre sesiones.
  - Comparador de escenarios (antes vs después) para medir el impacto de cambios de hábitos.
  - Pestaña de ahorro con sugerencias personalizadas de eficiencia energética.
  - Capacidad de exportar/importar datos en formato JSON.

---

## 4. Arquitectura y Tecnologías Usadas
- **Frontend:** HTML5 semántico, TypeScript / JavaScript moderno (ESNext), Tailwind CSS para diseño responsivo mobile-first.
- **Persistencia:** Web Storage API (`window.localStorage`) para almacenamiento local en el navegador del cliente.
- **Empaquetado y Ejecución:** Vite / Bundler standalone que compila a un único archivo `index.html` estático, ideal para alojamiento sin costo en GitHub Pages.
- **Iconografía:** UTF-8 nativo y Lucide Icons para máxima velocidad de carga sin peticiones externas pesadas.

---

## 5. Guía de Instalación y Ejecución Local

### Opción A: Probar directamente en el navegador (Sin dependencias)
1. Descargá el archivo `index.html`.
2. Hacé doble clic en el archivo para abrirlo con Google Chrome, Mozilla Firefox, Microsoft Edge o Safari.
3. ¡Listo! La aplicación funciona al 100% de forma autónoma.

### Opción B: Ejecución en entorno de desarrollo Node.js
```bash
# 1. Clonar el repositorio
git clone https://github.com/giova2023/recibo-claro.git

# 2. Entrar a la carpeta
cd recibo-claro

# 3. Instalar dependencias
npm install

# 4. Iniciar el servidor local
npm run dev
```
La aplicación quedará disponible en `http://localhost:3000`.

---

## 6. Declaración Transparente de Uso de IA
> **Declaración de Honestidad Académica:**  
> Se utilizó un modelo de inteligencia artificial como asistente de generación de código inicial para estructurar la aplicación del Ejercicio 35 a partir de los requerimientos de la consigna.  
> Posteriormente, como alumno responsable:
> 1. Revisé, validé y depuré la lógica de cálculo matemático y energético.
> 2. Implementé las restricciones de validación horaria (límite de 24h).
> 3. Realicé el despliegue a GitHub Pages y la generación de evidencias.
> 4. Conduje las pruebas de usuario con 3 personas reales e incorporé sus devoluciones al diseño final.
> 5. Para el hito M5 (Ahorro), se optó por un motor de reglas heurísticas local autónomo en lugar de una API paga para garantizar alta disponibilidad offline en GitHub Pages.

---

## 7. Historial de Hitos de Desarrollo (M0 a M5)
| Hito | Nombre | Descripción Técnica |
|---|---|---|
| **M0** | Versión Inicial | Generación de la estructura base y calculadora reactiva de artefactos y kWh. |
| **M1** | Comparador | Módulo de comparación de consumo «Antes vs. Después» con cálculo de deltas y porcentajes. |
| **M2** | Persistencia | Almacenamiento continuo en `localStorage` con funciones de exportación/importación JSON. |
| **M3** | Adaptabilidad Móvil | Optimización de estilos responsive mobile-first para guardado en pantalla de inicio. |
| **M4** | Validación y Errores | Verificación estricta de límites (0 < horas ≤ 24) con carteles de alerta contextuales. |
| **M5** | Pestaña Ahorro | Algoritmo heurístico local de eficiencia energética y simulación de contingencia offline. |

---

## 8. Validaciones y Manejo de Errores
- **Límite de 24 Horas:** Un día solar cuenta únicamente con 24 horas. Si el usuario ingresa un valor como `25` o `30` horas diarias, la aplicación despliega inmediatamente un banner de error bloqueante (`E4-error.png`) e impide contabilizar cálculos absurdos.
- **Valores Negativos o Nulos:** Se rechaza cualquier valor inferior a cero en potencia o tiempo de uso.
- **Control de JSON corrupto:** En caso de importar un respaldo con formato alterado, el parser de LocalStorage intercepta el error con `try/catch` y restaura el estado seguro por defecto.

---

## 9. Limitaciones Técnicas y Persistencia Local
- **Ámbito del Almacenamiento:** Los datos se guardan en el `localStorage` exclusivo del navegador y dispositivo donde se ejecuta. Si se limpia la caché o se abre la app en otro celular, el usuario debe utilizar la opción **Exportar datos** e **Importar datos** para sincronizar.
- **Ejecución Estática:** GitHub Pages no provee un servidor Node.js backend en vivo; en consecuencia, el motor de ahorro opera mediante reglas heurísticas locales probadas, garantizando rapidez y cero costos de mantenimiento de servidores.

---

## 10. Pruebas con 3 Personas Reales

### Usuario 1: Mateo González (Compañero de clase, 20 años)
- **Tarea intentada:** Cargar el aire acondicionado de su habitación y verificar cuánto aumentaba el recibo si lo usaba 10 horas en vez de 6.
- **Punto de fricción:** Al principio no ubicaba con claridad dónde cambiar la moneda o la tarifa de su distribuidora eléctrica.
- **Frase textual:** *«Che, ¿el precio del kWh es el que viene en mi factura o ya está fijo? Estaría bueno que se pueda tocar fácil arriba sin entrar a menús raros.»*
- **Mejora aplicada:** Se incorporó la barra de tarifa configurable directamente visible en la cabecera de la calculadora.

### Usuario 2: Prof. Silvia Rossi (Adulta del centro educativo, 48 años)
- **Tarea intentada:** Cargar los artefactos de calefacción (termotanque y caloventor) para prever el recibo de invierno.
- **Punto de fricción:** Escribió sin querer 30 horas pensando que era una cifra acumulativa mensual.
- **Frase textual:** *«Me saltó un cartel rojo que me avisó que el día solo tiene 24 horas, eso está excelente porque me salvó del error. Pero me gustaría ver destacado el precio final con impuestos.»*
- **Mejora aplicada:** Se agregó un cálculo automático del 21% de impuestos y se amplió el tamaño de fuente del total mensual.

### Usuario 3: Carlos Alberto (Familiar / Adulto ajeno al proyecto, 55 años)
- **Tarea intentada:** Abrir el enlace enviado por WhatsApp en su celular Samsung para ver qué hacía la app.
- **Punto de fricción:** No comprendía la diferencia entre la columna de Watts y la de kWh.
- **Frase textual:** *«En el celular se lee todo clarito, pero decime qué tengo que apretar para ver cuánto ahorro si apago el split a la noche.»*
- **Mejora aplicada:** Se diseñó la **Pestaña Ahorro** con tarjetas con consejos directos e impactos cuantificados en pesos y kWh.

---

## 11. Estructura de Carpetas y Evidencias
```
recibo-claro/
├── index.html                 # Aplicación completa compilada
├── README.md                  # Documentación oficial con las 13 partes
├── PROMPTS.md                 # Bitácora detallada de prompts e iteraciones
├── .gitignore                 # Exclusión de archivos sensibles y temporales
└── evidencias/                # Directorio obligatorio de capturas y evidencias
    ├── README.md              # Documentación detallada con visualización de evidencias
    ├── qr.png                 # Código QR oficial hacia https://giova2023.github.io/recibo-claro/
    ├── e1_calculadora.svg     # E1: Calculadora con cálculo de kWh y pesos en tiempo real
    ├── e2_comparador.svg      # E2: Comparador de escenarios (Antes vs Después con ahorro)
    ├── e3_ahorro.svg          # E3: Pestaña de ahorro energético con consejos heurísticos
    ├── e4_validacion_error.svg # E4: Validación de error bloqueante al ingresar >24 horas
    └── e5_usuarios.svg        # E5: Pruebas con 3 usuarios reales y criterios SUS
```

---

## 12. Guión para el Video de Defensa (90 Segundos)
- **[0:00 - 0:15] Introducción:**  
  *«Hola, soy Carlos de 3DS-A. Mi proyecto para la Práctica 1 es ReciboClaro, correspondiente al Ejercicio 35. Es una app para calcular el consumo eléctrico real de un hogar y proyectar el costo de la factura de luz.»*
- **[0:15 - 0:35] Demostración en vivo y validación horaria:**  
  *«Aquí vemos la lista de electrodomésticos con sus potencias y horas de uso. Si intento ingresar 25 horas diarias para un artefacto, la aplicación me muestra este error en rojo porque un día tiene máximo 24 horas.»*
- **[0:35 - 0:55] Comparador y persistencia:**  
  *«En la pestaña Comparador podemos fijar un escenario base y medir cuánto ahorramos al bajar el uso del aire acondicionado. Además, si refresco la pestaña, los datos se mantienen gracias a localStorage.»*
- **[0:55 - 1:15] Pestaña de ahorro y pruebas con usuarios:**  
  *«En la Pestaña Ahorro el sistema ofrece sugerencias personalizadas de consumo. Lo probé con 3 personas reales, lo que me permitió simplificar el acceso a las tarifas y hacer la app accesible desde cualquier celular.»*
- **[1:15 - 1:30] Cierre y acceso:**  
  *«La app está publicada en GitHub Pages y accesible desde el código QR incluido en el repositorio. Muchas gracias.»*

---

## 13. Autoría y Fecha de Entrega
- **Autor:** Carlos
- **Carrera / Especialidad:** Desarrollo de Software (3DS-A)
- **Fecha:** Octubre 2026
- **Licencia:** MIT - Software Libre Educativo
