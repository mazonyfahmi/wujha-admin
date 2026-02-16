<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ServiceResource;
use App\Models\Category;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends ApiController
{
    /**
     * Get all active services with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $query = Service::with(['category', 'images'])
            ->where('is_active', true);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->boolean('is_popular')) {
            $query->where('is_popular', true);
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        // Validate sort columns to prevent SQL injection
        $allowedSorts = ['created_at', 'name', 'price'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder === 'asc' ? 'asc' : 'desc');
        }

        // Pagination
        $perPage = min($request->get('per_page', 15), 50); // Max 50 per page
        $services = $query->paginate($perPage);

        return $this->paginatedResponse(
            ServiceResource::collection($services)
        );
    }

    /**
     * Get popular/featured services
     */
    public function popular(): JsonResponse
    {
        $services = Service::with(['category', 'images'])
            ->where('is_active', true)
            ->where('is_popular', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $this->successResponse(
            ServiceResource::collection($services)
        );
    }

    /**
     * Get featured services
     */
    public function featured(): JsonResponse
    {
        $services = Service::with(['category', 'images'])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return $this->successResponse(
            ServiceResource::collection($services)
        );
    }

    /**
     * Get services by category
     */
    public function byCategory(Category $category): JsonResponse
    {
        $services = Service::with('images')
            ->where('category_id', $category->id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return $this->successResponse([
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
            ],
            'services' => ServiceResource::collection($services),
        ]);
    }

    /**
     * Get service details with images
     */
    public function show(Service $service): JsonResponse
    {
        if (!$service->is_active) {
            return $this->notFoundResponse('Service not available.');
        }

        $service->load(['category', 'images']);

        // Increment view count if exists
        if (method_exists($service, 'incrementViewCount')) {
            $service->incrementViewCount();
        }

        return $this->resourceResponse(
            new ServiceResource($service)
        );
    }

    /**
     * Get related services
     */
    public function related(Service $service): JsonResponse
    {
        $relatedServices = Service::with(['category', 'images'])
            ->where('is_active', true)
            ->where('id', '!=', $service->id)
            ->where('category_id', $service->category_id)
            ->limit(6)
            ->get();

        return $this->successResponse(
            ServiceResource::collection($relatedServices)
        );
    }
}
