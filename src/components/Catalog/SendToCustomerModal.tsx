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
  const handleSendWhatsAppJpg = async (isBusiness: boolean = false, includeText: boolean = true) => {
    if (!product) return;
    setIsGeneratingJpg(true);
    try {
      await shareProductJpgWhatsApp(product, isBusiness, formattedTargetPhone, activeName, includeText);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto notranslate" translate="no">
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
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 notranslate" translate="no">
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Package className="h-7 w-7" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-1 notranslate" translate="no">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900 notranslate" translate="no">
                {product.category}
              </span>
              {product.sku && (
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded notranslate" translate="no">
                  Cód: {product.sku}
                </span>
              )}
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base leading-snug truncate notranslate" translate="no">
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

        {/* Action Options: 3 Simplified Choices Requested */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              2. Escolha como deseja enviar ou salvar:
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                title="Copiar texto do anúncio"
              >
                {copiedText ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedText ? 'Texto Copiado!' : 'Copiar Texto'}</span>
              </button>
              <button
                type="button"
                onClick={handleCopyImageToClipboard}
                disabled={isGeneratingJpg}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                title="Copiar imagem editada para colar com Ctrl+V"
              >
                {copiedImage ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                <span>{copiedImage ? 'Foto Copiada (Ctrl+V)!' : 'Copiar Foto (Ctrl+V)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            
            {/* OPÇÃO 1: BAIXAR FOTO EDITADA */}
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl text-rose-600 dark:text-rose-400 shrink-0">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                    1. Baixar Foto Editada
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Salva a foto editada em alta resolução (JPG) com preços e descontos no seu dispositivo.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadJpgCard}
                disabled={isGeneratingJpg}
                className="bg-slate-900 hover:bg-slate-800 text-white font-black text-xs py-2.5 px-4 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                <Download className="h-4 w-4 text-emerald-400" />
                <span>{isGeneratingJpg ? 'Gerando...' : 'Baixar Foto Editada'}</span>
              </button>
            </div>

            {/* OPÇÃO 2: ENVIAR PARA CLIENTE FOTO EDITADA */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/60 rounded-xl text-indigo-600 dark:text-indigo-400 shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-indigo-950 dark:text-indigo-200">
                    2. Enviar para Cliente Foto Editada
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Envia a foto editada diretamente para o WhatsApp do cliente {activeName ? `(${activeName})` : ''}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppJpg(false, false)}
                  disabled={isGeneratingJpg}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Enviar foto para o cliente via WhatsApp Padrão"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsAppJpg(true, false)}
                  disabled={isGeneratingJpg}
                  className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Enviar foto para o cliente via WhatsApp Business"
                >
                  <Building2 className="h-4 w-4 text-teal-200" />
                  <span>Business</span>
                </button>
              </div>
            </div>

            {/* OPÇÃO 3: ENVIAR FOTO E TEXTO */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                    3. Enviar Foto e Texto
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Envia a foto editada + o texto completo formatado com preço, economia e estoque.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppJpg(false, true)}
                  disabled={isGeneratingJpg}
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2.5 px-3.5 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Enviar foto + texto completo via WhatsApp Padrão"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsAppJpg(true, true)}
                  disabled={isGeneratingJpg}
                  className="flex-1 sm:flex-none bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  title="Enviar foto + texto completo via WhatsApp Business"
                >
                  <Building2 className="h-4 w-4 text-teal-200" />
                  <span>Business</span>
                </button>
              </div>
            </div>

          </div>

          {/* Quick text preview drawer (collapsible) */}
          <details className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700/80 text-xs">
            <summary className="font-bold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              👁️ Visualizar texto do anúncio formatado
            </summary>
            <div className="mt-2 bg-slate-900 text-emerald-300 p-2.5 rounded-lg text-[11px] font-mono whitespace-pre-wrap max-h-28 overflow-y-auto border border-slate-800 shadow-inner">
              {shareText}
            </div>
          </details>

        </div>

        </div>
      </div>
    </div>
  );
};
