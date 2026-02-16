<?php

namespace App\Http\Requests;

use App\Enums\ServiceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreServiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Basic Information
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            
            // Service Type
            'type' => ['required', Rule::enum(ServiceType::class)],
            'type_config' => ['nullable', 'array'],
            
            // Pricing
            'price' => ['required', 'numeric', 'min:0'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            
            // Duration
            'duration' => ['required', 'string', 'max:100'],
            'min_duration' => ['nullable', 'integer', 'min:1'],
            'max_duration' => ['nullable', 'integer', 'min:1', 'gte:min_duration'],
            
            // Category
            'category_id' => ['required', 'exists:categories,id'],
            
            // Content
            'requirements' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'steps' => ['nullable', 'array'],
            'steps.*' => ['string'],
            
            // Media
            'image_url' => ['nullable', 'string'],
            
            // Settings
            'is_active' => ['boolean'],
            'is_popular' => ['boolean'],
            'requires_approval' => ['boolean'],
            
            // Slots (for consultation type)
            'slots' => ['nullable', 'array'],
            'slots.*.date' => ['required_with:slots', 'date'],
            'slots.*.start_time' => ['required_with:slots', 'date_format:H:i'],
            'slots.*.end_time' => ['required_with:slots', 'date_format:H:i', 'after:slots.*.start_time'],
            'slots.*.capacity' => ['nullable', 'integer', 'min:1'],
            
            // Attributes
            'attributes' => ['nullable', 'array'],
            'attributes.*.key' => ['required_with:attributes', 'string', 'max:100'],
            'attributes.*.value_type' => ['required_with:attributes', 'in:text,number,boolean,select'],
            'attributes.*.value' => ['nullable', 'string'],
            'attributes.*.options' => ['nullable', 'array'],
            'attributes.*.is_required' => ['boolean'],
        ];
    }

    /**
     * Get custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Service name is required.',
            'name.max' => 'Service name must not exceed 255 characters.',
            'description.required' => 'Service description is required.',
            'type.required' => 'Service type is required.',
            'type.enum' => 'Invalid service type.',
            'price.required' => 'Price is required.',
            'price.min' => 'Price must be 0 or greater.',
            'duration.required' => 'Service duration is required.',
            'category_id.required' => 'Category is required.',
            'category_id.exists' => 'Selected category does not exist.',
            'max_duration.gte' => 'Maximum duration must be greater than minimum duration.',
            'slots.*.end_time.after' => 'End time must be after start time.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', true),
            'is_popular' => $this->boolean('is_popular', false),
            'requires_approval' => $this->boolean('requires_approval', false),
        ]);
    }
}
