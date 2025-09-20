<?php

namespace App\Http\Controllers;

use App\Models\WebhookEvent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WebhookController extends Controller
{
    public function aramex(Request $request): JsonResponse
    {
        $event = WebhookEvent::create([
            'carrier' => 'aramex',
            'event_type' => $request->input('event') ?? null,
            'payload' => $request->all(),
            'signature' => $request->header('X-Signature') ?? null,
        ]);
        return response()->json(['ok' => true, 'id' => $event->id]);
    }

    public function tunisiaExpress(Request $request): JsonResponse
    {
        $event = WebhookEvent::create([
            'carrier' => 'tunisiaexpress',
            'event_type' => $request->input('event') ?? null,
            'payload' => $request->all(),
            'signature' => $request->header('X-Signature') ?? null,
        ]);
        return response()->json(['ok' => true, 'id' => $event->id]);
    }
}





