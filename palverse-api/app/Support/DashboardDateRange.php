<?php

namespace App\Support;

use Carbon\Carbon;
use InvalidArgumentException;

class DashboardDateRange
{
    public Carbon $from;

    public Carbon $to;

    public string $period;

    public function __construct(?string $period = 'last_30_days', ?string $fromStr = null, ?string $toStr = null)
    {
        $this->period = $period ?? 'last_30_days';
        $timezone = config('app.timezone', 'UTC');

        switch ($this->period) {
            case 'today':
                $this->from = Carbon::now($timezone)->startOfDay();
                $this->to = Carbon::now($timezone)->endOfDay();
                break;

            case 'last_7_days':
                $this->from = Carbon::now($timezone)->subDays(6)->startOfDay();
                $this->to = Carbon::now($timezone)->endOfDay();
                break;

            case 'last_30_days':
                $this->from = Carbon::now($timezone)->subDays(29)->startOfDay();
                $this->to = Carbon::now($timezone)->endOfDay();
                break;

            case 'current_month':
                $this->from = Carbon::now($timezone)->startOfMonth()->startOfDay();
                $this->to = Carbon::now($timezone)->endOfMonth()->endOfDay();
                break;

            case 'previous_month':
                $this->from = Carbon::now($timezone)->subMonth()->startOfMonth()->startOfDay();
                $this->to = Carbon::now($timezone)->subMonth()->endOfMonth()->endOfDay();
                break;

            case 'current_year':
                $this->from = Carbon::now($timezone)->startOfYear()->startOfDay();
                $this->to = Carbon::now($timezone)->endOfYear()->endOfDay();
                break;

            case 'custom':
                if (empty($fromStr) || empty($toStr)) {
                    throw new InvalidArgumentException("For custom period, 'from' and 'to' dates are required.");
                }
                $this->from = Carbon::parse($fromStr, $timezone)->startOfDay();
                $this->to = Carbon::parse($toStr, $timezone)->endOfDay();

                if ($this->to->lessThan($this->from)) {
                    throw new InvalidArgumentException("The 'to' date must be on or after the 'from' date.");
                }

                $maxRange = config('palverse.dashboard.max_custom_range_days', 366);
                if ($this->from->diffInDays($this->to) > $maxRange) {
                    throw new InvalidArgumentException("The custom date range cannot exceed {$maxRange} days.");
                }
                break;

            default:
                $this->from = Carbon::now($timezone)->subDays(29)->startOfDay();
                $this->to = Carbon::now($timezone)->endOfDay();
                $this->period = 'last_30_days';
                break;
        }
    }

    public function toArray(): array
    {
        return [
            'from' => $this->from->toIso8601String(),
            'to' => $this->to->toIso8601String(),
            'period' => $this->period,
            'timezone' => config('app.timezone', 'UTC'),
            'generated_at' => Carbon::now()->toIso8601String(),
        ];
    }
}
