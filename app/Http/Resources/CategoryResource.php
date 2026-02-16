<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'icon' => $this->icon
                ? (str_starts_with($this->icon, 'http')
                    ? $this->icon
                    : url('/api/v1/media/' . basename($this->icon)))
                : null,
            'color' => $this->color,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'services_count' => $this->when(
                $this->relationLoaded('services'),
                fn() => $this->services->count()
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
