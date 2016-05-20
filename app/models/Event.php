<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 18.05.16
 * Time: 20:49
 */

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Validator\Email as EmailValidator;
use Phalcon\Mvc\Model\Validator\Uniqueness as UniquenessValidator;

class Event extends Model
{
    public $id;

    public $name;

    public $date;

    public $time;

    public $type;

    public $description;

    public $user_id;
    
    public $image;

    public function getSource()
    {
        return 'event';
    }
}
