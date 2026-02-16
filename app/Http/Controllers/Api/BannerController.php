<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends ApiController
{
    /**
     * Get active banners
     */
    public function index(Request $request): JsonResponse
    {
        $banners = Banner::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return $this->successResponse(
            BannerResource::collection($banners)
        );
    }

    /**
     * Get single banner
     */
    public function show(Banner $banner): JsonResponse
    {
        if (!$banner->is_active) {
            return $this->notFoundResponse('Banner not found.');
        }

        return $this->resourceResponse(
            new BannerResource($banner)
        );
    }
}
