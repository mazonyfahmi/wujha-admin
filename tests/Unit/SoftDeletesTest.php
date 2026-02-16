<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Invoice;
use App\Models\Order;
use App\Models\Refund;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SoftDeletesTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function order_is_soft_deleted()
    {
        $order = Order::factory()->create();
        $order->delete();

        $this->assertSoftDeleted('orders', ['id' => $order->id]);
        $this->assertDatabaseHas('orders', ['id' => $order->id]);
        $this->assertNull(Order::find($order->id));
        $this->assertNotNull(Order::withTrashed()->find($order->id));
    }

    #[Test]
    public function soft_deleted_order_can_be_restored()
    {
        $order = Order::factory()->create();
        $order->delete();

        Order::withTrashed()->find($order->id)->restore();

        $this->assertNotNull(Order::find($order->id));
        $this->assertNull(Order::find($order->id)->deleted_at);
    }

    #[Test]
    public function invoice_is_soft_deleted()
    {
        $order = Order::factory()->create();
        $invoice = Invoice::create([
            'increment_id' => 'INV00001',
            'state' => 'pending',
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'sub_total' => 100,
            'grand_total' => 100,
        ]);

        $invoice->delete();

        $this->assertSoftDeleted('invoices', ['id' => $invoice->id]);
        $this->assertNotNull(Invoice::withTrashed()->find($invoice->id));
    }

    #[Test]
    public function refund_is_soft_deleted()
    {
        $order = Order::factory()->create();
        $refund = Refund::create([
            'increment_id' => 'REF00001',
            'state' => 'pending',
            'order_id' => $order->id,
            'customer_id' => $order->customer_id,
            'refund_type' => 'full',
            'reason' => 'Customer requested',
            'sub_total' => 50,
            'grand_total' => 50,
        ]);

        $refund->delete();

        $this->assertSoftDeleted('refunds', ['id' => $refund->id]);
        $this->assertNotNull(Refund::withTrashed()->find($refund->id));
    }

    #[Test]
    public function service_is_soft_deleted()
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create(['category_id' => $category->id]);
        $service->delete();

        $this->assertSoftDeleted('services', ['id' => $service->id]);
        $this->assertNotNull(Service::withTrashed()->find($service->id));
    }
}
