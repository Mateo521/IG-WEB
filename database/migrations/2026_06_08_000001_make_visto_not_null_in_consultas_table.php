<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('consultas')->whereNull('visto')->update(['visto' => false]);

        Schema::table('consultas', function (Blueprint $table) {
            $table->boolean('visto')->default(false)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('consultas', function (Blueprint $table) {
            $table->boolean('visto')->default(false)->nullable()->change();
        });
    }
};
