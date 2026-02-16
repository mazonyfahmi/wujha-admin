<?php

namespace App\Http\Requests;

use App\Enums\RefundState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRefundRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'state' => ['required', Rule::in(array_column(RefundState::cases(), 'value'))],
            'admin_notes' => ['nullable', 'string', 'max:2000'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
