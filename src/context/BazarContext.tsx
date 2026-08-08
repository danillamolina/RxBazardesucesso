import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Sale, 
  BazarEdition, 
  PaymentStatus, 
  PaymentMethod,
  StockMetrics, 
  FinancialSummary,
  StoreInfo
} from '../types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EDITIONS } from '../data/initialData';
import { calculateMarginPercent } from '../utils/formatters';

const DEFAULT_STORE_INFO: StoreInfo = {
  name: 'Rx do Bazar de Sucesso',
  address: 'Rua Principal, 100 - Centro',
  phone: '(11) 99999-8888',
  whatsapp: '(11) 99999-8888',
  instagram: '@danillafinancas',
  pixKey: '11999998888',
  notes: 'Horário de Atendimento: Segunda a Sábado das 09h às 18h. Retiradas no local ou entregas combinadas!',
};

interface BazarContextType {
  products: Product[];
  sales: Sale[];
  editions: BazarEdition[];
  activeEditionId: string; // 'all' or specific ID
  storeInfo: StoreInfo;
  
  // Store info action
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'profitMarginPercent' | 'initialQuantity'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, amount: number) => void;
  
  // Sale actions
  addSale: (sale: Omit<Sale, 'id' | 'saleDate' | 'netProfit' | 'amountPaid' | 'remainingBalance'> & { amountPaid?: number; remainingBalance?: number }) => boolean;
  updateSale: (saleId: string, updatedSale: Partial<Sale>) => boolean;
  updateSaleStatus: (saleId: string, newStatus: PaymentStatus) => void;
  addPartialPayment: (saleId: string, amount: number, paymentMethod: PaymentMethod, notes?: string) => void;
  deleteSale: (saleId: string) => void;
  
  // Edition actions
  addEdition: (name: string, notes?: string) => void;
  setActiveEditionId: (id: string) => void;
  
  // System actions
  resetToInitialData: () => void;
  clearAllData: () => void;
  importAllData: (data: { products: Product[]; sales: Sale[]; editions: BazarEdition[]; activeEditionId?: string }) => void;
  
  // Computed Realtime Metrics
  stockMetrics: StockMetrics;
  financialSummary: FinancialSummary;
}

const STORAGE_KEYS = {
  PRODUCTS: 'bazar_secreto_products_v1',
  SALES: 'bazar_secreto_sales_v1',
  EDITIONS: 'bazar_secreto_editions_v1',
  ACTIVE_EDITION: 'bazar_secreto_active_edition_v1',
  STORE_INFO: 'bazar_secreto_store_info_v1',
};

const BazarContext = createContext<BazarContextType | undefined>(undefined);

