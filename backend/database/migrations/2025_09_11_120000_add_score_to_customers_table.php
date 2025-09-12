<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('customers', function (Blueprint $table) {
            if (!Schema::hasColumn('customers', 'score')) {
                $table->integer('score')->default(100)->after('postal_code');
            }
        });
    }
    public function down() {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('score');
        });
    }
};
