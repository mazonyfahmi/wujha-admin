<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'customer_id' => \App\Models\Customer::factory(),
            'service_id' => \App\Models\Service::factory(),
            'status' => 'pending',
            'payment_method' => 'credit_card',
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'notes' => $this->faker->sentence(),
        ];
    }
}
