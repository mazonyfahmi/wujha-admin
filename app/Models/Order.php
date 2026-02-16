<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Traits\Filterable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Order extends Model
{
    use HasFactory, Filterable, SoftDeletes;

    protected array $searchable = ['customer.first_name', 'customer.last_name', 'service.name'];
    protected array $filterable = ['status', 'payment_method'];
    protected $fillable = [
        'user_id',
        'customer_id',
        'service_id',
        'status',
        'payment_method',
        'payment_proof_url',
        'price',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'status' => OrderStatus::class,
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function invoice()
    {
        return $this->hasOne(Invoice::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return $this->status?->label() ?? $this->attributes['status'] ?? 'Unknown';
    }

    public static function getStatuses(): array
    {
        return OrderStatus::toArray();
    }
}
