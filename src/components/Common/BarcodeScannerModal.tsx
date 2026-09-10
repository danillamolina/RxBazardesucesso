import React, { useEffect, useRef, useState, useId } from 'react';
import { 
  X, 
  Camera, 
  FlipHorizontal, 
  Flashlight, 
  FlashlightOff, 
  Barcode, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  PackageCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../../types';
import { playBarcodeBeep, playErrorBeep } from '../../utils/audioFeedback';
import { formatCurrency } from '../../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string, matchedProduct?: Product) => void;
  products?: Product[];
  title?: string;
  description?: string;
  allowContinuousScan?: boolean;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  products = [],
  title = 'Escanear Código de Barras',
  description = 'Aponte a câmera para o código de barras (EAN-13, Code 128, etc.) ou digite abaixo',
  allowContinuousScan = false,
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const scannerContainerId = `barcode-reader-box-${uniqueId}`;

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [currentCameraId, setCurrentCameraId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // Manual barcode typing state
  const [manualCode, setManualCode] = useState('');
  
  // Last scanned info & feedback
  const [lastScanned, setLastScanned] = useState<{
    code: string;
    product?: Product;
    time: Date;
  } | null>(null);
  const [scannedCount, setScannedCount] = useState(0);
  const [notFoundCode, setNotFoundCode] = useState<string | null>(null);

  // Cooldown to avoid duplicate scanning in fraction of a second
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setLastScanned(null);
      setScannedCount(0);
      setNotFoundCode(null);
      setManualCode('');
      setCameraError(null);
      return;
    }

    // Delay start slightly to let the modal mount its container in DOM
    const timer = setTimeout(() => {
      startCamera();
    }, 300);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Error stopping scanner:', e);
    } finally {
      setIsScanning(false);
      setTorchOn(false);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    const container = document.getElementById(scannerContainerId);
    if (!container) return;

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const scanner = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
        verbose: false,
      });

      html5QrCodeRef.current = scanner;

      // Check available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices.map(d => ({ id: d.id, label: d.label || `Câmera ${d.id}` })));
        }
      } catch (err) {
        // Device listing may be restricted until permission granted
      }

      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        // Horizontal rectangular box ideal for 1D barcodes
        const minEdgePercentage = 0.8;
        const boxWidth = Math.floor(viewfinderWidth * minEdgePercentage);
        const boxHeight = Math.floor(Math.min(viewfinderHeight * 0.5, 180));
        return {
          width: Math.max(220, boxWidth),
          height: Math.max(120, boxHeight),
        };
      };

      const config = {
        fps: 15,
        qrbox: qrboxFunction,
        aspectRatio: 1.3333,
      };

      await scanner.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleBarcodeDetected(decodedText);
        },
        () => {
          // Frame error (no barcode found in frame), ignore silently
        }
      );

      setIsScanning(true);

      // Check for torch capability
      try {
        const track = (scanner as any).getRunningTrackCameraCapabilities?.();
        if (track && track.torchFeature && track.torchFeature().isSupported()) {
          setHasTorch(true);
        }
      } catch (e) {
        setHasTorch(false);
      }

    } catch (err: any) {
      console.error('Failed to start camera:', err);
      setIsScanning(false);
      let message = 'Não foi possível acessar a câmera.';
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')) {
        message = 'Permissão de câmera negada. Por favor, autorize o acesso à câmera no seu navegador.';
      } else if (err?.name === 'NotFoundError' || err?.message?.includes('No camera')) {
        message = 'Nenhuma câmera encontrada neste dispositivo.';
      }
      setCameraError(message);
    }
  };

  const handleBarcodeDetected = (rawCode: string) => {
    const cleanCode = rawCode.trim();
    if (!cleanCode) return;

    // Prevent debounce duplicate within 1.5 seconds for exact same code
    const now = Date.now();
    if (cleanCode === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 1500) {
      return;
    }
    lastScannedCodeRef.current = cleanCode;
    lastScannedTimeRef.current = now;

    // Match against catalog products
    const matched = products.find((p) => {
      const matchBarcode = p.barcode && p.barcode.trim().toLowerCase() === cleanCode.toLowerCase();
      const matchSku = p.sku && p.sku.trim().toLowerCase() === cleanCode.toLowerCase();
      const matchId = p.id.toLowerCase() === cleanCode.toLowerCase();
      return matchBarcode || matchSku || matchId;
    });

    if (products.length > 0 && !matched) {
      // In sales context, if product doesn't exist, provide clear error feedback
      playErrorBeep();
      setNotFoundCode(cleanCode);
      setLastScanned({
        code: cleanCode,
        product: undefined,
        time: new Date(),
      });
      return;
    }

    // Success scan!
    playBarcodeBeep();
    setNotFoundCode(null);
    setScannedCount((c) => c + 1);
    setLastScanned({
      code: cleanCode,
      product: matched,
      time: new Date(),
    });

    onScanSuccess(cleanCode, matched);

    if (!allowContinuousScan) {
      // Single scan mode: close modal after brief visual confirmation
      setTimeout(() => {
        onClose();
      }, 400);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode.trim());
    setManualCode('');
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !hasTorch) return;
    try {
      const newTorch = !torchOn;
      await (html5QrCodeRef.current as any).applyVideoConstraints({
        advanced: [{ torch: newTorch }],
      });
      setTorchOn(newTorch);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-[60] overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-white my-auto flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Barcode className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                {allowContinuousScan && scannedCount > 0 && (
                  <span className="text-[11px] bg-emerald-500 text-white font-extrabold px-2 py-0.5 rounded-full">
                    {scannedCount} lido{scannedCount > 1 ? 's' : ''}
                  </span>
                )}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera Viewfinder Box */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-slate-800 min-h-[260px] sm:min-h-[280px] flex items-center justify-center shadow-inner">
          <div id={scannerContainerId} className="w-full h-full min-h-[260px] overflow-hidden" />

          {/* Overlay Targeting Laser Guide */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Target Reticle */}
              <div className="w-[85%] max-w-[320px] h-[130px] border-2 border-dashed border-rose-400/80 rounded-2xl relative flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)]">
                {/* Reticle corners */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-rose-500 rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-rose-500 rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-rose-500 rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-rose-500 rounded-br-lg" />

                {/* Animated Red Laser Scanning Line */}
                <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse relative">
                  <div className="absolute inset-0 bg-white/70 blur-[1px]" />
                </div>
              </div>
              <span className="mt-3 text-[11px] font-semibold text-rose-200/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm tracking-wide">
                Posicione o código de barras no centro
              </span>
            </div>
          )}

          {/* Camera Error Message */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
              <p className="text-xs sm:text-sm font-semibold text-slate-200 max-w-xs mb-3">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={startCamera}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Tentar Novamente</span>
              </button>
            </div>
          )}

          {/* Camera Controls Floating Bar */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
            {hasTorch && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-xl backdrop-blur-md transition shadow-md ${
                  torchOn ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-black/60 text-white hover:bg-black/80'
                }`}
                title={torchOn ? 'Desligar Lanterna' : 'Ligar Lanterna'}
              >
                {torchOn ? <Flashlight className="h-4 w-4" /> : <FlashlightOff className="h-4 w-4" />}
              </button>
            )}
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md"
              title="Inverter Câmera (Traseira / Frontal)"
            >
              <FlipHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scan Status & Feedback Card */}
        {notFoundCode && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
            <div className="flex-1 text-xs">
              <div className="font-bold text-rose-800 dark:text-rose-200">
                Código não cadastrado: <span className="font-mono bg-rose-200/70 dark:bg-rose-900 px-1.5 py-0.5 rounded">{notFoundCode}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                Nenhum produto em estoque possui este código de barras ou SKU.
              </p>
            </div>
          </div>
        )}

        {lastScanned && lastScanned.product && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-200">
            {lastScanned.product.imageUrl ? (
              <img
                src={lastScanned.product.imageUrl}
                alt={lastScanned.product.name}
                className="w-12 h-12 object-cover rounded-xl border border-emerald-200 dark:border-emerald-700 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <PackageCheck className="h-6 w-6" />
              </div>
            )}
            <div className="flex-1 min-w-0 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ✓ Reconhecido
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  {lastScanned.code}
                </span>
              </div>
              <div className="font-bold text-slate-900 dark:text-white truncate mt-1">
                {lastScanned.product.name}
              </div>
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(lastScanned.product.bazarPrice)} • Estoque: {lastScanned.product.quantity} un.
              </div>
            </div>
          </div>
        )}

        {/* Manual Input or USB Gun Fallback */}
        <form onSubmit={handleManualSubmit} className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Barcode className="h-3.5 w-3.5 text-rose-500" />
              Digitar ou Ler com Leitor USB / Bluetooth:
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Pressione Enter</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="ex: 7891234567890 ou SKU..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1 shadow-sm"
            >
              <span>Buscar</span>
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {allowContinuousScan ? (
              <span>💡 Dica: continue apontando para escanear mais peças</span>
            ) : (
              <span>Reconhecimento instantâneo via câmera</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition"
          >
            {allowContinuousScan && scannedCount > 0 ? 'Concluir Leitura' : 'Fechar'}
          </button>
        </div>

      </div>
    </div>
  );
};
