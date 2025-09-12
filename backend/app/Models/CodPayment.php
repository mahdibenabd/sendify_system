<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CodPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'carrier',
        'shipment_id',
        'amount_tnd',
        'status', // pending, settled
        'settled_at',
    ];

    protected $casts = [
        'settled_at' => 'datetime',
        'amount_tnd' => 'decimal:3',
    ];
}




