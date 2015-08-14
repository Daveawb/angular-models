<?php

use Illuminate\Database\Seeder;
use Laracasts\TestDummy\Factory;

class ItemsTableSeeder extends Seeder
{
    public function run()
    {
        Factory::times(100)->create('App\Item');
    }
}
