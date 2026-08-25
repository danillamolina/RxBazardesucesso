import React, { useState, useMemo } from 'react';
import { 
  X, 
  MessageSquare, 
  Search, 
  User, 
  Phone, 
  Send, 
  Check, 
  ExternalLink,
  Sparkles,
  Package,
  Building2,
  Tag,
  UserCheck,
  Image as ImageIcon,
  Download,
  Copy,
  Zap,
  Monitor
} from 'lucide-react';
import { Product, Sale } from '../../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { 
  shareProductJpgWhatsApp, 
  downloadProductJpg, 
  copyProductImageToClipboard, 
  buildWhatsAppDirectUrl,
  isDesktopDevice 
} from '../../utils/productJpgGenerator';

interface SendToCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  sales: Sale[];
}

export const SendToCustomerModal: React.FC<SendToCustomerModalProps> = ({
  isOpen,
  onClose,
  product,
  sales,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string } | null>(null);
  const [customPhone, setCustomPhone] = useState('');
  const [customName, setCustomName] = useState('');
  const [copiedText, setCopiedText] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isGeneratingJpg, setIsGeneratingJpg] = useState(false);
  const isDesktop = useMemo(() => isDesktopDevice(), []);

  // Extract unique customer contacts from sales list
  const customersList = useMemo(() => {
    const map = new Map<string, { name: string; phone: string; salesCount: number }>();
    sales.forEach((s) => {
      const name = s.customerName?.trim();
      if (!name) return;
      const key = name.toLowerCase();
      const existing = map.get(key);
      if (existing) {
        existing.salesCount += 1;
        if (!existing.phone && s.customerPhone) {
          existing.phone = s.customerPhone.trim();
        }
      } else {
        map.set(key, {
          name,
          phone: s.customerPhone?.trim() || '',
          salesCount: 1,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [sales]);

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customersList;
    const q = searchQuery.toLowerCase().trim();
    return customersList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customersList, searchQuery]);

  if (!isOpen || !product) return null;

  const { fullPrice, bazarPrice, discountAmount, discountPercent, hasDiscount } = getProductPriceDetails(product);

  // Get recipient details
  const activeName = selectedCustomer ? selectedCustomer.name : customName.trim();
  const activePhoneRaw = selectedCustomer ? selectedCustomer.phone : customPhone.trim();

  // Clean phone to numeric only with Brazil country code if missing
  const cleanPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.length === 10 || digits.length === 11) {
      return `55${digits}`;
    }
    return digits;
  };

  const formattedTargetPhone = cleanPhone(activePhoneRaw);

  // Build formatted announcement text for WhatsApp
  const shareText = 
    `🔥 *ACHADO DO RX DO BAZAR DE SUCESSO!* 🔥\n\n` +
    (activeName ? `Olá *${activeName}*! Confira essa oferta especial separada para você:\n\n` : '') +
    `✨ *${product.name}*${product.sku ? ` (Cód: ${product.sku})` : ''}\n` +
    (product.sizeColor ? `📏 Detalhes: ${product.sizeColor}\n` : '') +
    (product.expirationDate ? `📅 Validade: ${product.expirationDate}\n` : '') +
    (product.description ? `📝 ${product.description}\n` : '') +
    (hasDiscount 
      ? `\n🏷️ Preço Cheio: ~${formatCurrency(fullPrice)}~\n🔥 Preço no Bazar: *${formatCurrency(bazarPrice)}* (🔥 *${discountPercent}% OFF*)\n💰 Desconto Realizado: *${formatCurrency(discountAmount)}* de economia!\n`
      : `\n💰 Preço no Bazar: *${formatCurrency(bazarPrice)}*!\n`) +
    (product.quantity > 0 ? `📦 Estoque Disponível: *${product.quantity} un.*\n` : `🔴 *PRODUTO ESGOTADO*\n`) +
    (product.imageUrl && !product.imageUrl.startsWith('data:') ? `\n📸 Foto da peça: ${product.imageUrl}\n` : '') +
    `\nMe chama no privado para garantir ou tirar dúvidas! 🛍️💖`;

  // Instant direct WhatsApp sending (0 delay, no canvas rendering needed)
  const handleInstantWhatsApp = (isBusiness: boolean = false) => {
    const url = buildWhatsAppDirectUrl(shareText, formattedTargetPhone, isBusiness, true);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Copy image to clipboard for instant Ctrl+V on PC
  const handleCopyImageToClipboard = async () => {
    if (!product) return;
    setIsGeneratingJpg(true);
    try {
      const success = await copyProductImageToClipboard(product);
      if (success) {
        setCopiedImage(true);
        setTimeout(() => setCopiedImage(false), 3000);
      } else {
        // Fallback to download
        await downloadProductJpg(product);
      }
    } catch (err) {
      console.error('Erro ao copiar imagem:', err);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  // Send JPG + Open WhatsApp
  const handleSendWhatsAppJpg = async (isBusiness: boolean = false) => {
    if (!product) return;
    setIsGeneratingJpg(true);
    try {
      await shareProductJpgWhatsApp(product, isBusiness, formattedTargetPhone, activeName);
    } catch (err) {
      console.error('Erro ao enviar imagem do anúncio em JPG:', err);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  const handleDownloadJpgCard = async () => {
    if (!product) return;
    setIsGeneratingJpg(true);
    try {
      await downloadProductJpg(product);
    } catch (err) {
      console.error('Erro ao baixar imagem JPG:', err);
    } finally {
      setIsGeneratingJpg(false);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400 shrink-0">
              <Send className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                  Enviar Anúncio para Cliente
                </h3>
                {isDesktop && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    <Monitor className="h-3 w-3" /> Modo PC Otimizado
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Selecione o cliente e envie instantaneamente pelo WhatsApp ou copie a imagem
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 flex-1 space-y-3.5 mt-3">

        {/* Product Compact Summary Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package className="h-7 w-7" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                {product.category}
              </span>
              {product.sku && (
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                  Cód: {product.sku}
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate">
              {product.name}
            </h4>
            <div className="flex items-center gap-2 text-xs font-bold flex-wrap">
              <span className="text-emerald-600 dark:text-emerald-400 font-black">
                Por {formatCurrency(bazarPrice)}
              </span>
              {hasDiscount && (
                <span className="text-slate-400 font-medium text-[11px]">
                  De: <span className="line-through">{formatCurrency(fullPrice)}</span>
                </span>
              )}
              {hasDiscount && (
                <span className="text-[10px] font-black text-white bg-rose-600 px-1.5 py-0.5 rounded shadow-sm">
                  🔥 {formatPercent(discountPercent)} OFF
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Selection Section */}
        <div className="space-y-2.5">
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            1. Selecione o Cliente Cadastrado ou Digite o Telefone:
          </label>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou telefone..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Customer list scrollable */}
          {filteredCustomers.length > 0 ? (
            <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 no-scrollbar border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 bg-slate-50/50 dark:bg-slate-900/50">
              {filteredCustomers.map((c, idx) => {
                const isSelected = selectedCustomer?.name === c.name;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(isSelected ? null : c);
                      if (!isSelected) {
                        setCustomName('');
                        setCustomPhone('');
                      }
                    }}
                    className={`w-full p-2 rounded-lg text-left transition flex items-center justify-between gap-3 border ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        <User className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {c.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          {c.phone || 'Sem telefone cadastrado'}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="bg-emerald-600 text-white p-1 rounded-full shrink-0">
                        <UserCheck className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic px-1">
              Nenhum cliente cadastrado com "{searchQuery}". Digite o número abaixo:
            </p>
          )}

          {/* Custom Name / Phone inputs if not using selected customer */}
          {!selectedCustomer && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                  Nome do Cliente (Opcional):
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-0.5">
                  WhatsApp com DDD:
                </label>
                <input
                  type="text"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-8888"
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {selectedCustomer && (
            <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold truncate">
                🎯 Enviar para: {selectedCustomer.name} {selectedCustomer.phone ? `(${selectedCustomer.phone})` : ''}
              </span>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-xs underline font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 shrink-0 ml-2"
              >
                Trocar
              </button>
            </div>
          )}
        </div>

        {/* Message Preview Box */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              2. Texto do Anúncio:
            </label>
            <button
              type="button"
              onClick={handleCopyText}
              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {copiedText ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedText ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          <div className="bg-slate-900 text-emerald-300 p-2.5 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto border border-slate-800 shadow-inner">
            {shareText}
          </div>
        </div>

        {/* Action Buttons Section: Super Fast Options */}
        <div className="space-y-2.5 pt-1">
          
          {/* TOP OPTION: Instant 0.1s Direct Send to WhatsApp Web */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 rounded-2xl text-white shadow-lg shadow-emerald-600/20 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm uppercase tracking-wide">
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-pulse" />
                <span>Envio Imediato no WhatsApp (Sem Espera)</span>
              </div>
              <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full">
                ⚡ Super Rápido
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantWhatsApp(false)}
                className="w-full bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow transition active:scale-98 flex items-center justify-center gap-2"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>{isDesktop ? 'Abrir WhatsApp Web Direto' : 'Enviar no WhatsApp'}</span>
                <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
              </button>

              <button
                type="button"
                onClick={() => handleInstantWhatsApp(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-xl shadow transition active:scale-98 flex items-center justify-center gap-2"
              >
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span>{isDesktop ? 'WhatsApp App / Business' : 'WhatsApp Business'}</span>
                <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* SECOND OPTION: JPG Card Generation & Fast Clipboard Copy */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-extrabold text-xs uppercase tracking-wide">
                <ImageIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Imagem (JPG) de Alta Definição:</span>
              </div>
              {copiedImage && (
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Imagem Copiada! Cole no WhatsApp (Ctrl+V)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Copy Image Button (Ctrl+V) */}
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isGeneratingJpg}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 px-2.5 rounded-xl shadow-md transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                title="Copia o banner para colar direto na conversa com Ctrl+V"
              >
                {copiedImage ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                <span>{copiedImage ? 'Copiada!' : 'Copiar Imagem (Ctrl+V)'}</span>
              </button>

              {/* Download JPG */}
              <button
                type="button"
                onClick={handleDownloadJpgCard}
                disabled={isGeneratingJpg}
                className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>{isGeneratingJpg ? 'Gerando...' : 'Baixar JPG'}</span>
              </button>

              {/* Send with JPG Flow */}
              <button
                type="button"
                onClick={() => handleSendWhatsAppJpg(false)}
                disabled={isGeneratingJpg}
                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs py-2.5 px-2.5 rounded-xl shadow-md transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{isGeneratingJpg ? 'Gerando...' : 'Enviar Foto + Web'}</span>
              </button>
            </div>

            {isDesktop && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
                💡 <span className="font-bold text-amber-900 dark:text-amber-300">Dica para PC:</span> Clique em <strong>"Copiar Imagem"</strong>, abra o WhatsApp Web e dê <strong>Ctrl+V</strong> para colar a foto instantaneamente junto com o texto!
              </p>
            )}
          </div>

        </div>

        </div>
      </div>
    </div>
  );
};
