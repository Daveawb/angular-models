<?php namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Item extends Model {

	protected $appends = ['short_description'];

    public function getShortDescriptionAttribute()
    {
        return Str::limit($this->getAttribute('description'), 28);
    }

}
