<?php

namespace App\Http\Requests\Api\V1;

use App\Support\DashboardDateRange;
use Carbon\Carbon;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class DashboardStatsRequest extends FormRequest
{
    protected ?DashboardDateRange $dateRange = null;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'period' => ['nullable', 'string', 'in:today,last_7_days,last_30_days,current_month,previous_month,current_year,custom'],
            'from' => [
                Rule::requiredIf($this->input('period') === 'custom'),
                'nullable',
                'date',
            ],
            'to' => [
                Rule::requiredIf($this->input('period') === 'custom'),
                'nullable',
                'date',
                'after_or_equal:from',
            ],
        ];
    }

    /**
     * Force standard JSON validation response format.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => __('Validation failed.'),
            'errors' => $validator->errors(),
        ], 422));
    }

    /**
     * Perform custom date range limits check.
     */
    protected function passedValidation(): void
    {
        $period = $this->input('period', 'last_30_days');
        $from = $this->input('from');
        $to = $this->input('to');

        if ($period === 'custom' && $from && $to) {
            $fromCarbon = Carbon::parse($from)->startOfDay();
            $toCarbon = Carbon::parse($to)->endOfDay();
            $maxRange = config('palverse.dashboard.max_custom_range_days', 366);

            if ($fromCarbon->diffInDays($toCarbon) > $maxRange) {
                throw new HttpResponseException(response()->json([
                    'success' => false,
                    'message' => __('Validation failed.'),
                    'errors' => [
                        'from' => [__('The custom date range cannot exceed :days days.', ['days' => $maxRange])],
                    ],
                ], 422));
            }
        }

        $this->dateRange = new DashboardDateRange($period, $from, $to);
    }

    /**
     * Get the parsed DashboardDateRange.
     */
    public function dateRange(): DashboardDateRange
    {
        if (! $this->dateRange) {
            $this->dateRange = new DashboardDateRange(
                $this->input('period', 'last_30_days'),
                $this->input('from'),
                $this->input('to')
            );
        }

        return $this->dateRange;
    }
}
