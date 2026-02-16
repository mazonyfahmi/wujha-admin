<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileUploadController extends Controller
{
    /**
     * Allowed directories for file operations (security measure)
     */
    private const ALLOWED_DIRECTORIES = [
        'uploads',
        'banners',
        'services',
        'categories',
    ];

    /**
     * Handle file upload and return the public URL
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,webp,svg|max:5120', // 5MB max
        ]);

        $file = $request->file('file');
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        
        // Store in public disk under 'uploads' folder
        $path = $file->storeAs('uploads', $filename, 'public');
        
        // Return the public URL
        $url = Storage::disk('public')->url($path);
        
        return response()->json([
            'success' => true,
            'url' => $url,
            'path' => $path,
            'filename' => $filename,
        ]);
    }

    /**
     * Delete an uploaded file (with security validation)
     */
    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');
        
        // Security: Normalize path and prevent directory traversal
        $normalizedPath = str_replace(['../', '..\\', '..'], '', $path);
        
        // Security: Check if path starts with allowed directory
        $isAllowed = false;
        foreach (self::ALLOWED_DIRECTORIES as $dir) {
            if (Str::startsWith($normalizedPath, $dir . '/')) {
                $isAllowed = true;
                break;
            }
        }
        
        if (!$isAllowed) {
            return response()->json([
                'success' => false, 
                'message' => 'Unauthorized: file deletion not permitted'
            ], 403);
        }
        
        if (Storage::disk('public')->exists($normalizedPath)) {
            Storage::disk('public')->delete($normalizedPath);
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false, 'message' => 'File not found'], 404);
    }
}

