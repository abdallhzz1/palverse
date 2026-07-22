<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class DemoLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Hebron City
        $city = City::updateOrCreate(
            ['name_en' => 'Hebron'],
            [
                'name_ar' => 'الخليل',
            ]
        );

        // Hebron Zones and Localities
        $zones = [
            ['name_ar' => 'مدينة الخليل', 'name_en' => 'Hebron City'],
            ['name_ar' => 'حلحول', 'name_en' => 'Halhul'],
            ['name_ar' => 'سعير', 'name_en' => "Sa'ir"],
            ['name_ar' => 'بني نعيم', 'name_en' => "Bani Na'im"],
            ['name_ar' => 'الشيوخ', 'name_en' => 'Ash-Shuyukh'],
            ['name_ar' => 'بيت أمر', 'name_en' => 'Beit Ummar'],
            ['name_ar' => 'صوريف', 'name_en' => 'Surif'],
            ['name_ar' => 'خاراس', 'name_en' => 'Kharas'],
            ['name_ar' => 'نوبا', 'name_en' => 'Nuba'],
            ['name_ar' => 'بيت أولا', 'name_en' => 'Beit Ula'],
            ['name_ar' => 'ترقوميا', 'name_en' => 'Tarqumiyah'],
            ['name_ar' => 'إذنا', 'name_en' => 'Idhna'],
            ['name_ar' => 'تفوح', 'name_en' => 'Taffuh'],
            ['name_ar' => 'بيت عوا', 'name_en' => 'Beit Awwa'],
            ['name_ar' => 'دير سامت', 'name_en' => 'Deir Sammit'],
            ['name_ar' => 'الكوم', 'name_en' => 'Al-Kum'],
            ['name_ar' => 'خرسا', 'name_en' => 'Khursa'],
            ['name_ar' => 'الطبقة', 'name_en' => 'At-Tabaqa'],
            ['name_ar' => 'الظاهرية', 'name_en' => 'Adh-Dhahiriya'],
            ['name_ar' => 'السموع', 'name_en' => 'As-Samu'],
            ['name_ar' => 'يطا', 'name_en' => 'Yatta'],
            ['name_ar' => 'دورا', 'name_en' => 'Dura'],
        ];

        foreach ($zones as $zoneData) {
            Zone::updateOrCreate(
                [
                    'city_id' => $city->id,
                    'name_en' => $zoneData['name_en'],
                ],
                [
                    'name_ar' => $zoneData['name_ar'],
                ]
            );
        }
    }
}
