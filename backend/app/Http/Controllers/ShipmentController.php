<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;

class ShipmentController extends Controller
{
    public function track($tracking_number)
    {
        $shipment = Shipment::where('tracking_number', $tracking_number)->first();
        if (!$shipment) {
            return response()->json(['error' => 'Shipment not found'], 404);
        }
        return response()->json([
            'id' => $shipment->id,
            'tracking_number' => $shipment->tracking_number,
            'status' => $shipment->status,
            'recipient_name' => $shipment->recipient_name,
            'recipient_phone' => $shipment->recipient_phone,
            'address' => $shipment->address_line1 . ' ' . $shipment->address_line2 . ' ' . $shipment->city . ' ' . $shipment->delegation . ' ' . $shipment->governorate . ' ' . $shipment->postal_code,
            'designation' => $shipment->designation,
            'created_at' => $shipment->created_at,
        ]);
    }
    public function create()
    {
        $user = auth()->user();
        $pickupAddresses = \App\Models\PickupAddress::where('merchant_id', $user->id)->get();
        $customers = \App\Models\Customer::where('merchant_id', $user->id)->get();
        $shipmentPrice = config('settings.shipment_price', 10.000); // Example default
        $commission = config('settings.commission', 2.000); // Example default
        return view('shipments.create', compact('pickupAddresses', 'customers', 'shipmentPrice', 'commission'));
    }


    public function index(Request $request)
    {
        $user = $request->user();
        $shipments = \App\Models\Shipment::where('merchant_id', $user->id)->orderByDesc('id')->get();
        return response()->json(['data' => $shipments]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'pickup_address_id' => 'required|exists:pickup_addresses,id',
            'customer_id' => 'nullable|exists:customers,id',
            'new_customer_name' => 'nullable|string',
            'new_customer_phone' => 'nullable|string',
            'goods_price' => 'required|numeric|min:0',
            'designation' => 'nullable|string',
        ]);

        // Handle new customer creation
        if (empty($data['customer_id']) && $data['new_customer_name']) {
            $customer = \App\Models\Customer::create([
                'name' => $data['new_customer_name'],
                'phone' => $data['new_customer_phone'],
            ]);
            $data['customer_id'] = $customer->id;
        }

    // Get commission rate, shipping fee, and barcode prefix from settings
    $commission = (float) (\App\Models\Setting::where('key', 'commission_rate')->value('value') ?? 2.000);
    $shipmentPrice = (float) (\App\Models\Setting::where('key', 'shipping_fee')->value('value') ?? 10.000);
    $barcodePrefix = \App\Models\Setting::where('key', 'barcode_prefix')->value('value') ?? 'CustomLabel';
    $totalPrice = $data['goods_price'] + $shipmentPrice + $commission;

        // Get customer info
        $customer = \App\Models\Customer::find($data['customer_id']);
        $governorate = strtolower($customer->governorate ?? '');
        $tunisiaExpressGovernorates = ['ariana', 'tunis', 'ben arous', 'manouba', 'nabeul'];
        $carrier = in_array($governorate, $tunisiaExpressGovernorates) ? 'tunisia express' : 'aramex';

        $shipment = Shipment::create([
            'merchant_id' => $request->user()->id,
            'pickup_address_id' => $data['pickup_address_id'],
            'customer_id' => $data['customer_id'],
            'designation' => $data['designation'] ?? null,
            'goods_price' => $data['goods_price'],
            'shipment_price' => $shipmentPrice,
            'commission' => $commission,
            'total_price' => $totalPrice,
            'label' => $barcodePrefix . uniqid(),
            'carrier' => $carrier,
            'recipient_name' => $customer->name,
            'recipient_phone' => $customer->phone,
            'address_line1' => $customer->address_line1 ?? '',
            'address_line2' => $customer->address_line2 ?? '',
            'city' => $customer->city ?? '',
            'delegation' => $customer->delegation ?? '',
            'governorate' => $customer->governorate ?? '',
            'postal_code' => $customer->postal_code ?? '',
        ]);
        // Save shipment history in CustomerHistory
        $history = \App\Models\CustomerHistory::firstOrCreate([
            'phone' => $customer->phone
        ], [
            'name' => $customer->name,
            'history' => json_encode([])
        ]);
        $histArr = json_decode($history->history ?? '[]', true);
        $histArr[] = [
            'merchant_id' => $shipment->merchant_id,
            'shipment_id' => $shipment->id,
            'status' => $shipment->status,
            'date' => now()->toDateTimeString()
        ];
        $history->history = json_encode($histArr);
        $history->save();
        \App\Models\Customer::updateGlobalScore($shipment->recipient_name, $shipment->recipient_phone);
        return response()->json(['shipment' => $shipment]);
    }
    public function label($id, Request $request)
    {
        $shipment = Shipment::findOrFail($id);
        $pickupAddress = $shipment->pickupAddress;
        $merchant = $pickupAddress ? \App\Models\User::find($pickupAddress->merchant_id) : null;
        $format = $request->query('format', 'pdf');
        if ($format === 'pdf') {
            $html = view('pdf.shipment-label', [
                'shipment' => $shipment,
                'pickupAddress' => $pickupAddress,
                'merchant' => $merchant,
            ])->render();
            $options = new \Dompdf\Options();
            $options->set('isRemoteEnabled', true);
            $dompdf = new \Dompdf\Dompdf($options);
            $dompdf->loadHtml($html);
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            return response($dompdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'inline; filename=shipment-label-' . $shipment->id . '.pdf');
        }
        return response()->json(['error' => 'Format not supported'], 400);
    }

    public function update(Request $request, $id)
    {
        $shipment = Shipment::findOrFail($id);
        $shipment->update($request->all());
        // Save shipment history in CustomerHistory
        $customer = \App\Models\Customer::where('phone', $shipment->recipient_phone)->first();
        if ($customer) {
            $history = \App\Models\CustomerHistory::firstOrCreate([
                'phone' => $customer->phone
            ], [
                'name' => $customer->name,
                'history' => json_encode([])
            ]);
            $histArr = json_decode($history->history ?? '[]', true);
            $histArr[] = [
                'merchant_id' => $shipment->merchant_id,
                'shipment_id' => $shipment->id,
                'status' => $shipment->status,
                'date' => now()->toDateTimeString()
            ];
            $history->history = json_encode($histArr);
            $history->save();
        }
        \App\Models\Customer::updateGlobalScore($shipment->recipient_name, $shipment->recipient_phone);
        return response()->json(['shipment' => $shipment]);
    }
}








