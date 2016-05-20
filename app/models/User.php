<?php

use Phalcon\Mvc\Model;
use Phalcon\Mvc\Model\Validator\Email as EmailValidator;
use Phalcon\Mvc\Model\Validator\Uniqueness as UniquenessValidator;

class User extends Model
{
    public $id;

    public $name;

    public $email;

    public $username;

    public $password;

    public $active;

    public $created;
    
}
