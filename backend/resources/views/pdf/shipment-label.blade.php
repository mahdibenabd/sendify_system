<html>
<head>
    <meta charset="utf-8">
    <title>Shipment Label</title>
    <style>
        body { font-family: Arial, sans-serif; font-size: 14px; }
        .label-box { border: 2px dashed #333; padding: 20px; margin: 20px; }
        .label-title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .label-row { margin-bottom: 6px; }
        .label-key { font-weight: bold; }
    </style>
</head>
<body>
    <div class="label-box">
        <div class="label-title">Facture Expédition</div>
        <table style="width:100%; margin-bottom:20px;">
            <tr>
                <td style="vertical-align:top; width:50%;">
                    <strong>De :</strong><br>
                    @if($merchant)
                        {{ $merchant->company_name ?? $merchant->name }}<br>
                        {{ $pickupAddress->address ?? '' }}<br>
                        {{ $pickupAddress->city ?? '' }} {{ $pickupAddress->postal_code ?? '' }}<br>
                        Contact: {{ $pickupAddress->contact_name ?? $merchant->name }}<br>
                        Tel: {{ $pickupAddress->contact_phone ?? $merchant->phone }}<br>
                    @else
                        {{ config('app.name', 'Sendify') }}<br>
                    @endif
                </td>
                <td style="vertical-align:top; width:50%;">
                    <strong>À :</strong><br>
                    {{ $shipment->recipient_name }}<br>
                    {{ $shipment->address_line1 }} {{ $shipment->address_line2 }}<br>
                    {{ $shipment->city }} {{ $shipment->delegation }}<br>
                    {{ $shipment->governorate }} {{ $shipment->postal_code }}<br>
                    Tel: {{ $shipment->recipient_phone }}
                </td>
            </tr>
        </table>
        <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
            <tr style="background:#f3f3f3;">
                <th style="border:1px solid #ccc; padding:8px;">Désignation</th>
                <th style="border:1px solid #ccc; padding:8px;">Prix HT</th>
                <th style="border:1px solid #ccc; padding:8px;">TVA 19%</th>
                <th style="border:1px solid #ccc; padding:8px;">Prix TTC</th>
            </tr>
            <tr>
                <td style="border:1px solid #ccc; padding:8px;">{{ $shipment->designation ?? 'Marchandises' }}</td>
                <td style="border:1px solid #ccc; padding:8px;">{{ number_format($shipment->goods_price, 3) }} TND</td>
                <td style="border:1px solid #ccc; padding:8px;">{{ number_format($shipment->goods_price * 0.19, 3) }} TND</td>
                <td style="border:1px solid #ccc; padding:8px;">{{ number_format($shipment->goods_price * 1.19, 3) }} TND</td>
            </tr>
        </table>
        <table style="width:100%; border-collapse:collapse;">
            <tr>
                <th style="text-align:left; padding:8px;">Frais d'expédition</th>
                <td style="padding:8px;">{{ number_format($shipment->shipment_price, 3) }} TND</td>
            </tr>
            <tr>
                <th style="text-align:left; padding:8px;">Commission</th>
                <td style="padding:8px;">{{ number_format($shipment->commission, 3) }} TND</td>
            </tr>
            <tr style="font-weight:bold;">
                <th style="text-align:left; padding:8px;">Total TTC</th>
                <td style="padding:8px;">{{ number_format($shipment->total_price, 3) }} TND</td>
            </tr>
        </table>
        <div style="margin-top:20px; font-size:13px; color:#555;">
            <strong>Label:</strong> {{ $shipment->label }}<br>
            <strong>Tracking:</strong> {{ $shipment->tracking_number ?? '-' }}<br>
            <strong>Status:</strong> {{ $shipment->status ?? '-' }}<br>
            <strong>Date:</strong> {{ $shipment->created_at->format('d/m/Y H:i') }}
        </div>
    </div>
    <div style="margin-top:30px; text-align:center;">
        @php
            $trackUrl = url('/track?tracking=' . $shipment->tracking_number);
        @endphp
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data={{ urlencode($trackUrl) }}" alt="QR Code" style="margin-bottom:8px;" />
        <div style="font-size:12px; color:#555;">Scannez pour suivre l'expédition</div>
    </div>
</body>
</html>
