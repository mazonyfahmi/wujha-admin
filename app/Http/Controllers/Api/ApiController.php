<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

/**
 * Base API Controller
 * 
 * Provides unified response methods following Bagisto patterns.
 * All API controllers should extend this class.
 */
abstract class ApiController extends Controller
{
    /**
     * Success response with data
     */
    protected function successResponse(
        mixed $data = null,
        ?string $message = null,
        int $code = Response::HTTP_OK
    ): JsonResponse {
        $response = [
            'success' => true,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Success response with Resource
     */
    protected function resourceResponse(
        JsonResource|ResourceCollection $resource,
        ?string $message = null,
        int $code = Response::HTTP_OK
    ): JsonResponse {
        $response = [
            'success' => true,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        $response['data'] = $resource;

        return response()->json($response, $code);
    }

    /**
     * Success response with paginated data
     */
    protected function paginatedResponse(
        ResourceCollection $collection,
        ?string $message = null
    ): JsonResponse {
        $paginator = $collection->resource;
        
        $response = [
            'success' => true,
        ];

        if ($message) {
            $response['message'] = $message;
        }

        $response['data'] = $collection;
        $response['meta'] = [
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
        $response['links'] = [
            'first' => $paginator->url(1),
            'last' => $paginator->url($paginator->lastPage()),
            'prev' => $paginator->previousPageUrl(),
            'next' => $paginator->nextPageUrl(),
        ];

        return response()->json($response);
    }

    /**
     * Error response
     */
    protected function errorResponse(
        string $message,
        int $code = Response::HTTP_BAD_REQUEST,
        ?array $errors = null
    ): JsonResponse {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Not found response
     */
    protected function notFoundResponse(?string $message = null): JsonResponse
    {
        return $this->errorResponse(
            $message ?? trans('api.not_found'),
            Response::HTTP_NOT_FOUND
        );
    }

    /**
     * Unauthorized response
     */
    protected function unauthorizedResponse(?string $message = null): JsonResponse
    {
        return $this->errorResponse(
            $message ?? trans('api.unauthorized'),
            Response::HTTP_UNAUTHORIZED
        );
    }

    /**
     * Forbidden response
     */
    protected function forbiddenResponse(?string $message = null): JsonResponse
    {
        return $this->errorResponse(
            $message ?? trans('api.forbidden'),
            Response::HTTP_FORBIDDEN
        );
    }

    /**
     * Validation error response
     */
    protected function validationErrorResponse(array $errors): JsonResponse
    {
        return $this->errorResponse(
            trans('api.validation_failed'),
            Response::HTTP_UNPROCESSABLE_ENTITY,
            $errors
        );
    }

    /**
     * Created response
     */
    protected function createdResponse(
        mixed $data = null,
        ?string $message = null
    ): JsonResponse {
        return $this->successResponse(
            $data,
            $message ?? trans('api.created'),
            Response::HTTP_CREATED
        );
    }

    /**
     * No content response (for successful delete)
     */
    protected function noContentResponse(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    /**
     * Deleted response
     */
    protected function deletedResponse(?string $message = null): JsonResponse
    {
        return $this->successResponse(
            null,
            $message ?? trans('api.deleted')
        );
    }
}
