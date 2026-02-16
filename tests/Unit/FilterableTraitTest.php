<?php

namespace Tests\Unit;

use App\Models\Category;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class FilterableTraitTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_filters_by_exact_match_column()
    {
        Order::factory()->create(['status' => 'pending', 'payment_method' => 'cash']);
        Order::factory()->create(['status' => 'review', 'payment_method' => 'cash']);
        Order::factory()->create(['status' => 'pending', 'payment_method' => 'mada']);

        $result = Order::filter(['status' => 'pending'])->get();

        $this->assertCount(2, $result);
        $result->each(fn ($o) => $this->assertEquals('pending', $o->getRawOriginal('status')));
    }

    #[Test]
    public function it_filters_by_date_range()
    {
        Order::factory()->create(['created_at' => '2026-01-01']);
        Order::factory()->create(['created_at' => '2026-01-15']);
        Order::factory()->create(['created_at' => '2026-02-01']);

        $result = Order::filter([
            'from_date' => '2026-01-10',
            'to_date' => '2026-01-20',
        ])->get();

        $this->assertCount(1, $result);
    }

    #[Test]
    public function it_searches_related_model_columns()
    {
        $customer = Customer::factory()->create([
            'first_name' => 'Ahmad',
            'last_name' => 'Hassan',
        ]);
        Order::factory()->create(['customer_id' => $customer->id]);
        Order::factory()->create(); // different customer

        $result = Order::filter(['search' => 'Ahmad'])->get();

        $this->assertCount(1, $result);
    }

    #[Test]
    public function it_searches_service_name()
    {
        $category = Category::factory()->create();
        $service = Service::factory()->create([
            'name' => 'Umrah Package',
            'category_id' => $category->id,
        ]);
        Order::factory()->create(['service_id' => $service->id]);
        Order::factory()->create(); // different service

        $result = Order::filter(['search' => 'Umrah'])->get();

        $this->assertCount(1, $result);
    }

    #[Test]
    public function it_returns_all_when_no_filters()
    {
        Order::factory()->count(5)->create();

        $result = Order::filter([])->get();

        $this->assertCount(5, $result);
    }

    #[Test]
    public function it_combines_multiple_filters()
    {
        Order::factory()->create([
            'status' => 'pending',
            'payment_method' => 'cash',
            'created_at' => '2026-01-15',
        ]);
        Order::factory()->create([
            'status' => 'pending',
            'payment_method' => 'mada',
            'created_at' => '2026-01-15',
        ]);
        Order::factory()->create([
            'status' => 'review',
            'payment_method' => 'cash',
            'created_at' => '2026-01-15',
        ]);

        $result = Order::filter([
            'status' => 'pending',
            'payment_method' => 'cash',
        ])->get();

        $this->assertCount(1, $result);
    }
}
