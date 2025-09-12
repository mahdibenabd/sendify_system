<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->decimal('fixed_commission_tnd', 10, 3)->default(config('billing.default_commission_tnd'));
            $table->string('aramex_api_key')->nullable();
            $table->string('aramex_username')->nullable();
            $table->string('aramex_password')->nullable();
            $table->string('tunisiaexpress_api_key')->nullable();
            $table->timestamps();
        });

        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('carrier');
            $table->string('tracking_number')->nullable();
            $table->string('status')->default('created');
            $table->string('service_type')->nullable();
            $table->decimal('cod_amount_tnd', 10, 3)->default(0);
            $table->string('recipient_name');
            $table->string('recipient_phone');
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city')->nullable();
            $table->string('delegation')->nullable();
            $table->string('governorate')->nullable();
            $table->string('postal_code')->nullable();
            $table->string('label_url')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('cod_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->foreignId('shipment_id')->nullable()->constrained('shipments')->nullOnDelete();
            $table->string('carrier');
            $table->decimal('amount_tnd', 10, 3);
            $table->string('status')->default('pending');
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('carrier');
            $table->string('event_type')->nullable();
            $table->json('payload');
            $table->string('signature')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
        Schema::dropIfExists('cod_payments');
        Schema::dropIfExists('shipments');
        Schema::dropIfExists('merchants');
    }
};




