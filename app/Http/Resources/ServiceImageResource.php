<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceImageResource extends JsonResource
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
            'url' => $this->image_url
                ? (str_starts_with($this->image_url, 'http')
                    ? $this->image_url
                    : url('/api/v1/media/' . basename($this->image_url)))
                : null,
            'caption' => $this->caption,
            'sort_order' => $this->sort_order,
        ];
    }
}
