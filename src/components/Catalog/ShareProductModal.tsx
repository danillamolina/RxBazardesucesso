import React, { useState, useMemo } from 'react';
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
  Image as ImageIcon,
  Zap,
  Monitor
} from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, formatPercent, generateProductShareText } from '../../utils/formatters';
import { 
  buildWhatsAppDirectUrl, 
  copyProductImageToClipboard, 
  downloadProductJpg, 
  isDesktopDevice,
  shareProductJpgWhatsApp 
} from '../../utils/productJpgGenerator';

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
  const [copiedImage, setCopiedImage] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isDesktop = useMemo(() => isDesktopDevice(), []);

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

  // Direct fast open WhatsApp Web / App (Instantaneous, 0ms latency)
  const handleInstantWhatsApp = (isBusiness: boolean = false) => {
    const url = buildWhatsAppDirectUrl(shareText, undefined, isBusiness, true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy card image to clipboard (Ctrl+V)
  const handleCopyImage = async () => {
    if (!product) return;
    setIsSharing(true);
    try {
      const success = await copyProductImageToClipboard(product);
      if (success) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      } else {
        await downloadProductJpg(product);
      }
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Download JPG Banner
  const handleDownloadBanner = async () => {
    if (!product) return;
    setIsSharing(true);
    try {
      await downloadProductJpg(product);
    } catch (err) {
      console.error('Erro ao baixar banner JPG:', err);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Native Share / Direct WhatsApp with Photo
  const handleShareWithPhoto = async () => {
    if (!product) return;
    setIsSharing(true);
    try {
      await shareProductJpgWhatsApp(product, false);
    } catch (err) {
      console.error('Erro ao compartilhar:', err);
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Copy Text
  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  Divulgar Peça no WhatsApp
                </h3>
                {isDesktop && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    <Monitor className="h-3 w-3" /> Modo PC
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Envio instantâneo e opções de imagem para copiar ou baixar
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

        <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 mt-3">

        {/* Product Visual Card Preview */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 bg-slate-200 dark:bg-slate-700 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-600">
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
                <div className="bg-white/95 text-slate-900 text-[9px] px-2 py-1 rounded shadow-md border border-slate-200 text-right space-y-0.5">
                  <span className="text-slate-500 block text-[8px] font-bold">
                    De: <span className="line-through font-normal text-slate-400">{formatCurrency(product.fullPrice)}</span>
                  </span>
                  <span className="font-black text-emerald-600 block text-[10px]">
                    Por {formatCurrency(product.bazarPrice)}
                  </span>
                </div>
              ) : (
                <div className="bg-white/95 text-slate-900 text-[9px] px-2 py-1 rounded shadow-md border border-slate-200 text-right">
                  <span className="font-black text-emerald-600 block text-[10px]">
                    {formatCurrency(product.bazarPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 flex-1 text-center sm:text-left min-w-0">
            <span className="text-[10px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
              {product.category}
            </span>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate">
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
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    {formatPercent((1 - (product.bazarPrice / product.fullPrice)) * 100)} OFF
                  </span>
                </>
              )}
            </div>
          </div>

        </div>

        {/* WhatsApp Message Text Box Preview */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
              Texto Formatado para o WhatsApp:
            </label>
            <button
              onClick={handleCopyText}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          <div className="bg-slate-900 text-emerald-300 p-3 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto border border-slate-800 shadow-inner">
            {shareText}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          
          {/* Instant WhatsApp Web Button */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-600/20 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-300 fill-amber-300" />
              <div>
                <p className="font-extrabold text-xs sm:text-sm">Envio Imediato no WhatsApp</p>
                <p className="text-[10px] text-emerald-100">Abre a conversa na hora com o texto preenchido</p>
              </div>
            </div>

            <button
              onClick={() => handleInstantWhatsApp(false)}
              className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs py-2 px-4 rounded-xl shadow transition active:scale-98 flex items-center justify-center gap-1.5 shrink-0"
            >
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              <span>{isDesktop ? 'Abrir no WhatsApp Web' : 'Abrir no WhatsApp'}</span>
              <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
            </button>
          </div>

          {/* Image Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Copy Image Button */}
            <button
              onClick={handleCopyImage}
              disabled={isSharing}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 px-2 rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              title="Copia a imagem para colar com Ctrl+V na conversa"
            >
              {copiedImage ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              <span>{copiedImage ? 'Imagem Copiada!' : 'Copiar Imagem (Ctrl+V)'}</span>
            </button>

            {/* Download JPG Banner */}
            <button
              onClick={handleDownloadBanner}
              disabled={isSharing}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-emerald-500" />
              <span>Baixar Imagem JPG</span>
            </button>

            {/* Share with Photo */}
            <button
              onClick={handleShareWithPhoto}
              disabled={isSharing}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-2 rounded-xl shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{isSharing ? 'Gerando...' : 'Enviar Foto + Web'}</span>
            </button>
          </div>

          {isDesktop && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40 text-center">
              💡 <span className="font-bold text-amber-900 dark:text-amber-300">Dica:</span> No PC, você pode clicar em <strong>"Copiar Imagem"</strong> e dar <strong>Ctrl+V</strong> na conversa do WhatsApp Web para colar o card promocional instantaneamente!
            </p>
          )}

        </div>

        </div>
      </div>
    </div>
  );
};
