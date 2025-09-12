<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $fillable = [
        'merchant_id',
        'pickup_address_id',
        'customer_id',
        'carrier',
        'designation',
        'goods_price',
        'shipment_price',
        'commission',
        'total_price',
        'label',
        'recipient_name',
        'recipient_phone',
        'address_line1',
        'address_line2',
        'city',
        'delegation',
        'governorate',
        'postal_code',
        'status',
    ];

    public function pickupAddress()
    {
        return $this->belongsTo(PickupAddress::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
    
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'merchant_id');
    }
}



