<?php
// Public tracking endpoint
Route::get('/track/{tracking_number}', [\App\Http\Controllers\ShipmentController::class, 'track']);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\WebhookController;

// These routes are loaded by the 'api' middleware group (stateless, no CSRF)

// Auth
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::post('/auth/update-profile', [AuthController::class, 'updateProfile']);
});

// Shipments (protect as needed)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/shipments', [ShipmentController::class, 'store']);
    Route::get('/shipments/{id}', [ShipmentController::class, 'show']);
    Route::get('/shipments', [ShipmentController::class, 'index']);
    Route::post('/shipments/{id}/cancel', [ShipmentController::class, 'cancel']);
});

// Make label route public
Route::get('/shipments/{id}/label', [ShipmentController::class, 'label']);

// Carrier webhooks
Route::post('/webhooks/aramex', [WebhookController::class, 'aramex']);
Route::post('/webhooks/tunisiaexpress', [WebhookController::class, 'tunisiaExpress']);

// Settings
Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
Route::put('/settings/{key}', [\App\Http\Controllers\SettingController::class, 'update']);

// Admin and Dashboard routes
Route::middleware('auth:sanctum')->group(function () {
    // Admin routes
    Route::get('/admin/users', [\App\Http\Controllers\AdminController::class, 'users']);
    Route::post('/admin/users', [\App\Http\Controllers\AdminController::class, 'store']);
    Route::put('/admin/users/{user}', [\App\Http\Controllers\AdminController::class, 'updateUser']);
    Route::get('/admin/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
    // Dashboard stats
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'stats']);
    // Pickup addresses
    Route::get('/pickup-addresses', [\App\Http\Controllers\PickupAddressController::class, 'index']);
    Route::post('/pickup-addresses', [\App\Http\Controllers\PickupAddressController::class, 'store']);
    Route::delete('/pickup-addresses/{pickupAddress}', [\App\Http\Controllers\PickupAddressController::class, 'destroy']);

    // Location data
    Route::get('/locations', [\App\Http\Controllers\LocationController::class, 'index']);
    Route::get('/locations/governorates', [\App\Http\Controllers\LocationController::class, 'governorates']);
    Route::get('/locations/delegations', [\App\Http\Controllers\LocationController::class, 'delegations']);
    Route::get('/locations/localities', [\App\Http\Controllers\LocationController::class, 'localities']);

    // Customers CRUD
    Route::get('/customers', [\App\Http\Controllers\CustomerController::class, 'index']);
    Route::post('/customers', [\App\Http\Controllers\CustomerController::class, 'store']);
    Route::put('/customers/{customer}', [\App\Http\Controllers\CustomerController::class, 'update']);
    Route::delete('/customers/{customer}', [\App\Http\Controllers\CustomerController::class, 'destroy']);
    Route::get('/customers/global-history', [\App\Http\Controllers\CustomerController::class, 'globalHistory']);
    Route::get('/customers/global-shipment-history', [\App\Http\Controllers\CustomerController::class, 'globalShipmentHistory']);

    // Admin shipments
    Route::get('/admin/shipments', [\App\Http\Controllers\AdminController::class, 'shipments']);
    Route::put('/admin/shipments/{shipment}', [\App\Http\Controllers\AdminController::class, 'updateShipment']);
});
