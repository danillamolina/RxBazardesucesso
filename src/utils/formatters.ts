import { PaymentStatus, PaymentMethod, StoreInfo } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatPercent(value: number): string {
  const val = value || 0;
  const rounded = Math.round(val * 10) / 10;
  return `${rounded.toLocaleString('pt-BR')}%`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

// Calculate profit margin % given cost and bazaar price (Margem de Lucro sobre o Preço de Venda)
export function calculateMarginPercent(cost: number, sell: number): number {
  if (!sell || sell <= 0 || !cost || cost <= 0) return 0;
  return ((sell - cost) / sell) * 100;
}

// Calculate bazaar sell price given cost and desired profit margin % (Preço = Custo / (1 - Margem/100))
export function calculatePriceFromMargin(cost: number, marginPercent: number): number {
  if (!cost || cost <= 0) return 0;
  if (marginPercent >= 100) return cost;
  const divisor = 1 - marginPercent / 100;
  if (divisor <= 0) return cost;
  return cost / divisor;
}

// Get standardized pricing details (Full Price, Bazar Price, Savings, Discount %)
export function getProductPriceDetails(prod: { fullPrice?: number; bazarPrice: number; costPrice?: number }) {
  const bazarPrice = prod.bazarPrice || 0;
  // O Preço Cheio vem estritamente do preço cheio cadastrado no produto (prod.fullPrice)
  const fullPrice = (prod.fullPrice && prod.fullPrice > 0)
    ? prod.fullPrice
    : bazarPrice;
  
  const discountAmount = (prod.fullPrice && prod.fullPrice > bazarPrice)
    ? prod.fullPrice - bazarPrice
    : 0;

  // Cálculo da porcentagem de desconto: (1 - (bazarPrice / fullPrice)) * 100
  const rawDiscountRatio = (fullPrice > 0 && prod.fullPrice && prod.fullPrice > bazarPrice)
    ? (1 - (bazarPrice / fullPrice)) * 100
    : 0;

  const discountPercent = Math.round(rawDiscountRatio * 10) / 10;

  return {
    fullPrice,
    bazarPrice,
    discountAmount,
    discountPercent,
    hasDiscount: discountAmount > 0 && discountPercent > 0,
  };
}

export function getPaymentStatusLabel(status: PaymentStatus): { label: string; colorClass: string; bgClass: string; borderClass: string } {
  switch (status) {
    case 'pago':
      return {
        label: 'Pago',
        colorClass: 'text-emerald-700 dark:text-emerald-400',
        bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
        borderClass: 'border-emerald-200 dark:border-emerald-800/50',
      };
    case 'pendente':
      return {
        label: 'Pendente',
        colorClass: 'text-amber-700 dark:text-amber-400',
        bgClass: 'bg-amber-50 dark:bg-amber-950/40',
        borderClass: 'border-amber-200 dark:border-amber-800/50',
      };
    case 'fiado':
      return {
        label: 'Fiado / A Receber',
        colorClass: 'text-purple-700 dark:text-purple-400',
        bgClass: 'bg-purple-50 dark:bg-purple-950/40',
        borderClass: 'border-purple-200 dark:border-purple-800/50',
      };
    case 'parcial':
      return {
        label: 'Pagamento Parcial',
        colorClass: 'text-blue-700 dark:text-blue-400',
        bgClass: 'bg-blue-50 dark:bg-blue-950/40',
        borderClass: 'border-blue-200 dark:border-blue-800/50',
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        colorClass: 'text-rose-700 dark:text-rose-400',
        bgClass: 'bg-rose-50 dark:bg-rose-950/40',
        borderClass: 'border-rose-200 dark:border-rose-800/50',
      };
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'pix':
      return 'PIX';
    case 'cartao_credito':
      return 'Cartão de Crédito';
    case 'cartao_debito':
      return 'Cartão de Débito';
    case 'dinheiro':
      return 'Dinheiro';
    case 'promissoria':
      return 'Promissória / Fiado';
  }
}

// Clean phone number for WhatsApp
export function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 || cleaned.length === 11) {
    return `55${cleaned}`;
  }
  return cleaned;
}

// Helper to retrieve store info from parameter or localStorage fallback
function getEffectiveStoreInfo(storeInfo?: StoreInfo): StoreInfo | undefined {
  if (storeInfo) return storeInfo;
  try {
    const saved = localStorage.getItem('bazar_secreto_store_info_v1');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    // ignore
  }
  return undefined;
}

