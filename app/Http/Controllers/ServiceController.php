<?php

namespace App\Http\Controllers;

use App\Enums\ServiceType;
use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Models\Category;
use App\Models\Service;
use App\Models\ServiceImage;
use App\Repositories\ServiceRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ServiceController extends Controller
{
    public function __construct(
        protected ServiceRepository $serviceRepository
    ) {}

    /**
     * Display a listing of services
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Service::class);

        $filters = $request->only(['category_id', 'type', 'is_active', 'is_popular', 'search']);
        $services = $this->serviceRepository->paginate($filters, 12);
        $categories = Category::orderBy('sort_order')->get();
        $serviceTypes = ServiceType::toSelectOptions();

        return Inertia::render('Dashboard/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'serviceTypes' => $serviceTypes,
            'filters' => $filters,
        ]);
    }

    /**
     * Display a single service
     */
    public function show(Service $service)
    {
        $this->authorize('view', $service);

        $service = $this->serviceRepository->findWithRelations($service->id);
        $categories = Category::orderBy('sort_order')->get();
        $serviceTypes = ServiceType::toSelectOptions();

        return Inertia::render('Dashboard/Services/Show', [
            'service' => $service,
            'categories' => $categories,
            'serviceTypes' => $serviceTypes,
        ]);
    }

    /**
     * Show the form for creating a new service
     */
    public function create()
    {
        $this->authorize('create', Service::class);

        $categories = Category::orderBy('sort_order')->get();
        $serviceTypes = ServiceType::toSelectOptions();

        return Inertia::render('Dashboard/Services/Create', [
            'categories' => $categories,
            'serviceTypes' => $serviceTypes,
        ]);
    }

    /**
     * Show the form for editing a service
     */
    public function edit(Service $service)
    {
        $this->authorize('update', $service);

        $service = $this->serviceRepository->findWithRelations($service->id);
        $categories = Category::orderBy('sort_order')->get();
        $serviceTypes = ServiceType::toSelectOptions();

        return Inertia::render('Dashboard/Services/Edit', [
            'service' => $service,
            'categories' => $categories,
            'serviceTypes' => $serviceTypes,
        ]);
    }

    /**
     * Store a newly created service
     */
    public function store(StoreServiceRequest $request)
    {
        $this->authorize('create', Service::class);

        $this->serviceRepository->create($request->validated());

        return redirect()->back()->with('success', 'Service added successfully.');
    }

    /**
     * Update the specified service
     */
    public function update(UpdateServiceRequest $request, Service $service)
    {
        $this->authorize('update', $service);

        $this->serviceRepository->update($service, $request->validated());

        return redirect()->back()->with('success', 'Service updated successfully.');
    }

    /**
     * Remove the specified service
     */
    public function destroy(Service $service)
    {
        $this->authorize('delete', $service);

        $this->serviceRepository->delete($service);

        return redirect()->back()->with('success', 'Service deleted successfully.');
    }

    /**
     * Remove multiple services
     */
    public function bulkDelete(Request $request)
    {
        $this->authorize('bulkDelete', Service::class);

        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:services,id',
        ]);

        $this->serviceRepository->bulkDelete($request->ids);

        return redirect()->back()->with('success', 'Selected services deleted successfully.');
    }

    /**
     * Toggle service active status
     */
    public function toggleStatus(Request $request, Service $service)
    {
        $request->validate([
            'is_active' => 'required|boolean',
        ]);

        $service->update(['is_active' => $request->is_active]);

        return redirect()->back()->with('success', 'Service status updated.');
    }

    /**
     * Bulk toggle service active status
     */
    public function bulkToggleStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:services,id',
            'is_active' => 'required|boolean',
        ]);

        Service::whereIn('id', $request->ids)->update(['is_active' => $request->is_active]);

        return redirect()->back()->with('success', 'Services status updated.');
    }

    /**
     * Add image to service gallery
     */
    public function addImage(Request $request, Service $service)
    {
        $validated = $request->validate([
            'image_url' => 'required|string',
            'caption' => 'nullable|string|max:255',
        ]);

        $maxOrder = $service->images()->max('sort_order') ?? 0;

        $service->images()->create([
            'image_url' => $validated['image_url'],
            'caption' => $validated['caption'] ?? null,
            'sort_order' => $maxOrder + 1,
        ]);

        return redirect()->back()->with('success', 'Image added successfully.');
    }

    /**
     * Remove image from service gallery
     */
    public function removeImage(Service $service, ServiceImage $image)
    {
        // Ensure image belongs to the service
        if ($image->service_id !== $service->id) {
            abort(403);
        }

        // Delete from storage if it's a local file
        if (str_starts_with($image->image_url, '/storage/')) {
            $path = str_replace('/storage/', '', $image->image_url);
            Storage::disk('public')->delete($path);
        }

        $image->delete();

        return redirect()->back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Reorder images
     */
    public function reorderImages(Request $request, Service $service)
    {
        $validated = $request->validate([
            'images' => 'required|array',
            'images.*.id' => 'required|exists:service_images,id',
            'images.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($validated['images'] as $imageData) {
            ServiceImage::where('id', $imageData['id'])
                ->where('service_id', $service->id)
                ->update(['sort_order' => $imageData['sort_order']]);
        }

        return redirect()->back()->with('success', 'Images reordered successfully.');
    }

    /**
     * Get available slots for a service (API)
     */
    public function getSlots(Request $request, Service $service)
    {
        $date = $request->input('date', now()->toDateString());
        $slots = $this->serviceRepository->getAvailableSlots(
            $service,
            \Carbon\Carbon::parse($date)
        );

        return response()->json([
            'slots' => $slots,
            'service_id' => $service->id,
            'date' => $date,
        ]);
    }

    /**
     * Generate slots for a service
     */
    public function generateSlots(Request $request, Service $service)
    {
        $validated = $request->validate([
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'required|date|after_or_equal:start_date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_duration' => 'required|integer|min:15|max:480',
            'capacity' => 'required|integer|min:1',
            'exclude_days' => 'nullable|array',
            'exclude_days.*' => 'integer|min:0|max:6',
        ]);

        $slots = $this->serviceRepository->generateSlots(
            $service,
            \Carbon\Carbon::parse($validated['start_date']),
            \Carbon\Carbon::parse($validated['end_date']),
            $validated['start_time'],
            $validated['end_time'],
            $validated['slot_duration'],
            $validated['capacity'],
            $validated['exclude_days'] ?? []
        );

        return redirect()->back()->with('success', "{$slots->count()} time slot(s) created successfully.");
    }

    /**
     * Get service types for frontend
     */
    public function getTypes()
    {
        return response()->json(ServiceType::toSelectOptions());
    }
}
