import React, { useState, useMemo } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  MessageSquare, 
  Send, 
  Check, 
  Copy, 
  CreditCard, 
  Sparkles, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Truck,
  Building,
  Store,
  ArrowRight,
  Users,
  ExternalLink
} from 'lucide-react';
import { Product, PaymentMethod } from '../../types';
import { formatCurrency, formatPercent, getProductPriceDetails } from '../../utils/formatters';
import { useBazar } from '../../context/BazarContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface OnlineStoreCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  editionName?: string;
  editionId?: string;
}

export const OnlineStoreCartModal: React.FC<OnlineStoreCartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  editionName,
  editionId,
}) => {
  const { storeInfo, activeEditionId } = useBazar();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'retirada' | 'motoboy' | 'correios'>('retirada');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedOrderText, setCopiedOrderText] = useState(false);
  const [sentFeedback, setSentFeedback] = useState<{
    type: 'group' | 'store';
    title: string;
    message: string;
  } | null>(null);

  // Cart financial totals
  const { totalItems, subtotalFullPrice, totalBazarPrice, totalSavings } = useMemo(() => {
    let items = 0;
    let full = 0;
    let bazar = 0;

    cart.forEach(({ product, quantity }) => {
      const { fullPrice, bazarPrice } = getProductPriceDetails(product);
      items += quantity;
      full += fullPrice * quantity;
      bazar += bazarPrice * quantity;
    });

    return {
      totalItems: items,
      subtotalFullPrice: full,
      totalBazarPrice: bazar,
      totalSavings: Math.max(0, full - bazar),
    };
  }, [cart]);

  if (!isOpen) return null;

  const deliveryLabel = 
    deliveryMethod === 'retirada' 
      ? 'Retirada no Local' 
      : deliveryMethod === 'motoboy' 
      ? 'Entrega Motoboy' 
      : 'Envio Correios / Transportadora';

  const paymentLabel = 
    paymentMethod === 'pix' 
      ? 'PIX' 
      : paymentMethod === 'cartao_credito' 
      ? 'Cartão de Crédito' 
      : paymentMethod === 'cartao_debito' 
      ? 'Cartão de Débito' 
      : 'Dinheiro';

  // Build formatted WhatsApp message (adapted for Group or Direct)
  const generateWhatsAppOrderText = (isGroup: boolean = false) => {
    const title = editionName ? `PEDIDO — ${editionName.toUpperCase()}` : 'NOVO PEDIDO';
    let text = isGroup
      ? `🙋‍♀️ *MEU PEDIDO / RESERVA* 🛍️✨\n`
      : `🛍️ *${title}* 🛍️\n`;
    text += `🏪 *Loja:* ${storeInfo.name || 'Loja Online'}\n`;
    if (editionName) {
      text += `🏷️ *Promoção/Coleção:* ${editionName}\n`;
    }
    text += `📅 *Data:* ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\n`;

    if (customerName.trim()) {
      text += `👤 *Cliente:* ${customerName.trim()}\n`;
    }
    if (customerPhone.trim()) {
      text += `📱 *Telefone/WhatsApp:* ${customerPhone.trim()}\n`;
    }
    text += `🚚 *Forma de Entrega:* ${deliveryLabel}\n`;
    if (deliveryAddress.trim() && deliveryMethod !== 'retirada') {
      text += `📍 *Endereço:* ${deliveryAddress.trim()}\n`;
    }
    text += `💳 *Forma de Pagamento:* ${paymentLabel}\n\n`;

    text += `📦 *ITENS DO PEDIDO (${totalItems} item${totalItems > 1 ? 's' : ''}):*\n`;
    cart.forEach(({ product, quantity }, idx) => {
      const { fullPrice, bazarPrice, hasDiscount } = getProductPriceDetails(product);
      const itemTotal = bazarPrice * quantity;
      text += `${idx + 1}️⃣ *${product.name}*\n`;
      text += `   • ${quantity} un. x ${formatCurrency(bazarPrice)} = *${formatCurrency(itemTotal)}*`;
      if (hasDiscount) {
        text += ` (Preço Normal: ~${formatCurrency(fullPrice)}~)`;
      }
      text += `\n`;
      if (product.sizeColor) {
        text += `   • Detalhes/Tam: ${product.sizeColor}\n`;
      }
      if (product.sku) {
        text += `   • Cód/Ref: ${product.sku}\n`;
      }
    });

    text += `\n─────────────────────\n`;
    if (totalSavings > 0) {
      text += `🏷️ *Valor de Tabela:* ${formatCurrency(subtotalFullPrice)}\n`;
      text += `🔥 *ECONOMIA:* ${formatCurrency(totalSavings)}\n`;
    }
    text += `✨ *VALOR TOTAL DO PEDIDO:* *${formatCurrency(totalBazarPrice)}*\n`;
    text += `─────────────────────\n`;

    if (paymentMethod === 'pix' && storeInfo.pixKey) {
      text += `\n🔑 *CHAVE PIX PARA PAGAMENTO:* \n\`${storeInfo.pixKey}\`\n`;
      text += `(Após o PIX, favor enviar o comprovante por aqui!)\n`;
    }

    if (customerNotes.trim()) {
      text += `\n📝 *Observações:* ${customerNotes.trim()}\n`;
    }

    if (isGroup) {
      text += `\n⚠️ *Pedido enviado no grupo da promoção! Aguardo retorno da atendente para combinar pagamento e entrega.* 💖✨`;
    } else {
      text += `\nMuito obrigado(a)! Aguardo confirmação e retorno da atendente no privado para combinar pagamento e entrega. 💖✨`;
    }
    return text;
  };

  // Open WhatsApp directly in the Promotion Group (or WhatsApp with text prefilled)
  const handleSendToGroup = async () => {
    const text = generateWhatsAppOrderText(true);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOrderText(true);
      setTimeout(() => setCopiedOrderText(false), 3000);
    } catch (e) {
      console.error('Erro ao copiar pedido:', e);
    }

    if (storeInfo.whatsappGroupLink && storeInfo.whatsappGroupLink.trim()) {
      window.open(storeInfo.whatsappGroupLink.trim(), '_blank', 'noopener,noreferrer');
      setSentFeedback({
        type: 'group',
        title: 'Grupo da Promoção Aberto no WhatsApp!',
        message: 'O link do grupo foi aberto e o seu pedido já está copiado. Basta colar (Ctrl+V ou Pressionar e Colar) e enviar a mensagem no grupo para combinar pagamento e entrega com a atendente!',
      });
    } else {
      const encoded = encodeURIComponent(text);
      const url = `https://api.whatsapp.com/send?text=${encoded}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      setSentFeedback({
        type: 'group',
        title: 'WhatsApp Aberto para Enviar!',
        message: 'O WhatsApp foi aberto com o seu pedido formatado. Encaminhe para o grupo definido na promoção ou no contato desejado e combine pagamento e entrega com a atendente!',
      });
    }
  };

  // Open WhatsApp directly to store private chat
  const handleSendToStore = async () => {
    const text = generateWhatsAppOrderText(false);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOrderText(true);
      setTimeout(() => setCopiedOrderText(false), 3000);
    } catch (e) {
      console.error('Erro ao copiar pedido:', e);
    }

    const phoneToUse = storeInfo.whatsapp || storeInfo.phone || '';
    const cleanPhone = phoneToUse.replace(/\D/g, '');
    let formattedPhone = cleanPhone;
    if (cleanPhone && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
      formattedPhone = `55${cleanPhone}`;
    }

    const encoded = encodeURIComponent(text);
    const url = formattedPhone 
      ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setSentFeedback({
      type: 'store',
      title: 'WhatsApp da Loja Aberto!',
      message: 'O WhatsApp da loja foi aberto com a mensagem pronta. Envie para a atendente conferir a disponibilidade das peças e combinar o pagamento!',
    });
  };

  const handleCopyOrderText = async () => {
    try {
      await navigator.clipboard.writeText(generateWhatsAppOrderText(true));
      setCopiedOrderText(true);
      setTimeout(() => setCopiedOrderText(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar pedido:', err);
    }
  };

  const handleCopyPixKey = async () => {
    if (!storeInfo.pixKey) return;
    try {
      await navigator.clipboard.writeText(storeInfo.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar chave PIX:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in notranslate" translate="no">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/30">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Sacola da Loja Online
                </h3>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {storeInfo.name || 'Loja Online'} • Finalização do Pedido
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

        {/* Sent / WhatsApp Feedback Banner */}
        {sentFeedback && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-white/20 shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-200" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-white leading-tight">
                  {sentFeedback.title}
                </h4>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  {sentFeedback.message}
                </p>
                <p className="text-[11px] text-emerald-200/90 italic pt-1">
                  ✨ Lembrete: O estoque só é conferido e reservado pela atendente da loja no WhatsApp.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
              <button
                type="button"
                onClick={() => {
                  onClearCart();
                  setSentFeedback(null);
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-extrabold text-xs hover:bg-emerald-50 shadow-xs transition"
              >
                Concluir & Limpar Sacola
              </button>
              <button
                type="button"
                onClick={() => setSentFeedback(null)}
                className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition"
              >
                Fechar Aviso
              </button>
            </div>
          </div>
        )}

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* Cart Empty State */}
          {cart.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                <ShoppingBag className="h-10 w-10 opacity-50" />
              </div>
              <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-200">
                Sua sacola está vazia
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Navegue pelas categorias da Vitrine e clique em "Adicionar à Sacola" nas peças desejadas.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold text-xs shadow-md transition"
              >
                Voltar e Ver Vitrine
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Peças Selecionadas
                  </span>
                  <button
                    onClick={onClearCart}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    Limpar Sacola
                  </button>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-800/30">
                  {cart.map(({ product, quantity }) => {
                    const { fullPrice, bazarPrice, hasDiscount } = getProductPriceDetails(product);
                    const itemTotal = bazarPrice * quantity;

                    return (
                      <div key={product.id} className="p-3 sm:p-3.5 flex items-center gap-3 bg-white dark:bg-slate-900">
                        {/* Thumbnail */}
                        <div className="w-14 h-16 sm:w-16 sm:h-18 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-contain p-1"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-slate-400 opacity-40" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 flex-wrap">
                            {product.sizeColor && (
                              <span className="font-bold text-rose-600 dark:text-rose-400">
                                📏 {product.sizeColor}
                              </span>
                            )}
                            {product.sku && (
                              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                                Cód: {product.sku}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(bazarPrice)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[10px] text-slate-400 line-through">
                                {formatCurrency(fullPrice)}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-medium">
                              (Total: {formatCurrency(itemTotal)})
                            </span>
                          </div>
                        </div>

                        {/* Quantity Adjuster */}
                        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shrink-0">
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                            className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                            title="Diminuir"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center font-black text-xs text-slate-800 dark:text-slate-200">
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                            disabled={quantity >= product.quantity}
                            className="p-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition disabled:opacity-30"
                            title={quantity >= product.quantity ? 'Limite de estoque atingido' : 'Aumentar'}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Remove item */}
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                          title="Remover produto da sacola"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Financial Summary Box */}
              <div className="bg-gradient-to-br from-rose-50/80 to-amber-50/50 dark:from-rose-950/30 dark:to-slate-800/50 p-4 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 space-y-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Subtotal de Tabela:</span>
                  <span className="line-through">{formatCurrency(subtotalFullPrice)}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      Economia Total:
                    </span>
                    <span>-{formatCurrency(totalSavings)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/60 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                      Total a Pagar:
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      ({totalItems} peça{totalItems !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalBazarPrice)}
                  </span>
                </div>
              </div>

              {/* Customer & Delivery Form */}
              <div className="space-y-3.5 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-rose-600" />
                  Dados do Cliente & Entrega
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Cliente
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Maria Eduarda"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      WhatsApp / Telefone
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ex: (11) 99999-8888"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Opção de Entrega
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('retirada')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                        deliveryMethod === 'retirada'
                          ? 'bg-rose-50 text-rose-700 border-rose-400 dark:bg-rose-950 dark:text-rose-300 ring-1 ring-rose-400'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Store className="h-4 w-4" />
                      <span className="text-[10.5px]">Retirar no Local</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('motoboy')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                        deliveryMethod === 'motoboy'
                          ? 'bg-rose-50 text-rose-700 border-rose-400 dark:bg-rose-950 dark:text-rose-300 ring-1 ring-rose-400'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                      <span className="text-[10.5px]">Motoboy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('correios')}
                      className={`p-2 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                        deliveryMethod === 'correios'
                          ? 'bg-rose-50 text-rose-700 border-rose-400 dark:bg-rose-950 dark:text-rose-300 ring-1 ring-rose-400'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      <span className="text-[10.5px]">Correios</span>
                    </button>
                  </div>
                </div>

                {deliveryMethod !== 'retirada' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Endereço de Entrega & Ponto de Referência
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Rua, Número, Bairro e Cidade"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Forma de Pagamento
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['pix', 'cartao_credito', 'cartao_debito', 'dinheiro'] as PaymentMethod[]).map((method) => {
                      const label = 
                        method === 'pix' ? 'PIX' :
                        method === 'cartao_credito' ? 'Crédito' :
                        method === 'cartao_debito' ? 'Débito' : 'Dinheiro';

                      return (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`p-2 rounded-xl border text-center text-xs font-bold transition ${
                            paymentMethod === method
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-400 font-extrabold'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* If PIX: Show Store PIX Key with Copy Button */}
                {paymentMethod === 'pix' && storeInfo.pixKey && (
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 block">
                        Chave PIX da Loja:
                      </span>
                      <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                        {storeInfo.pixKey}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPixKey}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-xs transition active:scale-95"
                    >
                      {copiedPix ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedPix ? 'Copiado!' : 'Copiar PIX'}</span>
                    </button>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Observações do Pedido (Opcional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ex: Embalar para presente, entregar após as 14h..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Informative Note: How Order Reservation Works */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span className="text-xs font-black uppercase tracking-wide">
                    Como funciona a reserva do seu pedido
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                  Ao clicar no botão abaixo, o WhatsApp será aberto com o seu pedido formatado. 
                  Basta encaminhar a mensagem <strong>para a loja no privado</strong> ou <strong>para o grupo definido na promoção</strong>. 
                  Em seguida, combine o pagamento e a entrega diretamente com a atendente para confirmar a sua reserva!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* 1. Main Action: Send to Promotion WhatsApp Group */}
                <button
                  type="button"
                  onClick={handleSendToGroup}
                  className="w-full p-3.5 sm:p-4 bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/25 transition active:scale-[0.99] group text-left"
                  title="Abre o WhatsApp para encaminhar o pedido ao grupo definido na promoção"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 sm:p-2.5 rounded-xl bg-white/20 group-hover:scale-105 transition shrink-0">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-black">
                          Enviar no Grupo da Promoção (WhatsApp)
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-300 text-amber-950 shrink-0">
                          ⭐ Grupo
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs font-medium text-emerald-100/90">
                        {storeInfo.whatsappGroupLink 
                          ? 'Abre o link do grupo da promoção para você enviar o seu pedido'
                          : 'Abre o WhatsApp com o pedido pronto para encaminhar ao grupo'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-200 group-hover:translate-x-1 transition shrink-0" />
                </button>

                {/* 2. Secondary Actions (Store Private Chat & Copy) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSendToStore}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.99]"
                    title="Enviar diretamente para a conversa privada do WhatsApp da Loja e combinar com a atendente"
                  >
                    <MessageSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Enviar no Privado da Loja (WhatsApp)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyOrderText}
                    className="w-full p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition active:scale-[0.99]"
                    title="Copiar texto do pedido formatado"
                  >
                    {copiedOrderText ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                        <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Texto Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-500 shrink-0" />
                        <span>Copiar Texto do Pedido</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            {totalItems > 0 ? `${totalItems} peças na sacola • ${formatCurrency(totalBazarPrice)}` : 'Nenhum item'}
          </span>
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
