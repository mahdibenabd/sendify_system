<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomerHistory extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'history', // JSON: array of {merchant_id, shipment_id, status, date}
    ];
}
