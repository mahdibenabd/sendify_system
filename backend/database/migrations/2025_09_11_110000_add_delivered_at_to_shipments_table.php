<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('shipments', function (Blueprint $table) {
            if (!Schema::hasColumn('shipments', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('status');
            }
        });
    }
    public function down() {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn('delivered_at');
        });
    }
};
