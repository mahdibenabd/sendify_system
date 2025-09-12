<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'merchant_id',
        'name',
        'phone',
        'email',
        'address',
        'governorate',
        'delegation',
        'localite',
        'postal_code',
        'score',
    ];

    public function shipments()
    {
        return $this->hasMany(Shipment::class);
    }

    public function getScoreAttribute()
    {
    $total = $this->shipments()->count();
    if ($total === 0) return 100;
    $canceled = $this->shipments()->where('status', 'canceled')->count();
    $returned = $this->shipments()->where('status', 'returned')->count();
    $score = 100 - (($canceled + $returned) * 20);
    if ($score < 0) $score = 0;
    return round($score);
    }

    public static function updateGlobalScore($name, $phone)
    {
        $customers = self::where('name', $name)->orWhere('phone', $phone)->get();
        $total = 0;
        $canceled = 0;
        $returned = 0;
        foreach ($customers as $customer) {
            $total += $customer->shipments()->count();
            $canceled += $customer->shipments()->where('status', 'canceled')->count();
            $returned += $customer->shipments()->where('status', 'returned')->count();
        }
        $score = $total === 0 ? 100 : 100 - (($canceled + $returned) * 20);
        if ($score < 0) $score = 0;
        $score = round($score);
        // Update or create CustomerHistory
        \App\Models\CustomerHistory::updateOrCreate(
            ['phone' => $phone],
            ['name' => $name, 'score' => $score]
        );
        // Optionally, update all customers' score field for consistency
        foreach ($customers as $customer) {
            $customer->score = $score;
            $customer->save();
        }
    }

    public static function findIntelligent($name, $phone)
    {
        // Try to find by exact phone
        $byPhone = self::where('phone', $phone)->orderByDesc('score')->first();
        if ($byPhone) return $byPhone;
        // Try to find by normalized name (case, spaces)
        $normalizedName = trim(strtolower($name));
        $byName = self::whereRaw('LOWER(TRIM(name)) = ?', [$normalizedName])->orderByDesc('score')->first();
        if ($byName) return $byName;
        // Fallback: no match
        return null;
    }
}
