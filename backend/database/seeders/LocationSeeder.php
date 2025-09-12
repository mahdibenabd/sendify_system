<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $json = File::get(database_path('tunisia.json'));
        $data = json_decode($json, true);
        $locations = [];
        foreach ($data as $governorate => $entries) {
            foreach ($entries as $entry) {
                $locations[] = [
                    'governorate' => $governorate,
                    'delegation' => $entry['delegation'],
                    'localite' => $entry['localite'],
                    'cp' => $entry['cp'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }
        DB::table('locations')->insert($locations);
    }
}
