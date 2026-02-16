<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $primaryImage = $this->primary_image_url;
        $primaryImageUrl = $primaryImage
            ? (str_starts_with($primaryImage, 'http') ? $primaryImage : url($primaryImage))
            : null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'requirements' => $this->requirements,
            'terms' => $this->terms,
            'steps' => $this->steps,
            'price' => $this->price,
            'formatted_price' => number_format($this->price, 2) . ' SDG',
            'duration' => $this->duration,
            'min_duration' => $this->min_duration,
            'max_duration' => $this->max_duration,
            'deposit_amount' => $this->deposit_amount,
            'is_active' => $this->is_active,
            'is_popular' => $this->is_popular,
            'requires_approval' => $this->requires_approval,
            'type' => $this->type?->value ?? $this->type,
            'type_label' => $this->type_label,
            'type_label_en' => $this->type_label_en,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ServiceImageResource::collection($this->whenLoaded('images')),
            'primary_image' => $primaryImageUrl,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
