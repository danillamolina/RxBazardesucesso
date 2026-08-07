import React, { useState, useEffect } from 'react';
import { X, Calculator, Package, Sparkles, Image as ImageIcon, Upload, Camera, Plus, Tag, Barcode, Calendar } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { formatCurrency, formatPercent, calculateMarginPercent, calculatePriceFromMargin } from '../../utils/formatters';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit?: Product | null;
}

const DEFAULT_CATEGORIES = [
  'Roupas',
  'Calçados',
  'Bolsas & Acessórios',
  'Cosméticos & Perfumes',
  'Semijoias',
  'Casa & Decoração',
  'Outros',
];

const SAMPLE_IMAGES = [
  { label: 'Vestido', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=600' },
  { label: 'Perfume', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600' },
  { label: 'Bolsa', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' },
  { label: 'Semijoia', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600' },
  { label: 'Calçado', url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=600' },
  { label: 'Cosmético', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=600' },
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>('Roupas');
  const [customCategory, setCustomCategory] = useState('');
  
  // Pricing
  const [fullPrice, setFullPrice] = useState<number | ''>(''); // Preço Cheio de Loja
  const [bazarDiscountValue, setBazarDiscountValue] = useState<number | ''>(''); // Desconto no Bazar R$
  const [costPrice, setCostPrice] = useState<number | ''>(50);
  const [bazarPrice, setBazarPrice] = useState<number | ''>(100);
  const [customMarginInput, setCustomMarginInput] = useState<string>('');

  const [quantity, setQuantity] = useState<number | ''>(5);
  const [sizeColor, setSizeColor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showInCatalog, setShowInCatalog] = useState<boolean>(true);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku || '');
      setExpirationDate(productToEdit.expirationDate || '');
      
      if (DEFAULT_CATEGORIES.includes(productToEdit.category)) {
        setSelectedCategoryOption(productToEdit.category);
        setCustomCategory('');
      } else {
        setSelectedCategoryOption('__nova__');
        setCustomCategory(productToEdit.category);
      }

      setFullPrice(productToEdit.fullPrice || '');
      setBazarDiscountValue(productToEdit.bazarDiscountValue || '');
      setCostPrice(productToEdit.costPrice);
      setBazarPrice(productToEdit.bazarPrice);
      setQuantity(productToEdit.quantity);
      setSizeColor(productToEdit.sizeColor || '');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setShowInCatalog(productToEdit.showInCatalog !== false);
    } else {
      setName('');
      setSku('');
      setExpirationDate('');
      setSelectedCategoryOption('Roupas');
      setCustomCategory('');
      setFullPrice('');
      setBazarDiscountValue('');
      setCostPrice(50);
      setBazarPrice(100);
      setQuantity(5);
      setSizeColor('');
      setDescription('');
      setImageUrl('');
      setShowInCatalog(true);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const numFull = typeof fullPrice === 'number' ? fullPrice : 0;
  const numCost = typeof costPrice === 'number' ? costPrice : 0;
  const numPrice = typeof bazarPrice === 'number' ? bazarPrice : 0;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  const currentMarginPercent = calculateMarginPercent(numCost, numPrice);
  const unitProfit = numPrice - numCost;
  const totalPotentialProfit = unitProfit * numQty;

  // Calculate discount automatically if full price is set
  const calculatedDiscountAmount = numFull > 0 && numPrice > 0 ? Math.max(0, numFull - numPrice) : 0;
  const calculatedDiscountPercent = numFull > 0 && calculatedDiscountAmount > 0 ? ((calculatedDiscountAmount / numFull) * 100) : 0;

  const handleFullPriceChange = (val: number | '') => {
    setFullPrice(val);
    if (typeof val === 'number' && val > 0 && typeof bazarDiscountValue === 'number' && bazarDiscountValue > 0) {
      setBazarPrice(Math.max(0, val - bazarDiscountValue));
    } else if (typeof val === 'number' && val > 0 && numPrice > 0) {
      setBazarDiscountValue(Math.max(0, val - numPrice));
    }
  };

  const handleBazarDiscountChange = (val: number | '') => {
    setBazarDiscountValue(val);
    if (typeof numFull === 'number' && numFull > 0 && typeof val === 'number') {
      setBazarPrice(Math.max(0, numFull - val));
    }
  };

  const handleApplyMarginPreset = (marginPct: number) => {
    if (numCost > 0) {
      const newPrice = calculatePriceFromMargin(numCost, marginPct);
      setBazarPrice(parseFloat(newPrice.toFixed(2)));
      if (numFull > 0) {
        setBazarDiscountValue(Math.max(0, numFull - newPrice));
      }
    }
  };

  const handleApplyCustomMargin = () => {
    const pct = parseFloat(customMarginInput);
    if (!isNaN(pct) && pct >= 0) {
      handleApplyMarginPreset(pct);
    } else {
      alert('Informe uma porcentagem de margem válida (ex: 85, 120, 250)');
    }
  };

  // Handle Photo File Upload (PC / Mobile Camera)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A foto é muito grande! Escolha uma imagem de até 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor, informe o nome do produto.');
      return;
    }

    const finalCategory = selectedCategoryOption === '__nova__'
      ? (customCategory.trim() || 'Outros')
      : selectedCategoryOption;

    if (numCost <= 0) {
      alert('Informe um preço de custo válido.');
      return;
    }
    if (numPrice <= 0) {
      alert('Informe o valor de venda no bazar.');
      return;
    }

    onSave({
      name: name.trim(),
      sku: sku.trim() || undefined,
      expirationDate: expirationDate.trim() || undefined,
      category: finalCategory,
      fullPrice: numFull > 0 ? numFull : undefined,
      bazarDiscountValue: typeof bazarDiscountValue === 'number' ? bazarDiscountValue : (numFull > numPrice ? numFull - numPrice : undefined),
      bazarDiscountPercent: calculatedDiscountPercent > 0 ? parseFloat(calculatedDiscountPercent.toFixed(1)) : undefined,
      costPrice: numCost,
      bazarPrice: numPrice,
      quantity: numQty,
      sizeColor: sizeColor.trim() || undefined,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      showInCatalog: showInCatalog,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {productToEdit ? 'Editar Produto' : 'Cadastrar Produto no Bazar'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calcule o preço cheio, desconto, custo e margem personalizada
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
          
          {/* Main Product Identification Card */}
          <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wider">
              <Tag className="h-4 w-4 text-rose-500" />
              <span>Identificação do Produto</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Nome do Produto */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-rose-500" />
                    Nome do Produto *
                  </span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold uppercase bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-md">Obrigatório</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="ex: Vestido Midi Floral Linho"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-sm"
                />
              </div>

              {/* Código do Produto (SKU) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                  <Barcode className="h-3.5 w-3.5 text-rose-500" />
                  Código do Produto
                </label>
                <input
                  type="text"
                  placeholder="ex: REF-102"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-black text-rose-600 dark:text-rose-400 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition shadow-sm"
                />
              </div>
            </div>

            {/* Category, Size/Color & Expiration Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Categoria *
                </label>
                <select
                  value={selectedCategoryOption}
                  onChange={(e) => setSelectedCategoryOption(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500 transition shadow-sm"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__nova__">➕ + Criar Nova Categoria...</option>
                </select>

                {selectedCategoryOption === '__nova__' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Nome da nova categoria..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tamanho / Cor / Variação
                </label>
                <input
                  type="text"
                  placeholder="ex: Tam M / Cor Rosa"
                  value={sizeColor}
                  onChange={(e) => setSizeColor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500 transition shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  Validade do Produto
                </label>
                <input
                  type="text"
                  placeholder="ex: 12/2026 ou 31/12/2026"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-rose-500 transition shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Margin Calculator Card */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Calculator className="h-4 w-4 text-rose-500" />
                Cálculo de Preço Cheio, Desconto & Bazar
              </span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                Lucro Un: {formatCurrency(unitProfit)}
              </span>
            </div>

            {/* Row 1: Preço Cheio & Desconto Dado no Bazar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Preço Cheio de Loja (R$) <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 180.00"
                  value={fullPrice}
                  onChange={(e) => handleFullPriceChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                  Desconto no Bazar (R$) <span className="text-slate-400 font-normal">(R$ OFF)</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="ex: 80.00"
                  value={bazarDiscountValue}
                  onChange={(e) => handleBazarDiscountChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                />
              </div>

              {numFull > 0 && numPrice > 0 && (
                <div className="col-span-1 sm:col-span-2 text-[11px] text-rose-600 dark:text-rose-400 font-bold flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    De {formatCurrency(numFull)} por {formatCurrency(numPrice)}
                  </span>
                  <span className="bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full">
                    🔥 Desconto de {formatCurrency(calculatedDiscountAmount)} ({formatPercent(calculatedDiscountPercent)} OFF)
                  </span>
                </div>
              )}
            </div>

            {/* Row 2: Preço Custo, Valor Bazar, Estoque */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Preço de Custo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Valor no Bazar (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={bazarPrice}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    setBazarPrice(val);
                    if (numFull > 0 && typeof val === 'number') {
                      setBazarDiscountValue(Math.max(0, numFull - val));
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  Quantidade Estoque *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Quick Margin Preset Buttons + Custom Margin Input */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Aplicar Margem Rápida sobre o Custo:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {[50, 70, 100, 150, 200].map((margin) => (
                  <button
                    key={margin}
                    type="button"
                    onClick={() => handleApplyMarginPreset(margin)}
                    className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    +{margin}%
                  </button>
                ))}

                {/* Custom Percentage Input */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-rose-300 dark:border-rose-800">
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="ex: 85"
                    value={customMarginInput}
                    onChange={(e) => setCustomMarginInput(e.target.value)}
                    className="w-16 bg-transparent px-2 py-0.5 text-xs font-bold focus:outline-none text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-bold text-slate-400">%</span>
                  <button
                    type="button"
                    onClick={handleApplyCustomMargin}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold px-2 py-1 rounded-lg transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>

            {/* Live Profit Summary Box */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-800 dark:text-emerald-300 font-bold block">
                  Margem Aplicada: {formatPercent(currentMarginPercent)}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                  Lucro Total no Estoque ({numQty} un): <strong className="font-extrabold">{formatCurrency(totalPotentialProfit)}</strong>
                </span>
              </div>
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
          </div>

          {/* Photo Upload Options (Device / PC / Camera / URL) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Foto do Produto (Celular ou Computador)
              </label>

              {/* Photo Upload Button & Camera Trigger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <label className="cursor-pointer bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-800/80 rounded-2xl p-3 flex items-center justify-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold transition">
                  <Camera className="h-4 w-4 text-rose-500" />
                  <span>Tirar Foto / Galeria (Celular/PC)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 text-xs font-semibold p-3 rounded-2xl transition"
                  >
                    Remover Foto Atual
                  </button>
                )}
              </div>

              {/* Image Preview */}
              {imageUrl && (
                <div className="relative h-32 w-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-2">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                    Carregada
                  </span>
                </div>
              )}

              {/* URL Input */}
              <input
                type="text"
                placeholder="Ou cole a URL da imagem (ex: https://exemplo.com/foto.jpg)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-xs focus:outline-none focus:border-rose-500 transition"
              />

              {/* Sample Images Picker */}
              <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
                <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Ou escolha um exemplo:
                </span>
                {SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg shrink-0 transition"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Descrição ou Detalhes para Divulgação
              </label>
              <textarea
                rows={2}
                placeholder="ex: Tecido super confortável, caimento impecável. Ótima opção para presente!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            {/* Catalog Visibility Toggle */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <label className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer" onClick={() => setShowInCatalog(!showInCatalog)}>
                  <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Exibir na Vitrine / Catálogo do Bazar</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Quando ativado, este produto ficará visível no catálogo online e será incluído na exportação de fotos do WhatsApp.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowInCatalog(!showInCatalog)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                  showInCatalog ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    showInCatalog ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 transition active:scale-95"
            >
              {productToEdit ? 'Salvar Alterações' : 'Cadastrar no Estoque'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
