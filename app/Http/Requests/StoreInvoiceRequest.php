<?php

namespace App\Http\Requests;

use App\Enums\InvoiceState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'billing_address_name' => ['nullable', 'string', 'max:255'],
            'billing_address_email' => ['nullable', 'email', 'max:255'],
            'billing_address_phone' => ['nullable', 'string', 'max:20'],
            'billing_address' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.tax_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.discount_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.sku' => ['nullable', 'string', 'max:100'],
            'items.*.description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => 'Please select an order.',
            'order_id.exists' => 'The selected order does not exist.',
            'items.required' => 'At least one item is required.',
            'items.min' => 'At least one item is required.',
        ];
    }
}
