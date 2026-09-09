import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  Send, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Phone, 
  Clock,
  ExternalLink,
  CreditCard,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { useBazar } from '../../context/BazarContext';
import { Sale, PaymentStatus, PaymentMethod } from '../../types';
import { 
  formatCurrency, 
  formatDate, 
  getPaymentMethodLabel, 
  getPaymentStatusLabel,
  createWhatsAppCustomerSummaryLink,
  generateCustomerSummaryText,
  createWhatsAppReceiptFromSale,
  generateOrderReceiptText
} from '../../utils/formatters';
import { generateCustomerPurchasesPdf } from '../../utils/pdfGenerator';

interface CustomerAggregated {
  customerName: string;
  phone?: string;
  address?: string;
  deliveryMethod?: string;
  notes?: string;
  sales: Sale[];
  totalSpent: number;
  totalPaid: number;
  totalPending: number;
  totalPieces: number;
  ordersCount: number;
  lastPurchaseDate: string;
  overallStatus: 'quitado' | 'pendente' | 'parcial';
}

export const CustomerPurchasesReport: React.FC = () => {
  const { sales, storeInfo, editions, activeEditionId } = useBazar();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'quitado' | 'pendente'>('todos');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'todos'>('todos');
  const [sortBy, setSortBy] = useState<'maior_valor' | 'mais_recente' | 'nome' | 'maior_pendente' | 'mais_pedidos'>('maior_valor');
  const [expandedCustomers, setExpandedCustomers] = useState<Record<string, boolean>>({});
  const [copiedCustomer, setCopiedCustomer] = useState<string | null>(null);
  const [copiedSaleId, setCopiedSaleId] = useState<string | null>(null);

  const activeEditionName = editions.find((e) => e.id === activeEditionId)?.name || 'Geral';

  // Group all sales by customer
  const allCustomers = useMemo(() => {
    const map: Record<string, CustomerAggregated> = {};

    sales.forEach((s) => {
      const nameKey = (s.customerName || 'Cliente sem nome').trim();
      if (!map[nameKey]) {
        map[nameKey] = {
          customerName: nameKey,
          phone: s.customerPhone,
          address: s.customerAddress,
          deliveryMethod: s.deliveryMethod,
          notes: s.customerNotes,
          sales: [],
          totalSpent: 0,
          totalPaid: 0,
          totalPending: 0,
          totalPieces: 0,
          ordersCount: 0,
          lastPurchaseDate: s.saleDate,
          overallStatus: 'quitado',
        };
      }

      map[nameKey].sales.push(s);
      map[nameKey].totalSpent += s.totalAmount;
      map[nameKey].totalPieces += s.quantitySold;
      map[nameKey].ordersCount += 1;

      if (s.paymentStatus === 'pago') {
        map[nameKey].totalPaid += s.totalAmount;
      } else if (s.paymentStatus === 'parcial') {
        map[nameKey].totalPaid += s.amountPaid || 0;
        map[nameKey].totalPending += s.remainingBalance || 0;
      } else if (s.paymentStatus === 'pendente' || s.paymentStatus === 'fiado') {
        map[nameKey].totalPending += s.totalAmount;
      }

      if (new Date(s.saleDate) > new Date(map[nameKey].lastPurchaseDate)) {
        map[nameKey].lastPurchaseDate = s.saleDate;
      }

      if (!map[nameKey].phone && s.customerPhone) map[nameKey].phone = s.customerPhone;
      if (!map[nameKey].address && s.customerAddress) map[nameKey].address = s.customerAddress;
      if (!map[nameKey].deliveryMethod && s.deliveryMethod) map[nameKey].deliveryMethod = s.deliveryMethod;
    });

    // Compute overall status for each client
    Object.values(map).forEach((c) => {
      if (c.totalPending <= 0.01) {
        c.overallStatus = 'quitado';
      } else if (c.totalPaid <= 0.01) {
        c.overallStatus = 'pendente';
      } else {
        c.overallStatus = 'parcial';
      }
      // Sort client's internal sales from newest to oldest
      c.sales.sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
    });

    return Object.values(map);
  }, [sales]);

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    return allCustomers
      .filter((c) => {
        // Status filter
        if (statusFilter === 'quitado' && c.overallStatus !== 'quitado') return false;
        if (statusFilter === 'pendente' && c.overallStatus === 'quitado') return false;

        // Payment method filter (matches if customer has at least one order with this method)
        if (methodFilter !== 'todos') {
          const hasMethod = c.sales.some((s) => s.paymentMethod === methodFilter);
          if (!hasMethod) return false;
        }

        // Search text
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchesName = c.customerName.toLowerCase().includes(q);
          const matchesPhone = c.phone ? c.phone.toLowerCase().includes(q) : false;
          const matchesAddress = c.address ? c.address.toLowerCase().includes(q) : false;
          const matchesProduct = c.sales.some((s) => {
            const mainMatch = s.productName.toLowerCase().includes(q);
            const itemsMatch = s.items?.some((i) => i.productName.toLowerCase().includes(q));
            return mainMatch || itemsMatch;
          });
          if (!matchesName && !matchesPhone && !matchesAddress && !matchesProduct) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'maior_valor') return b.totalSpent - a.totalSpent;
        if (sortBy === 'maior_pendente') return b.totalPending - a.totalPending;
        if (sortBy === 'mais_pedidos') return b.ordersCount - a.ordersCount;
        if (sortBy === 'nome') return a.customerName.localeCompare(b.customerName, 'pt-BR');
        if (sortBy === 'mais_recente') {
          return new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime();
        }
        return 0;
      });
  }, [allCustomers, search, statusFilter, methodFilter, sortBy]);

  // Overall KPIs
  const totalClientsCount = allCustomers.length;
  const totalOrdersCount = sales.length;
  const grandTotalSpent = allCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
  const grandTotalPaid = allCustomers.reduce((acc, c) => acc + c.totalPaid, 0);
  const grandTotalPending = allCustomers.reduce((acc, c) => acc + c.totalPending, 0);
  const totalPiecesSold = allCustomers.reduce((acc, c) => acc + c.totalPieces, 0);
  const averageTicket = totalClientsCount > 0 ? grandTotalSpent / totalClientsCount : 0;

  // Toggle single customer expansion
  const toggleExpand = (name: string) => {
    setExpandedCustomers((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Expand all / collapse all
  const expandAll = () => {
    const next: Record<string, boolean> = {};
    filteredCustomers.forEach((c) => {
      next[c.customerName] = true;
    });
    setExpandedCustomers(next);
  };

  const collapseAll = () => {
    setExpandedCustomers({});
  };

  // Copy customer statement
  const handleCopyCustomerStatement = (c: CustomerAggregated) => {
    const text = generateCustomerSummaryText(c.customerName, c.sales, storeInfo);
    navigator.clipboard.writeText(text);
    setCopiedCustomer(c.customerName);
    setTimeout(() => setCopiedCustomer(null), 3000);
  };

  // Copy single order receipt
  const handleCopyOrderReceipt = (s: Sale) => {
    const text = generateOrderReceiptText(s, storeInfo);
    navigator.clipboard.writeText(text);
    setCopiedSaleId(s.id);
    setTimeout(() => setCopiedSaleId(null), 3000);
  };

  // Export to PDF
  const handleExportPdf = () => {
    // If user filtered, we pass the sales of the filtered customers
    const filteredSalesIds = new Set(filteredCustomers.flatMap((c) => c.sales.map((s) => s.id)));
    const targetSales = sales.filter((s) => filteredSalesIds.has(s.id));
    generateCustomerPurchasesPdf(targetSales.length > 0 ? targetSales : sales, activeEditionName);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Cliente',
      'Telefone',
      'Endereço',
      'Data da Compra',
      'ID Venda',
      'Produtos Comprados',
      'Qtd Peças',
      'Forma de Pagamento',
      'Status',
      'Total da Compra (R$)',
      'Valor Pago (R$)',
      'Saldo a Pagar (R$)',
    ];

    const rows: string[][] = [];

    filteredCustomers.forEach((c) => {
      c.sales.forEach((s) => {
        let itemsList = '';
        if (s.items && s.items.length > 0) {
          itemsList = s.items.map((i) => `${i.quantitySold}x ${i.productName} (${formatCurrency(i.unitBazarPrice)})`).join(' | ');
        } else {
          itemsList = `${s.quantitySold}x ${s.productName} (${formatCurrency(s.unitBazarPrice)})`;
        }

        const paid = s.paymentStatus === 'pago' ? s.totalAmount : (s.amountPaid || 0);
        const pending = s.paymentStatus === 'pago' ? 0 : (s.remainingBalance || (s.totalAmount - paid));

        rows.push([
          `"${c.customerName}"`,
          c.phone || '',
          `"${c.address || ''}"`,
          formatDate(s.saleDate),
          s.id,
          `"${itemsList}"`,
          String(s.quantitySold),
          getPaymentMethodLabel(s.paymentMethod),
          getPaymentStatusLabel(s.paymentStatus).label,
          s.totalAmount.toFixed(2),
          paid.toFixed(2),
          pending.toFixed(2),
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_Clientes_Compras_Bazar_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Title and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-sky-500" />
            Relatório de Clientes e Compras no Bazar
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detalhamento de cada cliente e as compras realizadas no bazar, peças adquiridas, pagamentos e saldos
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportPdf}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-lg shadow-sky-600/20 flex items-center gap-2 transition active:scale-95"
            title="Gera o PDF consolidado com todos os clientes e compras"
          >
            <FileText className="h-4 w-4" />
            <span>Exportar PDF do Relatório</span>
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

      {/* Hero KPIs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Clientes</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{totalClientsCount}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{totalOrdersCount} compras feitas</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Peças Compradas</span>
          <span className="text-xl font-black text-sky-600 dark:text-sky-400 mt-1 block">{totalPiecesSold} un</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Total de itens</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Total Comprado</span>
          <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">{formatCurrency(grandTotalSpent)}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Faturamento</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">Total Recebido</span>
          <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{formatCurrency(grandTotalPaid)}</span>
          <span className="text-[11px] text-emerald-700/70 dark:text-emerald-300/70">Em caixa / quitado</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">Total Fiado / Pendente</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{formatCurrency(grandTotalPending)}</span>
          <span className="text-[11px] text-amber-700/70 dark:text-amber-300/70">Saldo a receber</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">Ticket Médio</span>
          <span className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1 block">{formatCurrency(averageTicket)}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Por cliente</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, telefone ou produto comprado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm font-medium focus:outline-none focus:border-sky-500 transition text-slate-900 dark:text-white"
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

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-200"
            >
              <option value="todos">Todos Status</option>
              <option value="quitado">✓ Quitado / Pago</option>
              <option value="pendente">⏳ Com Pendência / Fiado</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="sm:col-span-2">
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-200"
            >
              <option value="todos">Todas Formas Pag.</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="promissoria">Fiado / Promissória</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-sky-500 text-slate-800 dark:text-slate-200"
            >
              <option value="maior_valor">Ordenar: Maior Valor Comprado</option>
              <option value="maior_pendente">Ordenar: Maior Saldo Pendente</option>
              <option value="mais_pedidos">Ordenar: Mais Compras/Itens</option>
              <option value="mais_recente">Ordenar: Mais Recente</option>
              <option value="nome">Ordenar: Nome A-Z</option>
            </select>
          </div>

        </div>

        {/* Toolbar bottom: Results count and Expand/Collapse buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            Exibindo <strong>{filteredCustomers.length}</strong> de <strong>{allCustomers.length}</strong> clientes
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={expandAll}
              className="text-sky-600 dark:text-sky-400 hover:underline font-bold"
            >
              Expandir Todos os Pedidos
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="text-slate-500 hover:underline font-semibold"
            >
              Recolher
            </button>
          </div>
        </div>
      </div>

      {/* Customers and Purchases Detailed List */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
          <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">Nenhum cliente encontrado</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Tente alterar os termos da busca ou os filtros de status e forma de pagamento.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCustomers.map((c, index) => {
            const isExpanded = !!expandedCustomers[c.customerName];
            const isFullyPaid = c.totalPending <= 0.01;
            const waSummaryLink = c.phone ? createWhatsAppCustomerSummaryLink(c.customerName, c.phone, c.sales, storeInfo) : '#';

            return (
              <div
                key={c.customerName}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden transition"
              >
                {/* Customer Summary Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  
                  {/* Left: Customer Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        #{index + 1}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {c.customerName}
                      </h4>
                      <span
                        className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          isFullyPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {isFullyPaid ? '✓ 100% Quitado' : `⏳ Saldo: ${formatCurrency(c.totalPending)}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                      {c.phone && (
                        <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                          {c.phone}
                        </span>
                      )}

                      {c.address && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-rose-500" />
                          {c.address} {c.deliveryMethod ? `(${c.deliveryMethod})` : ''}
                        </span>
                      )}

                      {c.notes && (
                        <span className="italic text-slate-400">
                          Obs: {c.notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Badges Overview */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Compras Feitas</span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                        {c.ordersCount} ({c.totalPieces} peças)
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Gasto</span>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrency(c.totalSpent)}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase block">Já Pago</span>
                      <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.totalPaid)}
                      </span>
                    </div>

                    {c.totalPending > 0.01 && (
                      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-amber-600 uppercase block">A Receber</span>
                        <span className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400">
                          {formatCurrency(c.totalPending)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions & Expand Button */}
                  <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
                    <button
                      type="button"
                      onClick={() => handleCopyCustomerStatement(c)}
                      className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
                      title="Copiar extrato consolidado com chave PIX e endereço"
                    >
                      {copiedCustomer === c.customerName ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copiar Extrato c/ PIX</span>
                        </>
                      )}
                    </button>

                    {c.phone && (
                      <a
                        href={waSummaryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 sm:px-3 sm:py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm active:scale-95"
                        title="Enviar resumo completo pelo WhatsApp"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>WhatsApp</span>
                        <ExternalLink className="h-3 w-3 opacity-80" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleExpand(c.customerName)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 border border-sky-200 dark:border-sky-800 transition flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Ocultar' : 'Ver Compras'} ({c.sales.length})</span>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                </div>

                {/* Expanded Purchases List for This Customer */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-sky-500" />
                        Histórico de Pedidos Realizados no Bazar ({c.sales.length})
                      </span>
                      <span className="text-slate-400 font-normal">
                        Última compra em {formatDate(c.lastPurchaseDate)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {c.sales.map((sale, saleIdx) => {
                        const paidAmount = sale.paymentStatus === 'pago' ? sale.totalAmount : (sale.amountPaid || 0);
                        const pendingAmount = sale.paymentStatus === 'pago' ? 0 : (sale.remainingBalance || (sale.totalAmount - paidAmount));
                        const statusObj = getPaymentStatusLabel(sale.paymentStatus);
                        const methodLabel = getPaymentMethodLabel(sale.paymentMethod);
                        const installmentsText = sale.installmentsCount && sale.installmentsCount > 1
                          ? ` em ${sale.installmentsCount}x de ${formatCurrency(sale.installmentValue || sale.totalAmount / sale.installmentsCount)}`
                          : '';

                        return (
                          <div
                            key={sale.id}
                            className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 sm:p-4 space-y-3"
                          >
                            {/* Sale Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-700/60 pb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  {formatDate(sale.saleDate)}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  (ID: {sale.id.slice(0, 8)})
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    sale.paymentStatus === 'pago'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : sale.paymentStatus === 'parcial'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  }`}
                                >
                                  {statusObj.label}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleCopyOrderReceipt(sale)}
                                  className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-sky-600 flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                  title="Copiar comprovante deste pedido com chave PIX"
                                >
                                  {copiedSaleId === sale.id ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-500" />
                                      <span className="text-emerald-600 font-bold">Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3 text-slate-400" />
                                      <span>Copiar Recibo</span>
                                    </>
                                  )}
                                </button>

                                {sale.customerPhone && (
                                  <a
                                    href={createWhatsAppReceiptFromSale(sale, storeInfo)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                                    title="Enviar comprovante do pedido no WhatsApp"
                                  >
                                    <Send className="h-3 w-3" />
                                    <span>WhatsApp</span>
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Products Bought Table */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                Peças Compradas no Bazar:
                              </span>

                              {sale.items && sale.items.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                                  {sale.items.map((item, itemIdx) => (
                                    <div
                                      key={itemIdx}
                                      className="p-2.5 text-xs flex items-center justify-between gap-2 flex-wrap"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                                          {item.quantitySold}x
                                        </span>
                                        <div>
                                          <span className="font-bold text-slate-900 dark:text-white">
                                            {item.productName}
                                          </span>
                                          {item.sizeColor && (
                                            <span className="text-slate-400 text-[11px] ml-1.5">
                                              ({item.sizeColor})
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-right">
                                        <span className="text-slate-400 text-[11px] mr-2">
                                          {formatCurrency(item.unitBazarPrice)} un.
                                        </span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                          {formatCurrency(item.quantitySold * item.unitBazarPrice)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
                                      {sale.quantitySold}x
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">
                                      {sale.productName}
                                    </span>
                                  </div>
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(sale.totalAmount)}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Sale Payment and Values Footer */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200/60 dark:border-slate-700/60">
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                                <span>
                                  Pagamento: <strong>{methodLabel}{installmentsText}</strong>
                                </span>
                                {sale.discount ? (
                                  <span className="text-rose-500 font-semibold ml-2">
                                    (Desconto: {formatCurrency(sale.discount)})
                                  </span>
                                ) : null}
                              </div>

                              <div className="flex items-center gap-3 font-mono">
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase font-sans mr-1">Total:</span>
                                  <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(sale.totalAmount)}</strong>
                                </div>

                                <div>
                                  <span className="text-[10px] text-emerald-500 uppercase font-sans mr-1">Pago:</span>
                                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(paidAmount)}</strong>
                                </div>

                                {pendingAmount > 0.01 && (
                                  <div>
                                    <span className="text-[10px] text-amber-500 uppercase font-sans mr-1">A Pagar:</span>
                                    <strong className="text-amber-600 dark:text-amber-400 font-bold">{formatCurrency(pendingAmount)}</strong>
                                  </div>
                                )}
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
