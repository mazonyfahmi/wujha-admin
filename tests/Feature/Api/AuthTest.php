<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function customer_can_register()
    {
        $response = $this->postJson(route('api.auth.register'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'phone' => '1234567890',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['user', 'token']]);

        $this->assertDatabaseHas('customers', ['email' => 'john@example.com']);
    }

    #[Test]
    public function customer_can_login_with_valid_credentials()
    {
        $customer = Customer::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
            'status' => true,
        ]);

        $response = $this->postJson(route('api.auth.login'), [
            'email' => 'jane@example.com',
            'password' => 'password',
            'device_name' => 'test-device',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['user', 'token']]);
    }

    #[Test]
    public function customer_cannot_login_with_invalid_credentials()
    {
        $customer = Customer::factory()->create([
            'email' => 'jane@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson(route('api.auth.login'), [
            'email' => 'jane@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(401);
    }

    #[Test]
    public function suspended_customer_cannot_login()
    {
        $customer = Customer::factory()->create([
            'email' => 'suspended@example.com',
            'password' => bcrypt('password'),
            'is_suspended' => true,
        ]);

        $response = $this->postJson(route('api.auth.login'), [
            'email' => 'suspended@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(403);
    }

    #[Test]
    public function authenticated_customer_can_access_protected_route()
    {
        $customer = Customer::factory()->create();
        
        $response = $this->actingAs($customer, 'sanctum')
            ->getJson(route('api.auth.user'));

        $response->assertStatus(200)
            ->assertJson(['data' => ['id' => $customer->id]]);
    }

    #[Test]
    public function unauthenticated_user_cannot_access_protected_route()
    {
        $response = $this->getJson(route('api.auth.user'));

        $response->assertStatus(401);
    }
}
