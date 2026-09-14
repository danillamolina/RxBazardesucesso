import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  MessageSquare, 
  Copy, 
  Check, 
  Sparkles, 
  Package, 
  Tag, 
  UserCheck, 
  ExternalLink,
  Image as ImageIcon,
  Share2
} from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { 
  downloadProductJpg, 
  downloadProductOriginalPhoto, 
  shareProductJpgWhatsApp,
  copyProductImageToClipboard,
  isDesktopDevice
} from '../../utils/productJpgGenerator';
import { useBazar } from '../../context/BazarContext';

interface PhotoOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOpenSendCustomer?: (product: Product) => void;
}

export const PhotoOptionsModal: React.FC<PhotoOptionsModalProps> = ({
  isOpen,
  onClose,
  product,
  onOpenSendCustomer
}) => {
  const { storeInfo } = useBazar();
  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [isDownloadingOriginal, setIsDownloadingOriginal] = useState(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const isDesktop = useMemo(() => isDesktopDevice(), []);

  if (!isOpen || !product) return null;

  const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(product);

  const formattedShareText =
    `🔥 *OFERTA IMPERDÍVEL!* 🔥\n\n` +
    `✨ *${product.name}*${product.sku ? ` (Cód: ${product.sku})` : ''}\n` +
    (product.sizeColor ? `📏 Detalhes: ${product.sizeColor}\n` : '') +
    (product.expirationDate ? `📅 Validade: ${product.expirationDate}\n` : '') +
    (product.description ? `📝 ${product.description}\n` : '') +
    (hasDiscount
      ? `\n🏷️ Preço Normal: ~${formatCurrency(fullPrice)}~\n🔥 *Preço Promocional: ${formatCurrency(bazarPrice)}* (🔥 *${formatPercent(discountPercent)} OFF*)\n💰 *Você Economiza: ${formatCurrency(discountAmount)}*!\n`
      : `\n💰 *Preço: ${formatCurrency(bazarPrice)}*!\n`) +
    (product.quantity > 0 ? `📦 Estoque: *${product.quantity} un.*\n` : `🔴 *ESGOTADO*\n`) +
    (storeInfo.pixKey ? `\n🔑 Chave PIX: *${storeInfo.pixKey}*\n` : '') +
    `\nGaranta a sua peça comigo no WhatsApp! 🛍️💖`;

  const handleDownloadCard = async () => {
    setIsDownloadingJpg(true);
    try {
      await downloadProductJpg(product);
    } catch (err) {
      console.error('Erro ao baixar card:', err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  const handleDownloadOriginal = async () => {
    setIsDownloadingOriginal(true);
    try {
      await downloadProductOriginalPhoto(product);
    } catch (err) {
      console.error('Erro ao baixar foto original:', err);
    } finally {
      setIsDownloadingOriginal(false);
    }
  };

  const handleShareWhatsApp = async () => {
    setIsSharingWhatsApp(true);
    try {
      await shareProductJpgWhatsApp(product, 'standard', undefined, undefined, true);
    } catch (err) {
      console.error('Erro ao enviar pelo WhatsApp:', err);
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(formattedShareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar texto:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in notranslate" translate="no">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Fotos & Envio no WhatsApp
              </h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
                {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Photo Preview & Key Details */}
          <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            {/* Image Thumbnail */}
            <div className="w-full sm:w-36 h-48 sm:h-36 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-contain p-1.5"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <Package className="h-8 w-8 mb-1 opacity-40" />
                  <span className="text-[10px]">Sem foto</span>
                </div>
              )}
            </div>

            {/* Info Summary */}
            <div className="flex-1 flex flex-col justify-between space-y-2">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-extrabold mb-1">
                  {product.category} {product.subcategory ? `• ${product.subcategory}` : ''}
                </span>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                  {product.name}
                </h4>
                {product.sizeColor && (
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                    📏 {product.sizeColor}
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-baseline justify-between gap-2">
                  <div>
                    {hasDiscount && (
                      <span className="text-[10px] text-slate-400 line-through font-medium block">
                        De: {formatCurrency(fullPrice)}
                      </span>
                    )}
                    <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">
                      Por: {formatCurrency(bazarPrice)}
                    </span>
                  </div>
                  {hasDiscount && (
                    <span className="text-[10px] font-black text-white bg-rose-600 px-2 py-0.5 rounded shadow-xs">
                      🔥 {formatPercent(discountPercent)} OFF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Downloads */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-rose-600" />
              1. Opções para Baixar a Foto
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option A: Card with Prices */}
              <button
                onClick={handleDownloadCard}
                disabled={isDownloadingJpg}
                className="p-3 bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-left transition flex items-start gap-3 group active:scale-[0.98]"
              >
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 group-hover:scale-105 transition">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                    Card do Anúncio (JPG)
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">
                    Foto editada com De/Por, % de desconto e dados da loja para Status e Stories.
                  </p>
                </div>
              </button>

              {/* Option B: Clean Original Photo */}
              <button
                onClick={handleDownloadOriginal}
                disabled={isDownloadingOriginal || !product.imageUrl}
                className="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-left transition flex items-start gap-3 group active:scale-[0.98] disabled:opacity-50"
              >
                <div className="p-2 rounded-xl bg-slate-700 text-white shrink-0 group-hover:scale-105 transition">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                    Foto Original Limpa
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-tight mt-0.5">
                    Baixa a foto limpa da peça sem preços ou textos por cima.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: WhatsApp Envio para Clientes */}
          <div className="space-y-2 pt-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              2. Enviar pelo WhatsApp para o Cliente
            </h4>

            <div className="space-y-2">
              {/* Direct WhatsApp Share */}
              <button
                onClick={handleShareWhatsApp}
                disabled={isSharingWhatsApp}
                className="w-full p-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between shadow-md transition active:scale-[0.99]"
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className="p-1.5 rounded-lg bg-emerald-700/80 text-white">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-extrabold leading-tight">Enviar no WhatsApp Agora</div>
                    <div className="text-[10px] sm:text-[11px] text-emerald-100 font-normal leading-tight">
                      {isDesktop ? 'Baixa a foto e abre o WhatsApp com a mensagem completa' : 'Envia a foto e mensagem diretamente para qualquer contato'}
                    </div>
                  </div>
                </div>
                <Share2 className="h-4 w-4 text-emerald-100 shrink-0" />
              </button>

              {/* Customer Selector Modal Button */}
              {onOpenSendCustomer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenSendCustomer(product);
                  }}
                  className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-2xl font-bold text-xs flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-indigo-600" />
                    <span>Selecionar Cliente Cadastrado da Lista</span>
                  </div>
                  <span className="text-[10px] bg-indigo-200/70 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 px-2 py-0.5 rounded-full font-extrabold">
                    Personalizado
                  </span>
                </button>
              )}

              {/* Copy Formatted Text */}
              <button
                onClick={handleCopyText}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition"
              >
                {copiedText ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 dark:text-emerald-400">Texto do Anúncio Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-500" />
                    <span>Copiar Texto Completo do Anúncio</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-300 hover:bg-slate-200/60 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
