<?php

namespace Database\Seeders;

use App\Models\City;
use App\Models\Zone;
use Illuminate\Database\Seeder;

/**
 * Adds urban neighborhoods and major streets as zones for key West Bank cities.
 * Complements village/locality coverage in WestBankLocationsSeeder.
 */
class MajorCityNeighborhoodsSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->neighborhoods() as $cityNameEn => $zones) {
            $city = City::query()->where('name_en', $cityNameEn)->first()
                ?? City::query()->where('name_ar', $this->cityArabicNames()[$cityNameEn] ?? '')->first();

            if (! $city) {
                continue;
            }

            foreach ($zones as $zone) {
                $this->resolveZone($city, $zone['name_ar'], $zone['name_en']);
            }
        }
    }

    /**
     * @return array<string, string>
     */
    private function cityArabicNames(): array
    {
        return [
            'Hebron' => 'الخليل',
            'Ramallah and Al-Bireh' => 'رام الله والبيرة',
            'Nablus' => 'نابلس',
            'Bethlehem' => 'بيت لحم',
            'Jenin' => 'جنين',
            'Tulkarm' => 'طولكرم',
        ];
    }

    private function resolveZone(City $city, string $nameAr, string $nameEn): Zone
    {
        $zone = Zone::query()
            ->where('city_id', $city->id)
            ->where(function ($query) use ($nameAr, $nameEn) {
                $query->where('name_ar', $nameAr)
                    ->orWhere('name_en', $nameEn);
            })
            ->first();

        if ($zone) {
            $updates = [];

            if ($zone->name_ar !== $nameAr
                && ! Zone::query()
                    ->where('city_id', $city->id)
                    ->where('name_ar', $nameAr)
                    ->where('id', '!=', $zone->id)
                    ->exists()) {
                $updates['name_ar'] = $nameAr;
            }

            if ($zone->name_en !== $nameEn) {
                $updates['name_en'] = $nameEn;
            }

            if ($updates !== []) {
                $zone->fill($updates)->save();
            }

            return $zone;
        }

        return Zone::create([
            'city_id' => $city->id,
            'name_ar' => $nameAr,
            'name_en' => $nameEn,
        ]);
    }

    /**
     * @return array<string, list<array{name_ar: string, name_en: string}>>
     */
    private function neighborhoods(): array
    {
        return [
            'Hebron' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Hebron Downtown'],
                ['name_ar' => 'عين سارة', 'name_en' => "'Ein Sarah Street"],
                ['name_ar' => 'راس الجورة', 'name_en' => 'Ras al-Jora'],
                ['name_ar' => 'الحاووز الأول', 'name_en' => 'Al-Hawooz 1'],
                ['name_ar' => 'الحاووز الثاني', 'name_en' => 'Al-Hawooz 2'],
                ['name_ar' => 'الحرس', 'name_en' => 'Al-Haras'],
                ['name_ar' => 'شارع السلام', 'name_en' => 'As-Salam Street'],
                ['name_ar' => 'شارع الشلالة', 'name_en' => 'Ash-Shallalah Street'],
                ['name_ar' => 'واد التفاح', 'name_en' => 'Wadi at-Tuffah'],
                ['name_ar' => 'بئر المحجر', 'name_en' => "Bi'r al-Mahjar"],
                ['name_ar' => 'ضاحية البلدية', 'name_en' => 'Municipality Suburb'],
                ['name_ar' => 'أبو كتيلة', 'name_en' => 'Abu Kteila'],
                ['name_ar' => 'الجلدة', 'name_en' => 'Al-Jalda'],
                ['name_ar' => 'المنطقة الصناعية', 'name_en' => 'Hebron Industrial Zone'],
                ['name_ar' => 'باب الزاوية', 'name_en' => 'Bab az-Zawiya'],
                ['name_ar' => 'دوار ابن رشد', 'name_en' => 'Ibn Rushd Circle'],
                ['name_ar' => 'دوار الصحة', 'name_en' => 'Health Circle'],
                ['name_ar' => 'جبل أبو رمان', 'name_en' => 'Jabal Abu Rumman'],
            ],
            'Ramallah and Al-Bireh' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Ramallah Downtown'],
                ['name_ar' => 'الماصيون', 'name_en' => 'Al-Masyoun'],
                ['name_ar' => 'البالوع', 'name_en' => 'Al-Balou'],
                ['name_ar' => 'المنارة', 'name_en' => 'Al-Manara'],
                ['name_ar' => 'الطيرة', 'name_en' => 'At-Tireh'],
                ['name_ar' => 'أم الشرايط', 'name_en' => 'Umm ash-Sharayet'],
                ['name_ar' => 'شارع الإرسال', 'name_en' => 'Al-Irsal Street'],
                ['name_ar' => 'دوار الساعة', 'name_en' => 'Clock Square'],
                ['name_ar' => 'بيتونيا', 'name_en' => 'Beitunia Neighborhood'],
                ['name_ar' => 'البيرة', 'name_en' => 'Al-Bireh Center'],
                ['name_ar' => 'المصايف', 'name_en' => 'Al-Masayef'],
                ['name_ar' => 'الشرفة', 'name_en' => 'Ash-Shurfa'],
                ['name_ar' => 'ضاحية الريحان', 'name_en' => 'Dahiyat ar-Rayhan'],
                ['name_ar' => 'عين منجد', 'name_en' => "'Ein Munjid"],
                ['name_ar' => 'المنطقة الصناعية', 'name_en' => 'Ramallah Industrial Zone'],
                ['name_ar' => 'سطح مرحبا', 'name_en' => 'Sath Marhaba'],
            ],
            'Nablus' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Nablus Downtown'],
                ['name_ar' => 'رفيديا', 'name_en' => 'Rafidia'],
                ['name_ar' => 'المخفية', 'name_en' => 'Al-Makhfiyya'],
                ['name_ar' => 'حي المعاجين', 'name_en' => 'Al-Maajin'],
                ['name_ar' => 'الجبل الشمالي', 'name_en' => 'Northern Mountain'],
                ['name_ar' => 'الجبل الجنوبي', 'name_en' => 'Southern Mountain'],
                ['name_ar' => 'المركز التجاري', 'name_en' => 'Commercial Center'],
                ['name_ar' => 'المساكن الشعبية', 'name_en' => 'Public Housing'],
                ['name_ar' => 'شارع سفيان', 'name_en' => 'Sufyan Street'],
                ['name_ar' => 'شارع جامعة النجاح', 'name_en' => 'An-Najah University Street'],
                ['name_ar' => 'شارع فيصل', 'name_en' => 'Faisal Street'],
                ['name_ar' => 'رأس العين', 'name_en' => "Ras al-'Ein"],
                ['name_ar' => 'بلاطة', 'name_en' => 'Balata'],
                ['name_ar' => 'عسكر', 'name_en' => "'Askar Neighborhood"],
                ['name_ar' => 'المنطقة الصناعية الشرقية', 'name_en' => 'Eastern Industrial Zone'],
            ],
            'Bethlehem' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Bethlehem Downtown'],
                ['name_ar' => 'شارع المهد', 'name_en' => 'Al-Mahd Street'],
                ['name_ar' => 'باب الدير', 'name_en' => 'Bab ad-Deir'],
                ['name_ar' => 'الدوحة', 'name_en' => 'Ad-Doha Neighborhood'],
                ['name_ar' => 'بيت جالا المركز', 'name_en' => 'Beit Jala Center'],
                ['name_ar' => 'بيت ساحور المركز', 'name_en' => 'Beit Sahour Center'],
                ['name_ar' => 'شارع القدس-الخليل', 'name_en' => 'Jerusalem-Hebron Road'],
                ['name_ar' => 'السوق المركزي', 'name_en' => 'Central Market'],
                ['name_ar' => 'جبل هندازة', 'name_en' => 'Jabal Hindaza'],
            ],
            'Jenin' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Jenin Downtown'],
                ['name_ar' => 'شارع أبو بكر', 'name_en' => 'Abu Bakr Street'],
                ['name_ar' => 'حي البساتين', 'name_en' => 'Al-Basatin'],
                ['name_ar' => 'الجابريات', 'name_en' => 'Al-Jabriyat'],
                ['name_ar' => 'البلدة القديمة', 'name_en' => 'Jenin Old City'],
                ['name_ar' => 'شارع نابلس', 'name_en' => 'Nablus Street Jenin'],
                ['name_ar' => 'شارع الناصرة', 'name_en' => 'Nazareth Street'],
                ['name_ar' => 'مخيم جنين', 'name_en' => 'Jenin Camp'],
                ['name_ar' => 'المنطقة الصناعية', 'name_en' => 'Jenin Industrial Zone'],
            ],
            'Tulkarm' => [
                ['name_ar' => 'وسط البلد', 'name_en' => 'Tulkarm Downtown'],
                ['name_ar' => 'الحي الشرقي', 'name_en' => 'Eastern Quarter'],
                ['name_ar' => 'الحي الغربي', 'name_en' => 'Western Quarter'],
                ['name_ar' => 'الحي الجنوبي', 'name_en' => 'Southern Quarter'],
                ['name_ar' => 'الحي الشمالي', 'name_en' => 'Northern Quarter'],
                ['name_ar' => 'ذنابة المركز', 'name_en' => 'Dhinnaba Center'],
                ['name_ar' => 'دوار الساعة', 'name_en' => 'Tulkarm Clock Square'],
                ['name_ar' => 'شارع نابلس', 'name_en' => 'Nablus Street Tulkarm'],
            ],
        ];
    }
}
