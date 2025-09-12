@extends('layouts.app')
@section('content')
<div class="container">
    <h2>Create Shipment</h2>
    <form method="POST" action="{{ route('shipments.store') }}">
        @csrf
        <!-- Pickup Address -->
        <div class="form-group">
            <label for="pickup_address_id">Pickup Address</label>
            <select name="pickup_address_id" id="pickup_address_id" class="form-control" required>
                @foreach($pickupAddresses as $address)
                    <option value="{{ $address->id }}">{{ $address->address_line1 }}</option>
                @endforeach
            </select>
        </div>
        <!-- Customer -->
        <div class="form-group">
            <label for="customer_id">Customer</label>
            <select name="customer_id" id="customer_id" class="form-control">
                <option value="">-- New Customer --</option>
                @foreach($customers as $customer)
                    <option value="{{ $customer->id }}">{{ $customer->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="form-group">
            <label for="new_customer_name">New Customer Name</label>
            <input type="text" name="new_customer_name" id="new_customer_name" class="form-control">
        </div>
        <div class="form-group">
            <label for="new_customer_phone">New Customer Phone</label>
            <input type="text" name="new_customer_phone" id="new_customer_phone" class="form-control">
        </div>
        <!-- Goods Price -->
        <div class="form-group">
            <label for="goods_price">Goods Price</label>
            <input type="number" name="goods_price" id="goods_price" class="form-control" required>
        </div>
        <!-- Designation -->
        <div class="form-group">
            <label for="designation">Designation</label>
            <input type="text" name="designation" id="designation" class="form-control">
        </div>
        <!-- Settings Parameters -->
        <div class="form-group">
            <label for="commission_rate">Commission Rate</label>
            <input type="number" step="0.01" name="commission_rate" id="commission_rate" class="form-control" value="{{ $commission }}" readonly>
        </div>
        <div class="form-group">
            <label for="shipping_fee">Shipping Fee</label>
            <input type="number" step="0.01" name="shipping_fee" id="shipping_fee" class="form-control" value="{{ $shipmentPrice }}" readonly>
        </div>
        <div class="form-group">
            <label for="barcode_prefix">Barcode Prefix</label>
            <input type="text" name="barcode_prefix" id="barcode_prefix" class="form-control" value="{{ $barcodePrefix ?? 'CustomLabel' }}" readonly>
        </div>
        <button type="submit" class="btn btn-primary">Create Shipment</button>
    </form>
</div>
@endsection
