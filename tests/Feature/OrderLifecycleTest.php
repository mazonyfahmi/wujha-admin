<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class OrderLifecycleTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function order_can_be_created()
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);
        $customer = Customer::factory()->create();

        $order = Order::factory()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'status' => 'pending',
            'price' => 100.00,
        ]);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'pending',
            'price' => 100.00,
        ]);

        $this->assertEquals($customer->id, $order->customer->id);
        $this->assertEquals($service->id, $order->service->id);
    }

    #[Test]
    public function order_status_can_be_updated()
    {
        $order = Order::factory()->create(['status' => 'pending']);

        $order->update(['status' => 'in_progress']);

        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'status' => 'in_progress',
        ]);
    }
}
