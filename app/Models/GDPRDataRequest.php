<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GDPRDataRequest extends Model
{
    use HasFactory;

    protected $table = 'gdpr_data_requests';

    protected $fillable = [
        'customer_id',
        'email',
        'type',
        'status',
        'message',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
