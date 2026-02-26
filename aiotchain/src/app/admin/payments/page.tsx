"use client";

import { fetchAPI } from "@/lib/api"; // Pastikan path ini benar
import {
    Activity,
    AlertCircle,
    ArrowUpRight,
    CheckCircle,
    Clock,
    DollarSign,
    Download,
    Filter,
    MoreHorizontal,
    Search,
    XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Tipe data untuk Payment sesuai response API
interface Payment {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string | null;
  user_id: number;
  user: {
      ID: number;
      username: string;
      email: string;
      role: string;
      profile_picture: string;
  };
  order_id: string;
  amount: number;
  status: string;
  payment_type: string;
  snap_url: string;
  transaction_id: string;
}

// Tipe data untuk Stats
interface PaymentStats {
  total_revenue: number;
  active_subscriptions: number;
  pending_payments: number;
  success_transactions: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    total_revenue: 0,
    active_subscriptions: 0,
    pending_payments: 0,
    success_transactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch Stats & Payments
  useEffect(() => {
    fetchData();
  }, [page, statusFilter]); // Refetch saat page atau filter berubah

  // Debounce search
  useEffect(() => {
      const timer = setTimeout(() => {
          setPage(1); // Reset ke halaman 1 saat search berubah
          fetchData();
      }, 500);
      return () => clearTimeout(timer);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Stats
      const statsData = await fetchAPI<PaymentStats>("/admin/payments/stats");
      setStats(statsData);

      // 2. Fetch Payments List
      const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          search: search,
          status: statusFilter === "All Status" ? "" : statusFilter.toLowerCase(), 
      });

      const paymentsData = await fetchAPI<{ data: Payment[]; total: number; page: number; limit: number }>(
        `/admin/payments?${queryParams.toString()}`
      );
      
      setPayments(paymentsData.data || []);
      setTotalPages(Math.ceil(paymentsData.total / paymentsData.limit));

    } catch (error) {
      console.error("Failed to fetch payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "failure":
      case "deny":
      case "cancel":
      case "expire":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: // challenge, etc
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "failure":
      case "deny":
      case "cancel":
      case "expire":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };


  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
            Payment & Subscriptions
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage transactions, revenue, and subscription billing.
          </p>
        </div>
        <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl font-bold text-sm text-foreground hover:bg-accent transition-colors">
                <Download className="w-4 h-4" />
                Export Report
            </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(stats.total_revenue),
            change: "+12.5%", // Mockup change
            trend: "up",
            icon: <DollarSign className="w-6 h-6 text-green-600" />,
            bg: "bg-green-100 dark:bg-green-900/20",
          },
          {
            title: "Active Subscriptions",
            value: stats.active_subscriptions.toString(),
            change: "+4.3%", // Mockup change
            trend: "up",
            icon: <Activity className="w-6 h-6 text-blue-600" />,
            bg: "bg-blue-100 dark:bg-blue-900/20",
          },
          {
            title: "Pending Payments",
            value: stats.pending_payments.toString(),
            change: "Wait for action",
            trend: "neutral",
            icon: <Clock className="w-6 h-6 text-amber-600" />,
            bg: "bg-amber-100 dark:bg-amber-900/20",
          },
          {
            title: "Success Transactions", // Ganti Failed jadi Success
            value: stats.success_transactions.toString(),
             change: "+2.1%", // Mockup
            trend: "up",
            icon: <CheckCircle className="w-6 h-6 text-purple-600" />, // Ganti icon
            bg: "bg-purple-100 dark:bg-purple-900/20",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="p-6 bg-card rounded-[2rem] border border-border shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${item.bg}`}>{item.icon}</div>
              <div
                className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                  item.trend === "up"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : item.trend === "down"
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {item.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                {item.change}
              </div>
            </div>
            <h3 className="text-muted-foreground text-sm font-bold mb-1">
              {item.title}
            </h3>
            <p className="text-2xl font-black text-foreground tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* FILTERS & SEARCH */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, email, or Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium transition-all"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0">
          {["All Status", "Success", "Pending", "Failure"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all border ${
                statusFilter === status
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                  : "bg-card text-foreground border-border hover:bg-accent"
              }`}
            >
              {status}
            </button>
          ))}
          <button className="px-3 py-3 bg-card border border-border rounded-xl hover:bg-accent transition-colors">
            <Filter className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="bg-card border border-border rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-black text-foreground">
            Recent Transactions
          </h2>
          <Link
            href="#"
            className="text-sm font-bold text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-bold">
                <th className="px-6 py-4">Transaction ID / Order ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan / Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                 <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground font-medium">
                        Loading transaction data...
                    </td>
                 </tr>
              ) : payments.length === 0 ? (
                <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground font-medium">
                        No transactions found.
                    </td>
                </tr>
              ) : (
                payments.map((payment) => (
                    <tr
                    key={payment.ID}
                    className="group hover:bg-muted/30 transition-colors"
                    >
                    <td className="px-6 py-4">
                        <div className="font-bold text-foreground">
                        {payment.order_id}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-1">
                        {payment.transaction_id || "-"}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                            {payment.user?.username?.substring(0, 2) || "U"}
                        </div>
                        <div>
                            <div className="font-bold text-foreground text-sm">
                            {payment.user?.username || "Unknown User"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                            {payment.user?.email || "-"}
                            </div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="font-bold text-sm text-foreground">
                        {payment.payment_type}
                        </span>
                    </td>
                    <td className="px-6 py-4 font-black text-foreground">
                        {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {new Date(payment.CreatedAt).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </td>
                    <td className="px-6 py-4">
                        <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(
                            payment.status
                        )}`}
                        >
                        {getStatusIcon(payment.status)}
                        {payment.status}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <button className="p-2 hover:bg-background rounded-full border border-transparent hover:border-border transition-all">
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
         {/* Pagination Info */}
         {totalPages > 1 && (
             <div className="p-4 border-t border-border flex justify-center gap-2">
                 <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1 rounded border border-border disabled:opacity-50 text-sm font-bold"
                 >
                     Prev
                 </button>
                 <span className="px-3 py-1 text-sm font-medium">Page {page} of {totalPages}</span>
                 <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 rounded border border-border disabled:opacity-50 text-sm font-bold"
                 >
                     Next
                 </button>
             </div>
         )}
      </div>
    </div>
  );
}
