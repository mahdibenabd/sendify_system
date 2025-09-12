<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Merchant extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'fixed_commission_tnd',
        'aramex_api_key',
        'aramex_username',
        'aramex_password',
        'tunisiaexpress_api_key',
    ];
}




