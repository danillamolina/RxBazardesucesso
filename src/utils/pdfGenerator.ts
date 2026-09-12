import { Product, Sale, StockMetrics, FinancialSummary, BazarEdition } from '../types';
import { formatCurrency, formatDate, getPaymentMethodLabel, getPaymentStatusLabel, formatPercent } from './formatters';

interface PrintDocumentOptions {
  title: string;
  subtitle?: string;
  editionName?: string;
  bodyHtml: string;
}

function openPrintWindow(options: PrintDocumentOptions) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups no seu navegador para gerar o PDF.');
    return;
  }

  const dateNow = formatDate(new Date().toISOString());

  const fullHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>${options.title} - Rx do Bazar de Sucesso</title>
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }
          * {
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          }
          body {
            color: #0f172a;
            background-color: #ffffff;
            font-size: 11pt;
            line-height: 1.4;
            margin: 0;
            padding: 0;
          }
          .header-banner {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .brand-title {
            font-size: 18pt;
            font-weight: 800;
            color: #e11d48;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: -0.5px;
          }
          .brand-subtitle {
            font-size: 9pt;
            color: #64748b;
            margin-top: 2px;
          }
          .doc-info {
            text-align: right;
            font-size: 9pt;
            color: #475569;
          }
          .doc-info strong {
            color: #0f172a;
          }
          .doc-title {
            font-size: 14pt;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 16px;
            padding-bottom: 6px;
            border-bottom: 1px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-size: 8pt;
            font-weight: 600;
            text-transform: uppercase;
          }
          .badge-rose { background-color: #ffe4e6; color: #9f1239; }
          .badge-emerald { background-color: #d1fae5; color: #065f46; }
          .badge-amber { background-color: #fef3c7; color: #92400e; }
          .badge-purple { background-color: #f3e8ff; color: #6b21a8; }
          .badge-slate { background-color: #f1f5f9; color: #334155; }

          .grid-metrics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .metric-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
          }
          .metric-label {
            font-size: 8pt;
            font-weight: 600;
            color: #64748b;
            text-transform: uppercase;
          }
          .metric-value {
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            margin-top: 4px;
          }
          .metric-sub {
            font-size: 8pt;
            color: #64748b;
            margin-top: 2px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            margin-bottom: 20px;
            font-size: 9pt;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 2px solid #cbd5e1;
            text-transform: uppercase;
            font-size: 8pt;
          }
          td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .font-mono { font-family: monospace; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: 700; }

          .footer-note {
            margin-top: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-size: 8pt;
            color: #94a3b8;
            display: flex;
            justify-content: space-between;
          }

          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            thead { display: table-header-group; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #0f172a; color: white; padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px;">
          <div>
            <strong>Documento pronto para impressão ou download!</strong>
            <div style="font-size: 12px; opacity: 0.8;">Clique no botão ao lado ou pressione Ctrl+P para salvar como PDF.</div>
          </div>
          <button onclick="window.print()" style="background: #e11d48; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer;">
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>

        <div class="header-banner">
          <div>
            <h1 class="brand-title">Rx do Bazar de Sucesso</h1>
            <div class="brand-subtitle">Estoque, Vendas & Lucro em Tempo Real</div>
          </div>
          <div class="doc-info">
            <div>Edição: <strong>${options.editionName || 'Geral'}</strong></div>
            <div>Data do Relatório: <strong>${dateNow}</strong></div>
          </div>
        </div>

        <div class="doc-title">
          <span>${options.title}</span>
          ${options.subtitle ? `<span class="badge badge-rose">${options.subtitle}</span>` : ''}
        </div>

        ${options.bodyHtml}

        <div class="footer-note">
          <span>Rx do Bazar de Sucesso — Feito por @danillafinancas © Todos os direitos reservados</span>
          <span>Gerado em ${dateNow}</span>
        </div>

        <script>
          // Automatically focus window for quick print
          window.focus();
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * 1. PDF do Bazar / Estoque (Catálogo e Inventário)
 */
export function generateStockPdf(products: Product[], stockMetrics: StockMetrics, editionName?: string) {
  let tableRows = '';

  products.forEach((p) => {
    const totalCost = p.costPrice * p.quantity;
    const totalBazar = p.bazarPrice * p.quantity;
    const margin = p.profitMarginPercent;

    tableRows += `
      <tr>
        <td>
          <div class="font-bold" style="color: #0f172a;">${p.name}</div>
          <div style="font-size: 8pt; color: #64748b;">${p.sizeColor ? `Tam/Cor: ${p.sizeColor} • ` : ''}Cat: ${p.category}</div>
        </td>
        <td class="text-center font-bold" style="font-size: 10pt;">${p.quantity} un</td>
        <td class="text-right font-mono">${formatCurrency(p.costPrice)}</td>
        <td class="text-right font-mono font-semibold" style="color: #e11d48;">${formatCurrency(p.bazarPrice)}</td>
        <td class="text-right font-mono" style="color: #059669; font-weight: 600;">+${margin.toFixed(0)}%</td>
        <td class="text-right font-mono">${formatCurrency(totalCost)}</td>
        <td class="text-right font-mono font-bold">${formatCurrency(totalBazar)}</td>
      </tr>
    `;
  });

  const bodyHtml = `
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">Total de Peças</div>
        <div class="metric-value">${stockMetrics.totalItemsInStock} un</div>
        <div class="metric-sub">${stockMetrics.totalProductsCount} produtos cadastrados</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Custo do Estoque</div>
        <div class="metric-value" style="color: #475569;">${formatCurrency(stockMetrics.totalCostValue)}</div>
        <div class="metric-sub">Investimento total</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Valor Potencial</div>
        <div class="metric-value" style="color: #e11d48;">${formatCurrency(stockMetrics.totalBazarValue)}</div>
        <div class="metric-sub">Venda total no Bazar</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Lucro Potencial</div>
        <div class="metric-value" style="color: #059669;">${formatCurrency(stockMetrics.totalPotentialProfit)}</div>
        <div class="metric-sub">${stockMetrics.lowStockItemsCount} com estoque baixo</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th class="text-center">Qtd</th>
          <th class="text-right">Custo Un.</th>
          <th class="text-right">Preço Bazar</th>
          <th class="text-right">Margem</th>
          <th class="text-right">Custo Total</th>
          <th class="text-right">Valor Total</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="7" class="text-center" style="padding: 20px;">Nenhum produto cadastrado.</td></tr>'}
      </tbody>
    </table>
  `;

  openPrintWindow({
    title: 'Relatório de Estoque & Inventário do Bazar',
    subtitle: `${stockMetrics.totalItemsInStock} Peças em Estoque`,
    editionName,
    bodyHtml,
  });
}

/**
 * 2. PDF de Relatório de Vendas
 */
export function generateSalesPdf(sales: Sale[], editionName?: string) {
  let tableRows = '';
  let grandTotal = 0;
  let totalPaid = 0;
  let totalPending = 0;

  sales.forEach((s) => {
    grandTotal += s.totalAmount;
    if (s.paymentStatus === 'pago') {
      totalPaid += s.totalAmount;
    } else if (s.paymentStatus === 'parcial') {
      totalPaid += s.amountPaid || 0;
      totalPending += s.remainingBalance || 0;
    } else if (s.paymentStatus === 'pendente' || s.paymentStatus === 'fiado') {
      totalPending += s.totalAmount;
    }

    const statusObj = getPaymentStatusLabel(s.paymentStatus);
    const methodStr = getPaymentMethodLabel(s.paymentMethod);

    let itemsStr = '';
    if (s.items && s.items.length > 0) {
      itemsStr = s.items.map((i) => `${i.quantitySold}x ${i.productName}`).join(', ');
    } else {
      itemsStr = `${s.quantitySold}x ${s.productName}`;
    }

    tableRows += `
      <tr>
        <td style="white-space: nowrap; font-size: 8pt; color: #64748b;">${formatDate(s.saleDate)}</td>
        <td>
          <div class="font-bold">${s.customerName}</div>
          <div style="font-size: 8pt; color: #475569;">${s.customerPhone || 'Sem telefone'}</div>
        </td>
        <td style="font-size: 8.5pt;">${itemsStr}</td>
        <td>${methodStr}</td>
        <td class="text-center">
          <span class="badge ${
            s.paymentStatus === 'pago'
              ? 'badge-emerald'
              : s.paymentStatus === 'parcial'
              ? 'badge-amber'
              : s.paymentStatus === 'fiado'
              ? 'badge-purple'
              : 'badge-slate'
          }">
            ${statusObj.label}
          </span>
        </td>
        <td class="text-right font-mono font-bold">${formatCurrency(s.totalAmount)}</td>
        <td class="text-right font-mono" style="color: #059669;">${formatCurrency(s.amountPaid || (s.paymentStatus === 'pago' ? s.totalAmount : 0))}</td>
        <td class="text-right font-mono" style="color: #d97706;">${formatCurrency(s.remainingBalance || 0)}</td>
      </tr>
    `;
  });

  const bodyHtml = `
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">Total de Vendas</div>
        <div class="metric-value">${sales.length} pedidos</div>
        <div class="metric-sub">Faturamento Bruto</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Faturamento Total</div>
        <div class="metric-value" style="color: #0f172a;">${formatCurrency(grandTotal)}</div>
        <div class="metric-sub">Soma dos pedidos</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Valor Já Recebido</div>
        <div class="metric-value" style="color: #059669;">${formatCurrency(totalPaid)}</div>
        <div class="metric-sub">Em caixa</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Fiado / A Receber</div>
        <div class="metric-value" style="color: #d97706;">${formatCurrency(totalPending)}</div>
        <div class="metric-sub">Pendente de quitação</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Data/Hora</th>
          <th>Cliente</th>
          <th>Itens</th>
          <th>Forma Pag.</th>
          <th class="text-center">Status</th>
          <th class="text-right">Total Pedido</th>
          <th class="text-right">Pago</th>
          <th class="text-right">A Receber</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows || '<tr><td colspan="8" class="text-center" style="padding: 20px;">Nenhuma venda registrada.</td></tr>'}
      </tbody>
    </table>
  `;

  openPrintWindow({
    title: 'Relatório Detalhado de Vendas',
    subtitle: `${sales.length} Pedidos Registrados`,
    editionName,
    bodyHtml,
  });
}

/**
 * 3. PDF do Resumo do Bazar (Resumo Executivo / Financeiro)
 */
export function generateExecutiveSummaryPdf(
  products: Product[],
  sales: Sale[],
  stockMetrics: StockMetrics,
  financialSummary: FinancialSummary,
  editions: BazarEdition[],
  editionName?: string
) {
  // Method breakdown
  const methodTotals: Record<string, number> = {};
  sales.forEach((s) => {
    if (s.paymentStatus !== 'cancelado') {
      const method = s.paymentMethod;
      methodTotals[method] = (methodTotals[method] || 0) + s.totalAmount;
    }
  });

  let methodRows = '';
  Object.entries(methodTotals).forEach(([method, total]) => {
    methodRows += `
      <tr>
        <td>${getPaymentMethodLabel(method as any)}</td>
        <td class="text-right font-mono font-bold">${formatCurrency(total)}</td>
      </tr>
    `;
  });

  const bodyHtml = `
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">
        1. Desempenho Financeiro & Vendas
      </h3>
      <div class="grid-metrics">
        <div class="metric-card">
          <div class="metric-label">Faturamento Total</div>
          <div class="metric-value" style="color: #0f172a;">${formatCurrency(financialSummary.totalRevenueSold)}</div>
          <div class="metric-sub">${financialSummary.totalSalesCount} vendas no total</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Recebido em Caixa</div>
          <div class="metric-value" style="color: #059669;">${formatCurrency(financialSummary.totalRevenuePaid)}</div>
          <div class="metric-sub">${financialSummary.paidSalesCount} vendas quitadas</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Pendente / Fiado</div>
          <div class="metric-value" style="color: #d97706;">${formatCurrency(financialSummary.totalRevenuePending)}</div>
          <div class="metric-sub">${financialSummary.pendingSalesCount} a receber</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Lucro Líquido Realizado</div>
          <div class="metric-value" style="color: #e11d48;">${formatCurrency(financialSummary.totalNetProfitRealized)}</div>
          <div class="metric-sub">Margem Média: ${financialSummary.averageMarginPercent.toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">
        2. Situação do Estoque Parado & Potencial
      </h3>
      <div class="grid-metrics">
        <div class="metric-card">
          <div class="metric-label">Total de Produtos</div>
          <div class="metric-value">${stockMetrics.totalProductsCount} itens</div>
          <div class="metric-sub">${stockMetrics.totalItemsInStock} unidades físicas</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Custo Parado</div>
          <div class="metric-value" style="color: #475569;">${formatCurrency(stockMetrics.totalCostValue)}</div>
          <div class="metric-sub">Capital investido</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Valor de Venda Estoque</div>
          <div class="metric-value" style="color: #2563eb;">${formatCurrency(stockMetrics.totalBazarValue)}</div>
          <div class="metric-sub">Potencial do estoque</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Lucro Potencial do Estoque</div>
          <div class="metric-value" style="color: #059669;">${formatCurrency(stockMetrics.totalPotentialProfit)}</div>
          <div class="metric-sub">Se 100% for vendido</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
      <div>
        <h3 style="font-size: 10pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">
          Faturamento por Meio de Pagamento
        </h3>
        <table>
          <thead>
            <tr>
              <th>Forma de Pagamento</th>
              <th class="text-right">Total Faturado</th>
            </tr>
          </thead>
          <tbody>
            ${methodRows || '<tr><td colspan="2" class="text-center">Sem dados.</td></tr>'}
          </tbody>
        </table>
      </div>

      <div>
        <h3 style="font-size: 10pt; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 10px;">
          Resumo da Edição
        </h3>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; font-size: 9pt; space-y: 6px;">
          <div>Edição Ativa: <strong>${editionName || 'Todas'}</strong></div>
          <div>Custo das Mercadorias Vendidas (CMV): <strong>${formatCurrency(financialSummary.totalCostOfGoodsSold)}</strong></div>
          <div>Total de Edições Cadastradas: <strong>${editions.length}</strong></div>
          <div style="margin-top: 8px; font-size: 8pt; color: #64748b;">
            Relatório gerado pelo sistema Rx do Bazar de Sucesso (por @danillafinancas) com consolidação em tempo real.
          </div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow({
    title: 'Resumo Executivo & Balanço do Bazar',
    subtitle: 'Relatório Gerencial Consolidado',
    editionName,
    bodyHtml,
  });
}

/**
 * 4. PDF do Relatório Completo de Lucro & Faturamento (ProfitReport)
 */
export function generateProfitReportPdf(
  products: Product[],
  sales: Sale[],
  financialSummary: FinancialSummary,
  stockMetrics: StockMetrics,
  editionName?: string
) {
  // Category breakdown calculation
  const categoryProfitMap: Record<string, { revenue: number; cost: number; profit: number; count: number }> = {};
  sales.forEach((s) => {
    if (s.paymentStatus !== 'cancelado') {
      const prod = products.find((p) => p.id === s.productId);
      const cat = prod?.category || 'Outros';
      const cost = prod ? prod.costPrice * s.quantitySold : 0;

      if (!categoryProfitMap[cat]) {
        categoryProfitMap[cat] = { revenue: 0, cost: 0, profit: 0, count: 0 };
      }
      categoryProfitMap[cat].revenue += s.totalAmount;
      categoryProfitMap[cat].cost += cost;
      categoryProfitMap[cat].profit += s.netProfit;
      categoryProfitMap[cat].count += s.quantitySold;
    }
  });

  let categoryRows = '';
  Object.entries(categoryProfitMap).forEach(([cat, val]) => {
    const margin = val.cost > 0 ? (val.profit / val.cost) * 100 : 0;
    categoryRows += `
      <tr>
        <td class="font-bold">${cat}</td>
        <td class="text-center">${val.count} un</td>
        <td class="text-right font-mono">${formatCurrency(val.cost)}</td>
        <td class="text-right font-mono font-bold">${formatCurrency(val.revenue)}</td>
        <td class="text-right font-mono font-bold" style="color: #059669;">${formatCurrency(val.profit)}</td>
        <td class="text-right font-mono" style="color: #6b21a8; font-weight: 600;">+${margin.toFixed(1)}%</td>
      </tr>
    `;
  });

  // Top profitable products
  const productProfitMap: Record<string, { name: string; profit: number; soldQty: number; revenue: number }> = {};
  sales.forEach((s) => {
    if (s.paymentStatus === 'pago') {
      if (!productProfitMap[s.productName]) {
        productProfitMap[s.productName] = { name: s.productName, profit: 0, soldQty: 0, revenue: 0 };
      }
      productProfitMap[s.productName].profit += s.netProfit;
      productProfitMap[s.productName].soldQty += s.quantitySold;
      productProfitMap[s.productName].revenue += s.totalAmount;
    }
  });

  const topProducts = Object.values(productProfitMap)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8);

  let topProductRows = '';
  topProducts.forEach((item, index) => {
    topProductRows += `
      <tr>
        <td class="text-center font-bold" style="color: #e11d48;">#${index + 1}</td>
        <td class="font-bold">${item.name}</td>
        <td class="text-center">${item.soldQty} un</td>
        <td class="text-right font-mono font-semibold">${formatCurrency(item.revenue)}</td>
        <td class="text-right font-mono font-bold" style="color: #059669;">${formatCurrency(item.profit)}</td>
      </tr>
    `;
  });

  // Sales analytical listing
  let salesRows = '';
  sales.slice(0, 50).forEach((s) => {
    const statusObj = getPaymentStatusLabel(s.paymentStatus);
    const methodStr = getPaymentMethodLabel(s.paymentMethod);
    salesRows += `
      <tr>
        <td style="white-space: nowrap; font-size: 8pt; color: #64748b;">${formatDate(s.saleDate)}</td>
        <td class="font-semibold">${s.customerName}</td>
        <td>${s.quantitySold}x ${s.productName}</td>
        <td>${methodStr}</td>
        <td class="text-center">
          <span class="badge ${
            s.paymentStatus === 'pago'
              ? 'badge-emerald'
              : s.paymentStatus === 'parcial'
              ? 'badge-amber'
              : s.paymentStatus === 'fiado'
              ? 'badge-purple'
              : 'badge-slate'
          }">
            ${statusObj.label}
          </span>
        </td>
        <td class="text-right font-mono font-bold">${formatCurrency(s.totalAmount)}</td>
        <td class="text-right font-mono font-bold" style="color: #059669;">${formatCurrency(s.netProfit)}</td>
      </tr>
    `;
  });

  const bodyHtml = `
    <!-- Top KPI Grid -->
    <div class="grid-metrics" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 16px;">
      <div class="metric-card" style="border-left: 4px solid #059669; background: #f0fdf4;">
        <div class="metric-label" style="color: #065f46;">Lucro Líquido Realizado (Pago)</div>
        <div class="metric-value" style="color: #059669; font-size: 16pt;">${formatCurrency(financialSummary.totalNetProfitRealized)}</div>
        <div class="metric-sub" style="color: #047857; font-weight: 700;">Margem Média: ${formatPercent(financialSummary.averageMarginPercent)}</div>
      </div>
      <div class="metric-card" style="border-left: 4px solid #2563eb; background: #eff6ff;">
        <div class="metric-label" style="color: #1e40af;">Valor Total Vendido (Bruto)</div>
        <div class="metric-value" style="color: #1d4ed8; font-size: 16pt;">${formatCurrency(financialSummary.totalRevenueSold)}</div>
        <div class="metric-sub">${financialSummary.totalSalesCount} pedidos no total</div>
      </div>
      <div class="metric-card" style="border-left: 4px solid #d97706; background: #fffbeb;">
        <div class="metric-label" style="color: #92400e;">Valor a Receber (Pendente/Fiado)</div>
        <div class="metric-value" style="color: #b45309; font-size: 16pt;">${formatCurrency(financialSummary.totalRevenuePending)}</div>
        <div class="metric-sub">${financialSummary.pendingSalesCount} pedidos pendentes</div>
      </div>
    </div>

    <div class="grid-metrics" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 24px;">
      <div class="metric-card">
        <div class="metric-label">Valor Total Recebido (Em Caixa)</div>
        <div class="metric-value" style="color: #0f172a;">${formatCurrency(financialSummary.totalRevenuePaid)}</div>
        <div class="metric-sub">${financialSummary.paidSalesCount} pedidos quitados</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Custo dos Produtos Vendidos (CPV)</div>
        <div class="metric-value" style="color: #475569;">${formatCurrency(financialSummary.totalCostOfGoodsSold)}</div>
        <div class="metric-sub">Capital investido nas peças vendidas</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Estoque Atual em Peças</div>
        <div class="metric-value" style="color: #64748b;">${stockMetrics.totalItemsInStock} un</div>
        <div class="metric-sub">${stockMetrics.totalProductsCount} modelos (${formatCurrency(stockMetrics.totalBazarValue)} pot.)</div>
      </div>
    </div>

    <!-- Section: Category Performance -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        1. Desempenho & Lucratividade por Categoria
      </h3>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th class="text-center">Qtd Vendida</th>
            <th class="text-right">Custo Total</th>
            <th class="text-right">Faturamento</th>
            <th class="text-right">Lucro Líquido</th>
            <th class="text-right">Margem %</th>
          </tr>
        </thead>
        <tbody>
          ${categoryRows || '<tr><td colspan="6" class="text-center">Nenhuma venda registrada ainda.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Section: Top Profitable Products -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        2. Ranking dos Produtos Mais Lucrativos
      </h3>
      <table>
        <thead>
          <tr>
            <th class="text-center" style="width: 40px;">#</th>
            <th>Produto</th>
            <th class="text-center">Qtd Vendida</th>
            <th class="text-right">Faturamento Total</th>
            <th class="text-right">Lucro Gerado (R$)</th>
          </tr>
        </thead>
        <tbody>
          ${topProductRows || '<tr><td colspan="5" class="text-center">Nenhuma venda com lucro registrada ainda.</td></tr>'}
        </tbody>
      </table>
    </div>

    <!-- Section: Analytical Sales Listing -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 700; color: #1e293b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">
        3. Demonstrativo de Vendas Registradas
      </h3>
      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Cliente</th>
            <th>Produto / Itens</th>
            <th>Forma Pag.</th>
            <th class="text-center">Status</th>
            <th class="text-right">Total (R$)</th>
            <th class="text-right">Lucro Líquido</th>
          </tr>
        </thead>
        <tbody>
          ${salesRows || '<tr><td colspan="7" class="text-center">Nenhuma venda registrada ainda.</td></tr>'}
        </tbody>
      </table>
      ${sales.length > 50 ? `<p style="font-size: 8pt; color: #94a3b8; text-align: center;">(Exibindo as 50 vendas mais recentes. Para lista completa, exporte também o arquivo CSV).</p>` : ''}
    </div>
  `;

  openPrintWindow({
    title: 'Relatório Consolidado de Lucro & Faturamento',
    subtitle: `Lucro Realizado: ${formatCurrency(financialSummary.totalNetProfitRealized)}`,
    editionName,
    bodyHtml,
  });
}

/**
 * 5. PDF do Manual Prático do Usuário & Checklist Operacional
 */
export function generateUserGuidePdf(editionName?: string) {
  const bodyHtml = `
    <!-- Header Hero Banner -->
    <div style="background: linear-gradient(135deg, #1F2919 0%, #2A3722 50%, #3A452F 100%); color: #ffffff; padding: 18px 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #3A4A30;">
      <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #8FA079; margin-bottom: 4px;">
        Manual Prático do Usuário &bull; Versão Impressa Oficial
      </div>
      <h2 style="font-size: 16pt; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; letter-spacing: -0.5px;">
        Guia Completo do Rx do Bazar de Sucesso 🛍️
      </h2>
      <p style="font-size: 9.5pt; color: #D8C7AC; margin: 0; line-height: 1.4;">
        Passo a passo didático para organizar, precificar com fotos, divulgar na vitrine virtual, registrar vendas ágeis e garantir o <strong>lucro líquido no seu bolso</strong>.
      </p>
    </div>

    <!-- Principle Box: Regra do Lucro Real -->
    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-left: 5px solid #059669; border-radius: 8px; padding: 12px 16px; margin-bottom: 22px;">
      <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; color: #065f46; letter-spacing: 0.5px;">
        💡 Princípio Financeiro Fundamental
      </div>
      <div style="font-size: 11pt; font-weight: 800; color: #064e3b; margin-top: 2px;">
        Faturamento NÃO é Lucro: O que importa é o que sobra líquido no seu bolso!
      </div>
      <div style="font-size: 9pt; color: #047857; margin-top: 4px; line-height: 1.4;">
        Vender R$ 5.000 com custo de R$ 4.500 deixa apenas R$ 500 de lucro. O <strong>Rx do Bazar</strong> calcula e separa o custo de cada produto automaticamente para você saber com exatidão sua margem líquida real.
      </div>
    </div>

    <!-- Dica de Ouro Box: Cadastre Primeiro, Abra o Bazar Depois -->
    <div style="background: #fffbeb; border: 1.5px solid #fcd34d; border-left: 5px solid #d97706; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px;">
      <div style="font-size: 8pt; font-weight: 800; text-transform: uppercase; color: #92400e; letter-spacing: 0.5px;">
        ⭐ Dica de Ouro da Danilla &bull; Facilita Todo o Processo
      </div>
      <div style="font-size: 10.5pt; font-weight: 800; color: #78350f; margin-top: 2px;">
        Cadastre os Produtos Primeiro no Estoque, Depois Abra o Bazar!
      </div>
      <div style="font-size: 8.5pt; color: #92400e; margin-top: 3px; line-height: 1.4;">
        Cadastrar primeiro as peças no <strong>Estoque</strong> (com foto, preço de custo e valor promocional) deixa todo o seu catálogo pronto. Quando você for abrir o bazar (ou criar uma nova edição), basta selecionar os itens que vão participar com 1 clique, evitando correria e erros durante as vendas!
      </div>
    </div>

    <!-- Section 1: Fluxo Ideal em 8 Passos -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">
        1. Fluxo Ideal Recomendado (8 Passos Sequenciais)
      </h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px;">
        <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #059669; margin-bottom: 2px;">⭐ 1º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #065f46; margin-bottom: 4px;">1. Criar o Bazar</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Defina o evento, selecione os produtos participantes e gere o link exclusivo da edição.
          </div>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #d97706; margin-bottom: 2px;">2º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #b45309; margin-bottom: 4px;">2. Produtos</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Cadastre as peças com fotos nítidas, custo e preço promocional com cálculo automático De/Por.
          </div>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #2563eb; margin-bottom: 2px;">3º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #1d4ed8; margin-bottom: 4px;">3. Vendas</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Registre no caixa ágil em segundos com baixa automática de estoque e cálculo de margem.
          </div>
        </div>
        <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #e11d48; margin-bottom: 2px;">4º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #be123c; margin-bottom: 4px;">4. Vitrine</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Envie o link exclusivo da edição com sacola de compras e fechamento direto no WhatsApp.
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #0d9488; margin-bottom: 2px;">5º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #0f766e; margin-bottom: 4px;">5. Relatórios</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Analise faturamento, ticket médio, formas de pagamento e o Lucro Líquido Real no bolso.
          </div>
        </div>
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #4f46e5; margin-bottom: 2px;">6º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #4338ca; margin-bottom: 4px;">6. Dados da Loja</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Mantenha chave PIX, telefone, Instagram e o backup dos dados sempre atualizados.
          </div>
        </div>
        <div style="background: #f7fee7; border: 1px solid #d9f99d; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #65a30d; margin-bottom: 2px;">7º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #4d7c0f; margin-bottom: 4px;">7. Manual de Uso</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Consulte este guia a qualquer momento e imprima em PDF para treinar sua equipe.
          </div>
        </div>
        <div style="background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px;">
          <div style="font-size: 7.5pt; font-weight: 800; text-transform: uppercase; color: #c2410c; margin-bottom: 2px;">8º Passo</div>
          <div style="font-size: 9pt; font-weight: 800; color: #9a3412; margin-bottom: 4px;">8. Próximos Passos</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Cursos de precificação, gestão de estoque e mentoria VIP exclusiva com Danilla Finanças.
          </div>
        </div>
      </div>
    </div>

    <!-- Section 2: CHECKLIST OPERACIONAL (Destaque Principal) -->
    <div style="margin-bottom: 24px; page-break-inside: avoid;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
        <span>2. Checklist Operacional do Bazar de Sucesso</span>
        <span style="font-size: 8pt; color: #64748b; font-weight: 600; text-transform: none;">Marque conforme executar:</span>
      </h3>
      
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
        
        <!-- Fase 1 -->
        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px;">
          <div style="font-size: 8.5pt; font-weight: 800; color: #92400e; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #fde68a;">
            FASE 1: Antes do Bazar (1 semana)
          </div>
          <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 8pt; color: #451a03; line-height: 1.5;">
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span><strong>1º Passo:</strong> Criar o Bazar (ou selecionar a edição) e gerar o link exclusivo com as peças conectadas.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span><strong>2º Passo:</strong> Cadastrar ou revisar os <strong>Produtos</strong> no estoque com fotos nítidas, custos e preços De/Por.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Conferir Chave PIX, WhatsApp e Instagram na aba <strong>Dados da Loja</strong>.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Revisar as margens e a <strong>Vitrine</strong> com cálculo De/Por e sacola de compras.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Exportar Vitrine de Fotos em PDF / JPG para aquecimento nas redes sociais e WhatsApp.</span>
            </li>
          </ul>
        </div>

        <!-- Fase 2 -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px;">
          <div style="font-size: 8.5pt; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #bbf7d0;">
            FASE 2: Durante o Bazar (Dia D)
          </div>
          <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 8pt; color: #14532d; line-height: 1.5;">
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #15803d; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Deixar o app aberto na tela de <strong>Vitrine</strong> com a busca ativa.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #15803d; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Lançar as vendas na hora que a cliente reservar em <strong>+ Nova Venda</strong>.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #15803d; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Copiar o texto formatado para mandar confirmação no WhatsApp.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #15803d; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Acompanhar peças esgotadas e saldo de estoque em tempo real.</span>
            </li>
          </ul>
        </div>

        <!-- Fase 3 -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px;">
          <div style="font-size: 8.5pt; font-weight: 800; color: #1e40af; text-transform: uppercase; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #bfdbfe;">
            FASE 3: Pós-Bazar (Fechamento)
          </div>
          <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 8pt; color: #1e3a8a; line-height: 1.5;">
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #1d4ed8; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Conferir Faturamento e Lucro Líquido Real no <strong>Dashboard</strong>.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #1d4ed8; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Exportar o <strong>Relatório de Lucro em PDF</strong> para seu arquivo.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #1d4ed8; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Fazer o <strong>Download do Backup JSON</strong> em Configurações.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #1d4ed8; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Separar o lucro para sua <strong>Reserva da Paz</strong> e reinvestimento!</span>
            </li>
          </ul>
        </div>

      </div>
    </div>

    <!-- Section 3: Módulos do Sistema -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">
        3. Instruções Detalhadas dos Módulos do Sistema
      </h3>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #065f46; margin-bottom: 4px;">
            1. Criar o Bazar (Edições & Link do Evento)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Crie a edição do evento (ex: "Bazar VIP"), selecione os produtos participantes e compartilhe o link exclusivo oficial conectado aos produtos.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #b45309; margin-bottom: 4px;">
            2. Produtos (Estoque, Fotos & Margens)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Cadastre peças com fotos nítidas otimizadas, custo real e preço De/Por promocional com cálculo automático de Lucro Unitário e Margem %.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #1d4ed8; margin-bottom: 4px;">
            3. Vendas (Caixa Ágil & Baixa Automática)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Lance vendas em segundos escolhendo produto, cliente e forma de pagamento (PIX, Cartão, Dinheiro ou Fiado). O estoque baixa na mesma hora.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #be123c; margin-bottom: 4px;">
            4. Vitrine (Catálogo com Sacola WhatsApp)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Busca instantânea por nome ou código. O cliente monta a sacola na vitrine virtual e envia o pedido pronto diretamente para o seu WhatsApp.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f766e; margin-bottom: 4px;">
            5. Relatórios (Lucro Líquido Real & Métricas)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Painel com Lucro Líquido Real no bolso, faturamento total, margem média, ticket médio e ranking dos produtos mais rentáveis da edição.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #4338ca; margin-bottom: 4px;">
            6. Dados da Loja (PIX, Contatos & Backup Seguro)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Configure chave PIX, telefone WhatsApp e Instagram. Baixe o backup JSON para proteger seus dados ou transferir de celular com segurança.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #4d7c0f; margin-bottom: 4px;">
            7. Manual de Uso (Guia Didático da Equipe)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Consulte orientações passo a passo a qualquer momento e gere este manual em PDF para capacitar atendentes e equipe no evento.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #9a3412; margin-bottom: 4px;">
            8. Próximos Passos (Cursos & Mentoria VIP)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Evolua a gestão do seu negócio com cursos oficiais de precificação, finanças e mentoria individual estratégica com a Danilla.
          </div>
        </div>

      </div>
    </div>

    <!-- Section 4: Dicas & Perguntas Frequentes -->
    <div style="margin-bottom: 24px; page-break-inside: avoid;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">
        4. Perguntas Frequentes & Dicas Operacionais
      </h3>
      
      <div style="font-size: 8.5pt; color: #334155; line-height: 1.45; space-y: 8px;">
        <div style="margin-bottom: 8px;">
          <strong>• Como garantir que não vou perder meus dados ao trocar de aparelho?</strong><br/>
          Vá em Configurações (ícone de engrenagem) e clique em "Fazer Backup (Download JSON)". Guarde esse arquivo no WhatsApp ou Google Drive. No novo aparelho, clique em "Restaurar Backup" e selecione o arquivo.
        </div>
        <div style="margin-bottom: 8px;">
          <strong>• Como precificar sem ter prejuízo no bazar?</strong><br/>
          Certifique-se sempre de que o "Valor no Bazar" seja maior que o "Preço de Custo". O app exibe o Lucro Unitário e a Margem em tempo real no cadastro.
        </div>
        <div>
          <strong>• Como achar um produto rápido quando a cliente perguntar no WhatsApp?</strong><br/>
          Use a barra de busca no topo da Vitrine. Digite o nome da peça e clique no botão "Copiar Texto" ou "Enviar Foto" para responder em menos de 10 segundos.
        </div>
      </div>
    </div>
  `;

  openPrintWindow({
    title: 'Manual Prático do Usuário & Checklist Operacional',
    subtitle: 'Guia Oficial do Rx do Bazar',
    editionName,
    bodyHtml,
  });
}

/**
 * 7. PDF do Relatório de Clientes e Compras Realizadas no Bazar
 */
export function generateCustomerPurchasesPdf(sales: Sale[], editionName?: string) {
  // Group sales by customer
  const customerMap: Record<string, {
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
  }> = {};

  sales.forEach((s) => {
    const key = (s.customerName || 'Cliente').trim();
    if (!customerMap[key]) {
      customerMap[key] = {
        customerName: key,
        phone: s.customerPhone,
        address: s.customerAddress,
        deliveryMethod: s.deliveryMethod,
        notes: s.customerNotes,
        sales: [],
        totalSpent: 0,
        totalPaid: 0,
        totalPending: 0,
        totalPieces: 0,
      };
    }

    customerMap[key].sales.push(s);
    customerMap[key].totalSpent += s.totalAmount;
    customerMap[key].totalPieces += s.quantitySold;

    if (s.paymentStatus === 'pago') {
      customerMap[key].totalPaid += s.totalAmount;
    } else if (s.paymentStatus === 'parcial') {
      customerMap[key].totalPaid += s.amountPaid || 0;
      customerMap[key].totalPending += s.remainingBalance || 0;
    } else if (s.paymentStatus === 'pendente' || s.paymentStatus === 'fiado') {
      customerMap[key].totalPending += s.totalAmount;
    }

    if (!customerMap[key].phone && s.customerPhone) customerMap[key].phone = s.customerPhone;
    if (!customerMap[key].address && s.customerAddress) customerMap[key].address = s.customerAddress;
    if (!customerMap[key].deliveryMethod && s.deliveryMethod) customerMap[key].deliveryMethod = s.deliveryMethod;
  });

  const customerList = Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent);

  const totalClients = customerList.length;
  const totalSalesCount = sales.length;
  const grandTotalSpent = customerList.reduce((acc, c) => acc + c.totalSpent, 0);
  const grandTotalPaid = customerList.reduce((acc, c) => acc + c.totalPaid, 0);
  const grandTotalPending = customerList.reduce((acc, c) => acc + c.totalPending, 0);
  const grandTotalPieces = customerList.reduce((acc, c) => acc + c.totalPieces, 0);

  let customersHtml = '';

  customerList.forEach((c, idx) => {
    let salesRows = '';

    c.sales.forEach((s) => {
      const statusObj = getPaymentStatusLabel(s.paymentStatus);
      const methodStr = getPaymentMethodLabel(s.paymentMethod);
      const installmentsStr = s.installmentsCount && s.installmentsCount > 1 ? ` (${s.installmentsCount}x)` : '';
      const paidVal = s.paymentStatus === 'pago' ? s.totalAmount : (s.amountPaid || 0);
      const pendVal = s.paymentStatus === 'pago' ? 0 : (s.remainingBalance || (s.totalAmount - paidVal));

      let itemsDetails = '';
      if (s.items && s.items.length > 0) {
        itemsDetails = s.items
          .map((i) => `<div>• <strong>${i.quantitySold}x</strong> ${i.productName} ${i.sizeColor ? `<span style="color:#64748b;">(${i.sizeColor})</span>` : ''} - <span style="font-family:monospace;">${formatCurrency(i.unitBazarPrice)}</span></div>`)
          .join('');
      } else {
        itemsDetails = `<div>• <strong>${s.quantitySold}x</strong> ${s.productName} - <span style="font-family:monospace;">${formatCurrency(s.unitBazarPrice)}</span></div>`;
      }

      salesRows += `
        <tr>
          <td style="white-space: nowrap; font-size: 8pt; color: #64748b;">${formatDate(s.saleDate)}</td>
          <td style="font-size: 8.5pt;">${itemsDetails}</td>
          <td style="font-size: 8.5pt;">${methodStr}${installmentsStr}</td>
          <td class="text-center">
            <span class="badge ${
              s.paymentStatus === 'pago'
                ? 'badge-emerald'
                : s.paymentStatus === 'parcial'
                ? 'badge-amber'
                : s.paymentStatus === 'fiado'
                ? 'badge-purple'
                : 'badge-slate'
            }">
              ${statusObj.label}
            </span>
          </td>
          <td class="text-right font-mono font-bold">${formatCurrency(s.totalAmount)}</td>
          <td class="text-right font-mono" style="color: #059669;">${formatCurrency(paidVal)}</td>
          <td class="text-right font-mono" style="color: #d97706;">${formatCurrency(pendVal)}</td>
        </tr>
      `;
    });

    const isFullyPaid = c.totalPending <= 0;

    customersHtml += `
      <div style="margin-bottom: 22px; border: 1.5px solid #cbd5e1; border-radius: 8px; overflow: hidden; page-break-inside: avoid;">
        <div style="background-color: #f1f5f9; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; flex-wrap: wrap; gap: 8px;">
          <div>
            <span style="font-weight: 800; font-size: 11pt; color: #0f172a;">#${idx + 1} - ${c.customerName}</span>
            ${c.phone ? `<span style="font-size: 9pt; color: #475569; margin-left: 10px;">📞 ${c.phone}</span>` : '<span style="font-size: 9pt; color: #94a3b8; margin-left: 10px;">(Sem telefone)</span>'}
            ${c.address ? `<div style="font-size: 8pt; color: #64748b; margin-top: 2px;">📍 ${c.address} ${c.deliveryMethod ? `(${c.deliveryMethod})` : ''}</div>` : ''}
          </div>
          <div style="text-align: right; display: flex; align-items: center; gap: 12px;">
            <div>
              <span style="font-size: 8pt; color: #64748b; display: block;">Total Gasto (${c.sales.length} compras / ${c.totalPieces} peças)</span>
              <span style="font-weight: 800; font-size: 11pt; color: #0f172a;">${formatCurrency(c.totalSpent)}</span>
            </div>
            <div>
              <span style="font-size: 8pt; color: #059669; display: block;">Pago: ${formatCurrency(c.totalPaid)}</span>
              <span style="font-size: 8pt; font-weight: 700; color: ${isFullyPaid ? '#059669' : '#d97706'}; display: block;">
                ${isFullyPaid ? '✓ Quitado' : `Saldo Pendente: ${formatCurrency(c.totalPending)}`}
              </span>
            </div>
          </div>
        </div>

        <table style="margin: 0; font-size: 8.5pt;">
          <thead>
            <tr>
              <th style="width: 15%;">Data</th>
              <th style="width: 40%;">Produtos Comprados</th>
              <th style="width: 15%;">Pagamento</th>
              <th class="text-center" style="width: 10%;">Status</th>
              <th class="text-right" style="width: 10%;">Total</th>
              <th class="text-right" style="width: 10%;">Pago</th>
              <th class="text-right" style="width: 10%;">A Receber</th>
            </tr>
          </thead>
          <tbody>
            ${salesRows}
          </tbody>
        </table>
      </div>
    `;
  });

  const bodyHtml = `
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">Total de Clientes</div>
        <div class="metric-value">${totalClients} clientes</div>
        <div class="metric-sub">${totalSalesCount} pedidos no bazar</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Peças Compradas</div>
        <div class="metric-value">${grandTotalPieces} un</div>
        <div class="metric-sub">Média ${(grandTotalPieces / (totalClients || 1)).toFixed(1)} peças/cliente</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Gasto (Faturamento)</div>
        <div class="metric-value" style="color: #0f172a;">${formatCurrency(grandTotalSpent)}</div>
        <div class="metric-sub">Ticket Médio: ${formatCurrency(grandTotalSpent / (totalClients || 1))}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Recebido vs Fiado</div>
        <div class="metric-value" style="color: #059669;">${formatCurrency(grandTotalPaid)}</div>
        <div class="metric-sub" style="color: #d97706; font-weight: 700;">A receber: ${formatCurrency(grandTotalPending)}</div>
      </div>
    </div>

    <div style="margin-top: 10px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        Detalhamento Individual por Cliente e Compras no Bazar
      </h3>
      ${customersHtml || '<div style="text-align: center; padding: 30px; color: #64748b;">Nenhuma compra registrada neste bazar.</div>'}
    </div>
  `;

  openPrintWindow({
    title: 'Relatório de Clientes e Compras Realizadas no Bazar',
    subtitle: `${totalClients} Clientes • ${totalSalesCount} Pedidos`,
    editionName,
    bodyHtml,
  });
}

/**
 * 8. PDF do Relatório de Produtos Mais Vendidos e Mais Lucrativos
 */
export function generateTopProductsReportPdf(products: Product[], sales: Sale[], editionName?: string) {
  // Aggregate sales data per product
  const productStatsMap: Record<string, {
    id: string;
    name: string;
    sku?: string;
    category: string;
    sizeColor?: string;
    soldQty: number;
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    currentStock: number;
    initialStock: number;
  }> = {};

  // Initialize with catalog products
  products.forEach((p) => {
    productStatsMap[p.id] = {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category || 'Outros',
      sizeColor: p.sizeColor,
      soldQty: 0,
      totalRevenue: 0,
      totalCost: 0,
      netProfit: 0,
      currentStock: p.quantity,
      initialStock: p.initialQuantity || p.quantity,
    };
  });

  // Accumulate from sales
  sales.forEach((s) => {
    if (s.paymentStatus === 'cancelado') return;

    if (s.items && s.items.length > 0) {
      s.items.forEach((item) => {
        const prodId = item.productId || item.productName;
        if (!productStatsMap[prodId]) {
          productStatsMap[prodId] = {
            id: prodId,
            name: item.productName,
            category: 'Outros',
            sizeColor: item.sizeColor,
            soldQty: 0,
            totalRevenue: 0,
            totalCost: 0,
            netProfit: 0,
            currentStock: 0,
            initialStock: 0,
          };
        }
        const revenue = item.quantitySold * item.unitBazarPrice;
        const cost = item.quantitySold * item.unitCostPrice;
        productStatsMap[prodId].soldQty += item.quantitySold;
        productStatsMap[prodId].totalRevenue += revenue;
        productStatsMap[prodId].totalCost += cost;
        productStatsMap[prodId].netProfit += (revenue - cost);
      });
    } else {
      const prodId = s.productId || s.productName;
      if (!productStatsMap[prodId]) {
        productStatsMap[prodId] = {
          id: prodId,
          name: s.productName,
          category: 'Outros',
          soldQty: 0,
          totalRevenue: 0,
          totalCost: 0,
          netProfit: 0,
          currentStock: 0,
          initialStock: 0,
        };
      }
      const revenue = s.totalAmount;
      const cost = s.quantitySold * s.unitCostPrice;
      productStatsMap[prodId].soldQty += s.quantitySold;
      productStatsMap[prodId].totalRevenue += revenue;
      productStatsMap[prodId].totalCost += cost;
      productStatsMap[prodId].netProfit += (revenue - cost);
    }
  });

  const allStats = Object.values(productStatsMap).filter((p) => p.soldQty > 0 || p.currentStock > 0);

  // Ranked by quantity sold
  const rankedByQty = [...allStats].sort((a, b) => b.soldQty - a.soldQty);
  // Ranked by profit
  const rankedByProfit = [...allStats].sort((a, b) => b.netProfit - a.netProfit);

  const topSeller = rankedByQty[0];
  const mostProfitable = rankedByProfit[0];

  const totalPiecesSold = allStats.reduce((acc, p) => acc + p.soldQty, 0);
  const totalNetProfit = allStats.reduce((acc, p) => acc + p.netProfit, 0);
  const totalRevenue = allStats.reduce((acc, p) => acc + p.totalRevenue, 0);
  const avgMargin = totalRevenue > 0 ? ((totalNetProfit / totalRevenue) * 100) : 0;

  // Build Table sorted by profit / sales
  let tableRows = '';
  rankedByProfit.filter(p => p.soldQty > 0).forEach((p, index) => {
    const margin = p.totalRevenue > 0 ? ((p.netProfit / p.totalRevenue) * 100) : 0;
    const isTop3 = index < 3;

    tableRows += `
      <tr style="${isTop3 ? 'background-color: #fff1f2;' : ''}">
        <td class="text-center font-bold" style="width: 6%;">
          <span class="badge ${index === 0 ? 'badge-amber' : index === 1 ? 'badge-slate' : index === 2 ? 'badge-rose' : 'badge-slate'}">
            #${index + 1}
          </span>
        </td>
        <td>
          <div class="font-bold" style="color: #0f172a;">${p.name}</div>
          <div style="font-size: 8pt; color: #64748b;">
            ${p.sku ? `Cód: ${p.sku} • ` : ''}${p.sizeColor ? `Tam/Cor: ${p.sizeColor} • ` : ''}Cat: ${p.category}
          </div>
        </td>
        <td class="text-center font-bold" style="font-size: 10pt; color: #0f172a;">${p.soldQty} un</td>
        <td class="text-center font-mono" style="color: #64748b;">${p.currentStock} un</td>
        <td class="text-right font-mono">${formatCurrency(p.totalRevenue)}</td>
        <td class="text-right font-mono" style="color: #64748b;">${formatCurrency(p.totalCost)}</td>
        <td class="text-right font-mono font-bold" style="color: #059669; font-size: 9.5pt;">${formatCurrency(p.netProfit)}</td>
        <td class="text-right font-mono font-bold" style="color: #e11d48;">${margin.toFixed(1)}%</td>
      </tr>
    `;
  });

  const bodyHtml = `
    <div class="grid-metrics">
      <div class="metric-card">
        <div class="metric-label">🏆 Mais Vendido (Volume)</div>
        <div class="metric-value" style="font-size: 11pt; color: #e11d48; line-height: 1.2;">
          ${topSeller ? topSeller.name : 'Nenhum'}
        </div>
        <div class="metric-sub">${topSeller ? `${topSeller.soldQty} un vendidas` : ''}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">💎 Mais Lucrativo (R$)</div>
        <div class="metric-value" style="font-size: 11pt; color: #059669; line-height: 1.2;">
          ${mostProfitable ? mostProfitable.name : 'Nenhum'}
        </div>
        <div class="metric-sub">${mostProfitable ? `Lucro: ${formatCurrency(mostProfitable.netProfit)}` : ''}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Total Peças Vendidas</div>
        <div class="metric-value">${totalPiecesSold} un</div>
        <div class="metric-sub">Faturamento: ${formatCurrency(totalRevenue)}</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Lucro Líquido Realizado</div>
        <div class="metric-value" style="color: #059669;">${formatCurrency(totalNetProfit)}</div>
        <div class="metric-sub">Margem média: ${avgMargin.toFixed(1)}%</div>
      </div>
    </div>

    <div style="margin-top: 15px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 4px;">
        Ranking Geral dos Produtos Mais Vendidos & Mais Lucrativos
      </h3>

      <table>
        <thead>
          <tr>
            <th class="text-center">Rank</th>
            <th>Produto & Detalhes</th>
            <th class="text-center">Qtd Vendida</th>
            <th class="text-center">Estoque Restante</th>
            <th class="text-right">Faturamento</th>
            <th class="text-right">Custo Total</th>
            <th class="text-right">Lucro Líquido</th>
            <th class="text-right">Margem %</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows || '<tr><td colspan="8" class="text-center" style="padding: 24px; color: #64748b;">Nenhuma venda registrada até o momento.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  openPrintWindow({
    title: 'Relatório de Produtos Mais Vendidos e Mais Lucrativos',
    subtitle: `${totalPiecesSold} Peças Vendidas • Lucro: ${formatCurrency(totalNetProfit)}`,
    editionName,
    bodyHtml,
  });
}