// Generate Full Plain-Text Receipt/Order Summary for Customer (Includes Chave PIX and Store Address)
export function generateOrderReceiptText(
  sale: {
    customerPhone?: string;
    customerName: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
    discount?: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    installmentsCount?: number;
    installmentValue?: number;
    amountPaid?: number;
    remainingBalance?: number;
    deliveryMethod?: string;
    customerAddress?: string;
    customerNotes?: string;
    items?: { productName: string; quantitySold: number; unitBazarPrice: number; sizeColor?: string }[];
  },
  storeInfo?: StoreInfo
): string {
  const store = getEffectiveStoreInfo(storeInfo);
  const storeName = store?.name?.trim() || 'Rx do Bazar de Sucesso';
  const storeAddress = store?.address?.trim();
  const storePixKey = store?.pixKey?.trim();

  let statusText = '⏳ Aguardando Pagamento';
  if (sale.paymentStatus === 'pago') statusText = '✅ Pagamento Confirmado';
  if (sale.paymentStatus === 'parcial') {
    statusText = `🟧 Pagamento Parcial (Pago: ${formatCurrency(sale.amountPaid || 0)} | Falta: ${formatCurrency(sale.remainingBalance || 0)})`;
  }
  if (sale.paymentStatus === 'fiado') statusText = '🔵 Fiado / A Receber';
  if (sale.paymentStatus === 'cancelado') statusText = '🔴 Cancelado';

  let methodText = getPaymentMethodLabel(sale.paymentMethod);
  if (sale.installmentsCount && sale.installmentsCount > 1) {
    const instVal = sale.installmentValue || (sale.totalAmount / sale.installmentsCount);
    methodText += ` (${sale.installmentsCount}x de ${formatCurrency(instVal)})`;
  }

  // Items list formatted
  let itemsText = '';
  if (sale.items && sale.items.length > 0) {
    itemsText = sale.items
      .map(
        (item, idx) =>
          `  ${idx + 1}. *${item.quantitySold}x* ${item.productName}${item.sizeColor ? ` (${item.sizeColor})` : ''} — ${formatCurrency(item.quantitySold * item.unitBazarPrice)}`
      )
      .join('\n');
  } else {
    itemsText = `  1. *${sale.quantitySold}x* ${sale.productName} — ${formatCurrency(sale.totalAmount + (sale.discount || 0))}`;
  }

  const subtotal = sale.totalAmount + (sale.discount || 0);
  let discountLine = '';
  if (sale.discount && sale.discount > 0) {
    discountLine = `• Subtotal: ~${formatCurrency(subtotal)}~\n• Desconto Especial: *-${formatCurrency(sale.discount)}*\n`;
  }

  let paymentDetails = '';
  if (sale.paymentStatus === 'parcial') {
    paymentDetails = `• Entrada / Pago: *${formatCurrency(sale.amountPaid || 0)}*\n• Saldo Devedor: *${formatCurrency(sale.remainingBalance || 0)}*\n`;
  } else if (sale.remainingBalance && sale.remainingBalance > 0 && sale.paymentStatus !== 'pago') {
    paymentDetails = `• Saldo a Receber: *${formatCurrency(sale.remainingBalance)}*\n`;
  }

  let installmentInfo = '';
  if (sale.installmentsCount && sale.installmentsCount > 1) {
    const instVal = sale.installmentValue || (sale.totalAmount / sale.installmentsCount);
    installmentInfo = `• Parcelamento: *${sale.installmentsCount}x de ${formatCurrency(instVal)}*\n`;
  }

  // Delivery Section
  let deliverySection = '';
  if (sale.deliveryMethod || sale.customerAddress) {
    deliverySection = `\n🚚 *FORMA DE ENTREGA:*\n`;
    if (sale.deliveryMethod) {
      deliverySection += `• Método: *${sale.deliveryMethod}*\n`;
    }
    if (sale.customerAddress) {
      deliverySection += `• Endereço de Destino: *${sale.customerAddress}*\n`;
    }
  }

  // PIX Key Section
  let pixSection = '';
  if (storePixKey) {
    pixSection = `\n🔑 *DADOS PARA PAGAMENTO (CHAVE PIX):*\n` +
      `• Chave PIX: *${storePixKey}*\n` +
      `• Favorecido: *${storeName}*\n`;
  }

  // Store Address Section
  let addressSection = '';
  if (storeAddress) {
    addressSection = `\n📍 *ENDEREÇO DA LOJA / RETIRADA:*\n` +
      `${storeAddress}\n` +
      (store?.notes ? `_${store.notes}_\n` : '');
  }

  // Store Contact Section
  let contactSection = '';
  if (store?.whatsapp || store?.instagram) {
    contactSection = `\n📱 *CONTATO DA LOJA:*\n` +
      (store.whatsapp ? `• WhatsApp: ${store.whatsapp}\n` : '') +
      (store.instagram ? `• Instagram: ${store.instagram}\n` : '');
  }

  const closingMsg =
    sale.paymentStatus === 'pago'
      ? `Seu pedido está totalmente pago e garantido! Muito obrigada pela preferência e carinho! 🥰💖`
      : sale.paymentStatus === 'parcial'
      ? `Anotamos o seu pagamento parcial! Segue a chave PIX acima para quitação do restante. Muito obrigada! 🥰`
      : `Por favor, envie o comprovante do PIX por aqui assim que realizar o pagamento para garantirmos suas peças! Qualquer dúvida estou à disposição! 😘`;

  return (
    `Olá ${sale.customerName}! ✨\n\n` +
    `Aqui está o *Comprovante / Resumo do seu Pedido* no *${storeName}*! 🛍️💖\n\n` +
    `📋 *ITENS DO PEDIDO:*\n` +
    `${itemsText}\n\n` +
    `💰 *RESUMO FINANCEIRO:*\n` +
    `${discountLine}` +
    `• Valor Total do Pedido: *${formatCurrency(sale.totalAmount)}*\n` +
    `• Forma de Pagamento: *${methodText}*\n` +
    `${installmentInfo}` +
    `• Status do Pagamento: ${statusText}\n` +
    `${paymentDetails}` +
    `${deliverySection}` +
    `${pixSection}` +
    `${addressSection}` +
    `${contactSection}\n` +
    `${closingMsg}`
  );
}

