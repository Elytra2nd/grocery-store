<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'stock',
        'image',
        'category_id', // sesuaikan ini
        'is_active',
    ];

    // Relasi ke Category (many products belong to one category)
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function cartItems()
    {
        return $this->hasMany(Cart::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope untuk stok rendah
    public function scopeLowStock($query, $threshold = 10)
    {
        return $query->where('stock', '<=', $threshold);
    }

    public function rupiahformat()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getUnitAttribute()
    {
        return 'pcs';
    }

    public function getEmojiAttribute()
    {
        return '🛒';
    }

}
