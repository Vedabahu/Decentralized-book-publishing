"use client";

import { useEffect, useState, useRef } from "react";
import { X, Loader2 } from "lucide-react";

function PDFPage({ pdf, pageNumber }: { pdf: any; pageNumber: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: any;
    let isMounted = true;
    
    // We use an async block inside useEffect
    pdf.getPage(pageNumber).then((page: any) => {
      if (!isMounted) return;
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      renderTask = page.render(renderContext);
      
      // Catch and suppress intentional cancellation exceptions thrown by React Strict Mode
      renderTask.promise.catch((err: any) => {
        if (err.name !== "RenderingCancelledException") {
          console.error(err);
        }
      });
    }).catch(console.error);

    return () => {
      isMounted = false;
      if (renderTask && renderTask.cancel) {
        renderTask.cancel();
      }
    };
  }, [pdf, pageNumber]);

  return <canvas ref={canvasRef} className="max-w-full shadow-md" onContextMenu={(e) => e.preventDefault()} />;
}

export function ReaderOverlay({ url, onClose }: { url: string; onClose: () => void }) {
  const [pdf, setPdf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Lock the background page from scrolling while reading
  useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Globally block right click while reader is open
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu, { capture: true });
    
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    };
  }, []);

  // Fetch and init the PDF Document manually with dynamic imports to avoid SSR DOMMatrix crash
  useEffect(() => {
    let loadingTask: any;
    let isMounted = true;

    import("pdfjs-dist").then((pdfjsLib) => {
      if (!isMounted) return;
      
      // Configure worker conditionally to avoid Next.js bundling issues
      if (typeof window !== "undefined" && "workerSrc" in pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      }

      loadingTask = pdfjsLib.getDocument(`/api/pdf?url=${encodeURIComponent(url)}`);
      loadingTask.promise.then((loadedPdf: any) => {
        if (!isMounted) {
          loadingTask.destroy();
          return;
        }
        setPdf(loadedPdf);
        setLoading(false);
      }).catch((err: any) => {
        // Suppress Worker Destoryed intentional Strict Mode aborts
        if (err.message && err.message.includes("Worker was destroyed")) return;
        console.error("Error loading PDF via pdf.js", err);
        if (isMounted) setLoading(false);
      });
    });
    
    return () => {
      isMounted = false;
      if (loadingTask && loadingTask.destroy) {
        loadingTask.destroy();
      }
    };
  }, [url]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex flex-col pt-4 pb-0 px-4 md:px-12 animate-in fade-in duration-200"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold font-heading text-foreground">Secure Reader</h2>
        <button
          onClick={onClose}
          className="p-2 bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors active:scale-95 shadow border border-border"
          title="Close Reader"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        className="flex-1 bg-muted rounded-t-xl overflow-y-auto overflow-x-hidden border border-border shadow-2xl relative flex flex-col items-center py-8 custom-scrollbar"
        onContextMenu={(e) => e.preventDefault()} 
      >
        {loading && (
          <div className="flex flex-col items-center justify-center p-20 text-muted-foreground animate-pulse mt-20">
            <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
            <p className="text-lg">Securely rendering document via Canvas...</p>
          </div>
        )}

        {pdf && Array.from(new Array(pdf.numPages), (el, index) => (
          <div key={`page_${index + 1}`} className="mb-8 shadow-xl border border-border/50 bg-white" onContextMenu={(e) => e.preventDefault()}>
            <PDFPage pdf={pdf} pageNumber={index + 1} />
          </div>
        ))}
      </div>
    </div>
  );
}
