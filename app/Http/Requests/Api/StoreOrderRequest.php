<?php

namespace App\Http\Requests\Api;

class StoreOrderRequest extends ApiFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:services,id'],
            'payment_method' => ['required', \Illuminate\Validation\Rule::in($this->getAllowedPaymentMethods())],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    private function getAllowedPaymentMethods(): array
    {
        $methods = [];
        
        if (\App\Models\Setting::get('payment_bank_transfer', '1') === '1') {
            $methods[] = 'bank_transfer';
        }
        
        if (\App\Models\Setting::get('payment_cash_on_delivery', '0') === '1') {
            $methods[] = 'cash';
        }

        if (\App\Models\Setting::get('payment_mobile_wallet', '0') === '1') {
            $methods[] = 'mada';
            $methods[] = 'apple_pay';
        }

        return $methods;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'service_id.required' => 'Please select a service.',
            'service_id.exists' => 'Selected service does not exist.',
            'payment_method.required' => 'Please select a payment method.',
            'payment_method.in' => 'Invalid payment method.',
        ];
    }
}
