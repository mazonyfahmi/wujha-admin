<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'service_id',
        'name',
        'sku',
        'description',
        'qty',
        'price',
        'tax_amount',
        'discount_amount',
        'total',
        'additional',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'additional' => 'array',
    ];

    /**
     * Get the invoice that owns the item.
     */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Get the service for this item.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
