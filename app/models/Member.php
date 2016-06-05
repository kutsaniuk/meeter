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

class Member extends Model
{
    public $id;

    public $event_id;

    public $user_id;

}
