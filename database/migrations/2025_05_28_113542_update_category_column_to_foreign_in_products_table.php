<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Kalau kolom 'category' memang ada dan ingin di-drop, jalankan secara manual dulu sebelum migrasi ini.
            // Jika kolom 'category' tidak ada, hapus baris ini supaya tidak error.
            // $table->dropColumn('category');

            // Tambah kolom category_id, jika belum ada
            if (!Schema::hasColumn('products', 'category_id')) {
                // Ganti 'some_column' dengan kolom yang benar di tabel products, misal 'name' atau 'image'
                $table->unsignedBigInteger('category_id')->after('name');
            }
        });

        // Tambah foreign key di migration terpisah atau setelah kolom dibuat
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
            // Jika perlu, tambahkan kembali kolom category sebagai string
            $table->string('category')->after('image');
        });
    }
};
