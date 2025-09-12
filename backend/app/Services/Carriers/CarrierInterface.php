<?php

namespace App\Services\Carriers;

interface CarrierInterface
{
    public function createShipment(array $data): array; // returns ['tracking_number'=>..., 'label_url'=>...]
    public function getLabel(string $trackingNumber): ?string;
    public function track(string $trackingNumber): array; // returns normalized tracking events
    public function cancel(string $trackingNumber): bool;
    public function getRates(array $data): array; // returns list of rates
}




