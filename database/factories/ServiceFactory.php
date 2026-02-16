<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Service>
 */
class ServiceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->paragraph(),
            'short_description' => $this->faker->sentence(),
            'price' => $this->faker->randomFloat(2, 10, 1000),
            'duration' => $this->faker->randomElement(['30 min', '1 hour', '2 hours']),
            'is_active' => true,
            'is_popular' => $this->faker->boolean(20),
            'requires_approval' => false,
            'type' => 'on_demand', // Default type based on model
            'category_id' => \App\Models\Category::factory(),
        ];
    }
}
