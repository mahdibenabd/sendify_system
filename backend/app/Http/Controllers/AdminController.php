<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Shipment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $users = User::select('id', 'first_name', 'last_name', 'company_name', 'email', 'phone', 'is_admin', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($users);
    }

    public function showUser(User $user): JsonResponse
    {
        return response()->json($user);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'company_name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'regex:/^\+216\d{8}$/'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'is_admin' => ['boolean'],
        ]);

        $user->update([
            'name' => $data['first_name'] . ' ' . $data['last_name'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'company_name' => $data['company_name'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'is_admin' => $data['is_admin'] ?? false,
        ]);

        return response()->json($user);
    }

    public function deleteUser(User $user): JsonResponse
    {
        // Don't allow deleting the last admin
        if ($user->is_admin && User::where('is_admin', true)->count() <= 1) {
            return response()->json(['message' => 'Cannot delete the last admin user'], 400);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function stats(Request $request): JsonResponse
    {
        $period = $request->get('period', '30'); // days
        $startDate = now()->subDays($period);

        $stats = [
            'total_users' => User::count(),
            'new_users' => User::where('created_at', '>=', $startDate)->count(),
            'admin_users' => User::where('is_admin', true)->count(),
            'total_shipments' => Shipment::count(),
            'recent_shipments' => Shipment::where('created_at', '>=', $startDate)->count(),
            'shipments_by_status' => Shipment::selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->pluck('count', 'status'),
            'users_by_month' => User::selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->where('created_at', '>=', now()->subMonths(12))
                ->groupBy('month')
                ->orderBy('month')
                ->pluck('count', 'month'),
        ];

        return response()->json($stats);
    }

    public function shipments(Request $request): JsonResponse
    {
        $shipments = Shipment::with('user:id,first_name,last_name,company_name')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($shipments);
    }

    public function updateShipment(Request $request, Shipment $shipment): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string'],
        ]);
        $shipment->update($data);
        \App\Models\Customer::updateGlobalScore($shipment->recipient_name, $shipment->recipient_phone);
        return response()->json($shipment);
    }
}

