<?php

$factory('App\Item', [
    'name' => $faker->sentence(4),
    'description' => $faker->paragraph(6),
    'cost' => $cost = mt_rand(10, 100),
    'estimate' => $cost * 1.2
]);