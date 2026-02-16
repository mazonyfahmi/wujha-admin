<?php

namespace App\Http\Controllers;

use App\Models\CustomerGroup;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerGroupController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $groups = CustomerGroup::orderBy('id', 'asc')->paginate(15);

        return Inertia::render('Dashboard/Customers/Groups/Index', [
            'groups' => $groups,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('Dashboard/Customers/Groups/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:customer_groups,code|max:255',
            'name' => 'required|string|max:255',
        ]);

        CustomerGroup::create(array_merge($validated, [
            'is_user_defined' => true,
        ]));

        return redirect()->route('customer-groups.index')
            ->with('success', 'Customer group created successfully.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(CustomerGroup $customerGroup): Response
    {
        return Inertia::render('Dashboard/Customers/Groups/Edit', [
            'group' => $customerGroup,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, CustomerGroup $customerGroup)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:255|unique:customer_groups,code,' . $customerGroup->id,
            'name' => 'required|string|max:255',
        ]);

        // Prevent updating code for system groups if needed, keeping simple for now
        $customerGroup->update($validated);

        return redirect()->route('customer-groups.index')
            ->with('success', 'Customer group updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(CustomerGroup $customerGroup)
    {
        if (!$customerGroup->is_user_defined) {
            return redirect()->back()
                ->with('error', 'System groups cannot be deleted.');
        }

        if ($customerGroup->customers()->exists()) {
            return redirect()->back()
                ->with('error', 'Cannot delete group with assigned customers.');
        }

        $customerGroup->delete();

        return redirect()->route('customer-groups.index')
            ->with('success', 'Customer group deleted successfully.');
    }
}
