import { useState, useRef } from "react";

const STATUS = {
  IDLE: "idle",
  UPLOADING: "uploading",
  PROCESSING: "processing",
  DONE: "done",
  ERROR: "error",
};

const steps = ["Extrayendo texto", "Analizando estructura", "Generando EPUB", "Validando"];

 function App() {
  const [status, setStatus] = useState(STATUS.IDLE);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [epubUrl, setEpubUrl] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || f.type !== "application/pdf") {
      setError("Solo se aceptan archivos PDF.");
      return;
    }
    setError(null);
    setFile(f);
    setStatus(STATUS.IDLE);
    setEpubUrl(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus(STATUS.UPLOADING);
    setCurrentStep(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus(STATUS.PROCESSING);

      const progressInterval = setInterval(() => {
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);

      const apiUrl = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiUrl}/convert`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Error al convertir");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setCurrentStep(steps.length);
      setEpubUrl(url);
      setStatus(STATUS.DONE);
    } catch (err) {
      setError(err.message || "Error de conexion");
      setStatus(STATUS.ERROR);
    }
  };

  const reset = () => {
    setStatus(STATUS.IDLE);
    setFile(null);
    setEpubUrl(null);
    setError(null);
    setCurrentStep(0);
  };

  const isProcessing = status === STATUS.UPLOADING || status === STATUS.PROCESSING;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col" style={{ fontFamily: "'Georgia', serif" }}>
      {/* Header */}
      <header className="border-b border-stone-800 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-amber-500 rounded-sm flex items-center justify-center">
            <span className="text-stone-950 font-bold text-xs" style={{ fontFamily: "monospace" }}>E</span>
          </div>
          <span className="text-stone-200 tracking-widest text-sm uppercase"></span>
        </div>
        <span className="text-stone-600 text-xs tracking-wider">PDF → EPUB</span>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">

          {/* Title */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl text-stone-100 mb-3 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Convierte tu manuscrito
            </h1>
            <p className="text-stone-500 text-sm tracking-wide">
              Sube el PDF y obtén un EPUB listo para publicar
            </p>
          </div>

          {/* Drop Zone */}
          {status === STATUS.IDLE || status === STATUS.ERROR ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-200 ${
                drag
                  ? "border-amber-500 bg-amber-500/5"
                  : file
                  ? "border-stone-600 bg-stone-900"
                  : "border-stone-700 bg-stone-900 hover:border-stone-500"
              }`}
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-stone-800 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-200 text-sm font-medium">{file.name}</p>
                    <p className="text-stone-600 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); reset(); }}
                    className="text-stone-600 hover:text-stone-400 text-xs underline underline-offset-2 transition-colors"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 bg-stone-800 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-stone-300 text-sm">Arrastra tu PDF aqui</p>
                    <p className="text-stone-600 text-xs mt-1">o haz clic para seleccionar</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Error */}
          {error && (
            <p className="mt-3 text-red-400 text-xs text-center">{error}</p>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-6 text-center">Procesando</p>
              <div className="space-y-4">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      i < currentStep
                        ? "bg-amber-500"
                        : i === currentStep
                        ? "bg-stone-700 border-2 border-amber-500"
                        : "bg-stone-800"
                    }`}>
                      {i < currentStep && (
                        <svg className="w-3 h-3 text-stone-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                      {i === currentStep && (
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                    <span className={`text-sm transition-colors duration-300 ${
                      i <= currentStep ? "text-stone-200" : "text-stone-600"
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {status === STATUS.DONE && (
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-8 text-center">
              <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-stone-200 mb-1">EPUB generado</p>
              <p className="text-stone-600 text-xs mb-6">Listo para publicar en cualquier plataforma</p>
              <div className="flex flex-col gap-3">
                <a
                  href={epubUrl}
                  download={file?.name?.replace(".pdf", ".epub")}
                  className="block w-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-medium py-3 rounded transition-colors"
                >
                  Descargar EPUB
                </a>
                <button
                  onClick={reset}
                  className="w-full text-stone-600 hover:text-stone-400 text-sm py-2 transition-colors"
                >
                  Convertir otro archivo
                </button>
              </div>
            </div>
          )}

          {/* CTA */}
          {(status === STATUS.IDLE || status === STATUS.ERROR) && file && (
            <button
              onClick={handleConvert}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-sm py-4 rounded transition-colors"
            >
              Convertir a EPUB
            </button>
          )}

          {/* Info */}
          {status === STATUS.IDLE && !file && (
            <div className="mt-8 flex justify-center gap-8 text-stone-600 text-xs">
              <span>PDF estructurado</span>
              <span className="text-stone-800">·</span>
              <span>IA para estructura</span>
              <span className="text-stone-800">·</span>
              <span>EPUB3 valido</span>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 px-8 py-4 text-center">
      </footer>
    </div>
  );
}

export default App