<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image; // Import langsung

class ImageUploadService
{
    public function uploadProductImage(UploadedFile $file, $oldImagePath = null)
    {
        // Delete old image if exists
        if ($oldImagePath) {
            Storage::disk('public')->delete($oldImagePath);
        }

        // Generate unique filename
        $filename = time() . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();

        // Resize and optimize image
        $image = Image::make($file)
            ->resize(800, 600, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->encode('jpg', 85);

        // Store image
        $path = 'products/' . $filename;
        Storage::disk('public')->put($path, $image);

        // Create thumbnail
        $thumbnailPath = 'products/thumbnails/' . $filename;
        $thumbnail = Image::make($file)
            ->resize(300, 225, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            })
            ->encode('jpg', 80);

        Storage::disk('public')->put($thumbnailPath, $thumbnail);

        return $path;
    }

    public function deleteProductImage($imagePath)
    {
        if ($imagePath) {
            Storage::disk('public')->delete($imagePath);

            // Delete thumbnail
            $thumbnailPath = str_replace('products/', 'products/thumbnails/', $imagePath);
            Storage::disk('public')->delete($thumbnailPath);
        }
    }
}
