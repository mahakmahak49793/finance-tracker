"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Download,
 
  Wallet,
  
  BarChart3,
  Calendar,
  Target,
  Sparkles,
  TrendingUp as ArrowUp,
  TrendingDown as ArrowDown,
  Menu,
  X,
  Plus,
} from "lucide-react";
import jsPDF from "jspdf";
import Link from "next/link";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  note?: string;
  date: string;
  category: {
    name: string;
    icon?: string;
  };
  account: {
    name: string;
  };
}

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

interface CategorySummary {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

// Updated theme colors - Green/Emerald theme
const THEME_COLORS = {
  primary: {
    light: "#10b981", // emerald-500
    DEFAULT: "#059669", // emerald-600
    dark: "#047857", // emerald-700
    lighter: "#d1fae5", // emerald-100
  },
  secondary: {
    light: "#34d399", // emerald-400
    DEFAULT: "#10b981", // emerald-500
    dark: "#059669", // emerald-600
  },
  accent: {
    blue: "#3b82f6", // blue-500
    amber: "#f59e0b", // amber-500
    purple: "#8b5cf6", // purple-500
  },
};

const CHART_COLORS = {
  expense: ["#ef4444", "#f97316", "#eab308", "#84cc16", "#06b6d4"],
  income: ["#10b981", "#0ea5e9", "#8b5cf6", "#ec4899", "#f59e0b"],
  accounts: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"],
};

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [activeChart, setActiveChart] = useState<"expense" | "income">(
    "expense"
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      let startDate = new Date();

      switch (timeRange) {
        case "week":
          // Get Monday of this week for week calculation
          const dayOfWeek = now.getDay();
          const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          startDate.setHours(0, 0, 0, 0);
          break;
        default:
          startDate.setMonth(now.getMonth() - 1);
          startDate.setHours(0, 0, 0, 0);
      }

      const [transactionsRes, accountsRes] = await Promise.all([
        fetch(`/api/transactions?startDate=${startDate.toISOString()}`),
        fetch("/api/accounts"),
      ]);

      const transactionsData = await transactionsRes.json();
      const accountsData = await accountsRes.json();

      const transactions =
        transactionsData.transactions || transactionsData || [];
      const accounts = accountsData.accounts || accountsData || [];

      setTransactions(Array.isArray(transactions) ? transactions : []);
      setAccounts(Array.isArray(accounts) ? accounts : []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setTransactions([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const transactionArray = Array.isArray(transactions) ? transactions : [];

    const income = transactionArray
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactionArray
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const accountArray = Array.isArray(accounts) ? accounts : [];
    const totalBalance = accountArray.reduce(
      (sum, acc) => sum + acc.balance,
      0
    );

    const totalTransactions = transactionArray.length;
    const avgTransaction =
      totalTransactions > 0 ? (income + expenses) / totalTransactions : 0;

    // Calculate change percentage based on time range
    let changePercentage = 0;
    if (timeRange === "week") {
      // For weekly, compare with previous week
      changePercentage =
        expenses > 0 ? ((income - expenses) / expenses) * 100 : 0;
    } else if (timeRange === "month") {
      // For monthly, compare income vs expenses
      changePercentage =
        expenses > 0 ? ((income - expenses) / income) * 100 : 100;
    }

    return {
      income,
      expenses,
      balance,
      totalBalance,
      totalTransactions,
      avgTransaction,
      changePercentage,
    };
  };

  const getCategoryBreakdown = (
    type: "income" | "expense"
  ): CategorySummary[] => {
    const transactionArray = Array.isArray(transactions) ? transactions : [];
    const filtered = transactionArray.filter((t) => t.type === type);
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = filtered.reduce((acc, t) => {
      const name = t.category.name;
      acc[name] = (acc[name] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    const colors =
      type === "expense" ? CHART_COLORS.expense : CHART_COLORS.income;

    return Object.entries(categoryMap)
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getWeeklyTrend = () => {
    const transactionArray = Array.isArray(transactions) ? transactions : [];
    const weeklyData: Record<string, { income: number; expense: number }> = {};

    const now = new Date();
    const startOfWeek = new Date(now);
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    transactionArray.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (date >= startOfWeek) {
        const dayKey = date.toLocaleDateString("en-US", { weekday: "short" });

        if (!weeklyData[dayKey]) {
          weeklyData[dayKey] = { income: 0, expense: 0 };
        }

        if (transaction.type === "income") {
          weeklyData[dayKey].income += transaction.amount;
        } else {
          weeklyData[dayKey].expense += transaction.amount;
        }
      }
    });

    // Ensure all days of the week are present
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const result = days.map((day) => ({
      day,
      ...(weeklyData[day] || { income: 0, expense: 0 }),
    }));

    return result;
  };

  const getMonthlyTrend = () => {
    const transactionArray = Array.isArray(transactions) ? transactions : [];
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    transactionArray.forEach((transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  // Get appropriate trend data based on time range
  const getTrendData = () => {
    if (timeRange === "week") {
      return getWeeklyTrend();
    } else {
      return getMonthlyTrend();
    }
  };

  // Memoized calculations for better performance
  const stats = useMemo(
    () => calculateStats(),
    [transactions, accounts, timeRange]
  );
  const expenseBreakdown = useMemo(
    () => getCategoryBreakdown("expense"),
    [transactions]
  );
  const incomeBreakdown = useMemo(
    () => getCategoryBreakdown("income"),
    [transactions]
  );
  const trendData = useMemo(() => getTrendData(), [transactions, timeRange]);

  // Calculate pie chart paths
  const getPieChartPaths = () => {
    const breakdown =
      activeChart === "expense" ? expenseBreakdown : incomeBreakdown;
    const totalPercentage = breakdown.reduce(
      (sum, cat) => sum + cat.percentage,
      0
    );

    if (totalPercentage === 0) return [];

    let currentAngle = 0;
    const paths = breakdown.map((cat, index) => {
      const angle = (cat.percentage / totalPercentage) * 360;
      const startAngle = currentAngle - 90; // Start from top
      const endAngle = startAngle + angle;

      // Convert angles to radians
      const startRad = startAngle * (Math.PI / 180);
      const endRad = endAngle * (Math.PI / 180);

      // Calculate coordinates
      const x1 = 50 + 40 * Math.cos(startRad);
      const y1 = 50 + 40 * Math.sin(startRad);
      const x2 = 50 + 40 * Math.cos(endRad);
      const y2 = 50 + 40 * Math.sin(endRad);

      // Determine if we need a large arc
      const largeArc = angle > 180 ? 1 : 0;

      // Create SVG path
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
        `Z`,
      ].join(" ");

      currentAngle += angle;

      return {
        path: pathData,
        color: cat.color,
        name: cat.name,
        percentage: cat.percentage,
      };
    });

    return paths;
  };

  const downloadPDFReport = async () => {
    try {
      // Create PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 15;
      const lineHeight = 7;

      // Title with green theme
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text("Personal Finance Report", margin, 25);

      // Subtitle
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      const rangeText =
        timeRange === "week"
          ? "This Week"
          : timeRange === "month"
          ? "This Month"
          : "This Year";
      doc.text(`Period: ${rangeText}`, margin, 35);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 42);

      let yPos = 50;

      // Summary Section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(5, 150, 105);
      doc.text("Financial Summary", margin, yPos);

      yPos += 10;

      // Summary stats
      const summaryData = [
        {
          label: "Total Balance",
          value: `$${stats.totalBalance.toFixed(2)}`,
          color: "#1e293b",
        },
        {
          label: "Total Income",
          value: `$${stats.income.toFixed(2)}`,
          color: "#10b981",
        },
        {
          label: "Total Expenses",
          value: `$${stats.expenses.toFixed(2)}`,
          color: "#ef4444",
        },
        {
          label: "Net Balance",
          value: `$${stats.balance.toFixed(2)}`,
          color: stats.balance >= 0 ? "#10b981" : "#ef4444",
        },
        {
          label: "Total Transactions",
          value: stats.totalTransactions.toString(),
          color: "#1e293b",
        },
        {
          label: "Performance",
          value: `${
            stats.changePercentage >= 0 ? "+" : ""
          }${stats.changePercentage.toFixed(1)}%`,
          color: stats.changePercentage >= 0 ? "#10b981" : "#ef4444",
        },
      ];

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      summaryData.forEach((item, index) => {
        const rowY = yPos + index * lineHeight;

        // Label
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text(item.label, margin, rowY);

        // Value
        doc.setFont("helvetica", "normal");
        doc.setTextColor(item.color);
        doc.text(item.value, margin + 80, rowY);
      });

      yPos += summaryData.length * lineHeight + 15;

      // Save the PDF
      doc.save(`finance-report-${timeRange}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Could not generate PDF. Please try again.");
    }
  };

  const pieChartPaths = getPieChartPaths();
  const isWeekly = timeRange === "week";
  const trendArray = Array.isArray(trendData) ? trendData : [];

  // Calculate max value for bar scaling
  const maxTrendValue = useMemo(() => {
    if (isWeekly) {
      return Math.max(
        1,
        ...(trendArray as Array<{ income: number; expense: number }>).map(
          (data) => Math.max(data.income, data.expense)
        )
      );
    } else {
      const monthlyTrend = trendArray as Array<
        [string, { income: number; expense: number }]
      >;
      return Math.max(
        1,
        ...monthlyTrend.map(([, data]) => Math.max(data.income, data.expense))
      );
    }
  }, [trendArray, isWeekly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-3 md:mb-4"></div>
          <p className="text-emerald-600 font-medium text-sm md:text-base">
            Loading your financial insights...
          </p>
        </div>
      </div>
    );
  }

  const getTimeRangeText = () => {
    switch (timeRange) {
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      case "year":
        return "This Year";
      default:
        return "This Month";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50/30 p-2 md:p-4 lg:p-6">
      {/* Floating Action Button for Mobile */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        aria-label="Add Transaction"
      >
        <Link href="/dashboard/transactions">
          <Plus size={24} />
        </Link>
      </button>

      <div className="w-full mx-auto max-w-7xl">
        {/* Mobile Header */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <Sparkles className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-emerald-200"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="bg-white rounded-xl border border-emerald-100 p-4 mb-4 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {["week", "month", "year"].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setTimeRange(range);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        timeRange === range
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {range === "week"
                        ? "Week"
                        : range === "month"
                        ? "Month"
                        : "Year"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-medium">
                  <Plus size={18} />
                  <Link href="/dashboard/transactions">Add Transaction</Link>
                </button>
                <button
                  onClick={downloadPDFReport}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg font-medium"
                >
                  <Download size={18} />
                  Export Report
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center mb-6 lg:mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Welcome back!
              </h1>
              <p className="text-gray-600 text-sm lg:text-base">
                Your Personal insights and financial overview
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-95 text-sm font-medium">
              <Plus size={18} />
              <span className="hidden sm:inline">
                <Link href="/dashboard/transactions">Add Transaction</Link>
              </span>
            </button>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl">
              <Calendar size={16} className="text-emerald-600" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-transparent focus:outline-none text-emerald-700 font-medium text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>

            <button
              onClick={downloadPDFReport}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all shadow-sm hover:shadow text-sm font-medium"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-emerald-100 p-4 md:p-6 mb-6 lg:mb-8 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Total Balance */}
            <div className="bg-emerald-50 rounded-xl p-4 md:p-6 text-green-900 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-900 text-sm md:text-base font-medium">
                    Total Balance
                  </p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">
                    ${stats.totalBalance.toFixed(2)}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-white/20 rounded-xl">
                  <Wallet size={20} className="md:w-6 md:h-6" />
                </div>
              </div>
              <div className="text-green-900 text-xs md:text-sm">
                Across all your accounts
              </div>
            </div>

            {/* Income & Expenses */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:border-emerald-200 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <ArrowUp className="text-emerald-600" size={14} />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Income
                      </p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-emerald-600">
                      ${stats.income.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        stats.changePercentage >= 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stats.changePercentage >= 0 ? "↗" : "↘"}
                      {Math.abs(stats.changePercentage).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:border-red-200 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-red-100 rounded-lg">
                        <ArrowDown className="text-red-600" size={14} />
                      </div>
                      <p className="text-gray-600 text-sm font-medium">
                        Total Expenses
                      </p>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-red-600">
                      ${stats.expenses.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Net Balance */}
              <div className="md:col-span-2">
                <div
                  className={`rounded-xl p-4 md:p-5 ${
                    stats.balance >= 0
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200"
                      : "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-700 text-sm font-medium">
                        Net Balance
                      </p>
                      <p
                        className={`text-xl md:text-2xl font-bold mt-1 ${
                          stats.balance >= 0
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        ${stats.balance.toFixed(2)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        {stats.balance >= 0
                          ? "You are saving money!"
                          : "Consider adjusting your expenses"}
                      </p>
                    </div>
                 <Target
  className={`${
    stats.balance >= 0 ? "text-emerald-500" : "text-red-500"
  } md:w-6 md:h-6`}
  size={20}
/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 lg:mb-8">
          {/* Spending & Income Analysis */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-emerald-100 p-4 md:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  Spending & Income Analysis
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  Where your money goes and comes from
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveChart("expense")}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                    activeChart === "expense"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Expenses
                </button>
                <button
                  onClick={() => setActiveChart("income")}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition ${
                    activeChart === "income"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Pie Chart */}
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className={`text-xl md:text-2xl font-bold ${
                          activeChart === "expense"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        $
                        {activeChart === "expense"
                          ? stats.expenses.toFixed(2)
                          : stats.income.toFixed(2)}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        Total {activeChart === "expense" ? "Spent" : "Earned"}
                      </div>
                    </div>
                  </div>
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {pieChartPaths.length > 0 ? (
                      pieChartPaths.map((pathData, index) => (
                        <path
                          key={index}
                          d={pathData.path}
                          fill={pathData.color}
                          opacity="0.9"
                        />
                      ))
                    ) : (
                      <circle cx="50" cy="50" r="40" fill="#e5e7eb" />
                    )}
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                {(activeChart === "expense"
                  ? expenseBreakdown
                  : incomeBreakdown
                ).length > 0 ? (
                  (activeChart === "expense"
                    ? expenseBreakdown
                    : incomeBreakdown
                  ).map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 hover:bg-gray-50/50 rounded-xl transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {cat.name}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500">
                            {cat.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm md:text-base ml-2">
                        ${cat.amount.toFixed(2)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 md:py-8">
                    <p className="text-gray-500 text-sm md:text-base">
                      No {activeChart === "expense" ? "expenses" : "income"}{" "}
                      recorded
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-emerald-100 p-4 md:p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <BarChart3 className="text-emerald-600 size={18}md:w-5 md:h-5" />
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {isWeekly ? "Weekly Trend" : "Monthly Trend"}
                </h3>
                <p className="text-xs md:text-sm text-gray-500">
                  {isWeekly
                    ? "Daily activity this week"
                    : "Last 6 months overview"}
                </p>
              </div>
            </div>

            <div className="space-y-6 md:space-y-8">
              {trendArray.length > 0 ? (
                isWeekly ? (
                  (
                    trendArray as Array<{
                      day: string;
                      income: number;
                      expense: number;
                    }>
                  ).map((data, idx) => {
                    const maxHeight = 60;
                    const incomeHeight =
                      (data.income / maxTrendValue) * maxHeight;
                    const expenseHeight =
                      (data.expense / maxTrendValue) * maxHeight;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-10 md:w-12 text-xs md:text-sm font-medium text-gray-700">
                            {data.day}
                          </div>
                          <div className="flex gap-2 md:gap-3">
                            {data.income > 0 && (
                              <div className="text-right">
                                <div className="text-xs font-medium text-emerald-600">
                                  ${data.income.toFixed(0)}
                                </div>
                              </div>
                            )}
                            {data.expense > 0 && (
                              <div className="text-right">
                                <div className="text-xs font-medium text-red-600">
                                  ${data.expense.toFixed(0)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-end gap-1 md:gap-2 h-10 md:h-12">
                          {data.income > 0 && (
                            <div className="flex-1">
                              <div
                                className="w-full bg-emerald-400 rounded-t transition-all duration-300"
                                style={{ height: `${incomeHeight}px` }}
                              />
                            </div>
                          )}
                          {data.expense > 0 && (
                            <div className="flex-1">
                              <div
                                className="w-full bg-red-400 rounded-t transition-all duration-300"
                                style={{ height: `${expenseHeight}px` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  (
                    trendArray as Array<
                      [string, { income: number; expense: number }]
                    >
                  ).map(([month, data], idx) => {
                    const maxHeight = 60;
                    const incomeHeight =
                      (data.income / maxTrendValue) * maxHeight;
                    const expenseHeight =
                      (data.expense / maxTrendValue) * maxHeight;

                    return (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="w-16 md:w-20 text-xs md:text-sm font-medium text-gray-700 truncate">
                            {new Date(month + "-01").toLocaleDateString(
                              "en-US",
                              { month: "short", year: "2-digit" }
                            )}
                          </div>
                          <div className="flex gap-2 md:gap-3">
                            <div className="text-right">
                              <div className="text-xs font-medium text-emerald-600">
                                ${data.income.toFixed(0)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-medium text-red-600">
                                ${data.expense.toFixed(0)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-end gap-1 md:gap-2 h-10 md:h-12">
                          <div className="flex-1">
                            <div
                              className="w-full bg-emerald-400 rounded-t transition-all duration-300"
                              style={{ height: `${incomeHeight}px` }}
                            />
                          </div>
                          <div className="flex-1">
                            <div
                              className="w-full bg-red-400 rounded-t transition-all duration-300"
                              style={{ height: `${expenseHeight}px` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                <div className="text-center py-6 md:py-8">
                  <p className="text-gray-500 text-sm md:text-base">
                    No trend data available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Accounts Overview */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl lg:rounded-2xl border border-emerald-100 p-4 md:p-6 mb-6 lg:mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
                Your Accounts
              </h3>
              <p className="text-xs md:text-sm text-gray-500">
                All your financial accounts in one place
              </p>
            </div>
            <div className="text-sm text-emerald-600 font-medium">
              {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
            </div>
          </div>

          <div className="space-y-3">
            {Array.isArray(accounts) && accounts.length > 0 ? (
              accounts.map((account, idx) => {
                const color =
                  CHART_COLORS.accounts[idx % CHART_COLORS.accounts.length];
                const percentage =
                  stats.totalBalance > 0
                    ? (account.balance / stats.totalBalance) * 100
                    : 0;

                return (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 md:p-4 hover:bg-gray-50/50 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ backgroundColor: color }}
                      >
                        {account.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm md:text-base truncate">
                          {account.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 capitalize truncate">
                          {account.type}
                        </p>
                      </div>
                    </div>

                    <div className="text-right ml-2">
                      <p className="text-base md:text-lg font-bold text-gray-900 whitespace-nowrap">
                        ${account.balance.toFixed(2)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                        {percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 md:py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Wallet className="text-emerald-400 size={20} md:w-6 md:h-6" />
                </div>
                <p className="text-gray-500 text-sm md:text-base">
                  No accounts found
                </p>
                <p className="text-xs md:text-sm text-gray-400 mt-1">
                  Add your accounts to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Financial Insight */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl lg:rounded-2xl p-4 md:p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="md:max-w-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="md:w-5 md:h-5" />
                <h3 className="text-base md:text-lg font-semibold">
                  Financial Insight
                </h3>
              </div>
              <p className="text-emerald-100 text-sm md:text-base">
                {stats.balance >= 0
                  ? "Great work! Your income exceeds expenses. Consider saving or investing the surplus."
                  : "Review your spending habits. Try reducing discretionary expenses this week."}
              </p>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 mt-4 md:mt-0">
              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">
                  {stats.totalTransactions}
                </div>
                <div className="text-emerald-100/90 text-xs md:text-sm">
                  Transactions
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl md:text-2xl font-bold">
                  ${stats.avgTransaction.toFixed(0)}
                </div>
                <div className="text-emerald-100/90 text-xs md:text-sm">
                  Avg. Transaction
                </div>
              </div>

              <div
                className={`text-center px-3 py-1 rounded-full ${
                  stats.balance >= 0
                    ? "bg-emerald-400/20 text-white"
                    : "bg-red-400/20 text-white"
                }`}
              >
                <div className="text-xs md:text-sm font-medium">
                  {stats.balance >= 0 ? "Positive" : "Needs Attention"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
