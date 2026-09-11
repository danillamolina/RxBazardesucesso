import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  Download, 
  Sparkles, 
  Award, 
  ArrowUpRight,
  ShieldCheck,
  PackageCheck,
  FileText,
  Printer,
  ChevronDown,
  Users,
  BarChart3,
  ShoppingBag,
  Flame,
  Gem,
  ArrowLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';
import { useBazar } from '../../context/BazarContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { 
  generateProfitReportPdf, 
  generateExecutiveSummaryPdf, 
  generateSalesPdf, 
  generateStockPdf,
  generateCustomerPurchasesPdf,
  generateTopProductsReportPdf
} from '../../utils/pdfGenerator';
import { CustomerPurchasesReport } from './CustomerPurchasesReport';
import { TopProductsReport } from './TopProductsReport';

type ReportTab = 'lucro_geral' | 'clientes_compras' | 'mais_vendidos';

interface ProfitReportProps {
  initialSubTab?: ReportTab;
  onBackToOverview?: () => void;
}

export const ProfitReport: React.FC<ProfitReportProps> = ({
  initialSubTab = 'lucro_geral',
  onBackToOverview,
}) => {
  const { products, sales, financialSummary, stockMetrics, editions, activeEditionId } = useBazar();
  const [activeSubTab, setActiveSubTab] = useState<ReportTab>(initialSubTab);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeEditionName = editions.find(e => e.id === activeEditionId)?.name || 'Geral';

  // Count unique customers
  const uniqueCustomersCount = new Set(sales.map(s => (s.customerName || '').trim()).filter(Boolean)).size;

  // Category Profit Breakdown
  const categoryProfitMap: Record<string, { revenue: number; profit: number; count: number }> = {};

  sales.forEach((s) => {
    if (s.paymentStatus === 'pago') {
      const prod = products.find((p) => p.id === s.productId);
      const cat = prod?.category || 'Outros';

      if (!categoryProfitMap[cat]) {
        categoryProfitMap[cat] = { revenue: 0, profit: 0, count: 0 };
      }
      categoryProfitMap[cat].revenue += s.totalAmount;
      categoryProfitMap[cat].profit += s.netProfit;
      categoryProfitMap[cat].count += s.quantitySold;
    }
  });

  const categoryChartData = Object.entries(categoryProfitMap).map(([name, val]) => ({
    name,
    profit: val.profit,
    revenue: val.revenue,
    count: val.count,
  }));

  // Top Most Profitable Products
  const productProfitMap: Record<string, { name: string; profit: number; soldQty: number }> = {};
  sales.forEach((s) => {
    if (s.paymentStatus === 'pago') {
      if (!productProfitMap[s.productName]) {
        productProfitMap[s.productName] = { name: s.productName, profit: 0, soldQty: 0 };
      }
      productProfitMap[s.productName].profit += s.netProfit;
      productProfitMap[s.productName].soldQty += s.quantitySold;
    }
  });

  const topProfitableProducts = Object.values(productProfitMap)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5);

  // Financial comparison chart data
  const comparisonData = [
    {
      name: 'Faturamento Pago',
      valor: financialSummary.totalRevenuePaid,
      fill: '#10b981', // emerald
    },
    {
      name: 'Custo de Estoque Vendido',
      valor: financialSummary.totalCostOfGoodsSold,
      fill: '#64748b', // slate
    },
    {
      name: 'Lucro Líquido Realizado',
      valor: financialSummary.totalNetProfitRealized,
      fill: '#f43f5e', // rose
    },
    {
      name: 'Pendente / Fiado',
      valor: financialSummary.totalRevenuePending,
      fill: '#f59e0b', // amber
    },
  ];

  const exportPDF = () => {
    if (activeSubTab === 'clientes_compras') {
      generateCustomerPurchasesPdf(sales, activeEditionName);
    } else if (activeSubTab === 'mais_vendidos') {
      generateTopProductsReportPdf(products, sales, activeEditionName);
    } else {
      generateProfitReportPdf(products, sales, financialSummary, stockMetrics, activeEditionName);
    }
  };

  const exportExecutivePDF = () => {
    generateExecutiveSummaryPdf(products, sales, stockMetrics, financialSummary, editions, activeEditionName);
  };

  const exportSalesPDF = () => {
    generateSalesPdf(sales, activeEditionName);
  };

  const exportStockPDF = () => {
    generateStockPdf(products, stockMetrics, activeEditionName);
  };

  const exportCustomerPurchasesPDF = () => {
    generateCustomerPurchasesPdf(sales, activeEditionName);
  };

  const exportTopProductsPDF = () => {
    generateTopProductsReportPdf(products, sales, activeEditionName);
  };

  const exportCSV = () => {
    const headers = ['ID Venda', 'Cliente', 'Telefone', 'Produto', 'Qtd', 'Valor Total', 'Lucro', 'Status', 'Data'];
    const rows = sales.map(s => [
      s.id,
      `"${s.customerName}"`,
      s.customerPhone || '',
      `"${s.productName}"`,
      s.quantitySold,
      s.totalAmount.toFixed(2),
      s.netProfit.toFixed(2),
      s.paymentStatus,
      s.saleDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Lucro_Bazar_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Sub-Tabs Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        {/* Sub-Navigation Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {onBackToOverview && (
            <button
              type="button"
              onClick={onBackToOverview}
              className="px-3 py-2 rounded-xl font-bold text-xs bg-[#E8EFE2] hover:bg-[#DCE7D4] text-[#254217] border border-[#8FA079] flex items-center gap-1.5 transition shrink-0 shadow-xs"
              title="Voltar para a Visão Geral do Painel"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Painel</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveSubTab('lucro_geral')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
              activeSubTab === 'lucro_geral'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Lucro & Balanço Geral</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('clientes_compras')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
              activeSubTab === 'clientes_compras'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Clientes & Compras</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'clientes_compras' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {uniqueCustomersCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('mais_vendidos')}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition ${
              activeSubTab === 'mais_vendidos'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Mais Vendidos & Lucrativos</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              activeSubTab === 'mais_vendidos' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              {products.length}
            </span>
          </button>
        </div>

        {/* Global Action Export Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-auto">
          {/* Main PDF Export Button */}
          <button
            type="button"
            onClick={exportPDF}
            className={`font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 text-white ${
              activeSubTab === 'clientes_compras'
                ? 'bg-sky-600 hover:bg-sky-500 shadow-sky-600/20'
                : activeSubTab === 'mais_vendidos'
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
            }`}
            title="Exportar PDF deste relatório"
          >
            <FileText className="h-4 w-4" />
            <span>
              {activeSubTab === 'clientes_compras' && 'PDF Clientes & Compras'}
              {activeSubTab === 'mais_vendidos' && 'PDF Mais Vendidos/Lucrativos'}
              {activeSubTab === 'lucro_geral' && 'Exportar PDF de Lucro'}
            </span>
          </button>

          {/* Quick Dropdown for all other PDF / CSV formats */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Download className="h-4 w-4 text-emerald-400" />
              <span>Outros Formatos</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70" />
            </button>

            {showExportMenu && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-30 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowExportMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Exportação de Todos os Relatórios
                </div>

                <button
                  type="button"
                  onClick={exportCustomerPurchasesPDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50 dark:hover:bg-sky-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <Users className="h-4 w-4 text-sky-500 shrink-0" />
                  <div>
                    <div>Clientes & Compras (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Extrato individual de clientes e itens</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportTopProductsPDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <Award className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div>Mais Vendidos & Lucrativos (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Ranking analítico de unidades e lucro</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportPDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                  <div>
                    <div>Relatório de Lucro Geral (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Completo com KPIs e categorias</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportExecutivePDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <Printer className="h-4 w-4 text-purple-500 shrink-0" />
                  <div>
                    <div>Resumo Executivo (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Balanço geral e meios de pagamento</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportSalesPDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <ShoppingBag className="h-4 w-4 text-emerald-500 shrink-0" />
                  <div>
                    <div>Histórico de Vendas (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Todos os pedidos lançados</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportStockPDF}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition"
                >
                  <PackageCheck className="h-4 w-4 text-blue-500 shrink-0" />
                  <div>
                    <div>Inventário de Estoque (PDF)</div>
                    <div className="text-[10px] font-normal text-slate-400">Peças, custos e valor no bazar</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={exportCSV}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition border-t border-slate-100 dark:border-slate-800 mt-1"
                >
                  <Download className="h-4 w-4 text-amber-500 shrink-0" />
                  <div>
                    <div>Planilha Excel / CSV</div>
                    <div className="text-[10px] font-normal text-slate-400">Exportar dados tabulares</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO SUB-TAB */}
      {activeSubTab === 'clientes_compras' && (
        <CustomerPurchasesReport />
      )}

      {activeSubTab === 'mais_vendidos' && (
        <TopProductsReport />
      )}

      {activeSubTab === 'lucro_geral' && (
        <div className="space-y-6">
          {/* Header Description */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-rose-500" />
              Relatório de Lucro Total do Bazar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Análise consolidada do faturamento, margem real, lucro líquido e previsão de estoque
            </p>
          </div>

          {/* Hero Profit Summary Card */}
          <div className="bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-rose-100 bg-white/20 px-3 py-1 rounded-full backdrop-blur-md">
                  Lucro Líquido Realizado (Pago)
                </span>
                <div className="text-3xl sm:text-5xl font-black mt-3 tracking-tight">
                  {formatCurrency(financialSummary.totalNetProfitRealized)}
                </div>
                <p className="text-rose-100 text-xs sm:text-sm mt-2 flex items-center gap-2 font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>
                    Margem Líquida Média: <strong className="font-extrabold text-white text-base">{formatPercent(financialSummary.averageMarginPercent)}</strong>
                  </span>
                </p>
              </div>

              {/* Top Quick Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-rose-100 uppercase font-bold block">Valor Total Vendido</span>
                  <span className="text-lg font-black">{formatCurrency(financialSummary.totalRevenueSold)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center">
                  <span className="text-[10px] text-rose-100 uppercase font-bold block">Valor Total Recebido</span>
                  <span className="text-lg font-black text-emerald-200">{formatCurrency(financialSummary.totalRevenuePaid)}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-rose-100 uppercase font-bold block">Valor a Receber</span>
                  <span className="text-lg font-black text-amber-200">{formatCurrency(financialSummary.totalRevenuePending)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of All Requested Detailed Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* 1. Valor Total Vendido */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor Total Vendido</span>
                <span className="p-2 bg-blue-500/10 text-blue-600 rounded-xl text-xs font-black">Bruto</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(financialSummary.totalRevenueSold)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Soma de vendas pagas + pendentes/fiadas</p>
            </div>

            {/* 2. Valor Total Recebido */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor Total Recebido</span>
                <span className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-xs font-black">Confirmado</span>
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {formatCurrency(financialSummary.totalRevenuePaid)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Dinheiro em caixa / PIX / cartões confirmados</p>
            </div>

            {/* 3. Valor a Receber */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Valor a Receber</span>
                <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl text-xs font-black">Pendente</span>
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                {formatCurrency(financialSummary.totalRevenuePending)}
              </div>
              <p className="text-xs text-slate-400 mt-1">{financialSummary.pendingSalesCount} pedido(s) no fiado ou parcial</p>
            </div>

            {/* 4. Custo dos Produtos Vendidos */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custo dos Produtos</span>
                <span className="p-2 bg-slate-500/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black">CPV</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {formatCurrency(financialSummary.totalCostOfGoodsSold)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Investimento original do custo de aquisição</p>
            </div>

            {/* 5. Lucro Líquido Realizado */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lucro Líquido Realizado</span>
                <span className="p-2 bg-rose-500/10 text-rose-600 rounded-xl text-xs font-black">Líquido</span>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
                {formatCurrency(financialSummary.totalNetProfitRealized)}
              </div>
              <p className="text-xs text-slate-400 mt-1">(Valor Recebido) - (Custo dos Produtos)</p>
            </div>

            {/* 6. Margem de Lucro Média */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Margem de Lucro Média</span>
                <span className="p-2 bg-purple-500/10 text-purple-600 rounded-xl text-xs font-black">Margem %</span>
              </div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
                {formatPercent(financialSummary.averageMarginPercent)}
              </div>
              <p className="text-xs text-slate-400 mt-1">Retorno percentual médio sobre o faturamento</p>
            </div>

          </div>

          {/* Visual Recharts Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Financial Comparison Bar Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-500" />
                Visão Geral Financeira (R$)
              </h3>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      formatter={(val: any) => [formatCurrency(Number(val)), 'Valor']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Profitable Products List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  Destaques em Lucro Realizado
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('mais_vendidos')}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  Ver Ranking Completo →
                </button>
              </div>

              {topProfitableProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Nenhuma venda concluída com lucro ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {topProfitableProducts.map((item, idx) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.soldQty} unidade(s) vendida(s)</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-medium block">Lucro Gerado</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(item.profit)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
