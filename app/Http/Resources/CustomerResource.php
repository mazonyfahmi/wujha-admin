<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'avatar' => $this->avatar,
            'status' => $this->status,
            'is_verified' => $this->is_verified,
            'orders_count' => $this->when(
                $this->relationLoaded('orders') || isset($this->orders_count),
                fn() => $this->orders_count ?? $this->orders->count()
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
