// @/pages/api/branch-manager/finance/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Transaction from "@/models/Transaction";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";
import "@/models/Customer";
import "@/models/Product";
import "@/models/Supplier";
import { mongoConnect } from "@/lib/mongoConnect";
import { enableCors } from "@/middleware/enableCors";

// ============================================
// INTERFACES
// ============================================

interface IncomeSource {
    source: string;
    amount: number;
    count: number;
    percentage: number;
}

interface ExpenseSource {
    source: string;
    amount: number;
    count: number;
    percentage: number;
}

interface MonthlyFinance {
    month: string;
    year: number;
    income: {
        fromSales: number;
        fromSettledOrders: number;
        total: number;
    };
    expenses: {
        fromPurchases: number;
        total: number;
    };
    netProfit: number;
}

interface PaymentAnalysis {
    pending: { count: number; amount: number };
    settlement: { count: number; amount: number };
    cancel: { count: number; amount: number };
    deny: { count: number; amount: number };
    expire: { count: number; amount: number };
    failure: { count: number; amount: number };
}

interface FinancialOverview {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    incomeSources: IncomeSource[];
    expenseSources: ExpenseSource[];
    monthlyData: MonthlyFinance[];
    paymentAnalysis: PaymentAnalysis;
}

// ============================================
// HANDLER
// ============================================