export const BazarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STORE_INFO);
    if (saved) {
      try { return { ...DEFAULT_STORE_INFO, ...JSON.parse(saved) }; } catch (e) { console.error(e); }
    }
    return DEFAULT_STORE_INFO;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_PRODUCTS;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_SALES;
  });

  const [editions, setEditions] = useState<BazarEdition[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EDITIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_EDITIONS;
  });

  const [activeEditionId, setActiveEditionId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_EDITION);
    return saved || 'ed-1';
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STORE_INFO, JSON.stringify(storeInfo));
  }, [storeInfo]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EDITIONS, JSON.stringify(editions));
  }, [editions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EDITION, activeEditionId);
  }, [activeEditionId]);

  // Product Actions
  const addProduct = (
    data: Omit<Product, 'id' | 'createdAt' | 'profitMarginPercent' | 'initialQuantity'>
  ) => {
    const margin = calculateMarginPercent(data.costPrice, data.bazarPrice);
    const newProd: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      profitMarginPercent: margin,
      initialQuantity: data.quantity,
      bazarEditionId: activeEditionId === 'all' ? (editions[0]?.id || 'ed-1') : activeEditionId,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updatedCost = data.costPrice !== undefined ? data.costPrice : p.costPrice;
        const updatedPrice = data.bazarPrice !== undefined ? data.bazarPrice : p.bazarPrice;
        const margin = calculateMarginPercent(updatedCost, updatedPrice);
        return {
          ...p,
          ...data,
          profitMarginPercent: margin,
        };
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (id: string, amount: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const newQty = Math.max(0, p.quantity + amount);
        return { ...p, quantity: newQty };
      })
    );
  };

  // Sale Actions
  const addSale = (
    saleData: Omit<Sale, 'id' | 'saleDate' | 'netProfit' | 'amountPaid' | 'remainingBalance'> & { amountPaid?: number; remainingBalance?: number }
  ): boolean => {
    // Determine cost for calculating profit
    let totalCostOfItems = 0;
    if (saleData.items && saleData.items.length > 0) {
      totalCostOfItems = saleData.items.reduce((acc, item) => acc + (item.quantitySold * item.unitCostPrice), 0);
    } else {
      totalCostOfItems = saleData.quantitySold * saleData.unitCostPrice;
    }

    // Stock verification and deduction
    if (saleData.paymentStatus !== 'cancelado') {
      if (saleData.items && saleData.items.length > 0) {
        for (const item of saleData.items) {
          const prod = products.find((p) => p.id === item.productId);
          if (prod && prod.quantity < item.quantitySold) {
            alert(`Estoque insuficiente de ${prod.name}! Disponível: ${prod.quantity} un.`);
            return false;
          }
        }
        saleData.items.forEach((item) => {
          adjustStock(item.productId, -item.quantitySold);
        });
      } else {
        const product = products.find((p) => p.id === saleData.productId);
        if (product && product.quantity < saleData.quantitySold) {
          alert(`Estoque insuficiente! Disponível: ${product.quantity} unidade(s).`);
          return false;
        }
        if (product) {
          adjustStock(saleData.productId, -saleData.quantitySold);
        }
      }
    }

    const netProfit = saleData.totalAmount - totalCostOfItems;
    
    // Calculate partial payments
    let amountPaid = saleData.amountPaid ?? 0;
    if (saleData.paymentStatus === 'pago') {
      amountPaid = saleData.totalAmount;
    } else if (saleData.paymentStatus === 'parcial' && saleData.amountPaid === undefined) {
      amountPaid = Math.round(saleData.totalAmount * 0.5 * 100) / 100;
    }
    const remainingBalance = Math.max(0, saleData.totalAmount - amountPaid);

    const initialHistory = amountPaid > 0 ? [{
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: amountPaid,
      paymentMethod: saleData.paymentMethod,
      notes: saleData.paymentStatus === 'parcial' ? 'Entrada / Pagamento Parcial' : 'Pagamento Integral'
    }] : [];

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      netProfit,
      amountPaid,
      remainingBalance,
      paymentHistory: initialHistory,
      saleDate: new Date().toISOString(),
      bazarEditionId: saleData.bazarEditionId || (activeEditionId === 'all' ? (editions[0]?.id || 'ed-1') : activeEditionId),
    };

    setSales((prev) => [newSale, ...prev]);
    return true;
  };

  const updateSale = (saleId: string, updatedData: Partial<Sale>): boolean => {
    const existingSale = sales.find((s) => s.id === saleId);
    if (!existingSale) return false;

    // Build old quantity map (quantity previously deducted for each product)
    const oldQtyMap: Record<string, number> = {};
    if (existingSale.paymentStatus !== 'cancelado') {
      if (existingSale.items && existingSale.items.length > 0) {
        existingSale.items.forEach((item) => {
          if (item.productId) {
            oldQtyMap[item.productId] = (oldQtyMap[item.productId] || 0) + item.quantitySold;
          }
        });
      } else if (existingSale.productId) {
        oldQtyMap[existingSale.productId] = (oldQtyMap[existingSale.productId] || 0) + existingSale.quantitySold;
      }
    }

    // Determine new status and items
    const newStatus = updatedData.paymentStatus !== undefined ? updatedData.paymentStatus : existingSale.paymentStatus;
    const newItems = updatedData.items !== undefined ? updatedData.items : existingSale.items;

    // Build new quantity map (quantity requested for each product)
    const newQtyMap: Record<string, number> = {};
    if (newStatus !== 'cancelado') {
      if (newItems && newItems.length > 0) {
        newItems.forEach((item) => {
          if (item.productId) {
            newQtyMap[item.productId] = (newQtyMap[item.productId] || 0) + item.quantitySold;
          }
        });
      } else {
        const newProdId = updatedData.productId !== undefined ? updatedData.productId : existingSale.productId;
        const newQty = updatedData.quantitySold !== undefined ? updatedData.quantitySold : existingSale.quantitySold;
        if (newProdId) {
          newQtyMap[newProdId] = (newQtyMap[newProdId] || 0) + newQty;
        }
      }
    }

    // Validate stock for all products in newQtyMap
    for (const [prodId, reqQty] of Object.entries(newQtyMap)) {
      const prod = products.find((p) => p.id === prodId);
      const oldQty = oldQtyMap[prodId] || 0;
      // Effective available stock = current product stock + stock returned from old sale
      const effectiveAvailable = (prod ? prod.quantity : 0) + oldQty;

      if (reqQty > effectiveAvailable) {
        alert(
          `Estoque insuficiente de ${prod ? prod.name : 'produto'}! Disponível para venda: ${effectiveAvailable} un.`
        );
        return false;
      }
    }

    // Stock check passed! Update products stock in state
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const oldQty = oldQtyMap[p.id] || 0;
        const newQty = newQtyMap[p.id] || 0;
        const delta = oldQty - newQty; // positive means return to stock, negative means deduct
        if (delta === 0) return p;
        return {
          ...p,
          quantity: Math.max(0, p.quantity + delta),
        };
      })
    );

    // Update sales state
    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== saleId) return s;
        const merged = { ...s, ...updatedData };

        // Recalculate cost & net profit
        let totalCostOfItems = 0;
        if (merged.items && merged.items.length > 0) {
          totalCostOfItems = merged.items.reduce((acc, item) => acc + item.quantitySold * item.unitCostPrice, 0);
        } else {
          totalCostOfItems = merged.quantitySold * merged.unitCostPrice;
        }

        const netProfit = merged.totalAmount - totalCostOfItems;

        let amountPaid = merged.amountPaid;
        let remainingBalance = merged.remainingBalance;

        if (newStatus === 'pago') {
          amountPaid = merged.totalAmount;
          remainingBalance = 0;
        } else if (newStatus === 'parcial') {
          if (amountPaid === undefined || amountPaid <= 0) {
            amountPaid = Math.round(merged.totalAmount * 0.5 * 100) / 100;
          }
          remainingBalance = Math.max(0, merged.totalAmount - amountPaid);
        } else if (newStatus === 'pendente' || newStatus === 'fiado') {
          amountPaid = 0;
          remainingBalance = merged.totalAmount;
        } else {
          remainingBalance = Math.max(0, merged.totalAmount - (amountPaid || 0));
        }

        return {
          ...merged,
          paymentStatus: newStatus,
          netProfit,
          amountPaid,
          remainingBalance,
        };
      })
    );

    return true;
  };

  const addPartialPayment = (
    saleId: string,
    paymentAmount: number,
    paymentMethod: PaymentMethod,
    notes?: string
  ) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    const newAmountPaid = (sale.amountPaid || 0) + paymentAmount;
    const newRemainingBalance = Math.max(0, sale.totalAmount - newAmountPaid);
    const newStatus: PaymentStatus = newRemainingBalance <= 0 ? 'pago' : 'parcial';

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString(),
      amount: paymentAmount,
      paymentMethod,
      notes,
    };

    setSales((prev) =>
      prev.map((s) => {
        if (s.id !== saleId) return s;
        return {
          ...s,
          amountPaid: newAmountPaid,
          remainingBalance: newRemainingBalance,
          paymentStatus: newStatus,
          paymentHistory: [...(s.paymentHistory || []), newPaymentRecord],
        };
      })
    );
  };

  const updateSaleStatus = (saleId: string, newStatus: PaymentStatus) => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale) return;

    const oldStatus = sale.paymentStatus;
    if (oldStatus === newStatus) return;

    // Handle stock restoration or deduction based on status change
    if (oldStatus === 'cancelado' && newStatus !== 'cancelado') {
      // Un-canceling: deduct stock again
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => adjustStock(item.productId, -item.quantitySold));
      } else if (sale.productId) {
        adjustStock(sale.productId, -sale.quantitySold);
      }
    } else if (oldStatus !== 'cancelado' && newStatus === 'cancelado') {
      // Canceling: return items to stock
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => adjustStock(item.productId, item.quantitySold));
      } else if (sale.productId) {
        adjustStock(sale.productId, sale.quantitySold);
      }
    }

    let newAmountPaid = sale.amountPaid;
    let newRemainingBalance = sale.remainingBalance;

    if (newStatus === 'pago') {
      newAmountPaid = sale.totalAmount;
      newRemainingBalance = 0;
    } else if (newStatus === 'parcial') {
      if (newAmountPaid <= 0) {
        newAmountPaid = Math.round(sale.totalAmount * 0.5 * 100) / 100;
      }
      newRemainingBalance = Math.max(0, sale.totalAmount - newAmountPaid);
    } else if (newStatus === 'pendente' || newStatus === 'fiado') {
      newAmountPaid = 0;
      newRemainingBalance = sale.totalAmount;
    }

    setSales((prev) =>
      prev.map((s) => (s.id === saleId ? {
        ...s,
        paymentStatus: newStatus,
        amountPaid: newAmountPaid,
        remainingBalance: newRemainingBalance,
      } : s))
    );
  };

  const deleteSale = (saleId: string) => {
    const sale = sales.find((s) => s.id === saleId);
    if (sale && sale.paymentStatus !== 'cancelado') {
      // Restore stock when deleting active sale
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach((item) => adjustStock(item.productId, item.quantitySold));
      } else if (sale.productId) {
        adjustStock(sale.productId, sale.quantitySold);
      }
    }
    setSales((prev) => prev.filter((s) => s.id !== saleId));
  };

  const addEdition = (name: string, notes?: string) => {
    const newEdition: BazarEdition = {
      id: `ed-${Date.now()}`,
      name,
      startDate: new Date().toISOString(),
      active: true,
      notes,
    };
    setEditions((prev) => [newEdition, ...prev]);
    setActiveEditionId(newEdition.id);
  };

  const resetToInitialData = () => {
    setProducts(INITIAL_PRODUCTS);
    setSales(INITIAL_SALES);
    setEditions(INITIAL_EDITIONS);
    setActiveEditionId('ed-1');
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.EDITIONS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_EDITION);
  };

  const clearAllData = () => {
    setProducts([]);
    setSales([]);
    setEditions(INITIAL_EDITIONS);
    setActiveEditionId('all');
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.EDITIONS, JSON.stringify(INITIAL_EDITIONS));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_EDITION, 'all');
  };

  const importAllData = (data: { products: Product[]; sales: Sale[]; editions: BazarEdition[]; activeEditionId?: string }) => {
    if (data.products) setProducts(data.products);
    if (data.sales) setSales(data.sales);
    if (data.editions) setEditions(data.editions);
    if (data.activeEditionId) setActiveEditionId(data.activeEditionId);
  };

  // Computed Realtime Metrics based on active edition filter
  const filteredProducts = useMemo(() => {
    if (activeEditionId === 'all') return products;
    return products.filter((p) => !p.bazarEditionId || p.bazarEditionId === activeEditionId);
  }, [products, activeEditionId]);

  const filteredSales = useMemo(() => {
    if (activeEditionId === 'all') return sales;
    return sales.filter((s) => !s.bazarEditionId || s.bazarEditionId === activeEditionId);
  }, [sales, activeEditionId]);

  // Stock Metrics Calculation
  const stockMetrics = useMemo<StockMetrics>(() => {
    let totalItemsInStock = 0;
    let lowStockItemsCount = 0;
    let outOfStockItemsCount = 0;
    let totalCostValue = 0;
    let totalBazarValue = 0;

    filteredProducts.forEach((p) => {
      totalItemsInStock += p.quantity;
      if (p.quantity === 0) {
        outOfStockItemsCount += 1;
      } else if (p.quantity <= 3) {
        lowStockItemsCount += 1;
      }

      totalCostValue += p.costPrice * p.quantity;
      totalBazarValue += p.bazarPrice * p.quantity;
    });

    return {
      totalProductsCount: filteredProducts.length,
      totalItemsInStock,
      lowStockItemsCount,
      outOfStockItemsCount,
      totalCostValue,
      totalBazarValue,
      totalPotentialProfit: totalBazarValue - totalCostValue,
    };
  }, [filteredProducts]);

  // Financial Summary Calculation
  const financialSummary = useMemo<FinancialSummary>(() => {
    let totalRevenuePaid = 0;
    let totalRevenuePending = 0;
    let totalCostOfGoodsSold = 0;
    let totalNetProfitRealized = 0;
    let paidSalesCount = 0;
    let pendingSalesCount = 0;

    filteredSales.forEach((s) => {
      if (s.paymentStatus === 'cancelado') return;

      const costForSale = s.quantitySold * s.unitCostPrice;

      if (s.paymentStatus === 'pago') {
        totalRevenuePaid += s.totalAmount;
        totalCostOfGoodsSold += costForSale;
        totalNetProfitRealized += s.netProfit;
        paidSalesCount += 1;
      } else if (s.paymentStatus === 'parcial') {
        const paid = s.amountPaid ?? 0;
        const pending = s.remainingBalance ?? (s.totalAmount - paid);
        totalRevenuePaid += paid;
        totalRevenuePending += pending;

        // Proportional cost & profit realized from amount collected
        const paidRatio = s.totalAmount > 0 ? paid / s.totalAmount : 0;
        totalCostOfGoodsSold += costForSale * paidRatio;
        totalNetProfitRealized += s.netProfit * paidRatio;
        pendingSalesCount += 1;
      } else if (s.paymentStatus === 'pendente' || s.paymentStatus === 'fiado') {
        totalRevenuePending += s.totalAmount;
        pendingSalesCount += 1;
      }
    });

    const totalRevenueSold = totalRevenuePaid + totalRevenuePending;

    const averageMarginPercent =
      totalCostOfGoodsSold > 0
        ? ((totalRevenuePaid - totalCostOfGoodsSold) / totalCostOfGoodsSold) * 100
        : 0;

    return {
      totalRevenueSold,
      totalRevenuePaid,
      totalRevenuePending,
      totalCostOfGoodsSold,
      totalNetProfitRealized,
      averageMarginPercent,
      totalSalesCount: filteredSales.length,
      paidSalesCount,
      pendingSalesCount,
    };
  }, [filteredSales]);

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...info }));
  };

  return (
    <BazarContext.Provider
      value={{
        products: filteredProducts,
        sales: filteredSales,
        editions,
        activeEditionId,
        storeInfo,
        updateStoreInfo,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addSale,
        updateSale,
        updateSaleStatus,
        addPartialPayment,
        deleteSale,
        addEdition,
        setActiveEditionId,
        resetToInitialData,
        clearAllData,
        importAllData,
        stockMetrics,
        financialSummary,
      }}
    >
      {children}
    </BazarContext.Provider>
  );
};

export const useBazar = () => {
  const context = useContext(BazarContext);
  if (!context) {
    throw new Error('useBazar must be used within a BazarProvider');
  }
  return context;
};
