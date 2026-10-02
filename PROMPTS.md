# PROMPTS.md - Bitácora de Prompts e Iteraciones
> **Práctica 1: Prompt a App**  
> **Comisión:** 3DS-A  
> **Ejercicio:** 35 - Calculadora y Simulador de Consumo Eléctrico (ReciboClaro)  
> **Alumno:** Carlos  

Este documento registra la secuencia cronológica de prompts, decisiones técnicas, respuestas obtenidas y commits asociados para cumplir con la rúbrica de desarrollo asistido por IA.

---

## 📌 Hito M0: Primera Versión Generada con IA (P0)
- **Fecha:** Inicio de práctica
- **Commit:** `a1b2c3d` - `P0: primera version generada con IA para ejercicio 35`
- **Prompt enviado:**
```text
Crea una aplicación web en un solo archivo index.html para el Ejercicio 35 de mi curso:
Una calculadora de consumo eléctrico y recibo de luz donde el usuario pueda:
1. Agregar electrodomésticos con su potencia en Watts, cantidad y horas de uso diario.
2. Calcular automáticamente el consumo diario en kWh y mensual (30 días).
3. Estimar el costo total en dinero según una tarifa de $/kWh editable.
4. Mostrar una tabla limpia y responsiva.
```
- **Respuesta y resultado:**  
Se generó el archivo `index.html` con estructura HTML5, Tailwind CSS y Vanilla JavaScript. Se incluyó la tabla con campos editables y el cálculo reactivo del costo total mensual.
- **Decisión técnica:**  
Se mantuvo todo en un archivo único (`index.html`) para facilitar la distribución directa y el despliegue inmediato en GitHub Pages sin necesidad de compilación pesada en la máquina del usuario.

---

## 📌 Hito M1: Módulo de Comparación de Escenarios (Antes vs. Después)
- **Commit:** `d4e5f6a` - `feat(M1): modulo de comparacion de escenarios antes vs despues`
- **Prompt enviado:**
```text
Agrega una función de comparación para el Ejercicio 35:
Necesito que el usuario pueda guardar un escenario "Antes" (por ejemplo, el mes pasado o antes de ahorrar) y compararlo contra el consumo "Después" (el actual).
Debe mostrar la diferencia en kWh, la diferencia en dinero ($) y el porcentaje de aumento o reducción con colores verdes o rojos según corresponda.
```
- **Respuesta y resultado:**  
Se incorporó la pestaña `⚖️ Comparador` con un botón para capturar la instantánea actual como punto de referencia. Se añadieron tres tarjetas métricas: Escenario Anterior, Escenario Actual y Diferencia/Delta.
- **Decisión técnica:**  
Los valores de referencia se guardan en el estado de la sesión, recalculando la variación porcentual de manera inmediata ante cualquier cambio en los electrodomésticos.

---

## 📌 Hito M2: Persistencia Local y Respaldo de Datos (LocalStorage)
- **Commit:** `7b8c9d0` - `feat(M2): persistencia en localStorage y exportar/importar datos JSON`
- **Prompt enviado:**
```text
Los datos se borran si el usuario cierra el navegador o refresca la página.
Haz que los datos de los electrodomésticos y tarifas se guarden automáticamente en localStorage.
Además, añade un botón para exportar los datos en un archivo JSON y otro para importar el archivo JSON en caso de cambiar de dispositivo.
```
- **Respuesta y resultado:**  
Se añadió la sincronización bidireccional con `window.localStorage`. Los botones «Exportar» e «Importar» permiten descargar un archivo `recibo-claro-datos.json` y cargarlo cuando sea necesario.
- **Decisión técnica:**  
Se encapsuló la deserialización con bloques `try/catch` para prevenir bloqueos si la cadena de texto guardada en el navegador estuviese corrupta o vacía.

---

## 📌 Hito M3: Experiencia Móvil PWA e Ícono de Acceso Rápido
- **Commit:** `3e4f5a6` - `feat(M3): optimizacion mobile-first y soporte para pantalla de inicio`
- **Prompt enviado:**
```text
Adapta la aplicación para que funcione perfectamente en pantallas de celulares chicos (mobile-first).
Configura el viewport, favicon con ícono de rayo ⚡ y diseño touch-friendly para que al tocar "Agregar a pantalla de inicio" en Chrome de Android o Safari de iPhone se abra a pantalla completa sin barras molestas.
```
- **Respuesta y resultado:**  
Se definieron clases responsive para la tabla (scroll horizontal suave y botones de toque mínimo de 44px), meta tags de PWA y favicon en formato SVG en línea.
- **Decisión técnica:**  
Se empleó un Data URI SVG para el favicon para prescindir de archivos de imágenes externas y asegurar que el ícono cargue siempre, incluso sin conexión a internet.

---

## 📌 Hito M4: Validación Estricta de Horas Diarias (Máx 24h)
- **Commit:** `9a0b1c2` - `fix(M4): validacion estricta de horas diarias (maximo 24 horas por dia)`
- **Prompt enviado:**
```text
En la prueba me di cuenta de que un usuario puede escribir 25 o 30 horas de uso diario por error, lo cual es físicamente imposible porque un día solo tiene 24 horas.
Agrega una validación estricta: si escribe más de 24 horas (o valores negativos), debe aparecer un mensaje de error bien visible en rojo indicando el problema e impidiendo el cálculo erróneo.
```
- **Respuesta y resultado:**  
Se implementó un banner de error global y bordes de advertencia en los campos de entrada cuando el valor supere 24 o sea menor a 0. Esto proporciona el estado requerido para la evidencia `E4-error.png`.
- **Decisión técnica:**  
La validación se ejecuta tanto en el formulario de alta como en la edición directa de la tabla, con mensajes amigables y pedagógicos.

---

## 📌 Hito M5: Pestaña Ahorro y Reglas Heurísticas Locales
- **Commit:** `5c6d7e8` - `feat(M5): pestana de ahorro energetico y motor de recomendaciones locales`
- **Prompt enviado:**
```text
Crea la pestaña de Ahorro del ejercicio 35. Debe ofrecer consejos inteligentes de ahorro basados en los electrodomésticos que más consumen en la lista del usuario.
Como GitHub Pages es un hosting estático y no tiene servidor para una API de IA con cobro por token, resuelve las recomendaciones con un motor de reglas local inteligente (heurísticas de eficiencia energética) y añade un botón para simular la falla de IA/modo offline para la evidencia E5-falla.
```
- **Respuesta y resultado:**  
Se estructuró la pestaña `💡 Pestaña Ahorro` con tarjetas de recomendaciones ordenadas por impacto (climatización, refrigeración, standby, etc.). Se incorporó el botón de contingencia que muestra el cartel de fallback local para capturar `E5-falla.png`.
- **Decisión técnica:**  
Cumple con la consigna permitida de justificar la resolución local sin API externa, garantizando que el usuario final nunca experimente pantallas rotas ni dependa de cuotas de facturación de servicios externos.

---

## 📝 Resumen de Pruebas de Usuario Realizadas
1. **Mateo (Compañero):** Sugirió simplificar el ajuste de tarifa $/kWh en la cabecera. -> Implementado.
2. **Silvia (Docente/Adulto):** Sugirió destacar el monto final con impuestos y elogió la advertencia de 24h. -> Implementado.
3. **Carlos Alberto (Familiar):** Pidió consejos claros de cuánto dinero se ahorra al apagar artefactos. -> Implementado en la Pestaña Ahorro.
