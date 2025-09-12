<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('shipments', function (Blueprint $table) {
            // Add new columns
            if (!Schema::hasColumn('shipments', 'pickup_address_id')) {
                $table->unsignedBigInteger('pickup_address_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('shipments', 'customer_id')) {
                $table->unsignedBigInteger('customer_id')->nullable()->after('pickup_address_id');
            }
            if (!Schema::hasColumn('shipments', 'designation')) {
                $table->string('designation')->nullable()->after('customer_id');
            }
            if (!Schema::hasColumn('shipments', 'goods_price')) {
                $table->decimal('goods_price', 10, 2)->nullable()->after('designation');
            }
            if (!Schema::hasColumn('shipments', 'shipment_price')) {
                $table->decimal('shipment_price', 10, 2)->nullable()->after('goods_price');
            }
            if (!Schema::hasColumn('shipments', 'commission')) {
                $table->decimal('commission', 10, 2)->nullable()->after('shipment_price');
            }
            if (!Schema::hasColumn('shipments', 'total_price')) {
                $table->decimal('total_price', 10, 2)->nullable()->after('commission');
            }
            if (!Schema::hasColumn('shipments', 'label')) {
                $table->string('label')->nullable()->after('total_price');
            }
        });
    }
    public function down() {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn([
                'pickup_address_id',
                'customer_id',
                'designation',
                'goods_price',
                'shipment_price',
                'commission',
                'total_price',
                'label',
            ]);
        });
    }
};
