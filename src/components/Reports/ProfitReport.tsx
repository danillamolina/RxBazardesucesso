import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart as PieIcon, 
  Download, 
  Sparkles, 
  Award, 
  ArrowUpRight,
  ShieldCheck,
  PackageCheck
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

export const ProfitReport: React.FC = () => {
  const { products, sales, financialSummary, stockMetrics } = useBazar();

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

  const CATEGORY_COLORS = ['#f43f5e', '#8b5cf6', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#06b6d4'];

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
    link.setAttribute('download', `Relatorio_Bazar_Secreto_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-rose-500" />
            Relatório de Lucro Total do Bazar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Análise consolidada do faturamento, margem real, lucro líquido e previsão de estoque
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl border border-slate-700 shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Download className="h-4 w-4 text-rose-400" />
          <span>Exportar Relatório (CSV)</span>
        </button>
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
          <p className="text-xs text-slate-400 mt-1">Retorno percentual médio sobre o custo</p>
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
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Produtos Mais Lucrativos do Bazar
          </h3>

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
  );
};
