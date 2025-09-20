<?php

namespace App\Services\Carriers;

use Illuminate\Support\Facades\Http;

class AramexService implements CarrierInterface
{
    public function createShipment(array $data): array
    {
        // Pseudo-call using plugin as reference to structure
        // Replace with real Aramex API endpoint and credentials
        return [
            'tracking_number' => 'ARMX' . uniqid(),
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





