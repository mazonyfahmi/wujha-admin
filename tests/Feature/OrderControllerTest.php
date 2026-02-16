<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrderControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $agent;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->agent = User::factory()->create(['role' => 'agent']);
    }

    // ─── Authorization ───────────────────────────────────────────

    #[Test]
    public function admin_can_view_orders_index()
    {
        $response = $this->actingAs($this->admin)->get('/orders');
        $response->assertStatus(200);
    }

    #[Test]
    public function non_admin_user_cannot_view_orders_index()
    {
        // Routes use 'admin' middleware — only admin role is allowed
        $response = $this->actingAs($this->agent)->get('/orders');
        $response->assertStatus(403);
    }

    #[Test]
    public function guest_cannot_view_orders_index()
    {
        $response = $this->get('/orders');
        $response->assertRedirect('/login');
    }

    #[Test]
    public function admin_can_delete_order_without_invoice()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete("/orders/{$order->id}");

        $response->assertRedirect();
        $this->assertSoftDeleted('orders', ['id' => $order->id]);
    }

    #[Test]
    public function agent_cannot_delete_order()
    {
        $order = Order::factory()->create();

        $response = $this->actingAs($this->agent)
            ->delete("/orders/{$order->id}");

        $response->assertStatus(403);
    }

    // ─── CRUD ────────────────────────────────────────────────────

    #[Test]
    public function admin_can_create_order()
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);
        $customer = Customer::factory()->create();

        $response = $this->actingAs($this->admin)->post('/orders', [
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'price' => 250.00,
            'payment_method' => 'bank_transfer',
            'notes' => 'Test order',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'service_id' => $service->id,
            'customer_id' => $customer->id,
            'price' => 250.00,
        ]);
    }

    #[Test]
    public function admin_can_update_order_status()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $response = $this->actingAs($this->admin)
            ->patch("/orders/{$order->id}/status", ['status' => 'review']);

        $response->assertRedirect();
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'review',
        ]);
    }

    // ─── Pagination ──────────────────────────────────────────────

    #[Test]
    public function orders_index_returns_paginated_data()
    {
        Order::factory()->count(20)->create();

        $response = $this->actingAs($this->admin)->get('/orders');

        $response->assertStatus(200);
        $response->assertInertia(function ($page) {
            $page->component('Dashboard/Orders/Index')
                ->has('orders.data')
                ->has('orders.links')
                ->has('stats');
        });
    }
}
