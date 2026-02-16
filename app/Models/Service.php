<?php

namespace App\Models;

use App\Enums\ServiceType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Service Model
 * 
 * Represents a service that can be booked by customers.
 * Supports multiple service types: consultation, subscription, on_demand, package.
 * 
 * @property int $id
 * @property string $name
 * @property string $description
 * @property string|null $short_description
 * @property string|null $requirements
 * @property string|null $terms
 * @property array|null $steps
 * @property float $price
 * @property float|null $deposit_amount
 * @property string $duration
 * @property int|null $min_duration
 * @property int|null $max_duration
 * @property string|null $image_url
 * @property bool $is_active
 * @property bool $is_popular
 * @property bool $requires_approval
 * @property string $type
 * @property array|null $type_config
 * @property int $category_id
 */
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Service extends Model
{
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'name',
        'description',
        'short_description',
        'requirements',
        'terms',
        'steps',
        'price',
        'deposit_amount',
        'duration',
        'min_duration',
        'max_duration',
        'image_url',
        'is_active',
        'is_popular',
        'requires_approval',
        'type',
        'type_config',
        'category_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'is_active' => 'boolean',
        'is_popular' => 'boolean',
        'requires_approval' => 'boolean',
        'steps' => 'array',
        'type_config' => 'array',
        'min_duration' => 'integer',
        'max_duration' => 'integer',
        'type' => ServiceType::class,
    ];

    /**
     * Default attribute values
     */
    protected $attributes = [
        'type' => 'on_demand',
        'is_active' => true,
        'is_popular' => false,
        'requires_approval' => false,
    ];

    /**
     * Get the category this service belongs to
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get orders for this service
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get images for this service
     */
    public function images(): HasMany
    {
        return $this->hasMany(ServiceImage::class)->orderBy('sort_order');
    }

    /**
     * Get time slots for this service (for consultation type)
     */
    public function slots(): HasMany
    {
        return $this->hasMany(ServiceSlot::class)->orderBy('date')->orderBy('start_time');
    }

    /**
     * Get available slots for this service
     */
    public function availableSlots(): HasMany
    {
        return $this->slots()
            ->where('is_available', true)
            ->whereColumn('booked_count', '<', 'capacity');
    }

    /**
     * Get custom attributes for this service
     */
    public function attributes(): HasMany
    {
        return $this->hasMany(ServiceAttribute::class)->orderBy('sort_order');
    }

    /**
     * Check if service requires scheduling (appointment-based)
     */
    public function requiresScheduling(): bool
    {
        return $this->type?->requiresScheduling() ?? false;
    }

    /**
     * Get service type label
     */
    public function getTypeLabelAttribute(): string
    {
        return $this->type?->label() ?? 'Unknown';
    }

    /**
     * Get service type label in English
     */
    public function getTypeLabelEnAttribute(): string
    {
        return $this->type?->labelEn() ?? 'Unknown';
    }

    /**
     * Get service type icon
     */
    public function getTypeIconAttribute(): string
    {
        return $this->type?->icon() ?? 'QuestionCircleOutlined';
    }

    /**
     * Scope: Active services only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: Popular services
     */
    public function scopePopular($query)
    {
        return $query->where('is_popular', true);
    }

    /**
     * Scope: Filter by type
     */
    public function scopeOfType($query, ServiceType $type)
    {
        return $query->where('type', $type->value);
    }

    /**
     * Get formatted price with currency
     */
    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 2) . ' SDG';
    }

    /**
     * Get primary image URL
     */
    public function getPrimaryImageUrlAttribute(): ?string
    {
        if ($this->image_url) {
            return $this->image_url;
        }

        $firstImage = $this->images()->orderBy('sort_order')->first();
        return $firstImage ? $firstImage->image_url : null;
    }

    /**
     * Check if service has deposit requirement
     */
    public function hasDeposit(): bool
    {
        return $this->deposit_amount !== null && $this->deposit_amount > 0;
    }
}
