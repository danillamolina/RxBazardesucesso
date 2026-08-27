import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Package, Sparkles, Image as ImageIcon, Camera, Plus, Tag, Barcode, Calendar, Trash2, Loader2, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { Product } from '../../types';
import { formatCurrency, formatPercent, calculateMarginPercent, calculatePriceFromMargin } from '../../utils/formatters';
import { optimizeProductImage } from '../../utils/imageOptimizer';
import { useBazar } from '../../context/BazarContext';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const { categories, addCategory, addSubcategory } = useBazar();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  
  // Categories & Subcategories
  const [selectedCategoryOption, setSelectedCategoryOption] = useState<string>('');
  const [customCategory, setCustomCategory] = useState('');
  const [selectedSubcategoryOption, setSelectedSubcategoryOption] = useState<string>('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  
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

  // Photo Upload & Camera States
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageStats, setImageStats] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Derive active category's subcategories
  const activeCategoryObject = categories.find((c) => c.name === selectedCategoryOption);
  const availableSubcategories = activeCategoryObject?.subcategories || [];

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setSku(productToEdit.sku || '');
      setExpirationDate(productToEdit.expirationDate || '');
      
      const foundCat = categories.find((c) => c.name === productToEdit.category);
      if (foundCat) {
        setSelectedCategoryOption(foundCat.name);
        setCustomCategory('');
        
        if (productToEdit.subcategory) {
          if (foundCat.subcategories.includes(productToEdit.subcategory)) {
            setSelectedSubcategoryOption(productToEdit.subcategory);
            setCustomSubcategory('');
          } else {
            setSelectedSubcategoryOption('__nova_sub__');
            setCustomSubcategory(productToEdit.subcategory);
          }
        } else {
          setSelectedSubcategoryOption('');
          setCustomSubcategory('');
        }
      } else if (productToEdit.category) {
        setSelectedCategoryOption('__nova__');
        setCustomCategory(productToEdit.category);
        if (productToEdit.subcategory) {
          setSelectedSubcategoryOption('__nova_sub__');
          setCustomSubcategory(productToEdit.subcategory);
        } else {
          setSelectedSubcategoryOption('');
          setCustomSubcategory('');
        }
      } else {
        setSelectedCategoryOption(categories[0]?.name || 'Roupas');
        setCustomCategory('');
        setSelectedSubcategoryOption('');
        setCustomSubcategory('');
      }

      const editFull = productToEdit.fullPrice || '';
      const editBazar = productToEdit.bazarPrice || 0;
      const initialDiscount = typeof editFull === 'number' && editFull > editBazar
        ? parseFloat((editFull - editBazar).toFixed(2))
        : (productToEdit.bazarDiscountValue || '');

      setFullPrice(editFull);
      setBazarDiscountValue(initialDiscount);
      setCostPrice(productToEdit.costPrice);
      setBazarPrice(editBazar);
      setQuantity(productToEdit.quantity);
      setSizeColor(productToEdit.sizeColor || '');
      setDescription(productToEdit.description || '');
      setImageUrl(productToEdit.imageUrl || '');
      setShowInCatalog(productToEdit.showInCatalog !== false);
      setImageStats(productToEdit.imageUrl ? 'Foto atual carregada' : null);
      setImageError(null);
    } else {
      setName('');
      setSku('');
      setExpirationDate('');
      const defaultCat = categories[0]?.name || 'Roupas';
      setSelectedCategoryOption(defaultCat);
      setCustomCategory('');
      setSelectedSubcategoryOption('');
      setCustomSubcategory('');
      setFullPrice('');
      setBazarDiscountValue('');
      setCostPrice(50);
      setBazarPrice(100);
      setQuantity(5);
      setSizeColor('');
      setDescription('');
      setImageUrl('');
      setShowInCatalog(true);
      setImageStats(null);
      setImageError(null);
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const numFull = typeof fullPrice === 'number' ? fullPrice : 0;
  const numCost = typeof costPrice === 'number' ? costPrice : 0;
  const numPrice = typeof bazarPrice === 'number' ? bazarPrice : 0;
  const numQty = typeof quantity === 'number' ? quantity : 0;

  const currentMarginPercent = calculateMarginPercent(numCost, numPrice);
  const unitProfit = numPrice - numCost;
  const totalPotentialProfit = unitProfit * numQty;

  // Calculate discount automatically if full price is set: (1 - (bazarPrice / fullPrice)) * 100
  const calculatedDiscountAmount = numFull > 0 && numPrice > 0 && numFull > numPrice ? Math.max(0, numFull - numPrice) : 0;
  const calculatedDiscountPercent = numFull > 0 && numPrice > 0 && numFull > numPrice
    ? Math.max(0, (1 - (numPrice / numFull)) * 100)
    : 0;

  const handleFullPriceChange = (val: number | '') => {
    setFullPrice(val);
    if (typeof val === 'number' && val > 0) {
      if (numPrice > 0) {
        const disc = Math.max(0, val - numPrice);
        setBazarDiscountValue(parseFloat(disc.toFixed(2)));
      } else if (typeof bazarDiscountValue === 'number' && bazarDiscountValue > 0) {
        const newBazar = Math.max(0, val - bazarDiscountValue);
        setBazarPrice(parseFloat(newBazar.toFixed(2)));
      }
    } else {
      setBazarDiscountValue('');
    }
  };

  const handleBazarDiscountChange = (val: number | '') => {
    setBazarDiscountValue(val);
    if (typeof val === 'number' && val >= 0 && typeof numFull === 'number' && numFull > 0) {
      const newBazar = Math.max(0, numFull - val);
      setBazarPrice(parseFloat(newBazar.toFixed(2)));
    }
  };

  const handleApplyCustomMargin = () => {
    const pct = parseFloat(customMarginInput);
    if (isNaN(pct) || pct < 0) {
      alert('Informe uma porcentagem de margem válida (ex: 20, 30, 50).');
      return;
    }
    if (pct >= 100) {
      alert('A margem de lucro sobre o preço de venda deve ser menor que 100% (ex: 20%, 30%, 50%).');
      return;
    }
    if (numCost <= 0) {
      alert('Informe primeiro o Preço de Custo (ex: R$ 18,00).');
      return;
    }

    const newPrice = calculatePriceFromMargin(numCost, pct);
    const roundedPrice = parseFloat(newPrice.toFixed(2));
    setBazarPrice(roundedPrice);
    if (numFull > 0) {
      setBazarDiscountValue(Math.max(0, numFull - roundedPrice));
    }
  };

  // High-performance image processing with automatic compression for mobile/desktop
  const processImageFile = async (file: File) => {
    if (!file) return;
    
    // Check if file is image
    if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|heif)$/i)) {
      setImageError('Selecione um arquivo de foto válido (JPG, PNG, WEBP).');
      return;
    }

    try {
      setIsProcessingImage(true);
      setImageError(null);
      setImageStats(null);

      const optimized = await optimizeProductImage(file, 1080, 1080, 0.82);
      setImageUrl(optimized.dataUrl);
      setImageStats(`Foto otimizada com sucesso! (${optimized.optimizedSizeKb} KB)`);
    } catch (err: any) {
      console.error('Erro ao processar foto:', err);
      setImageError('Não foi possível processar a foto. Tente novamente ou escolha outra imagem.');
    } finally {
      setIsProcessingImage(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
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

    let finalSubcategory: string | undefined = undefined;
    if (selectedSubcategoryOption === '__nova_sub__') {
      finalSubcategory = customSubcategory.trim() || undefined;
    } else if (selectedSubcategoryOption) {
      finalSubcategory = selectedSubcategoryOption.trim() || undefined;
    }

    // Auto-persist new category/subcategory in context if entered
    if (selectedCategoryOption === '__nova__' && customCategory.trim()) {
      addCategory(customCategory.trim(), finalSubcategory ? [finalSubcategory] : []);
    } else if (finalCategory && selectedSubcategoryOption === '__nova_sub__' && customSubcategory.trim()) {
      addSubcategory(finalCategory, customSubcategory.trim());
    }

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
      subcategory: finalSubcategory,
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl text-slate-900 dark:text-white my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 sm:pb-4 sm:mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {productToEdit ? 'Editar Produto' : 'Cadastrar Produto no Bazar'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Calcule o preço cheio, desconto, custo e margem personalizada
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
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 overflow-y-auto pr-1 flex-1">
          
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

            {/* Category, Subcategory, Size/Color & Expiration Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
              {/* Categoria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5 text-rose-500" />
                    Categoria *
                  </span>
                </label>
                <select
                  value={selectedCategoryOption}
                  onChange={(e) => {
                    setSelectedCategoryOption(e.target.value);
                    setSelectedSubcategoryOption('');
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500 transition shadow-sm"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
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

              {/* Subcategoria */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-rose-500" />
                    Subcategoria
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Opcional</span>
                </label>
                <select
                  value={selectedSubcategoryOption}
                  onChange={(e) => setSelectedSubcategoryOption(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500 transition shadow-sm"
                >
                  <option value="">-- Nenhuma / Geral --</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="__nova_sub__">➕ + Nova Subcategoria...</option>
                </select>

                {selectedSubcategoryOption === '__nova_sub__' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="Nome da subcategoria..."
                      value={customSubcategory}
                      onChange={(e) => setCustomSubcategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              {/* Variação / Tamanho */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tamanho / Cor / Variação
                </label>
                <input
                  type="text"
                  placeholder="ex: Tam M / Cor Rosa"
                  value={sizeColor}
                  onChange={(e) => setSizeColor(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-rose-500 transition shadow-sm"
                />
              </div>

              {/* Validade */}
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
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 focus:outline-none focus:border-rose-500 transition shadow-sm"
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

            {/* Margin Calculator (Lucro sobre Preço de Venda) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Aplicar Margem de Lucro Desejada (%):
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 flex-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="99.9"
                    placeholder="ex: 20"
                    value={customMarginInput}
                    onChange={(e) => setCustomMarginInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyCustomMargin();
                      }
                    }}
                    className="w-full bg-transparent text-sm font-bold focus:outline-none text-slate-900 dark:text-white"
                  />
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">%</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyCustomMargin}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm shrink-0 flex items-center justify-center gap-1.5"
                >
                  <Calculator className="h-4 w-4" />
                  <span>Aplicar Margem</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Cálculo: Custo ÷ (1 - Margem/100). Exemplo: R$ 18,00 ÷ 0,80 = R$ 22,50 (20% de margem).
              </p>
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

          {/* Photo Upload & Camera Section (Mobile Gallery + Direct Camera + Desktop File) */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Foto da Peça / Produto
                </label>
                {imageUrl && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Foto carregada</span>
                  </span>
                )}
              </div>

              {/* Hidden File Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraChange}
                className="hidden"
                id="camera-photo-input"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGalleryChange}
                className="hidden"
                id="gallery-photo-input"
              />

              {/* Action Buttons: Camera & Gallery */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold text-xs p-3 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <Camera className="h-4 w-4 shrink-0" />
                  <span>Tirar Foto (Câmera)</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-[0.98] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs p-3 rounded-2xl flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <ImageIcon className="h-4 w-4 text-rose-500 shrink-0" />
                  <span>Galeria / Arquivo (Celular/PC)</span>
                </button>
              </div>

              {/* Processing Loader */}
              {isProcessingImage && (
                <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-4 flex items-center justify-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-pulse mb-3">
                  <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
                  <span>Processando e otimizando foto para o catálogo...</span>
                </div>
              )}

              {/* Error Notification */}
              {imageError && (
                <div className="bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 p-3 rounded-2xl text-xs font-medium border border-rose-300 dark:border-rose-800 mb-3">
                  {imageError}
                </div>
              )}

              {/* Photo Preview & Control Card */}
              {imageUrl ? (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-2 border-rose-500 shadow-md shrink-0 bg-slate-900">
                    <img src={imageUrl} alt="Foto do produto" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-slate-950/85 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                      ✓ Pronta
                    </span>
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Foto pronta para o Catálogo e WhatsApp
                      </p>
                      {imageStats && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {imageStats}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3 w-3 text-rose-500" />
                        <span>Tirar Outra</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="bg-white dark:bg-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 transition flex items-center gap-1.5"
                      >
                        <ImageIcon className="h-3 w-3 text-slate-500" />
                        <span>Trocar Galeria</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImageStats(null);
                          setImageError(null);
                        }}
                        className="bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 transition flex items-center gap-1.5"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => galleryInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                    isDraggingOver
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Tire uma foto ou selecione da galeria do celular/PC
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Arquivos JPG, PNG ou fotos tiradas na hora (otimização automática)
                    </p>
                  </div>
                </div>
              )}
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