// Generate Full WhatsApp Receipt Link from a Sale
export function createWhatsAppReceiptFromSale(
  sale: {
    customerPhone?: string;
    customerName: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
    discount?: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    installmentsCount?: number;
    installmentValue?: number;
    amountPaid?: number;
    remainingBalance?: number;
    deliveryMethod?: string;
    customerAddress?: string;
    customerNotes?: string;
    items?: { productName: string; quantitySold: number; unitBazarPrice: number; sizeColor?: string }[];
  },
  storeInfo?: StoreInfo
): string {
  const cleanPhone = cleanPhoneNumber(sale.customerPhone);
  if (!cleanPhone) return '#';

  const text = generateOrderReceiptText(sale, storeInfo);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

// Generate WhatsApp Sale Link (Legacy signature fallback)
export function createWhatsAppSaleMessageLink(
  phone: string | undefined,
  customerName: string,
  productName: string,
  quantity: number,
  totalAmount: number,
  paymentStatus: PaymentStatus,
  amountPaid?: number,
  remainingBalance?: number,
  storeInfo?: StoreInfo
): string {
  return createWhatsAppReceiptFromSale(
    {
      customerPhone: phone,
      customerName,
      productName,
      quantitySold: quantity,
      totalAmount,
      paymentStatus,
      paymentMethod: 'pix',
      amountPaid,
      remainingBalance,
    },
    storeInfo
  );
}

// Generate Full WhatsApp Customer Summary Link (All orders for a customer)
export function createWhatsAppCustomerSummaryLink(
  customerName: string,
  customerPhone: string | undefined,
  customerSales: {
    id: string;
    saleDate: string;
    productName: string;
    quantitySold: number;
    totalAmount: number;
    discount?: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    installmentsCount?: number;
    installmentValue?: number;
    amountPaid?: number;
    remainingBalance?: number;
    items?: { productName: string; quantitySold: number; unitBazarPrice: number; sizeColor?: string }[];
  }[],
  storeInfo?: StoreInfo
): string {
  const cleanPhone = cleanPhoneNumber(customerPhone);
  if (!cleanPhone) return '#';

  const store = getEffectiveStoreInfo(storeInfo);
  const storeName = store?.name?.trim() || 'Rx do Bazar de Sucesso';
  const storeAddress = store?.address?.trim();
  const storePixKey = store?.pixKey?.trim();

  const totalSpent = customerSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalPaid = customerSales.reduce((acc, s) => {
    if (s.paymentStatus === 'pago') return acc + s.totalAmount;
    return acc + (s.amountPaid || 0);
  }, 0);
  const totalRemaining = customerSales.reduce((acc, s) => {
    if (s.paymentStatus === 'pago' || s.paymentStatus === 'cancelado') return acc;
    return acc + (s.remainingBalance ?? (s.totalAmount - (s.amountPaid || 0)));
  }, 0);

  const ordersListText = customerSales
    .map((s, idx) => {
      let itemsStr = '';
      if (s.items && s.items.length > 0) {
        itemsStr = s.items.map(i => `    • ${i.quantitySold}x ${i.productName} (${formatCurrency(i.unitBazarPrice)})`).join('\n');
      } else {
        itemsStr = `    • ${s.quantitySold}x ${s.productName}`;
      }

      let statusBadge = '⏳ Pendente';
      if (s.paymentStatus === 'pago') statusBadge = '✅ Pago';
      if (s.paymentStatus === 'parcial') statusBadge = `🟧 Parcial (Pago: ${formatCurrency(s.amountPaid || 0)})`;
      if (s.paymentStatus === 'fiado') statusBadge = '🔵 Fiado';

      let instStr = '';
      if (s.installmentsCount && s.installmentsCount > 1) {
        const instVal = s.installmentValue || (s.totalAmount / s.installmentsCount);
        instStr = ` (${s.installmentsCount}x de ${formatCurrency(instVal)})`;
      }

      return (
        `📦 *Pedido #${idx + 1}*\n` +
        `${itemsStr}\n` +
        `  • Total: *${formatCurrency(s.totalAmount)}*\n` +
        `  • Forma: ${getPaymentMethodLabel(s.paymentMethod)}${instStr}\n` +
        `  • Status: ${statusBadge}`
      );
    })
    .join('\n\n');

  let pixSection = '';
  if (storePixKey) {
    pixSection = `\n🔑 *DADOS PARA PAGAMENTO (CHAVE PIX):*\n` +
      `• Chave PIX: *${storePixKey}*\n` +
      `• Favorecido: *${storeName}*\n`;
  }

  let addressSection = '';
  if (storeAddress) {
    addressSection = `\n📍 *ENDEREÇO DA LOJA / RETIRADA:*\n` +
      `${storeAddress}\n` +
      (store?.notes ? `_${store.notes}_\n` : '');
  }

  const text = encodeURIComponent(
    `Olá ${customerName}! ✨\n\n` +
    `Aqui está o *Resumo Geral de Todos os seus Pedidos* no *${storeName}*! 🛍️💖\n\n` +
    `${ordersListText}\n\n` +
    `📊 *EXTRATO GERAL DA CLIENTE:*\n` +
    `• Total dos Pedidos: *${formatCurrency(totalSpent)}*\n` +
    `• Total Já Quitado: *${formatCurrency(totalPaid)}*\n` +
    (totalRemaining > 0
      ? `• Saldo Devedor Pendente: *${formatCurrency(totalRemaining)}*\n`
      : `• Situação: *✅ Totalmente Quitado!*\n`) +
    `${pixSection}` +
    `${addressSection}\n` +
    (totalRemaining > 0
      ? `Ficamos à disposição para qualquer dúvida ou para confirmação do pagamento via PIX! Muito obrigada pelo carinho! 🥰`
      : `Todos os seus produtos já estão confirmados e quitados. Muito obrigada pela confiança e preferência! 🥰💖`)
  );

  return `https://wa.me/${cleanPhone}?text=${text}`;
}

// Generate WhatsApp Broadcast Card for Product
export interface ProductShareData {
  productName: string;
  bazarPrice: number;
  fullPrice?: number;
  description?: string;
  sizeColor?: string;
  imageUrl?: string;
  category?: string;
  stock?: number;
}

export function generateProductShareText(product: ProductShareData): string {
  const { productName, bazarPrice, fullPrice, description, sizeColor, imageUrl, category, stock } = product;

  let discountInfo = '';
  if (fullPrice && fullPrice > bazarPrice) {
    const diff = fullPrice - bazarPrice;
    const perc = Math.round((diff / fullPrice) * 100);
    discountInfo = `De ~${formatCurrency(fullPrice)}~ por Apenas: *${formatCurrency(bazarPrice)}* (${perc}% OFF 🔥)`;
  } else {
    discountInfo = `Apenas: *${formatCurrency(bazarPrice)}*`;
  }

  let text = `🔥 *ACHADO DO BAZAR SECRETO!* 🔥\n\n`;
  text += `✨ *${productName}*\n`;
  if (category) text += `🏷️ Categoria: ${category}\n`;
  if (sizeColor) text += `📏 Detalhes/Tamanho: *${sizeColor}*\n`;
  if (description) text += `📝 Descrição: ${description}\n`;
  if (stock && stock > 0) text += `⚡ Estoque: Restam apenas *${stock} un!*\n`;
  text += `\n💰 ${discountInfo}\n`;

  if (imageUrl && !imageUrl.startsWith('data:')) {
    text += `\n📸 Foto da peça: ${imageUrl}\n`;
  }

  text += `\n⚡ Peça incrível em estoque! Para garantir ou tirar dúvidas, me chama no privado agora! 👇🛍️💖`;
  return text;
}

export function createWhatsAppProductShareLink(
  productNameOrObj: string | ProductShareData,
  bazarPrice?: number,
  description?: string,
  sizeColor?: string,
  fullPriceOrImgUrl?: number | string,
  imageUrlOrFullPrice?: string | number,
  category?: string,
  stock?: number
): string {
  let shareData: ProductShareData;

  if (typeof productNameOrObj === 'object') {
    shareData = productNameOrObj;
  } else {
    let fullPrice: number | undefined;
    let imageUrl: string | undefined;

    if (typeof fullPriceOrImgUrl === 'number') {
      fullPrice = fullPriceOrImgUrl;
    } else if (typeof fullPriceOrImgUrl === 'string') {
      imageUrl = fullPriceOrImgUrl;
    }

    if (typeof imageUrlOrFullPrice === 'string') {
      imageUrl = imageUrlOrFullPrice;
    } else if (typeof imageUrlOrFullPrice === 'number') {
      fullPrice = imageUrlOrFullPrice;
    }

    shareData = {
      productName: productNameOrObj,
      bazarPrice: bazarPrice || 0,
      description,
      sizeColor,
      fullPrice,
      imageUrl,
      category,
      stock,
    };
  }

  const rawText = generateProductShareText(shareData);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(rawText)}`;
}

// Generate Full Catalog Text for WhatsApp Export organized by Category and Subcategory
export function generateFullCatalogExportText(products: {
  name: string;
  bazarPrice: number;
  fullPrice?: number;
  description?: string;
  sizeColor?: string;
  imageUrl?: string;
  category?: string;
  subcategory?: string;
  quantity?: number;
}[]): string {
  if (!products || products.length === 0) {
    return '🛍️ *RX DO BAZAR DE SUCESSO*: Nenhum produto selecionado no momento.';
  }

  let text = `🛍️✨ *VITRINE DE FOTOS & OFERTAS — RX DO BAZAR DE SUCESSO* ✨🛍️\n`;
  text += `Confira as peças selecionadas disponíveis para pronta entrega:\n`;
  text += `───────────────────────\n\n`;

  // Group products by category and then subcategory
  const categoriesMap: Record<string, Record<string, typeof products>> = {};

  products.forEach((p) => {
    const cat = p.category || 'Outros / Destaques';
    const sub = p.subcategory || 'Geral';

    if (!categoriesMap[cat]) {
      categoriesMap[cat] = {};
    }
    if (!categoriesMap[cat][sub]) {
      categoriesMap[cat][sub] = [];
    }
    categoriesMap[cat][sub].push(p);
  });

  let globalIndex = 1;

  Object.entries(categoriesMap).forEach(([categoryName, subcats]) => {
    text += `🏷️ *━━━ ${categoryName} ━━━*\n\n`;

    Object.entries(subcats).forEach(([subcatName, subProducts]) => {
      if (subcatName !== 'Geral') {
        text += `  📂 *${subcatName}*\n\n`;
      }

      subProducts.forEach((p) => {
        let discountStr = `*${formatCurrency(p.bazarPrice)}*`;
        if (p.fullPrice && p.fullPrice > p.bazarPrice) {
          const diff = p.fullPrice - p.bazarPrice;
          const perc = Math.round((diff / p.fullPrice) * 100);
          discountStr = `De ~${formatCurrency(p.fullPrice)}~ por *${formatCurrency(p.bazarPrice)}* (🔥 *${perc}% OFF*)`;
        }

        text += `  ✨ *${globalIndex}. ${p.name}*\n`;
        if (p.sizeColor) text += `     📏 Detalhes/Tam: *${p.sizeColor}*\n`;
        if (p.description) text += `     📝 ${p.description}\n`;
        text += `     💰 Preço: ${discountStr}\n`;
        if (p.quantity && p.quantity > 0) {
          text += `     📦 Estoque: *${p.quantity} un.*\n`;
        }

        if (p.imageUrl && !p.imageUrl.startsWith('data:')) {
          text += `     📸 Foto: ${p.imageUrl}\n`;
        }

        text += `\n`;
        globalIndex++;
      });
    });
  });

  text += `───────────────────────\n`;
  text += `⚡ *COMO RESERVAR A SUA PEÇA:*\n`;
  text += `Responda a esta mensagem informando o número ou nome da peça para garantir! Estoque com pronta entrega! 🥰💖`;

  return text;
}
