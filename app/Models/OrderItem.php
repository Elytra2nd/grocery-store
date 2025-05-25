<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Calculate subtotal for this item
    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->price;
    }

    // Get product name (useful if product is deleted)
    public function getProductNameAttribute()
    {
        return $this->product ? $this->product->name : 'Produk tidak tersedia';
    }
}
