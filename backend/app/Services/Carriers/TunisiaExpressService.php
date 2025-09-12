<?php

namespace App\Services\Carriers;

use Illuminate\Support\Facades\Http;

class TunisiaExpressService implements CarrierInterface
{
    public function createShipment(array $data): array
    {
        return [
            'tracking_number' => 'TNEX' . uniqid(),
            'label_url' => null,
        ];
    }

    public function getLabel(string $trackingNumber): ?string
    {
        return null;
    }

    public function track(string $trackingNumber): array
    {
        return [];
    }

    public function cancel(string $trackingNumber): bool
    {
        return true;
    }

    public function getRates(array $data): array
    {
        return [];
    }
}




