import { Product, Sale, StockMetrics, FinancialSummary, BazarEdition } from '../types';
import { formatCurrency, formatDate, getPaymentMethodLabel, getPaymentStatusLabel } from './formatters';

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
