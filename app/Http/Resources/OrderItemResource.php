<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
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
            'service' => new ServiceResource($this->whenLoaded('service')),
            'quantity' => $this->quantity,
            'price' => $this->price,
            'total' => $this->total,
            'formatted_total' => number_format($this->total, 2) . ' SDG',
            'options' => $this->options,
        ];
    }
}
