import React, { useState, useEffect } from 'react';
import { X, Edit3, ShoppingCart, User, Plus, Trash2, Save, DollarSign, Package, MapPin, Truck, Search } from 'lucide-react';
import { Sale, SaleItem, PaymentStatus, PaymentMethod } from '../../types';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency } from '../../utils/formatters';

interface EditSaleModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  productId: string;
  quantitySold: number;
  unitBazarPrice: number;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const { products, sales, updateSale } = useBazar();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [productFilter, setProductFilter] = useState('');
  
  // Customer Info
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Retirada no Local');
  const [customerNotes, setCustomerNotes] = useState('');

  // Payment Info
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pago');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [installmentsCount, setInstallmentsCount] = useState<number>(1);
  const [amountPaid, setAmountPaid] = useState<number>(0);

  useEffect(() => {
    if (sale) {
      if (sale.items && sale.items.length > 0) {
        setItems(
          sale.items.map((i) => ({
            productId: i.productId,
            quantitySold: i.quantitySold,
            unitBazarPrice: i.unitBazarPrice,
          }))
        );
      } else {
        setItems([
          {
            productId: sale.productId,
            quantitySold: sale.quantitySold,
            unitBazarPrice: sale.unitBazarPrice,
          },
        ]);
      }
      setDiscount(sale.discount || 0);
      setCustomerName(sale.customerName);
      setCustomerPhone(sale.customerPhone || '');
      setCustomerAddress(sale.customerAddress || '');
      setDeliveryMethod(sale.deliveryMethod || 'Retirada no Local');
      setCustomerNotes(sale.customerNotes || '');
      setPaymentStatus(sale.paymentStatus);
      setPaymentMethod(sale.paymentMethod);
      setInstallmentsCount(sale.installmentsCount || 1);
      setAmountPaid(sale.amountPaid || 0);
    }
  }, [sale, isOpen]);

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

  if (!isOpen || !sale) return null;

  // Handle adding an item line
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

  // Handle removing an item line
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      alert('O pedido deve ter pelo menos 1 produto.');
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle changing item field
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

  // Calculate totals
  const subtotal = items.reduce((acc, i) => acc + i.quantitySold * i.unitBazarPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const remainingBalance = Math.max(0, totalAmount - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }
    if (items.length === 0) {
      alert('Adicione pelo menos um produto ao pedido.');
      return;
    }
    if (items.some((i) => !i.productId)) {
      alert('Por favor, escolha o produto para todos os itens do pedido.');
      return;
    }

    // Build structured SaleItems array
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

    // Primary Summary
    let productNameSummary = structuredItems[0].productName;
    if (structuredItems.length > 1) {
      productNameSummary = `${structuredItems[0].productName} (+ ${structuredItems.length - 1} item(ns))`;
    }

    const totalQuantity = items.reduce((acc, i) => acc + i.quantitySold, 0);
    const primaryCostPrice = primaryProduct ? primaryProduct.costPrice : 0;
    const calcInstallmentValue = installmentsCount > 0 ? Math.round((totalAmount / installmentsCount) * 100) / 100 : totalAmount;

    const success = updateSale(sale.id, {
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
      amountPaid: paymentStatus === 'pago' ? totalAmount : amountPaid,
      remainingBalance: paymentStatus === 'pago' ? 0 : Math.max(0, totalAmount - amountPaid),
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl">
              <Edit3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                Alterar Pedido / Incluir Produtos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adicione ou remova itens e calcule a soma total comprada por {customerName || 'Cliente'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Info */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-sky-500" />
              Dados do Cliente
            </h4>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Maria Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  WhatsApp (DDD + Número)
                </label>
                <input
                  type="tel"
                  placeholder="11988887777"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Forma de Entrega
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-sky-500" />
                  Endereço Completo de Entrega
                </label>
                <input
                  type="text"
                  placeholder="Rua, nº, bairro, complemento, cidade"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  @Instagram ou Observação
                </label>
                <input
                  type="text"
                  placeholder="ex: @maria_silva / Entregar no trabalho"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Products List (Multi-item order) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Package className="h-4 w-4 text-emerald-500" />
                Produtos do Pedido ({items.length})
              </h4>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition self-start sm:self-auto"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+ Adicionar Produto</span>
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 text-xs font-medium focus:outline-none focus:border-sky-500 transition"
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
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-sky-500 transition ${
                          !item.productId
                            ? 'border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 font-bold bg-amber-50/50 dark:bg-amber-950/20'
                            : 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                        }`}
                      >
                        <option value="">-- Selecione o Produto (Ordem Alfabética) --</option>
                        {sortedAndFilteredProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku ? `[Cód: ${p.sku}] ` : ''}{p.name} {p.sizeColor ? `(${p.sizeColor})` : ''} — {p.quantity} em estoque - {formatCurrency(p.bazarPrice)}
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
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-sky-500"
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
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    {/* Line Total & Remove Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-200 dark:border-slate-700">
                      <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Total Line</span>
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

            {/* Subtotal & Discount Calculation Box */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-medium">
                <span>Soma dos Produtos ({items.length} item(ns)):</span>
                <span className="font-bold">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Desconto Especial no Pedido (R$):</span>
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
                <span>VALOR TOTAL DO PEDIDO:</span>
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-sky-500"
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
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
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
                Status de Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-sky-500"
              >
                <option value="pago">🟢 Pago Integralmente</option>
                <option value="parcial">🟧 Pagamento Parcial</option>
                <option value="pendente">🟡 Pendente</option>
                <option value="fiado">🔵 Fiado</option>
                <option value="cancelado">🔴 Cancelado</option>
              </select>
            </div>
          </div>

          {installmentsCount > 1 && (
            <div className="bg-sky-50 dark:bg-sky-950/40 p-3 rounded-2xl border border-sky-200 dark:border-sky-800 text-xs flex justify-between items-center text-sky-900 dark:text-sky-300">
              <span className="font-semibold">Plano de Parcelamento:</span>
              <span className="font-black text-sm">
                {installmentsCount}x de {formatCurrency(totalAmount / installmentsCount)}
              </span>
            </div>
          )}

          {paymentStatus === 'parcial' && (
            <div className="grid grid-cols-2 gap-3 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div>
                <label className="block text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">
                  Valor Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 rounded-xl px-2.5 py-1.5 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">
                  Saldo Restante
                </label>
                <div className="py-1.5 text-xs font-black text-rose-600 dark:text-rose-400">
                  {formatCurrency(remainingBalance)}
                </div>
              </div>
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
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-500/20 transition active:scale-95 flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>Salvar Alterações no Pedido</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
