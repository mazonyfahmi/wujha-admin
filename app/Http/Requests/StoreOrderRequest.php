<?php

namespace App\Http\Requests;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'exists:customers,id'],
            'service_id' => ['required', 'exists:services,id'],
            'payment_method' => ['required', 'string', 'in:bank_transfer,cash,online'],
            'price' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'Please select a customer.',
            'customer_id.exists' => 'The selected customer does not exist.',
            'service_id.required' => 'Please select a service.',
            'service_id.exists' => 'The selected service does not exist.',
            'payment_method.required' => 'Please select a payment method.',
            'price.required' => 'Price is required.',
            'price.min' => 'Price must be a positive number.',
        ];
    }
}
