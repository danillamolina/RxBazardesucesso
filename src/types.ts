export type PaymentStatus = 'pago' | 'pendente' | 'fiado' | 'parcial' | 'cancelado';

export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'promissoria';

export type ProductCategory = string;

export interface Product {
  id: string;
  name: string;
  sku?: string;
  expirationDate?: string; // Validade do produto (ex: "2026-12-31" ou "12/2026")
  category: ProductCategory;
  fullPrice?: number; // Preço Cheio de Tabela / Loja (R$)
  bazarDiscountValue?: number; // Desconto dado no Bazar (R$)
  bazarDiscountPercent?: number; // Desconto dado no Bazar (%)
  costPrice: number; // Preço de Custo (R$)
  bazarPrice: number; // Valor no Bazar (R$)
  profitMarginPercent: number; // Margem aplicada (%) -> ((bazarPrice - costPrice) / costPrice) * 100
  quantity: number; // Quantidade em Estoque
  initialQuantity: number; // Quantidade inicial cadastrada
  imageUrl?: string;
  description?: string;
  sizeColor?: string; // ex: "Tam M / Rosa"
  bazarEditionId?: string; // Edição do bazar
  showInCatalog?: boolean; // Se o produto deve ser exibido na Vitrine/Catálogo (padrão true)
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantitySold: number;
  unitCostPrice: number;
  unitBazarPrice: number;
  sizeColor?: string;
}

export interface PartialPaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface Sale {
  id: string;
  productId: string; // ID do produto principal (ou primeiro item)
  productName: string; // Nome do produto principal (ou resumo de itens)
  quantitySold: number; // Quantidade total vendida
  unitCostPrice: number; // Custo unitário no momento da venda
  unitBazarPrice: number; // Preço praticado no momento da venda
  items?: SaleItem[]; // Lista detalhada de itens no pedido (para vendas multi-item)
  
  totalAmount: number; // Quantidade * unitBazarPrice (pode ter desconto)
  discount: number; // Desconto em R$
  netProfit: number; // (totalAmount) - (custo total dos itens)
  
  // Pagamentos Parciais
  amountPaid?: number; // Valor pago até o momento (R$)
  remainingBalance?: number; // Saldo restante pendente (R$)
  paymentHistory?: PartialPaymentRecord[]; // Histórico de pagamentos parciais
  
  // Cliente & Contato
  customerName: string;
  customerPhone?: string; // Número para WhatsApp
  customerAddress?: string; // Endereço de entrega (Rua, Número, Bairro, Cidade)
  deliveryMethod?: string; // Forma de Entrega (Retirada, Motoboy, Correios, Entrega Própria, etc.)
  customerNotes?: string; // ex: @instagram, ponto de referência, lembrete
  
  // Status Integrado
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  installmentsCount?: number; // Número de parcelas (ex: 1x, 2x, 3x, 6x, 10x, 12x)
  installmentValue?: number; // Valor de cada parcela (ex: R$ 50,00)
  saleDate: string; // ISO string
  bazarEditionId?: string;
}

export interface BazarEdition {
  id: string;
  name: string;
  startDate: string;
  active: boolean;
  notes?: string;
}

export interface StockMetrics {
  totalProductsCount: number;
  totalItemsInStock: number;
  lowStockItemsCount: number;
  outOfStockItemsCount: number;
  totalCostValue: number; // Investimento em estoque
  totalBazarValue: number; // Faturamento potencial
  totalPotentialProfit: number; // Lucro potencial do estoque
}

export interface FinancialSummary {
  totalRevenueSold: number; // Valor Total Vendido (Pago + A Receber)
  totalRevenuePaid: number; // Valor Total Recebido
  totalRevenuePending: number; // Valor a Receber (Fiado/Pendente)
  totalCostOfGoodsSold: number; // Custo dos Produtos Vendidos
  totalNetProfitRealized: number; // Lucro Líquido Realizado
  averageMarginPercent: number; // Margem de Lucro Média (%)
  totalSalesCount: number;
  paidSalesCount: number;
  pendingSalesCount: number;
}
