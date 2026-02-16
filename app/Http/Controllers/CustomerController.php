<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    /**
     * Display a listing of the customers.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $query = Customer::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status === 'active');
        }

        // Suspended filter
        if ($request->filled('is_suspended')) {
            $query->where('is_suspended', $request->is_suspended === 'yes');
        }

        // Gender filter
        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        $customers = $query->withCount('orders')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $groups = \App\Models\CustomerGroup::all();

        return Inertia::render('Dashboard/Customers/Index', [
            'customers' => $customers,
            'groups' => $groups,
            'filters' => $request->only(['search', 'status', 'is_suspended', 'gender']),
        ]);
    }

    /**
     * Show the form for creating a new customer.
     */
    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('Dashboard/Customers/Create');
    }

    /**
     * Store a newly created customer in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', Customer::class);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'nullable|string|unique:customers,phone|max:20',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'customer_group_id' => 'required|exists:customer_groups,id',
            'status' => 'boolean',
            'is_suspended' => 'boolean',
            'subscribed_to_news_letter' => 'boolean',
            'notes' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        $password = $validated['password'] ?? Str::random(12); // Auto-generate secure password if not provided

        $data = array_merge($validated, [
            'password' => bcrypt($password),
            'is_verified' => true,
            'channel_id' => 1, // Default channel for now
            // 'token' => Str::random(30), // If verification was needed
        ]);

        Event::dispatch('customer.registration.before');

        $customer = Customer::create($data);

        Event::dispatch('customer.registration.after', $customer);

        // TODO: Send NewCustomerNotification email
        // Mail::queue(new NewCustomerNotification($customer, $password));

        return redirect()->route('customers.index')
            ->with('success', 'Customer created successfully.');
    }

    /**
     * Display the specified customer.
     */
    public function show(Customer $customer): Response
    {
        $this->authorize('view', $customer);

        $customer->load(['orders' => function ($query) {
            $query->latest()->take(5);
        }]);

        return Inertia::render('Dashboard/Customers/Show', [
            'customer' => $customer,
            'stats' => [
                'total_orders' => $customer->orders()->count(),
                // 'total_spent' => $customer->orders()->sum('grand_total'), // If column exists
                'address_count' => 0, // Placeholder
            ]
        ]);
    }

    /**
     * Show the form for editing the specified customer.
     */
    public function edit(Customer $customer): Response
    {
        return Inertia::render('Dashboard/Customers/Edit', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update the specified customer in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $this->authorize('update', $customer);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
            'phone' => 'nullable|string|max:20|unique:customers,phone,' . $customer->id,
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'status' => 'boolean',
            'is_suspended' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        Event::dispatch('customer.update.before', $customer->id);

        $customer->update($validated);

        Event::dispatch('customer.update.after', $customer);

        return redirect()->route('customers.index')
            ->with('success', 'Customer updated successfully.');
    }

    /**
     * Remove the specified customer from storage.
     */
    public function destroy(Customer $customer)
    {
        $this->authorize('delete', $customer);

        // Check for active orders
        $hasActiveOrders = $customer->orders()
            ->whereIn('status', ['pending', 'payment_confirmation', 'review', 'sent_to_agent', 'in_progress'])
            ->exists();

        if ($hasActiveOrders) {
            return redirect()->back()
                ->with('error', 'Cannot delete customer with active orders.');
        }

        $customer->delete();

        return redirect()->route('customers.index')
            ->with('success', 'Customer deleted successfully.');
    }

    /**
     * Bulk delete customers.
     */
    public function bulkDelete(Request $request)
    {
        $this->authorize('bulkDelete', Customer::class);

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:customers,id',
        ]);

        $activeStatuses = ['pending', 'payment_confirmation', 'review', 'sent_to_agent', 'in_progress'];

        // Filter out customers with active orders
        $customersWithActiveOrders = Customer::whereIn('id', $request->ids)
            ->whereHas('orders', function ($q) use ($activeStatuses) {
                $q->whereIn('status', $activeStatuses);
            })
            ->pluck('id')
            ->toArray();

        $deletableIds = array_diff($request->ids, $customersWithActiveOrders);

        if (empty($deletableIds)) {
            return redirect()->back()
                ->with('error', 'None of the selected customers can be deleted due to active orders.');
        }

        Customer::whereIn('id', $deletableIds)->delete();

        $skipped = count($customersWithActiveOrders);
        $deleted = count($deletableIds);
        $message = "{$deleted} customer(s) deleted successfully.";
        if ($skipped > 0) {
            $message .= " {$skipped} customer(s) skipped due to active orders.";
        }

        return redirect()->back()->with('success', $message);
    }

    /**
     * Bulk update customer status.
     */
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:customers,id',
            'status' => 'required|boolean',
        ]);

        Customer::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Customer status updated successfully.');
    }

    /**
     * Toggle customer suspension.
     */
    public function toggleSuspension(Customer $customer)
    {
        $this->authorize('toggleSuspension', $customer);

        $customer->update(['is_suspended' => !$customer->is_suspended]);

        $message = $customer->is_suspended 
            ? 'Customer has been suspended.' 
            : 'Customer suspension has been removed.';

        return redirect()->back()->with('success', $message);
    }
}
