import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Package, 
  ExternalLink,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, generateProductShareText, createWhatsAppProductShareLink } from '../../utils/formatters';

interface ShareProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ShareProductModal: React.FC<ShareProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  if (!isOpen || !product) return null;

  const shareText = generateProductShareText({
    productName: product.name,
    bazarPrice: product.bazarPrice,
    fullPrice: product.fullPrice,
    description: product.description,
    sizeColor: product.sizeColor,
    imageUrl: product.imageUrl,
    category: product.category,
    stock: product.quantity,
  });

  const waLink = createWhatsAppProductShareLink({
    productName: product.name,
    bazarPrice: product.bazarPrice,
    fullPrice: product.fullPrice,
    description: product.description,
    sizeColor: product.sizeColor,
    imageUrl: product.imageUrl,
    category: product.category,
    stock: product.quantity,
  });

  // Helper to convert base64/URL to File object safely for Web Share API
  const urlToFile = async (url: string, filename: string): Promise<File | null> => {
    if (!url) return null;
    try {
      if (url.startsWith('data:')) {
        const parts = url.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
      }

      const res = await fetch(url, { mode: 'cors' }).catch(() => null);
      if (res && res.ok) {
        const blob = await res.blob().catch(() => null);
        if (blob) {
          const mimeType = blob.type || 'image/jpeg';
          return new File([blob], filename, { type: mimeType });
        }
      }

      // Fallback via Canvas
      return await new Promise<File | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width || 300;
            canvas.height = img.naturalHeight || img.height || 300;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  resolve(new File([blob], filename, { type: blob.type || 'image/jpeg' }));
                } else {
                  resolve(null);
                }
              }, 'image/jpeg', 0.9);
            } else {
              resolve(null);
            }
          } catch {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    } catch {
      return null;
    }
  };

  // Handle Download Image
  const handleDownloadImage = () => {
    if (!product.imageUrl) return;

    const link = document.createElement('a');
    link.href = product.imageUrl;
    link.download = `bazar-${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Native Share (WhatsApp with Image file on Mobile / Web Share API)
  const handleNativeShareWithPhoto = async () => {
    setIsSharing(true);
    try {
      if (product.imageUrl && navigator.share) {
        const file = await urlToFile(
          product.imageUrl,
          `bazar-${product.name.toLowerCase().replace(/\s+/g, '-')}.jpg`
        );

        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Rx do Bazar de Sucesso: ${product.name}`,
            text: shareText,
            files: [file],
          });
          setIsSharing(false);
          return;
        }
      }

      // Fallback if file share is not supported by device
      window.open(waLink, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.log('Compartilhamento nativo cancelado ou não suportado:', err);
      window.open(waLink, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Copy Text
  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                Divulgar Peça no WhatsApp
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compartilhe a foto e os detalhes formatados da peça em 1 clique
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-4 mt-3">

        {/* Product Visual Card Preview */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center">
          
          <div className="relative w-32 h-32 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                <Package className="h-8 w-8 mb-1" />
                <span className="text-[10px]">Sem foto</span>
              </div>
            )}

            <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1">
              {product.fullPrice && product.fullPrice > product.bazarPrice ? (
                <>
                  <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                    🔥 {Math.round(((product.fullPrice - product.bazarPrice) / product.fullPrice) * 100)}% OFF
                  </span>
                  <div className="bg-slate-900/90 text-white text-[9px] px-1.5 py-0.5 rounded shadow text-right">
                    <span className="line-through text-slate-300 block text-[8px]">
                      De {formatCurrency(product.fullPrice)}
                    </span>
                    <span className="font-black text-emerald-400 block">
                      Por {formatCurrency(product.bazarPrice)}
                    </span>
                  </div>
                </>
              ) : (
                <div className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  {formatCurrency(product.bazarPrice)}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5 flex-1 text-center sm:text-left">
            <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
              {product.category}
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug">
              {product.name}
            </h4>
            {product.sizeColor && (
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                📏 {product.sizeColor}
              </p>
            )}
            <div className="flex items-center gap-2 justify-center sm:justify-start text-xs font-bold pt-1 flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 text-sm font-black">
                Por {formatCurrency(product.bazarPrice)}
              </span>
              {product.fullPrice && product.fullPrice > product.bazarPrice && (
                <>
                  <span className="text-slate-400 line-through text-xs font-normal">
                    De {formatCurrency(product.fullPrice)}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Economia: {formatCurrency(product.fullPrice - product.bazarPrice)} ({Math.round(((product.fullPrice - product.bazarPrice) / product.fullPrice) * 100)}% OFF)
                  </span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* WhatsApp Message Text Box Preview */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
            Texto Formatado para o WhatsApp:
          </label>
          <div className="bg-slate-900 text-emerald-300 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
            {shareText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          
          {/* Primary Action: Direct Share / WhatsApp with Photo */}
          <button
            onClick={handleNativeShareWithPhoto}
            disabled={isSharing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
          >
            <MessageSquare className="h-5 w-5" />
            <span>{isSharing ? 'Preparando...' : 'Enviar pelo WhatsApp (Com Foto)'}</span>
            <ExternalLink className="h-4 w-4 opacity-80" />
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Download Photo Button */}
            {product.imageUrl && (
              <button
                onClick={handleDownloadImage}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
              >
                <Download className="h-4 w-4 text-emerald-500" />
                <span>Baixar Foto da Peça</span>
              </button>
            )}

            {/* Copy Text Button */}
            <button
              onClick={handleCopyText}
              className={`w-full font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center gap-2 border ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              } ${!product.imageUrl ? 'sm:col-span-2' : ''}`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Texto Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copiar Texto do Anúncio</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center italic pt-1">
            💡 Dica: Ao baixar a foto, você pode anexá-la diretamente no Status ou Grupo do WhatsApp junto com o texto copiado!
          </p>

        </div>

        </div>
      </div>
    </div>
  );
};
