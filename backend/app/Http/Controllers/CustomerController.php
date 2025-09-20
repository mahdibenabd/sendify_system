<?php
namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    public function globalShipmentHistory(Request $request)
    {
        $name = $request->query('name');
        $phone = $request->query('phone');
        $normalizedName = trim(strtolower($name));
        $history = \App\Models\CustomerHistory::whereRaw('LOWER(TRIM(name)) = ?', [$normalizedName])
            ->where('phone', $phone)
            ->first();
        if ($history) {
            return response()->json([
                'history' => json_decode($history->history ?? '[]', true),
                'name' => $history->name,
                'phone' => $history->phone,
                'id' => $history->id,
            ]);
        }
        return response()->json(['history' => [], 'name' => $name, 'phone' => $phone, 'id' => null]);
    }
    public function index()
    {
        $merchantId = Auth::id();
        $customers = Customer::where('merchant_id', $merchantId)->get();
        return $customers;
    }

    public function store(Request $request)
    {
        $merchantId = Auth::id();
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'address' => 'required|string',
            'governorate' => 'required|string',
            'delegation' => 'required|string',
            'localite' => 'required|string',
            'postal_code' => 'required|string',
        ]);
        $data['merchant_id'] = $merchantId;
        $customer = Customer::create($data);
        Customer::updateGlobalScore($customer->name, $customer->phone);
        return $customer;
    }

    public function update(Request $request, Customer $customer)
    {
        $merchantId = Auth::id();
        if ($customer->merchant_id !== $merchantId) {
            abort(403);
        }
        $data = $request->validate([
            'name' => 'required|string',
            'phone' => 'required|string',
            'email' => 'nullable|email',
            'address' => 'required|string',
            'governorate' => 'required|string',
            'delegation' => 'required|string',
            'localite' => 'required|string',
            'postal_code' => 'required|string',
        ]);
        $customer->update($data);
        Customer::updateGlobalScore($customer->name, $customer->phone);
        return $customer;
    }

    public function destroy(Customer $customer)
    {
        $merchantId = Auth::id();
        if ($customer->merchant_id !== $merchantId) {
            abort(403);
        }
        $customer->delete();
        return response()->noContent();
    }

    public function globalHistory(Request $request)
    {
        $name = $request->query('name');
        $phone = $request->query('phone');
        // No score in CustomerHistory, just return basic info
        $history = \App\Models\CustomerHistory::where('phone', $phone)->first();
        if ($history) {
            return response()->json([
                'name' => $history->name,
                'phone' => $history->phone,
                'id' => $history->id,
            ]);
        }
        return response()->json(['name' => $name, 'phone' => $phone, 'id' => null]);
    }
}
