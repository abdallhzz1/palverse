<?php

namespace App\Http\Requests\Api\V1\Merchant\WorkingHours;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoreWorkingHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Enforced in controller
    }

    public function rules(): array
    {
        return [
            'days' => ['required', 'array', 'size:7'], // Ensuring all 7 days are provided
            'days.*.day_of_week' => ['required', 'integer', 'between:0,6', 'distinct'],
            'days.*.is_closed' => ['required', 'boolean'],
            'days.*.periods' => ['required_if:days.*.is_closed,false', 'array'],
            'days.*.periods.*.opens_at' => ['required_if:days.*.is_closed,false', 'date_format:H:i'],
            'days.*.periods.*.closes_at' => [
                'required_if:days.*.is_closed,false',
                'date_format:H:i',
                'after:days.*.periods.*.opens_at',
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $days = $this->input('days', []);
            foreach ($days as $dayIndex => $day) {
                if (isset($day['is_closed']) && $day['is_closed'] === true) {
                    if (isset($day['periods']) && count($day['periods']) > 0) {
                        $validator->errors()->add("days.{$dayIndex}.periods", 'Periods must be empty when is_closed is true.');
                    }

                    continue;
                }

                if (isset($day['is_closed']) && $day['is_closed'] === false) {
                    if (! isset($day['periods']) || count($day['periods']) === 0) {
                        $validator->errors()->add("days.{$dayIndex}.periods", 'At least one period is required when the day is not closed.');
                    } else {
                        // Check for overlaps
                        $periods = $day['periods'];
                        usort($periods, fn ($a, $b) => strcmp($a['opens_at'], $b['opens_at']));

                        for ($i = 0; $i < count($periods) - 1; $i++) {
                            $currentClose = $periods[$i]['closes_at'];
                            $nextOpen = $periods[$i + 1]['opens_at'];

                            if ($currentClose > $nextOpen) {
                                $validator->errors()->add("days.{$dayIndex}.periods", 'Working periods cannot overlap.');
                                break;
                            }
                        }
                    }
                }
            }
        });
    }
}
