<?php

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

    // app/Http/Middleware/HandleInertiaRequests.php
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'email_verified_at' => $request->user()->email_verified_at,
                    'roles' => $request->user()->roles()->get(['id', 'name']) ?? [],
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'ziggy' => function () use ($request) {
            // Try to use Ziggy class if available
                if (class_exists('Tightenco\Ziggy\Ziggy')) {
                    try {
                        $ziggy = new \Tightenco\Ziggy\Ziggy();
                        return array_merge($ziggy->toArray(), [
                            'location' => $request->url(),
                        ]);
                    } catch (\Exception $e) {
                    // Fallback to manual
                    }
                }

            // Manual ziggy data
                return [
                    'url' => config('app.url'),
                    'port' => null,
                    'defaults' => [],
                    'routes' => $this->getManualRoutes(),
                    'location' => $request->url(),
                ];
            },
        ];
    }

    private function getManualRoutes(): array
    {
        $routes = [];

        foreach (\Illuminate\Support\Facades\Route::getRoutes() as $route) {
            $name = $route->getName();
            if ($name) {
                $routes[$name] = [
                    'uri' => $route->uri(),
                    'methods' => $route->methods(),
                    'parameters' => $route->parameterNames(),
                ];
            }
        }

        return $routes;
    }
}
