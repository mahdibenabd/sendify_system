<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('pickup_addresses', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('merchant_id');
            $table->string('label')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('postal_code');
            $table->string('contact_name');
            $table->string('contact_phone');
            $table->timestamps();

            $table->foreign('merchant_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pickup_addresses');
    }
};
