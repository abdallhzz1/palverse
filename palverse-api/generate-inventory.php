<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Route;

$routes = Route::getRoutes();

$markdown = "# Palverse API v1.0.0 Route Inventory\n\n";
$markdown .= "This document serves as the frozen route contract for Palverse API v1.0.0.\n\n";
$markdown .= "| Method | Path | Access | Module | Operation | Status |\n";
$markdown .= "|---|---|---|---|---|---|\n";

foreach ($routes as $route) {
    if (! str_starts_with($route->uri(), 'api/v1')) {
        continue;
    }

    $methods = implode('|', array_diff($route->methods(), ['HEAD']));
    $path = '/'.$route->uri();

    $access = 'Public';
    $middleware = json_encode($route->middleware());
    if (str_contains($middleware, 'auth:sanctum')) {
        $access = 'Auth';
    }
    if (str_contains($middleware, 'permission:')) {
        preg_match('/permission:([a-zA-Z\.]+)/', $middleware, $matches);
        $access = 'Perm: '.($matches[1] ?? 'yes');
    }

    $module = 'System';
    if (str_contains($path, '/admin/')) {
        $module = 'Admin';
    } elseif (str_contains($path, '/merchant/')) {
        $module = 'Merchant';
    } elseif (str_contains($path, '/auth/')) {
        $module = 'Auth';
    } elseif (str_contains($path, '/public/') || str_contains($route->getActionName(), 'Public')) {
        $module = 'Public';
    }

    $actionName = $route->getActionName();
    $operationId = 'Closure';
    if (str_contains($actionName, '@')) {
        $parts = explode('\\', $actionName);
        $controllerMethod = end($parts);
        $operationId = str_replace('@', '.', $controllerMethod);
    }

    $markdown .= "| `{$methods}` | `{$path}` | {$access} | {$module} | `{$operationId}` | Frozen |\n";
}

if (! is_dir('docs/releases')) {
    mkdir('docs/releases', 0777, true);
}
file_put_contents('docs/releases/v1.0.0-route-inventory.md', $markdown);
echo "Generated docs/releases/v1.0.0-route-inventory.md\n";
