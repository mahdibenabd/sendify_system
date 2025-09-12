<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PickupAddress extends Model
{
    protected $fillable = [
        'merchant_id', 'label', 'address', 'city', 'postal_code', 'contact_name', 'contact_phone'
    ];
    public $timestamps = true;
}
