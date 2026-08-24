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

    <!-- Section 1: 4-Step Flow -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 11pt; font-weight: 800; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 4px;">
        1. Fluxo do Bazar em 4 Passos Rápidos
      </h3>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 9pt; font-weight: 800; color: #d97706; margin-bottom: 4px;">1. Abrir o Bazar</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Crie a edição do evento (ex: "Bazar de Inverno") ou use a edição ativa que abre direto.
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 9pt; font-weight: 800; color: #059669; margin-bottom: 4px;">2. Cadastrar com Fotos</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Tire fotos nítidas. Defina Preço de Custo, Preço Cheio de Loja e Preço do Bazar.
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 9pt; font-weight: 800; color: #2563eb; margin-bottom: 4px;">3. Divulgar na Vitrine</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Busca instantânea, cópia de textos para WhatsApp e cards JPG com chave PIX.
          </div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 9pt; font-weight: 800; color: #7c3aed; margin-bottom: 4px;">4. Vender & Lucrar</div>
          <div style="font-size: 8pt; color: #334155; line-height: 1.35;">
            Lançamento ágil no PDV, baixa automática de estoque e lucro líquido no Dashboard.
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
              <span>Cadastrar a edição do evento em <strong>+ Novo Bazar</strong>.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Conferir Chave PIX e WhatsApp na aba <strong>Dados da Loja</strong>.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Fotografar e cadastrar todas as peças com fotos nítidas e boa luz.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Revisar Preço de Custo e Preço De/Por de cada produto.</span>
            </li>
            <li style="margin-bottom: 6px; display: flex; align-items: flex-start; gap: 6px;">
              <span style="display: inline-block; width: 12px; height: 12px; border: 1.5px solid #b45309; border-radius: 2px; margin-top: 2px; flex-shrink: 0;"></span>
              <span>Exportar Catálogo em PDF / JPG para aquecimento nas redes sociais.</span>
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
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            1. Edições do Bazar (Gestão Múltipla)
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            O app abre direto na edição mais recente. Para criar novos eventos, use o botão "+ Novo Bazar". Alterne a qualquer momento ou selecione "Todas as Edições" para consolidação geral.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            2. Estoque & Cadastro Inteligente com Fotos
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Tire fotos pela câmera ou galeria com compressão ultra-rápida. Preencha Preço de Custo, Preço Cheio De/Por e Preço Bazar para cálculo automático de Lucro Unitário e Margem %.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            3. Vitrine Virtual & Compartilhamento WhatsApp
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Busca instantânea por nome ou código. Copie textos pré-formatados para WhatsApp com 1 clique e gere imagens JPG profissionais com chave PIX e dados da loja.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            4. PDV & Registro de Vendas Rápidas
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Lance vendas em segundos escolhendo produto, cliente e forma de pagamento (PIX, Dinheiro, Cartão ou Fiado). O estoque baixa automaticamente e o lucro é computado.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            5. Dashboard & Relatórios Financeiros
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Painel com Lucro Líquido Real, Margem Média, CMV, valores a receber e ranking dos produtos mais rentáveis. Exportação em PDF e planilha Excel / CSV.
          </div>
        </div>

        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; background: #ffffff;">
          <div style="font-weight: 800; font-size: 9pt; color: #0f172a; margin-bottom: 4px;">
            6. Dados da Loja & Backup Seguro
          </div>
          <div style="font-size: 8pt; color: #475569; line-height: 1.4;">
            Personalize sua chave PIX, telefone e Instagram. Baixe o arquivo de backup JSON periodicamente em Configurações para transferir de aparelho ou restaurar quando quiser.
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

