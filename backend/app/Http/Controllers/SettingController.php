<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SettingController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Setting::all());
    }

    public function update(Request $request, $key): JsonResponse
    {
        $data = $request->validate([
            'value' => ['required', 'string'],
        ]);
        $setting = Setting::updateOrCreate(['key' => $key], ['value' => $data['value']]);
        return response()->json($setting);
    }
}
