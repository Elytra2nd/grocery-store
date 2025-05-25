<?php
// app/Http/Middleware/HandleInertiaRequests.php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tightenco\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id ?? null,
                    'name' => $request->user()->name ?? '',
                    'email' => $request->user()->email ?? '',
                    'email_verified_at' => $request->user()->email_verified_at ?? null,
                    'roles' => $request->user()->roles()->get(['id', 'name']) ?? [],
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'ziggy' => function () use ($request) {
                // Try to use Ziggy class if available
                // Ziggy is not installed, so always use manual ziggy data

                // Manual ziggy data dengan null safety
                return [
                    'url' => config('app.url') ?? 'http://localhost',
                    'port' => null,
                    'defaults' => [],
                    'routes' => $this->getManualRoutes(),
                    'location' => $request->url() ?? '',
                ];
            },
        ];
    }

    private function getManualRoutes(): array
    {
        $routes = [];

        try {
            foreach (\Illuminate\Support\Facades\Route::getRoutes() as $route) {
                $name = $route->getName();
                if ($name) {
                    $routes[$name] = [
                        'uri' => $route->uri() ?? '',
                        'methods' => $route->methods() ?? [],
                        'parameters' => $route->parameterNames() ?? [],
                    ];
                }
            }
        } catch (\Exception $e) {
            // Fallback routes jika ada error
            $routes = [
                'dashboard' => ['uri' => 'dashboard', 'methods' => ['GET', 'HEAD']],
                'admin.dashboard' => ['uri' => 'admin/dashboard', 'methods' => ['GET', 'HEAD']],
                'admin.products.index' => ['uri' => 'admin/products', 'methods' => ['GET', 'HEAD']],
            ];
        }

        return $routes;
    }
}
