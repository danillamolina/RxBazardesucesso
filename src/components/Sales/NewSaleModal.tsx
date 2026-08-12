import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, User, Phone, DollarSign, Plus, Trash2, Package, AlertCircle, Sparkles, MapPin, Truck, Search, Barcode } from 'lucide-react';
import { Product, PaymentStatus, PaymentMethod, SaleItem } from '../../types';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency } from '../../utils/formatters';

interface NewSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProduct?: Product | null;
}

interface ItemRow {
  productId: string;
  quantitySold: number;
  unitBazarPrice: number;
}

export const NewSaleModal: React.FC<NewSaleModalProps> = ({
  isOpen,
  onClose,
  preselectedProduct,
}) => {
  const { products, sales, addSale } = useBazar();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [productFilter, setProductFilter] = useState('');
  
  // Customer Info & Suggestions
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Retirada no Local');
  const [customerNotes, setCustomerNotes] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<{ name: string; phone?: string; notes?: string; address?: string; deliveryMethod?: string }[]>([]);

  // Payment Info
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [amountPaidNow, setAmountPaidNow] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (preselectedProduct) {
        setItems([
          {
            productId: preselectedProduct.id,
            quantitySold: 1,
            unitBazarPrice: preselectedProduct.bazarPrice,
          },
        ]);
      } else {
        setItems([
          {
            productId: '',
            quantitySold: 1,
            unitBazarPrice: 0,
          },
        ]);
      }
    }
  }, [preselectedProduct, isOpen]);

  // Extract unique previous customers for search/autofill
  useEffect(() => {
    if (!customerName.trim()) {
      setCustomerSuggestions([]);
      return;
    }
    const search = customerName.toLowerCase().trim();
    const map = new Map<string, { name: string; phone?: string; notes?: string; address?: string; deliveryMethod?: string }>();
    sales.forEach((s) => {
      if (s.customerName.toLowerCase().includes(search)) {
        if (!map.has(s.customerName.toLowerCase())) {
          map.set(s.customerName.toLowerCase(), {
            name: s.customerName,
            phone: s.customerPhone,
            notes: s.customerNotes,
            address: s.customerAddress,
            deliveryMethod: s.deliveryMethod,
          });
        }
      }
    });
    setCustomerSuggestions(Array.from(map.values()).slice(0, 5));
  }, [customerName, sales]);

  // Alphabetically sorted & filtered products by code or name
  const sortedAndFilteredProducts = React.useMemo(() => {
    const sorted = [...products].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    if (!productFilter.trim()) return sorted;
    const query = productFilter.toLowerCase().trim();
    return sorted.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.sizeColor && p.sizeColor.toLowerCase().includes(query))
    );
  }, [products, productFilter]);

  if (!isOpen) return null;

  const selectCustomerSuggestion = (sug: { name: string; phone?: string; notes?: string; address?: string; deliveryMethod?: string }) => {
    setCustomerName(sug.name);
    if (sug.phone) setCustomerPhone(sug.phone);
    if (sug.notes) setCustomerNotes(sug.notes);
    if (sug.address) setCustomerAddress(sug.address);
    if (sug.deliveryMethod) setDeliveryMethod(sug.deliveryMethod);
    setCustomerSuggestions([]);
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        quantitySold: 1,
        unitBazarPrice: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('O pedido deve conter pelo menos 1 produto.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        if (field === 'productId') {
          const prod = products.find((p) => p.id === value);
          return {
            ...item,
            productId: value,
            unitBazarPrice: prod ? prod.bazarPrice : 0,
          };
        }
        return { ...item, [field]: value };
      })
    );
  };

  // Calculations
  const subtotal = items.reduce((acc, i) => acc + i.quantitySold * i.unitBazarPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const numPaidNow = typeof amountPaidNow === 'number' ? amountPaidNow : (paymentStatus === 'pago' ? totalAmount : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Selecione pelo menos um produto para a venda.');
      return;
    }

    if (items.some((i) => !i.productId)) {
      alert('Por favor, escolha o produto para todos os itens do pedido.');
      return;
    }

    // Build items list
    const structuredItems: SaleItem[] = items.map((i) => {
      const prod = products.find((p) => p.id === i.productId);
      return {
        productId: i.productId,
        productName: prod ? prod.name : 'Produto',
        quantitySold: i.quantitySold,
        unitCostPrice: prod ? prod.costPrice : 0,
        unitBazarPrice: i.unitBazarPrice,
        sizeColor: prod?.sizeColor,
      };
    });

    const primaryProduct = products.find((p) => p.id === items[0].productId);
    let productNameSummary = structuredItems[0].productName;
    if (structuredItems.length > 1) {
      productNameSummary = `${structuredItems[0].productName} (+ ${structuredItems.length - 1} item(ns))`;
    }

    const totalQuantity = items.reduce((acc, i) => acc + i.quantitySold, 0);
    const primaryCostPrice = primaryProduct ? primaryProduct.costPrice : 0;
    const finalAmountPaid = paymentStatus === 'pago' ? totalAmount : (paymentStatus === 'parcial' ? numPaidNow : 0);
    const calcInstallmentValue = installmentsCount > 0 ? Math.round((totalAmount / installmentsCount) * 100) / 100 : totalAmount;

    const success = addSale({
      productId: items[0].productId,
      productName: productNameSummary,
      quantitySold: totalQuantity,
      unitCostPrice: primaryCostPrice,
      unitBazarPrice: items[0].unitBazarPrice,
      items: structuredItems,
      totalAmount,
      discount,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      customerAddress: customerAddress.trim() || undefined,
      deliveryMethod: deliveryMethod.trim() || undefined,
      customerNotes: customerNotes.trim() || undefined,
      paymentStatus,
      paymentMethod,
      installmentsCount,
      installmentValue: calcInstallmentValue,
      amountPaid: finalAmountPaid,
      remainingBalance: Math.max(0, totalAmount - finalAmountPaid),
      bazarEditionId: primaryProduct?.bazarEditionId,
    });

    if (success) {
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
      setDeliveryMethod('Retirada no Local');
      setCustomerNotes('');
      setDiscount(0);
      setAmountPaidNow('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Header - Fixed top */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 sm:pb-4 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Registrar Venda / Novo Pedido
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Informe o cliente e selecione os produtos do pedido
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-4 sm:space-y-5">
          
          {/* Customer Info with Quick Search & Auto-complete */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 relative">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Cliente do Bazar</span>
            </h4>

            <div className="relative">
              <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase mb-1">
                Nome do Cliente (Obrigatório) *
              </label>
              <input
                type="text"
                required
                placeholder="Digite o nome do cliente (ex: Ana Maria)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 shadow-sm"
              />

              {/* Suggestions Dropdown */}
              {customerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-30 overflow-hidden max-h-48 overflow-y-auto">
                  <div className="p-2 text-[10px] font-bold text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                    Clientes Encontradas no Histórico:
                  </div>
                  {customerSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectCustomerSuggestion(sug)}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex justify-between items-center transition border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">{sug.name}</span>
                      <span className="text-[10px] text-slate-400">{sug.phone || sug.notes || 'Cliente cadastrada'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  WhatsApp (DDD + Telefone)
                </label>
                <input
                  type="tel"
                  placeholder="ex: 11988887777"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Forma de Entrega
                </label>
                <div className="relative">
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                  >
                    <option value="Retirada no Local">📍 Retirada no Local / Espaço Bazar</option>
                    <option value="Motoboy">🛵 Motoboy / Tele-entrega</option>
                    <option value="Entrega Própria">🚗 Entrega Própria</option>
                    <option value="Correios (SEDEX)">📦 Correios (SEDEX)</option>
                    <option value="Correios (PAC)">📦 Correios (PAC)</option>
                    <option value="Transportadora">🚚 Transportadora</option>
                    <option value="A Combinar">🤝 A Combinar com o Cliente</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-500" />
                  Endereço Completo de Entrega
                </label>
                <input
                  type="text"
                  placeholder="Rua, nº, bairro, complemento, cidade"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  @Instagram ou Observação
                </label>
                <input
                  type="text"
                  placeholder="ex: @ana_maria / Entregar no trabalho"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Products List (Multi-item support) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-500" />
                Produtos Selecionados ({items.length})
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Adicionar Produto ao Pedido</span>
              </button>
            </div>

            {/* Quick Filter by Code or Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                placeholder="Filtrar produtos por nome ou código (SKU)..."
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-medium focus:outline-none focus:border-emerald-500 transition"
              />
              {productFilter && (
                <button
                  type="button"
                  onClick={() => setProductFilter('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map((item, index) => {
                const lineTotal = item.quantitySold * item.unitBazarPrice;

                return (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  >
                    {/* Product Select */}
                    <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                        Item #{index + 1}
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition ${
                          !item.productId
                            ? 'border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <option value="">-- Selecione o Produto (Ordem Alfabética) --</option>
                        {sortedAndFilteredProducts.map((p) => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.sku ? `[Cód: ${p.sku}] ` : ''}{p.name} {p.sizeColor ? `(${p.sizeColor})` : ''} — {p.quantity === 0 ? 'SEM ESTOQUE' : `${p.quantity} un.`} - {formatCurrency(p.bazarPrice)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantitySold}
                        onChange={(e) => handleItemChange(index, 'quantitySold', parseInt(e.target.value, 10) || 1)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="w-28">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                        Preço Un. (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={item.unitBazarPrice}
                        onChange={(e) => handleItemChange(index, 'unitBazarPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Line Total & Remove */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-700">
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Subtotal</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Remover produto do pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span>Soma dos Produtos ({items.length} item(ns)):</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Desconto no Pedido (R$):</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1 text-xs font-bold text-right"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-black text-sm text-emerald-600 dark:text-emerald-400">
                <span>TOTAL A PAGAR:</span>
                <span className="text-base">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method, Installments & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                Forma de Pagamento
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="pix">PIX</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="dinheiro">Dinheiro em Espécie</option>
                <option value="promissoria">Fiado / Promissória</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                Parcelamento
              </label>
              <select
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              >
                <option value={1}>À vista (1x)</option>
                <option value={2}>2x sem juros ({formatCurrency(totalAmount / 2)})</option>
                <option value={3}>3x sem juros ({formatCurrency(totalAmount / 3)})</option>
                <option value={4}>4x sem juros ({formatCurrency(totalAmount / 4)})</option>
                <option value={5}>5x sem juros ({formatCurrency(totalAmount / 5)})</option>
                <option value={6}>6x sem juros ({formatCurrency(totalAmount / 6)})</option>
                <option value={7}>7x sem juros ({formatCurrency(totalAmount / 7)})</option>
                <option value={8}>8x sem juros ({formatCurrency(totalAmount / 8)})</option>
                <option value={9}>9x sem juros ({formatCurrency(totalAmount / 9)})</option>
                <option value={10}>10x sem juros ({formatCurrency(totalAmount / 10)})</option>
                <option value={11}>11x sem juros ({formatCurrency(totalAmount / 11)})</option>
                <option value={12}>12x sem juros ({formatCurrency(totalAmount / 12)})</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase">
                Status Inicial de Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="pago">🟢 Pago Integralmente</option>
                <option value="parcial">🟧 Pagamento Parcial (Sinal / Entrada)</option>
                <option value="pendente">🟡 Pendente</option>
                <option value="fiado">🔵 Fiado</option>
              </select>
            </div>
          </div>

          {installmentsCount > 1 && (
            <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-2xl border border-sky-200 dark:border-sky-800 text-xs flex justify-between items-center text-sky-900 dark:text-sky-300">
              <span className="font-semibold">Plano de Parcelamento Escolhido:</span>
              <span className="font-black text-sm">
                {installmentsCount}x de {formatCurrency(totalAmount / installmentsCount)}
              </span>
            </div>
          )}

          {paymentStatus === 'parcial' && (
            <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
              <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase">
                Valor Pago Hoje como Sinal/Entrada (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={totalAmount}
                placeholder={`ex: ${formatCurrency(totalAmount / 2)}`}
                value={amountPaidNow}
                onChange={(e) => setAmountPaidNow(parseFloat(e.target.value) || '')}
                className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
              />
              <p className="text-[10px] text-amber-700 dark:text-amber-400">
                Saldo restante a receber: <strong>{formatCurrency(Math.max(0, totalAmount - (typeof amountPaidNow === 'number' ? amountPaidNow : 0)))}</strong>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Confirmar Venda e Dar Baixa</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
