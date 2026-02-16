<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class CustomerBulkActionsTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function bulk_delete_skips_customers_with_active_orders()
    {
        // 1. Create Admin User
        $admin = User::factory()->create(['role' => 'admin']);

        // 2. Create Customer with Active Order (pending)
        $customerWithOrder = Customer::factory()->create();
        Order::factory()->create([
            'customer_id' => $customerWithOrder->id,
            'status' => 'pending',
            'user_id' => $admin->id, // Required by DB constraint
        ]);

        // 3. Create Customer with No Active Orders (soft deleted or just no order)
        $customerDeletable = Customer::factory()->create();

        // 4. Perform Bulk Delete
        $response = $this->actingAs($admin)
            ->post(route('customers.bulk-delete'), [
                'ids' => [$customerWithOrder->id, $customerDeletable->id],
            ]);

        // 5. Assertions
        $response->assertRedirect();
        $response->assertSessionHas('success'); // Partial success message

        // Verify Customer A still exists
        $this->assertDatabaseHas('customers', ['id' => $customerWithOrder->id]);
        $this->assertNull($customerWithOrder->fresh()->deleted_at);

        // Verify Customer B is soft deleted
        $this->assertSoftDeleted('customers', ['id' => $customerDeletable->id]);
    }
}
