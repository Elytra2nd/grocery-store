<?php
// app/Services/ImageUploadService.php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Intervention\Image\Laravel\Facades\Image;
use Illuminate\Support\Facades\Log;

class ImageUploadService
{
    public function uploadProductImage(UploadedFile $file, $oldImage = null)
    {
        try {
            // Delete old image if exists
            if ($oldImage && Storage::disk('public')->exists('products/' . $oldImage)) {
                Storage::disk('public')->delete('products/' . $oldImage);
            }

            // Generate unique filename
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

            // Gunakan read() untuk v3.x
            $image = Image::read($file);

            // Resize image - v3.x hanya menerima width dan height
            $image->resize(800, 600);

            // Atau gunakan scale untuk mempertahankan aspect ratio
            // $image->scale(800, 600);

            // Save to storage
            $path = 'products/' . $filename;
            Storage::disk('public')->put($path, $image->encode());

            return $filename;

        } catch (\Exception $e) {
            throw new \Exception('Failed to upload image: ' . $e->getMessage());
        }
    }

    public function deleteProductImage($filename)
    {
        try {
            if ($filename && Storage::disk('public')->exists('products/' . $filename)) {
                Storage::disk('public')->delete('products/' . $filename);
            }
        } catch (\Exception $e) {
            Log::warning('Failed to delete image: ' . $e->getMessage());
        }
    }
}
