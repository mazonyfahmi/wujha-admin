<?php

namespace App\Http\Controllers;

use App\Models\GDPRDataRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GDPRController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = GDPRDataRequest::with('customer');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $requests = $query->latest()->paginate(15);

        return Inertia::render('Dashboard/Customers/GDPR/Index', [
            'requests' => $requests,
            'filters' => $request->only(['status', 'type']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(GDPRDataRequest $gdprRequest): Response
    {
        $gdprRequest->load('customer');
        
        return Inertia::render('Dashboard/Customers/GDPR/Show', [
            'request' => $gdprRequest,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, GDPRDataRequest $gdprRequest)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,completed,declined',
            'notes' => 'nullable|string', // Internal notes or response
        ]);

        $gdprRequest->update([
            'status' => $validated['status'],
        ]);

        // TODO: Send email notification to customer about status update

        if ($validated['status'] === 'completed' && $gdprRequest->type === 'delete') {
            // Logic to delete customer data or anonymize it
            // $gdprRequest->customer->delete(); // Optional: driven by policy
        }

        return redirect()->route('gdpr.index')
            ->with('success', 'Request status updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(GDPRDataRequest $gdprRequest)
    {
        $gdprRequest->delete();

        return redirect()->route('gdpr.index')
            ->with('success', 'Request deleted successfully.');
    }
}
