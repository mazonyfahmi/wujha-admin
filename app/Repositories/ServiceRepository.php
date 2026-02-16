<?php

namespace App\Repositories;

use App\Enums\ServiceType;
use App\Models\Service;
use App\Models\ServiceSlot;
use App\Models\ServiceAttribute;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ServiceRepository
{
    /**
     * Create a new service with related data
     */
    public function create(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            // Extract related data
            $slots = $data['slots'] ?? [];
            $attributes = $data['attributes'] ?? [];
            unset($data['slots'], $data['attributes']);

            // Create the service
            $service = Service::create($data);

            // Create slots if provided
            if (!empty($slots)) {
                $this->syncSlots($service, $slots);
            }

            // Create attributes if provided
            if (!empty($attributes)) {
                $this->syncAttributes($service, $attributes);
            }

            return $service->fresh(['category', 'slots', 'attributes', 'images']);
        });
    }

    /**
     * Update a service with related data
     */
    public function update(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            // Extract related data
            $slots = $data['slots'] ?? null;
            $attributes = $data['attributes'] ?? null;
            unset($data['slots'], $data['attributes']);

            // Update the service
            $service->update($data);

            // Sync slots if provided
            if ($slots !== null) {
                $this->syncSlots($service, $slots);
            }

            // Sync attributes if provided
            if ($attributes !== null) {
                $this->syncAttributes($service, $attributes);
            }

            return $service->fresh(['category', 'slots', 'attributes', 'images']);
        });
    }

    /**
     * Delete a service and related data
     */
    public function delete(Service $service): bool
    {
        return DB::transaction(function () use ($service) {
            // Delete related images from storage
            foreach ($service->images as $image) {
                if (str_starts_with($image->image_url, '/storage/')) {
                    $path = str_replace('/storage/', '', $image->image_url);
                    Storage::disk('public')->delete($path);
                }
            }
            
            return $service->delete();
        });
    }

    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $services = Service::with('images')->whereIn('id', $ids)->get();

            foreach ($services as $service) {
                foreach ($service->images as $image) {
                    if (str_starts_with($image->image_url, '/storage/')) {
                        $path = str_replace('/storage/', '', $image->image_url);
                        Storage::disk('public')->delete($path);
                    }
                }
            }

            return Service::whereIn('id', $ids)->delete();
        });
    }

    /**
     * Find service with all relations
     */
    public function findWithRelations(int $id): ?Service
    {
        return Service::with(['category', 'slots', 'attributes', 'images'])
            ->find($id);
    }

    /**
     * Get paginated services with filters
     */
    public function paginate(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        $query = Service::with('category')
            ->withCount('images')
            ->orderBy('created_at', 'desc');

        // Filter by category
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filter by type
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        // Filter by popular
        if (isset($filters['is_popular'])) {
            $query->where('is_popular', (bool) $filters['is_popular']);
        }

        // Search by name
        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        return $query->paginate($perPage)->withQueryString();
    }

    /**
     * Get available slots for a service on a specific date
     */
    public function getAvailableSlots(Service $service, Carbon $date): Collection
    {
        return $service->slots()
            ->whereDate('date', $date)
            ->where('is_available', true)
            ->whereColumn('booked_count', '<', 'capacity')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Book a slot
     */
    public function bookSlot(ServiceSlot $slot, int $quantity = 1): bool
    {
        if ($slot->booked_count + $quantity > $slot->capacity) {
            return false;
        }

        $slot->increment('booked_count', $quantity);

        // Mark as unavailable if fully booked
        if ($slot->booked_count >= $slot->capacity) {
            $slot->update(['is_available' => false]);
        }

        return true;
    }

    /**
     * Cancel a slot booking
     */
    public function cancelSlotBooking(ServiceSlot $slot, int $quantity = 1): bool
    {
        $slot->decrement('booked_count', min($quantity, $slot->booked_count));

        // Mark as available again
        if ($slot->booked_count < $slot->capacity) {
            $slot->update(['is_available' => true]);
        }

        return true;
    }

    /**
     * Generate slots for a service based on configuration
     */
    public function generateSlots(
        Service $service,
        Carbon $startDate,
        Carbon $endDate,
        string $startTime,
        string $endTime,
        int $slotDuration = 60,
        int $capacity = 1,
        array $excludeDays = []
    ): Collection {
        $slots = collect();
        $current = $startDate->copy();

        while ($current->lte($endDate)) {
            // Skip excluded days (0 = Sunday, 6 = Saturday)
            if (!in_array($current->dayOfWeek, $excludeDays)) {
                $slotStart = $current->copy()->setTimeFromTimeString($startTime);
                $slotEnd = $current->copy()->setTimeFromTimeString($endTime);

                while ($slotStart->copy()->addMinutes($slotDuration)->lte($slotEnd)) {
                    $slot = $service->slots()->create([
                        'date' => $current->toDateString(),
                        'start_time' => $slotStart->format('H:i'),
                        'end_time' => $slotStart->copy()->addMinutes($slotDuration)->format('H:i'),
                        'capacity' => $capacity,
                        'booked_count' => 0,
                        'is_available' => true,
                    ]);
                    $slots->push($slot);

                    $slotStart->addMinutes($slotDuration);
                }
            }

            $current->addDay();
        }

        return $slots;
    }

    /**
     * Sync slots for a service
     */
    protected function syncSlots(Service $service, array $slots): void
    {
        $existingIds = [];

        foreach ($slots as $slotData) {
            if (isset($slotData['id'])) {
                // Update existing slot
                $slot = $service->slots()->find($slotData['id']);
                if ($slot) {
                    $slot->update($slotData);
                    $existingIds[] = $slot->id;
                }
            } else {
                // Create new slot
                $slot = $service->slots()->create($slotData);
                $existingIds[] = $slot->id;
            }
        }

        // Delete slots that were not in the update
        if (!empty($existingIds)) {
            $service->slots()->whereNotIn('id', $existingIds)->delete();
        }
    }

    /**
     * Sync attributes for a service
     */
    protected function syncAttributes(Service $service, array $attributes): void
    {
        $existingIds = [];

        foreach ($attributes as $index => $attrData) {
            $attrData['sort_order'] = $index;

            if (isset($attrData['id'])) {
                // Update existing attribute
                $attr = $service->attributes()->find($attrData['id']);
                if ($attr) {
                    $attr->update($attrData);
                    $existingIds[] = $attr->id;
                }
            } else {
                // Create new attribute
                $attr = $service->attributes()->create($attrData);
                $existingIds[] = $attr->id;
            }
        }

        // Delete attributes that were not in the update
        if (!empty($existingIds)) {
            $service->attributes()->whereNotIn('id', $existingIds)->delete();
        }
    }

    /**
     * Get services by type
     */
    public function getByType(ServiceType $type, bool $activeOnly = true): Collection
    {
        $query = Service::where('type', $type->value);

        if ($activeOnly) {
            $query->where('is_active', true);
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Get popular services
     */
    public function getPopular(int $limit = 6): Collection
    {
        return Service::where('is_active', true)
            ->where('is_popular', true)
            ->with('category')
            ->limit($limit)
            ->get();
    }
}
