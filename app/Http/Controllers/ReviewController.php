<?php

namespace App\Http\Controllers;

use App\Models\ServiceReview;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = ServiceReview::with(['service', 'customer']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $reviews = $query->latest()->paginate(15);

        return Inertia::render('Dashboard/Customers/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ServiceReview $review): Response
    {
        $review->load(['service', 'customer']);
        
        return Inertia::render('Dashboard/Customers/Reviews/Edit', [
            'review' => $review,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ServiceReview $review)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,disapproved',
            'comment' => 'nullable|string',
        ]);

        $oldStatus = $review->status;
        $review->update($validated);

        // Recalculate service average rating when status changes
        if ($oldStatus !== $validated['status']) {
            $service = $review->service;
            if ($service) {
                $avgRating = ServiceReview::where('service_id', $service->id)
                    ->where('status', 'approved')
                    ->avg('rating') ?? 0;

                $service->update([
                    'avg_rating' => round($avgRating, 2),
                ]);
            }
        }

        return redirect()->route('reviews.index')
            ->with('success', 'Review updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ServiceReview $review)
    {
        $review->delete();

        return redirect()->route('reviews.index')
            ->with('success', 'Review deleted successfully.');
    }

    /**
     * Bulk update status
     */
    public function massUpdate(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:service_reviews,id',
            'status' => 'required|in:pending,approved,disapproved',
        ]);

        ServiceReview::whereIn('id', $request->ids)->update(['status' => $request->status]);

        return redirect()->back()
            ->with('success', 'Reviews updated successfully.');
    }
    
    /**
     * Bulk delete
     */
    public function massDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:service_reviews,id',
        ]);

        ServiceReview::whereIn('id', $request->ids)->delete();

        return redirect()->back()
            ->with('success', 'Reviews deleted successfully.');
    }
}
