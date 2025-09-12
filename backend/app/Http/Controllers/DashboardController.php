<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', '7'); // days
        $startDate = now()->subDays($period);
        $userId = $request->user()->id;

        $stats = [
            'total_shipments' => Shipment::where('merchant_id', $userId)->count(),
            'period_shipments' => Shipment::where('merchant_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count(),
            'delivered_shipments' => Shipment::where('merchant_id', $userId)
                ->where('status', 'delivered')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'in_transit_shipments' => Shipment::where('merchant_id', $userId)
                ->where('status', 'in_transit')
                ->count(),
            'returned_shipments' => Shipment::where('merchant_id', $userId)
                ->where('status', 'returned')
                ->where('created_at', '>=', $startDate)
                ->count(),
            'shipments_by_status' => Shipment::where('merchant_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'total_cod_amount' => Shipment::where('merchant_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->sum('cod_amount_tnd'),
            'commission_earned' => Shipment::where('merchant_id', $userId)
                ->where('created_at', '>=', $startDate)
                ->count() * config('billing.fixed_commission_tnd', 2.5),
            'delivery_rate' => $this->calculateDeliveryRate($userId, $startDate),
            'average_delivery_time' => $this->calculateAverageDeliveryTime($userId, $startDate),
        ];

        return response()->json($stats);
    }

    private function calculateDeliveryRate($userId, $startDate): float
    {
        $total = Shipment::where('merchant_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->whereIn('status', ['delivered', 'returned'])
            ->count();

        if ($total === 0) return 0;

        $delivered = Shipment::where('merchant_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->count();

        return round(($delivered / $total) * 100, 1);
    }

    private function calculateAverageDeliveryTime($userId, $startDate): float
    {
        $deliveredShipments = Shipment::where('merchant_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->where('status', 'delivered')
            ->whereNotNull('delivered_at')
            ->get();

        if ($deliveredShipments->isEmpty()) return 0;

        $totalDays = $deliveredShipments->sum(function ($shipment) {
            return $shipment->created_at->diffInDays($shipment->delivered_at);
        });

        return round($totalDays / $deliveredShipments->count(), 1);
    }
}

