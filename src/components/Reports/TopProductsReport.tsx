import React, { useState, useMemo } from 'react';
import { 
  Award, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  BarChart3, 
  Sparkles, 
  Percent, 
  ArrowUpDown,
  CheckCircle2,
  Flame,
  Gem,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';
import { useBazar } from '../../context/BazarContext';
import { Product, Sale } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { generateTopProductsReportPdf } from '../../utils/pdfGenerator';

interface ProductStats {
  id: string;
  name: string;
  sku?: string;
  category: string;
  sizeColor?: string;
  imageUrl?: string;
  soldQty: number;
  currentStock: number;
  initialStock: number;
  costPrice: number;
  bazarPrice: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMarginPercent: number;
  turnoverRatePercent: number; // % do estoque inicial que foi vendido
}

type SortField = 'soldQty' | 'netProfit' | 'totalRevenue' | 'profitMarginPercent' | 'currentStock' | 'turnoverRatePercent';

export const TopProductsReport: React.FC = () => {
  const { products, sales, editions, activeEditionId } = useBazar();

  const [activeView, setActiveView] = useState<'mais_vendidos' | 'mais_lucrativos' | 'maior_faturamento' | 'maior_margem'>('mais_vendidos');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [sortField, setSortField] = useState<SortField>('soldQty');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const activeEditionName = editions.find((e) => e.id === activeEditionId)?.name || 'Geral';

  // Extract all categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Aggregate product performance
  const allProductStats = useMemo(() => {
    const map: Record<string, ProductStats> = {};

    // 1. Initialize from existing products
    products.forEach((p) => {
      map[p.id] = {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category || 'Geral',
        sizeColor: p.sizeColor,
        imageUrl: p.imageUrl,
        soldQty: 0,
        currentStock: p.quantity,
        initialStock: p.initialQuantity || p.quantity,
        costPrice: p.costPrice,
        bazarPrice: p.bazarPrice,
        totalRevenue: 0,
        totalCost: 0,
        netProfit: 0,
        profitMarginPercent: 0,
        turnoverRatePercent: 0,
      };
    });

    // 2. Accumulate sales
    sales.forEach((s) => {
      if (s.paymentStatus === 'cancelado') return;

      if (s.items && s.items.length > 0) {
        s.items.forEach((item) => {
          const prodId = item.productId || item.productName;
          if (!map[prodId]) {
            map[prodId] = {
              id: prodId,
              name: item.productName,
              category: 'Outros',
              sizeColor: item.sizeColor,
              soldQty: 0,
              currentStock: 0,
              initialStock: 0,
              costPrice: item.unitCostPrice,
              bazarPrice: item.unitBazarPrice,
              totalRevenue: 0,
              totalCost: 0,
              netProfit: 0,
              profitMarginPercent: 0,
              turnoverRatePercent: 0,
            };
          }

          const rev = item.quantitySold * item.unitBazarPrice;
          const cost = item.quantitySold * item.unitCostPrice;
          map[prodId].soldQty += item.quantitySold;
          map[prodId].totalRevenue += rev;
          map[prodId].totalCost += cost;
          map[prodId].netProfit += (rev - cost);
        });
      } else {
        const prodId = s.productId || s.productName;
        if (!map[prodId]) {
          map[prodId] = {
            id: prodId,
            name: s.productName,
            category: 'Outros',
            soldQty: 0,
            currentStock: 0,
            initialStock: 0,
            costPrice: s.unitCostPrice,
            bazarPrice: s.unitBazarPrice,
            totalRevenue: 0,
            totalCost: 0,
            netProfit: 0,
            profitMarginPercent: 0,
            turnoverRatePercent: 0,
          };
        }

        const rev = s.totalAmount;
        const cost = s.quantitySold * s.unitCostPrice;
        map[prodId].soldQty += s.quantitySold;
        map[prodId].totalRevenue += rev;
        map[prodId].totalCost += cost;
        map[prodId].netProfit += (rev - cost);
      }
    });

    // 3. Compute margins and turnover
    Object.values(map).forEach((p) => {
      if (p.totalRevenue > 0) {
        p.profitMarginPercent = (p.netProfit / p.totalRevenue) * 100;
      } else if (p.costPrice > 0 && p.bazarPrice > 0) {
        p.profitMarginPercent = ((p.bazarPrice - p.costPrice) / p.bazarPrice) * 100;
      }

      const totalHandled = p.soldQty + p.currentStock;
      if (totalHandled > 0) {
        p.turnoverRatePercent = Math.min(100, Math.round((p.soldQty / totalHandled) * 100));
      }
    });

    return Object.values(map);
  }, [products, sales]);

  // Overall KPIs
  const totalSoldPieces = useMemo(() => {
    return allProductStats.reduce((acc, p) => acc + p.soldQty, 0);
  }, [allProductStats]);

  const totalNetProfitRealized = useMemo(() => {
    return allProductStats.reduce((acc, p) => acc + p.netProfit, 0);
  }, [allProductStats]);

  const totalGrossRevenue = useMemo(() => {
    return allProductStats.reduce((acc, p) => acc + p.totalRevenue, 0);
  }, [allProductStats]);

  const averageMargin = totalGrossRevenue > 0 ? (totalNetProfitRealized / totalGrossRevenue) * 100 : 0;

  // Best-seller product & Most profitable product
  const bestSeller = useMemo(() => {
    const list = [...allProductStats].sort((a, b) => b.soldQty - a.soldQty);
    return list[0]?.soldQty > 0 ? list[0] : null;
  }, [allProductStats]);

  const mostProfitable = useMemo(() => {
    const list = [...allProductStats].sort((a, b) => b.netProfit - a.netProfit);
    return list[0]?.netProfit > 0 ? list[0] : null;
  }, [allProductStats]);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return allProductStats
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'todas' && p.category !== selectedCategory) {
          return false;
        }

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku ? p.sku.toLowerCase().includes(q) : false;
          const matchSize = p.sizeColor ? p.sizeColor.toLowerCase().includes(q) : false;
          if (!matchName && !matchSku && !matchSize) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const factor = sortDirection === 'desc' ? -1 : 1;
        if (sortField === 'soldQty') return (a.soldQty - b.soldQty) * factor;
        if (sortField === 'netProfit') return (a.netProfit - b.netProfit) * factor;
        if (sortField === 'totalRevenue') return (a.totalRevenue - b.totalRevenue) * factor;
        if (sortField === 'profitMarginPercent') return (a.profitMarginPercent - b.profitMarginPercent) * factor;
        if (sortField === 'currentStock') return (a.currentStock - b.currentStock) * factor;
        if (sortField === 'turnoverRatePercent') return (a.turnoverRatePercent - b.turnoverRatePercent) * factor;
        return 0;
      });
  }, [allProductStats, selectedCategory, search, sortField, sortDirection]);

  // Top 3 Podium Products
  const podiumProducts = useMemo(() => {
    let sortedList: ProductStats[] = [];
    if (activeView === 'mais_vendidos') {
      sortedList = [...allProductStats].sort((a, b) => b.soldQty - a.soldQty);
    } else if (activeView === 'mais_lucrativos') {
      sortedList = [...allProductStats].sort((a, b) => b.netProfit - a.netProfit);
    } else if (activeView === 'maior_faturamento') {
      sortedList = [...allProductStats].sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else {
      sortedList = [...allProductStats].filter(p => p.soldQty > 0).sort((a, b) => b.profitMarginPercent - a.profitMarginPercent);
    }

    return sortedList.slice(0, 3);
  }, [allProductStats, activeView]);

  // Chart Data (Top 7 according to active view)
  const chartData = useMemo(() => {
    let list = [...allProductStats];
    if (activeView === 'mais_vendidos') {
      list.sort((a, b) => b.soldQty - a.soldQty);
      return list.slice(0, 7).filter(p => p.soldQty > 0).map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
        value: p.soldQty,
        formatted: `${p.soldQty} un`,
        profit: p.netProfit,
        fill: '#f43f5e',
      }));
    } else if (activeView === 'mais_lucrativos') {
      list.sort((a, b) => b.netProfit - a.netProfit);
      return list.slice(0, 7).filter(p => p.netProfit > 0).map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
        value: p.netProfit,
        formatted: formatCurrency(p.netProfit),
        fill: '#10b981',
      }));
    } else if (activeView === 'maior_faturamento') {
      list.sort((a, b) => b.totalRevenue - a.totalRevenue);
      return list.slice(0, 7).filter(p => p.totalRevenue > 0).map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
        value: p.totalRevenue,
        formatted: formatCurrency(p.totalRevenue),
        fill: '#3b82f6',
      }));
    } else {
      list.sort((a, b) => b.profitMarginPercent - a.profitMarginPercent);
      return list.slice(0, 7).filter(p => p.soldQty > 0).map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 16) + '...' : p.name,
        value: Math.round(p.profitMarginPercent),
        formatted: `${p.profitMarginPercent.toFixed(1)}%`,
        fill: '#a855f7',
      }));
    }
  }, [allProductStats, activeView]);

  // Handle Quick View Change
  const handleSelectView = (view: 'mais_vendidos' | 'mais_lucrativos' | 'maior_faturamento' | 'maior_margem') => {
    setActiveView(view);
    if (view === 'mais_vendidos') {
      setSortField('soldQty');
      setSortDirection('desc');
    } else if (view === 'mais_lucrativos') {
      setSortField('netProfit');
      setSortDirection('desc');
    } else if (view === 'maior_faturamento') {
      setSortField('totalRevenue');
      setSortDirection('desc');
    } else if (view === 'maior_margem') {
      setSortField('profitMarginPercent');
      setSortDirection('desc');
    }
  };

  // Toggle column sort
  const handleSortColumn = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export PDF
  const handleExportPdf = () => {
    generateTopProductsReportPdf(products, sales, activeEditionName);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Rank',
      'Produto',
      'SKU',
      'Categoria',
      'Tamanho/Cor',
      'Qtd Vendida',
      'Estoque Atual',
      'Faturamento Bruto (R$)',
      'Custo Total das Vendas (R$)',
      'Lucro Líquido Realizado (R$)',
      'Margem de Lucro (%)',
      'Giro do Estoque (%)'
    ];

    const rows = filteredProducts.map((p, idx) => [
      String(idx + 1),
      `"${p.name}"`,
      p.sku || '',
      `"${p.category}"`,
      p.sizeColor || '',
      String(p.soldQty),
      String(p.currentStock),
      p.totalRevenue.toFixed(2),
      p.totalCost.toFixed(2),
      p.netProfit.toFixed(2),
      p.profitMarginPercent.toFixed(1) + '%',
      p.turnoverRatePercent + '%'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Produtos_Mais_Vendidos_e_Lucrativos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" />
            Relatório de Produtos Mais Vendidos e Mais Lucrativos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ranking analítico de unidades vendidas, lucro líquido gerado, faturamento e margem de cada produto
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportPdf}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-600/20 flex items-center gap-2 transition active:scale-95"
            title="Gera o PDF com os produtos mais vendidos e mais lucrativos"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar PDF do Ranking</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition flex items-center gap-2"
            title="Exportar planilha Excel / CSV"
          >
            <Download className="h-4 w-4 text-emerald-500" />
            <span>Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Top Seller Card */}
        <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-100 bg-white/20 px-2.5 py-1 rounded-full">
              🔥 Campeão em Vendas
            </span>
            <Flame className="h-5 w-5 text-rose-200" />
          </div>
          <div className="mt-3">
            <h4 className="font-black text-lg sm:text-xl line-clamp-1">
              {bestSeller ? bestSeller.name : 'Nenhuma venda ainda'}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black">
                {bestSeller ? `${bestSeller.soldQty} un` : '0'}
              </span>
              <span className="text-xs text-rose-100">
                {bestSeller ? `(${formatCurrency(bestSeller.totalRevenue)})` : ''}
              </span>
            </div>
            <p className="text-[11px] text-rose-100 mt-1">
              {bestSeller ? `Giro de ${bestSeller.turnoverRatePercent}% do estoque` : 'Lance uma venda para computar'}
            </p>
          </div>
        </div>

        {/* Most Profitable Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100 bg-white/20 px-2.5 py-1 rounded-full">
              💎 Campeão em Lucro R$
            </span>
            <Gem className="h-5 w-5 text-emerald-200" />
          </div>
          <div className="mt-3">
            <h4 className="font-black text-lg sm:text-xl line-clamp-1">
              {mostProfitable ? mostProfitable.name : 'Nenhum lucro ainda'}
            </h4>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black">
                {mostProfitable ? formatCurrency(mostProfitable.netProfit) : 'R$ 0,00'}
              </span>
              <span className="text-xs text-emerald-100">
                {mostProfitable ? `${mostProfitable.profitMarginPercent.toFixed(0)}% margem` : ''}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 mt-1">
              {mostProfitable ? `${mostProfitable.soldQty} un geraram este lucro líquido` : 'Lance vendas para registrar'}
            </p>
          </div>
        </div>

        {/* Total Sold Pieces */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Volume Total Vendido</span>
            <span className="p-1.5 bg-blue-500/10 text-blue-600 rounded-xl text-xs font-black">Total</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
            {totalSoldPieces} peças
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Faturamento: <strong>{formatCurrency(totalGrossRevenue)}</strong>
          </p>
        </div>

        {/* Total Net Profit Realized */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Lucro Líquido Realizado</span>
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-black">Retorno</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(totalNetProfitRealized)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Margem Real Média: <strong>{formatPercent(averageMargin)}</strong>
          </p>
        </div>

      </div>

      {/* Focus View Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => handleSelectView('mais_vendidos')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
            activeView === 'mais_vendidos'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Flame className="h-4 w-4" />
          <span>🔥 Mais Vendidos (Volume)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('mais_lucrativos')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
            activeView === 'mais_lucrativos'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Gem className="h-4 w-4" />
          <span>💎 Mais Lucrativos (R$)</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('maior_faturamento')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
            activeView === 'maior_faturamento'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>📈 Maior Faturamento</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectView('maior_margem')}
          className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
            activeView === 'maior_margem'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <Percent className="h-4 w-4" />
          <span>⭐ Maior Margem (%)</span>
        </button>
      </div>

      {/* Podium and Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Visual Chart (7 columns) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-sky-500" />
              <span>
                {activeView === 'mais_vendidos' && 'Top Produtos por Unidades Vendidas'}
                {activeView === 'mais_lucrativos' && 'Top Produtos por Lucro Líquido (R$)'}
                {activeView === 'maior_faturamento' && 'Top Produtos por Faturamento Bruto (R$)'}
                {activeView === 'maior_margem' && 'Top Produtos por Margem de Lucro (%)'}
              </span>
            </h4>
            <span className="text-xs text-slate-400">Até 7 destaques</span>
          </div>

          {chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-xs text-slate-400">
              Nenhuma venda registrada com dados suficientes para o gráfico.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    tickLine={false} 
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={11} 
                    tickLine={false} 
                    tickFormatter={(val) => activeView === 'mais_vendidos' ? `${val} un` : activeView === 'maior_margem' ? `${val}%` : `R$${val}`} 
                  />
                  <Tooltip 
                    formatter={(val: any) => [
                      activeView === 'mais_vendidos' 
                        ? `${val} unidades vendidas` 
                        : activeView === 'maior_margem'
                        ? `${val}% de margem`
                        : formatCurrency(Number(val)), 
                      activeView === 'mais_vendidos' ? 'Qtd Vendida' : activeView === 'maior_margem' ? 'Margem' : 'Valor'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Podium Top 3 (5 columns) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-amber-500" />
              Pódio dos Melhores Desempenhos
            </h4>

            {podiumProducts.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                Nenhum produto com vendas registradas ainda.
              </div>
            ) : (
              <div className="space-y-2.5">
                {podiumProducts.map((p, idx) => {
                  const isFirst = idx === 0;
                  const isSecond = idx === 1;
                  const medalColor = isFirst 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300' 
                    : isSecond 
                    ? 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';

                  return (
                    <div
                      key={p.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                        isFirst 
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60' 
                          : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shrink-0 border ${medalColor}`}>
                          {idx === 0 ? '1º' : idx === 1 ? '2º' : '3º'}
                        </span>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {p.category} {p.sku ? `• Cód: ${p.sku}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {activeView === 'mais_vendidos' ? (
                          <>
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm block">
                              {p.soldQty} un
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatCurrency(p.totalRevenue)}
                            </span>
                          </>
                        ) : activeView === 'mais_lucrativos' ? (
                          <>
                            <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm block">
                              {formatCurrency(p.netProfit)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.profitMarginPercent.toFixed(0)}% margem
                            </span>
                          </>
                        ) : activeView === 'maior_faturamento' ? (
                          <>
                            <span className="font-black text-blue-600 dark:text-blue-400 text-sm block">
                              {formatCurrency(p.totalRevenue)}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {p.soldQty} un vendidas
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-black text-purple-600 dark:text-purple-400 text-sm block">
                              {p.profitMarginPercent.toFixed(1)}%
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Lucro: {formatCurrency(p.netProfit)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Dica do Rx do Bazar:</span>
            <span className="text-slate-600 dark:text-slate-300 font-semibold">
              Reinvista mais nos produtos com maior lucro líquido!
            </span>
          </div>
        </div>

      </div>

      {/* Toolbar: Search and Filter by Category */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome da peça, SKU ou tamanho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-amber-500 text-slate-800 dark:text-slate-200"
            >
              <option value="todas">Todas as Categorias ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Listando <strong>{filteredProducts.length}</strong> produtos
        </div>
      </div>

      {/* Comprehensive Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Produto & Detalhes</th>
                <th 
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('soldQty')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd Vendida</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('currentStock')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Estoque Restante</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('totalRevenue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Faturamento</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Custo Total</th>
                <th 
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('netProfit')}
                >
                  <div className="flex items-center justify-end gap-1 text-emerald-600 dark:text-emerald-400">
                    <span>Lucro Líquido</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('profitMarginPercent')}
                >
                  <div className="flex items-center justify-end gap-1 text-rose-600 dark:text-rose-400">
                    <span>Margem %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white select-none transition"
                  onClick={() => handleSortColumn('turnoverRatePercent')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Giro %</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, index) => {
                  const isTop3 = index < 3;

                  return (
                    <tr 
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition ${
                        isTop3 ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                          index === 0 
                            ? 'bg-amber-400 text-slate-900 font-extrabold' 
                            : index === 1 
                            ? 'bg-slate-300 text-slate-900 font-extrabold' 
                            : index === 2 
                            ? 'bg-amber-600 text-white font-extrabold' 
                            : 'text-slate-400 font-bold'
                        }`}>
                          {index + 1}
                        </span>
                      </td>

                      {/* Product Name & Details */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}

                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block line-clamp-1">
                              {p.name}
                            </span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                              <span>Cat: <strong>{p.category}</strong></span>
                              {p.sku && <span>• Cód: <strong>{p.sku}</strong></span>}
                              {p.sizeColor && <span>• <strong>{p.sizeColor}</strong></span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Sold Qty */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {p.soldQty} un
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {p.currentStock} un
                      </td>

                      {/* Total Revenue */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(p.totalRevenue)}
                      </td>

                      {/* Total Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                        {formatCurrency(p.totalCost)}
                      </td>

                      {/* Net Profit */}
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.netProfit)}
                      </td>

                      {/* Profit Margin % */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        {p.profitMarginPercent.toFixed(1)}%
                      </td>

                      {/* Turnover Rate */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-12 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                p.turnoverRatePercent >= 80 ? 'bg-emerald-500' : p.turnoverRatePercent >= 40 ? 'bg-amber-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${p.turnoverRatePercent}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {p.turnoverRatePercent}%
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
