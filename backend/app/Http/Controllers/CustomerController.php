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
        $history = \App\Models\CustomerHistory::where('phone', $phone)
            ->orWhereRaw('LOWER(TRIM(name)) = ?', [$normalizedName])
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
        // Attach global score from CustomerHistory for each customer
        foreach ($customers as $customer) {
            $history = \App\Models\CustomerHistory::where('phone', $customer->phone)->first();
            $customer->score = $history ? $history->score : 100;
        }
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
        // Fetch global score by phone or normalized name
        $normalizedName = trim(strtolower($data['name']));
        $history = \App\Models\CustomerHistory::where('phone', $data['phone'])
            ->orWhereRaw('LOWER(TRIM(name)) = ?', [$normalizedName])
            ->orderByDesc('score')->first();
        $data['score'] = $history ? $history->score : 100;
        $customer = Customer::create($data);
        // Update global score after creation
        Customer::updateGlobalScore($customer->name, $customer->phone);
        // Always return the global score for this customer
        $history = \App\Models\CustomerHistory::where('phone', $customer->phone)
            ->orWhereRaw('LOWER(TRIM(name)) = ?', [$normalizedName])
            ->orderByDesc('score')->first();
        $customer->score = $history ? $history->score : 100;
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
        // Always return the global score for this customer
        $history = \App\Models\CustomerHistory::where('phone', $customer->phone)->first();
        $customer->score = $history ? $history->score : 100;
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
        $history = \App\Models\CustomerHistory::where('phone', $phone)->first();
        if ($history) {
            return response()->json([
                'score' => $history->score,
                'name' => $history->name,
                'phone' => $history->phone,
                'id' => $history->id,
            ]);
        }
        return response()->json(['score' => 100, 'name' => $name, 'phone' => $phone, 'id' => null]);
    }
}
