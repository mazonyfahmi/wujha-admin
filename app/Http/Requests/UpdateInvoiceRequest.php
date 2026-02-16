<?php

namespace App\Http\Requests;

use App\Enums\InvoiceState;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Authorization handled by policy
    }

    public function rules(): array
    {
        return [
            'state' => ['required', Rule::in(array_column(InvoiceState::cases(), 'value'))],
            'transaction_id' => ['nullable', 'string', 'max:255'],
        ];
    }
}
