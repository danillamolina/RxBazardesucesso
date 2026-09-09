import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit3, 
  ShoppingCart, 
  User, 
  Plus, 
  Trash2, 
  Save, 
  DollarSign, 
  Package, 
  MapPin, 
  Truck, 
  Search,
  Filter,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import { Sale, SaleItem, PaymentStatus, PaymentMethod, Product } from '../../types';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, createWhatsAppReceiptFromSale, generateOrderReceiptText } from '../../utils/formatters';

interface EditSaleModalProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ItemRow {
  id: string;
  productId: string;
  quantitySold: number;
  unitBazarPrice: number;
  filterText?: string;
  categoryFilter?: string;
}

export const EditSaleModal: React.FC<EditSaleModalProps> = ({
  sale,
  isOpen,
  onClose,
}) => {
  const { products, sales, updateSale, storeInfo } = useBazar();

  const [items, setItems] = useState<ItemRow[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  
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

  // Available unique categories from inventory
  const availableCategories = React.useMemo(() => {
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [products]);

  useEffect(() => {
    if (sale) {
      if (sale.items && sale.items.length > 0) {
        setItems(
          sale.items.map((i, idx) => ({
            id: `item-${sale.id}-${idx}-${Date.now()}`,
            productId: i.productId,
            quantitySold: i.quantitySold,
            unitBazarPrice: i.unitBazarPrice,
            filterText: '',
            categoryFilter: '',
          }))
        );
      } else {
        setItems([
          {
            id: `item-${sale.id}-0-${Date.now()}`,
            productId: sale.productId,
            quantitySold: sale.quantitySold,
            unitBazarPrice: sale.unitBazarPrice,
            filterText: '',
            categoryFilter: '',
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

  if (!isOpen || !sale) return null;

  // Handle adding an item line - PLACED AT THE TOP (parte de cima)
  const handleAddItem = () => {
    const newItem: ItemRow = {
      id: `edit-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: '',
      quantitySold: 1,
      unitBazarPrice: 0,
      filterText: '',
      categoryFilter: '',
    };
    setItems((prev) => [newItem, ...prev]);
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

  // Filter products specifically for each individual product row
  const getItemFilteredProducts = (item: ItemRow) => {
    const query = (item.filterText || '').toLowerCase().trim();
    const cat = item.categoryFilter || '';

    return products
      .filter((p) => {
        if (cat && p.category !== cat) {
          if (p.id === item.productId) return true;
          return false;
        }
        if (query) {
          const matchesName = p.name.toLowerCase().includes(query);
          const matchesSku = p.sku ? p.sku.toLowerCase().includes(query) : false;
          const matchesSizeColor = p.sizeColor ? p.sizeColor.toLowerCase().includes(query) : false;
          const matchesSub = p.subcategory ? p.subcategory.toLowerCase().includes(query) : false;
          if (!matchesName && !matchesSku && !matchesSizeColor && !matchesSub) {
            if (p.id === item.productId) return true;
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  };

  // Calculate totals
  const subtotal = items.reduce((acc, i) => acc + i.quantitySold * i.unitBazarPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);
  const remainingBalance = Math.max(0, totalAmount - amountPaid);

  const buildSalePayload = () => {
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

    let productNameSummary = structuredItems[0]?.productName || 'Produto';
    if (structuredItems.length > 1) {
      productNameSummary = `${structuredItems[0].productName} (+ ${structuredItems.length - 1} item(ns))`;
    }

    const totalQuantity = items.reduce((acc, i) => acc + i.quantitySold, 0);
    const primaryCostPrice = primaryProduct ? primaryProduct.costPrice : 0;
    const calcInstallmentValue = installmentsCount > 0 ? Math.round((totalAmount / installmentsCount) * 100) / 100 : totalAmount;

    return {
      productId: items[0]?.productId || '',
      productName: productNameSummary,
      quantitySold: totalQuantity,
      unitCostPrice: primaryCostPrice,
      unitBazarPrice: items[0]?.unitBazarPrice || 0,
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
    };
  };

  const handleCopyOrderText = () => {
    if (!customerName.trim()) {
      alert('Preencha o nome da cliente primeiro.');
      return;
    }
    const payload = buildSalePayload();
    const receiptText = generateOrderReceiptText(payload as any, storeInfo);
    navigator.clipboard.writeText(receiptText);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent, sendWhatsApp = false) => {
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

    const payload = buildSalePayload();
    const success = updateSale(sale.id, payload);

    if (success) {
      if (sendWhatsApp && payload.customerPhone) {
        const link = createWhatsAppReceiptFromSale(payload as any, storeInfo);
        if (link && link !== '#') {
          window.open(link, '_blank');
        }
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 sm:pb-4 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-2xl shrink-0">
              <Edit3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Alterar Pedido / Incluir Produtos
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Altere os dados do pedido de {customerName || 'Cliente'}
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

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 flex-1 space-y-4 sm:space-y-5">
          
          {/* Customer Info */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-sky-500" />
              <span>Dados do Cliente</span>
            </h4>

            <div>
              <label className="block text-xs font-bold text-sky-700 dark:text-sky-400 uppercase mb-1">
                Nome do Cliente (Obrigatório) *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Maria Silva"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-2 border-sky-300 dark:border-sky-700 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  WhatsApp (DDD + Número)
                </label>
                <input
                  type="tel"
                  placeholder="11988887777"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                  Forma de Entrega
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
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
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-sky-500" />
                  Endereço Completo de Entrega
                </label>
                <input
                  type="text"
                  placeholder="Rua, nº, bairro, complemento, cidade"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
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

          {/* Products List (Multi-item order with individual filter per product) */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-sky-500" />
                  Produtos do Pedido ({items.length})
                </h4>
                <span className="text-[10px] bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-md font-semibold hidden sm:inline">
                  Novos itens entram no topo
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/40 px-3.5 py-1.5 rounded-xl border border-sky-300 dark:border-sky-800 transition active:scale-95 shadow-sm self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                <span>+ Adicionar Produto ao Topo</span>
              </button>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {items.map((item, index) => {
                const lineTotal = item.quantitySold * item.unitBazarPrice;
                const itemFilteredProducts = getItemFilteredProducts(item);
                const selectedProd = products.find((p) => p.id === item.productId);
                const isTopItem = index === 0;

                return (
                  <div
                    key={item.id || index}
                    className={`p-3.5 rounded-2xl border transition shadow-sm ${
                      isTopItem
                        ? 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-300 dark:border-sky-700/80 ring-1 ring-sky-400/30'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80'
                    }`}
                  >
                    {/* Item Top Bar */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-700/70 flex-wrap gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100">
                          Item #{index + 1}
                        </span>
                        {isTopItem && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-600 text-white uppercase tracking-wider">
                            Novo / Topo
                          </span>
                        )}
                        {selectedProd && (
                          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 truncate max-w-[200px] sm:max-w-xs">
                            ✓ {selectedProd.name} {selectedProd.sizeColor ? `(${selectedProd.sizeColor})` : ''}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 text-xs font-semibold"
                        title="Remover produto do pedido"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline text-[11px]">Remover</span>
                      </button>
                    </div>

                    {/* Dedicated Filter FOR THIS PRODUCT */}
                    <div className="mb-2.5 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Filter className="h-3 w-3 text-sky-500" />
                          Filtro deste Produto:
                        </span>
                        {(item.filterText || item.categoryFilter) && (
                          <button
                            type="button"
                            onClick={() => {
                              handleItemChange(index, 'filterText', '');
                              handleItemChange(index, 'categoryFilter', '');
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:underline"
                          >
                            Limpar Filtro
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-7 relative">
                          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                            <Search className="h-3 w-3" />
                          </div>
                          <input
                            type="text"
                            placeholder="Buscar p/ nome, código (SKU) ou tamanho..."
                            value={item.filterText || ''}
                            onChange={(e) => handleItemChange(index, 'filterText', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-7 pr-2.5 py-1 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <select
                            value={item.categoryFilter || ''}
                            onChange={(e) => handleItemChange(index, 'categoryFilter', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-sky-500"
                          >
                            <option value="">Todas Categorias</option>
                            {availableCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Product Selection Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                      {/* Product Select */}
                      <div className="sm:col-span-6">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5 flex items-center justify-between">
                          <span>Selecione o Produto *</span>
                          <span className="text-slate-400 font-normal">
                            ({itemFilteredProducts.length} opção{itemFilteredProducts.length !== 1 ? 'ões' : ''})
                          </span>
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
                          <option value="">
                            {itemFilteredProducts.length === 0
                              ? '-- Nenhum produto com este filtro --'
                              : '-- Selecione o Produto --'}
                          </option>
                          {itemFilteredProducts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku ? `[Cód: ${p.sku}] ` : ''}{p.name} {p.sizeColor ? `(${p.sizeColor})` : ''} — {p.quantity === 0 ? 'SEM ESTOQUE' : `${p.quantity} un.`} - {formatCurrency(p.bazarPrice)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                          Qtd
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantitySold}
                          onChange={(e) => handleItemChange(index, 'quantitySold', parseInt(e.target.value, 10) || 1)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Unit Price */}
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                          Preço Un. (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={item.unitBazarPrice}
                          onChange={(e) => handleItemChange(index, 'unitBazarPrice', parseFloat(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-center focus:outline-none focus:border-sky-500 text-slate-900 dark:text-white"
                        />
                      </div>

                      {/* Line Subtotal */}
                      <div className="sm:col-span-2 text-right sm:pb-1">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">Subtotal</span>
                        <span className="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400">
                          {formatCurrency(lineTotal)}
                        </span>
                      </div>
                    </div>

                    {selectedProd && (
                      <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                        <span>Estoque: <strong className={selectedProd.quantity <= 2 ? 'text-amber-500 font-bold' : 'text-slate-700 dark:text-slate-300 font-bold'}>{selectedProd.quantity} un.</strong></span>
                        {selectedProd.category && <span>Categoria: <strong className="text-slate-700 dark:text-slate-300">{selectedProd.category}</strong></span>}
                      </div>
                    )}
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

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 font-black text-sm text-sky-600 dark:text-sky-400">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* Quick Copy Receipt text button */}
            <button
              type="button"
              onClick={handleCopyOrderText}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              title="Copia o resumo completo do pedido já com a Chave PIX e Endereço da loja para a área de transferência"
            >
              {copiedReceipt ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Pedido Copiado c/ PIX!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-500" />
                  <span>Copiar Pedido c/ PIX</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white transition active:scale-95 flex items-center gap-1.5"
                title="Apenas salva as alterações e atualiza o estoque"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Apenas Salvar</span>
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 transition active:scale-95 flex items-center gap-1.5"
                title="Salva as alterações e abre o WhatsApp com o comprovante contendo a Chave PIX e o Endereço da loja"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Salvar e Enviar no WhatsApp</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
