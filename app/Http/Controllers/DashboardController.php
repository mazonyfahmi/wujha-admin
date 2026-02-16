<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Refund;
use App\Models\Service;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Consolidated order stats — 1 query instead of 4
        $orderAgg = Order::toBase()->selectRaw("
            COUNT(*) as total_orders,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
            SUM(CASE WHEN DATE(created_at) = DATE('now') THEN 1 ELSE 0 END) as orders_today
        ")->first();

        $stats = [
            'total_orders' => $orderAgg->total_orders ?? 0,
            'pending_orders' => $orderAgg->pending_orders ?? 0,
            'active_customers' => Customer::where('status', true)->where('is_suspended', false)->count(),
            'total_services' => Service::where('is_active', true)->count(),
            'monthly_revenue' => Order::whereIn('status', ['issued'])
                ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                ->sum('price'),
            'orders_today' => $orderAgg->orders_today ?? 0,
        ];

        // Consolidated invoice stats — 1 query instead of 4
        $invAgg = Invoice::toBase()->selectRaw("
            COUNT(*) as total_invoices,
            SUM(CASE WHEN state = 'paid' THEN 1 ELSE 0 END) as paid_invoices,
            SUM(CASE WHEN state = 'pending' THEN 1 ELSE 0 END) as pending_invoices,
            SUM(CASE WHEN state = 'paid' THEN grand_total ELSE 0 END) as total_invoiced
        ")->first();

        $invoiceStats = [
            'total_invoices' => $invAgg->total_invoices ?? 0,
            'paid_invoices' => $invAgg->paid_invoices ?? 0,
            'total_invoiced' => $invAgg->total_invoiced ?? 0,
            'pending_invoices' => $invAgg->pending_invoices ?? 0,
        ];

        // Consolidated refund stats — 1 query instead of 4
        $refAgg = Refund::toBase()->selectRaw("
            COUNT(*) as total_refunds,
            SUM(CASE WHEN state = 'pending' THEN 1 ELSE 0 END) as pending_refunds,
            SUM(CASE WHEN state = 'processed' THEN 1 ELSE 0 END) as processed_refunds,
            SUM(CASE WHEN state = 'processed' THEN grand_total ELSE 0 END) as total_refunded
        ")->first();

        $refundStats = [
            'total_refunds' => $refAgg->total_refunds ?? 0,
            'pending_refunds' => $refAgg->pending_refunds ?? 0,
            'processed_refunds' => $refAgg->processed_refunds ?? 0,
            'total_refunded' => $refAgg->total_refunded ?? 0,
        ];

        // Recent orders
        $recentOrders = Order::with(['customer', 'service'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Orders by status for chart
        $ordersByStatus = Order::toBase()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->pluck('count', 'status');

        // Top services (by order count)
        $topServices = Service::withCount('orders')
            ->where('is_active', true)
            ->orderBy('orders_count', 'desc')
            ->take(5)
            ->get(['id', 'name', 'price', 'is_active']);

        // Recent invoices
        $recentInvoices = Invoice::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Recent refunds
        $recentRefunds = Refund::with(['customer'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Monthly revenue trend (last 6 months)
        $driver = DB::connection()->getDriverName();
        $isSqlite = $driver === 'sqlite' || $driver === 'sqlite3'; // Relaxed check

        $monthlyTrend = Order::whereIn('status', ['issued'])
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->select(
                $isSqlite ? DB::raw("strftime('%m', created_at) as month") : DB::raw('MONTH(created_at) as month'),
                $isSqlite ? DB::raw("strftime('%Y', created_at) as year") : DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(price) as total'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get();

        return Inertia::render('Dashboard/Index', [
            'stats' => $stats,
            'invoiceStats' => $invoiceStats,
            'refundStats' => $refundStats,
            'recentOrders' => $recentOrders,
            'ordersByStatus' => $ordersByStatus,
            'topServices' => $topServices,
            'recentInvoices' => $recentInvoices,
            'recentRefunds' => $recentRefunds,
            'monthlyTrend' => $monthlyTrend,
        ]);
    }
}
