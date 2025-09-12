<?php
namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::query();
        if ($request->has('governorate')) {
            $query->where('governorate', $request->get('governorate'));
        }
        if ($request->has('delegation')) {
            $query->where('delegation', $request->get('delegation'));
        }
        return response()->json($query->get());
    }

    public function governorates()
    {
        $governorates = Location::select('governorate')->distinct()->pluck('governorate');
        return response()->json($governorates);
    }

    public function delegations(Request $request)
    {
        $governorate = $request->get('governorate');
        $delegations = Location::where('governorate', $governorate)
            ->select('delegation')->distinct()->pluck('delegation');
        return response()->json($delegations);
    }

    public function localities(Request $request)
    {
        $governorate = $request->get('governorate');
        $delegation = $request->get('delegation');
        $localities = Location::where('governorate', $governorate)
            ->where('delegation', $delegation)
            ->select('localite', 'cp')->get();
        return response()->json($localities);
    }
}
