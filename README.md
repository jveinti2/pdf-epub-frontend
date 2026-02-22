# EPUB Forge — Frontend

Interfaz web para convertir PDFs de manuscritos a EPUB.

## Stack

- **React + Vite**
- **TailwindCSS**
- **React Query** — manejo de estado asíncrono de la conversión

## Estructura esperada

```
src/
  App.jsx          # Página única, ya existe como base
  api/
    convert.js     # Lógica de llamada al backend
```

## Flujo de la UI

```
1. Usuario arrastra o selecciona PDF
2. Click en "Convertir a EPUB"
3. Se muestra progreso por pasos (4 pasos visibles)
4. Al terminar, botón de descarga del EPUB
```

## Integración con el backend

### Llamada al endpoint

```js
// src/api/convert.js
export async function convertPdf(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Error en la conversión");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
```

- El backend retorna el EPUB directamente como blob descargable
- El frontend genera una URL temporal con `URL.createObjectURL` para la descarga
- Mientras el backend es síncrono, simular progreso en el frontend con pasos temporizados es aceptable

## Variables de entorno

```env
VITE_API_URL=http://localhost:8000
```

## Instalación local

```bash
pnpm install
pnpm run dev
```

## Consideraciones

- La página única ya existe en `App.jsx`, no recrearla desde cero
- Los 4 pasos del progreso son: Extrayendo texto, Analizando estructura, Generando EPUB, Validando
- El diseño usa tema oscuro (`stone-950`) con acento ámbar (`amber-500`), mantener consistencia
- No agregar rutas adicionales, es una sola página
