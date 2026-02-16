<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends ApiController
{
    /**
     * Get all active categories
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::where('is_active', true);

        // Load services count
        if ($request->boolean('with_services_count')) {
            $query->withCount('services');
        }

        $categories = $query->orderBy('sort_order')->orderBy('name')->get();

        return $this->successResponse(
            CategoryResource::collection($categories)
        );
    }

    /**
     * Get category tree (same as index for flat categories)
     */
    public function tree(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->withCount('services')
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse(
            CategoryResource::collection($categories)
        );
    }

    /**
     * Get single category with services
     */
    public function show(Category $category): JsonResponse
    {
        if (!$category->is_active) {
            return $this->notFoundResponse('Category not found.');
        }

        $category->load(['services' => function ($q) {
            $q->where('is_active', true);
        }]);

        return $this->resourceResponse(
            new CategoryResource($category)
        );
    }
}
