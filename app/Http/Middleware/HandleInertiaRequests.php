<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'app_settings' => [
                'tax_percentage' => (float) \App\Models\Setting::getValue('tax_percentage', 10),
                'service_percentage' => (float) \App\Models\Setting::getValue('service_percentage', 5),
                'store_name' => \App\Models\Setting::getValue('store_name', 'RESTOPRO'),
            ],
        ];
    }
}