async function handler(req: NextApiRequest, res: NextApiResponse) {
    await mongoConnect();

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed. Only GET is supported."
        });
    }

    try {
        const { type, startDate, endDate, groupBy } = req.query;

        // Build date filter
        const dateFilter: any = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate as string);
            }
            if (endDate) {
                dateFilter.createdAt.$lte = new Date(endDate as string);
            }
        }

        // ============================================
        // ROUTE: OVERVIEW - Ringkasan Keuangan Lengkap
        // ============================================
        if (type === "overview") {
            const [sales, transactions, purchases] = await Promise.all([
                Sale.find(dateFilter)
                    .populate("customerId", "nama email")
                    .populate("productId", "namaProduk hargaJual"),
                Transaction.find(dateFilter)
                    .populate("customerId", "nama email")
                    .populate("productId", "namaProduk"),
                Purchase.find(dateFilter)
                    .populate("supplierId", "nama email"),
            ]);

            // ===== PEMASUKAN =====
            const incomeFromSales = sales.reduce((sum, sale) => sum + (sale.totalHarga || 0), 0);
            const incomeFromSettledOrders = transactions
                .filter(txn => txn.paymentStatus === "settlement")
                .reduce((sum, txn) => sum + (txn.grossAmount || 0), 0);

            const totalIncome = incomeFromSales + incomeFromSettledOrders;

            // ===== PENGELUARAN =====
            const expensesFromPurchases = purchases.reduce(
                (sum, purchase) => sum + (purchase.hargaPerUnit * purchase.jumlah || 0),
                0
            );

            const totalExpenses = expensesFromPurchases;

            // ===== NET PROFIT =====
            const netProfit = totalIncome - totalExpenses;
            const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

            // ===== INCOME SOURCES =====
            const incomeSources: IncomeSource[] = [
                {
                    source: "Penjualan Langsung (Sales)",
                    amount: incomeFromSales,
                    count: sales.length,
                    percentage: totalIncome > 0 ? (incomeFromSales / totalIncome) * 100 : 0,
                },
                {
                    source: "Order yang Sudah Dibayar (Settled Transactions)",
                    amount: incomeFromSettledOrders,
                    count: transactions.filter(t => t.paymentStatus === "settlement").length,
                    percentage: totalIncome > 0 ? (incomeFromSettledOrders / totalIncome) * 100 : 0,
                },
            ];

            // ===== EXPENSE SOURCES =====
            const expenseSources: ExpenseSource[] = [
                {
                    source: "Pembelian Material (Purchases)",
                    amount: expensesFromPurchases,
                    count: purchases.length,
                    percentage: totalExpenses > 0 ? (expensesFromPurchases / totalExpenses) * 100 : 100,
                },
            ];

            // ===== PAYMENT ANALYSIS =====
            const paymentAnalysis: PaymentAnalysis = {
                pending: { count: 0, amount: 0 },
                settlement: { count: 0, amount: 0 },
                cancel: { count: 0, amount: 0 },
                deny: { count: 0, amount: 0 },
                expire: { count: 0, amount: 0 },
                failure: { count: 0, amount: 0 },
            };

            transactions.forEach(txn => {
                const status = txn.paymentStatus as keyof PaymentAnalysis;
                if (paymentAnalysis[status]) {
                    paymentAnalysis[status].count++;
                    paymentAnalysis[status].amount += txn.grossAmount || 0;
                }
            });

            // ===== MONTHLY DATA =====
            const monthlyMap = new Map<string, MonthlyFinance>();

            // Process sales
            sales.forEach(sale => {
                const date = new Date(sale.createdAt!);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyMap.has(key)) {
                    monthlyMap.set(key, {
                        month: date.toLocaleDateString("id-ID", { month: "long" }),
                        year: date.getFullYear(),
                        income: { fromSales: 0, fromSettledOrders: 0, total: 0 },
                        expenses: { fromPurchases: 0, total: 0 },
                        netProfit: 0,
                    });
                }

                const monthly = monthlyMap.get(key)!;
                monthly.income.fromSales += sale.totalHarga || 0;
            });

            // Process settled transactions
            transactions
                .filter(txn => txn.paymentStatus === "settlement")
                .forEach(txn => {
                    const date = new Date(txn.createdAt!);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                    if (!monthlyMap.has(key)) {
                        monthlyMap.set(key, {
                            month: date.toLocaleDateString("id-ID", { month: "long" }),
                            year: date.getFullYear(),
                            income: { fromSales: 0, fromSettledOrders: 0, total: 0 },
                            expenses: { fromPurchases: 0, total: 0 },
                            netProfit: 0,
                        });
                    }

                    const monthly = monthlyMap.get(key)!;
                    monthly.income.fromSettledOrders += txn.grossAmount || 0;
                });

            // Process purchases
            purchases.forEach(purchase => {
                const date = new Date(purchase.createdAt!);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyMap.has(key)) {
                    monthlyMap.set(key, {
                        month: date.toLocaleDateString("id-ID", { month: "long" }),
                        year: date.getFullYear(),
                        income: { fromSales: 0, fromSettledOrders: 0, total: 0 },
                        expenses: { fromPurchases: 0, total: 0 },
                        netProfit: 0,
                    });
                }

                const monthly = monthlyMap.get(key)!;
                monthly.expenses.fromPurchases += purchase.hargaPerUnit * purchase.jumlah || 0;
            });

            // Calculate totals and profit
            const monthlyData = Array.from(monthlyMap.values()).map(m => {
                m.income.total = m.income.fromSales + m.income.fromSettledOrders;
                m.expenses.total = m.expenses.fromPurchases;
                m.netProfit = m.income.total - m.expenses.total;
                return m;
            }).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                const monthOrder = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                    "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
            });

            const overview: FinancialOverview = {
                totalIncome,
                totalExpenses,
                netProfit,
                profitMargin: Math.round(profitMargin * 100) / 100,
                incomeSources,
                expenseSources,
                monthlyData,
                paymentAnalysis,
            };

            return res.status(200).json({ success: true, data: overview });
        }

        // ============================================
        // ROUTE: INCOME - Detail Pemasukan
        // ============================================
        if (type === "income") {
            const [sales, transactions] = await Promise.all([
                Sale.find(dateFilter)
                    .populate("customerId", "nama email telepon")
                    .populate("productId", "namaProduk hargaJual kodeProduk")
                    .sort({ createdAt: -1 }),
                Transaction.find({
                    ...dateFilter,
                    paymentStatus: "settlement"
                })
                    .populate("customerId", "nama email telepon")
                    .populate("productId", "namaProduk hargaJual kodeProduk")
                    .sort({ createdAt: -1 }),
            ]);

            const incomeData = {
                summary: {
                    totalFromSales: sales.reduce((sum, s) => sum + (s.totalHarga || 0), 0),
                    totalFromOrders: transactions.reduce((sum, t) => sum + (t.grossAmount || 0), 0),
                    totalIncome: 0,
                    salesCount: sales.length,
                    ordersCount: transactions.length,
                },
                sales: sales.map(s => ({
                    _id: s._id,
                    date: s.createdAt,
                    type: "PENJUALAN",
                    customer: (s.customerId as any)?.nama || "N/A",
                    product: (s.productId as any)?.namaProduk || "N/A",
                    quantity: s.jumlah,
                    unitPrice: s.hargaSatuan,
                    totalAmount: s.totalHarga,
                })),
                orders: transactions.map(t => ({
                    _id: t._id,
                    date: t.settlementTime || t.createdAt,
                    type: "ORDER",
                    orderId: t.orderId,
                    customer: (t.customerId as any)?.nama || "N/A",
                    product: (t.productId as any)?.namaProduk || "N/A",
                    quantity: t.quantity,
                    totalAmount: t.grossAmount,
                    paymentType: t.paymentType,
                })),
            };

            incomeData.summary.totalIncome =
                incomeData.summary.totalFromSales + incomeData.summary.totalFromOrders;

            return res.status(200).json({ success: true, data: incomeData });
        }

        // ============================================
        // ROUTE: EXPENSES - Detail Pengeluaran
        // ============================================
        if (type === "expenses") {
            const purchases = await Purchase.find(dateFilter)
                .populate("supplierId", "nama email telepon")
                .sort({ createdAt: -1 });

            const expensesData = {
                summary: {
                    totalFromPurchases: purchases.reduce(
                        (sum, p) => sum + (p.hargaPerUnit * p.jumlah || 0),
                        0
                    ),
                    totalExpenses: 0,
                    purchasesCount: purchases.length,
                },
                purchases: purchases.map(p => ({
                    _id: p._id,
                    date: p.createdAt,
                    type: "PEMBELIAN",
                    supplier: (p.supplierId as any)?.nama || "N/A",
                    material: p.namaMaterial,
                    unit: p.unit,
                    quantity: p.jumlah,
                    unitPrice: p.hargaPerUnit,
                    totalAmount: p.hargaPerUnit * p.jumlah,
                })),
            };

            expensesData.summary.totalExpenses = expensesData.summary.totalFromPurchases;

            return res.status(200).json({ success: true, data: expensesData });
        }

        // ============================================
        // ROUTE: CASHFLOW - Arus Kas
        // ============================================
        if (type === "cashflow") {
            const [sales, transactions, purchases] = await Promise.all([
                Sale.find(dateFilter).sort({ createdAt: 1 }),
                Transaction.find({
                    ...dateFilter,
                    paymentStatus: "settlement"
                }).sort({ createdAt: 1 }),
                Purchase.find(dateFilter).sort({ createdAt: 1 }),
            ]);

            const cashflowData: any[] = [];
            let runningBalance = 0;

            // Combine all transactions
            const allEntries = [
                ...sales.map(s => ({
                    date: s.createdAt,
                    type: "PEMASUKAN - Penjualan",
                    amount: s.totalHarga || 0,
                    isIncome: true,
                })),
                ...transactions.map(t => ({
                    date: t.settlementTime || t.createdAt,
                    type: "PEMASUKAN - Order",
                    amount: t.grossAmount || 0,
                    isIncome: true,
                })),
                ...purchases.map(p => ({
                    date: p.createdAt,
                    type: "PENGELUARAN - Pembelian",
                    amount: p.hargaPerUnit * p.jumlah || 0,
                    isIncome: false,
                })),
            ].sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

            allEntries.forEach(entry => {
                runningBalance += entry.isIncome ? entry.amount : -entry.amount;
                cashflowData.push({
                    date: entry.date,
                    type: entry.type,
                    amount: entry.amount,
                    balance: runningBalance,
                });
            });

            return res.status(200).json({
                success: true,
                data: {
                    cashflow: cashflowData,
                    finalBalance: runningBalance,
                }
            });
        }

        // ============================================
        // ROUTE: PAYMENTS - Status Pembayaran
        // ============================================
        if (type === "payments") {
            const transactions = await Transaction.find(dateFilter)
                .populate("customerId", "nama email telepon")
                .populate("productId", "namaProduk")
                .sort({ createdAt: -1 });

            const paymentData = {
                summary: {
                    total: transactions.length,
                    pending: 0,
                    settlement: 0,
                    failed: 0,
                    totalPendingAmount: 0,
                    totalSettledAmount: 0,
                },
                transactions: transactions.map(t => ({
                    _id: t._id,
                    orderId: t.orderId,
                    date: t.createdAt,
                    customer: (t.customerId as any)?.nama || "N/A",
                    product: (t.productId as any)?.namaProduk || "N/A",
                    amount: t.grossAmount,
                    paymentStatus: t.paymentStatus,
                    paymentType: t.paymentType,
                    orderStatus: t.orderStatus,
                    transactionTime: t.transactionTime,
                    settlementTime: t.settlementTime,
                })),
            };

            transactions.forEach(t => {
                if (t.paymentStatus === "pending") {
                    paymentData.summary.pending++;
                    paymentData.summary.totalPendingAmount += t.grossAmount || 0;
                } else if (t.paymentStatus === "settlement") {
                    paymentData.summary.settlement++;
                    paymentData.summary.totalSettledAmount += t.grossAmount || 0;
                } else {
                    paymentData.summary.failed++;
                }
            });

            return res.status(200).json({ success: true, data: paymentData });
        }

        // ============================================
        // DEFAULT: Return error for unknown type
        // ============================================
        return res.status(400).json({
            success: false,
            message: "Invalid type. Use: overview, income, expenses, cashflow, or payments"
        });

    } catch (err: any) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export default enableCors(handler);