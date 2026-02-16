<?php

namespace App\Http\Requests;

use App\Enums\RefundState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'exists:orders,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'refund_type' => ['required', 'in:full,partial'],
            'reason' => ['nullable', 'string', 'max:1000'],
            'refund_method' => ['nullable', 'string', 'in:original_payment,bank_transfer,wallet'],
            'adjustment_refund' => ['nullable', 'numeric', 'min:0'],
            'adjustment_fee' => ['nullable', 'numeric', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.name' => ['required', 'string'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.price' => ['required', 'numeric', 'min:0'],
            'items.*.tax_amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.sku' => ['nullable', 'string', 'max:100'],
            'items.*.description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'order_id.required' => 'Please select an order.',
            'items.required' => 'At least one refund item is required.',
            'refund_type.required' => 'Please select the refund type.',
        ];
    }
}
