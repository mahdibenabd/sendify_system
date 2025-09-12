<?php

namespace App\Http\Controllers;

use App\Models\PickupAddress;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PickupAddressController extends Controller
{
    public function index(): JsonResponse
    {
        $addresses = PickupAddress::where('merchant_id', Auth::id())->get();
        return response()->json($addresses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'label' => ['nullable', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'max:20'],
            'contact_name' => ['required', 'string', 'max:255'],
            'contact_phone' => ['required', 'string', 'max:20'],
        ]);
        $data['merchant_id'] = Auth::id();
        $address = PickupAddress::create($data);
        return response()->json($address, 201);
    }

    public function destroy(PickupAddress $pickupAddress): JsonResponse
    {
        if ($pickupAddress->merchant_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        $pickupAddress->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
