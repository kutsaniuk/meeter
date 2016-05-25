<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 18.05.16
 * Time: 14:03
 */

use Phalcon\Mvc\Controller;
use Phalcon\Http\Response;
use Phalcon\Mvc\Router;

/**
 * @RoutePrefix("/auth")
 */
class AuthController extends Controller
{
    /**
     * @Post("/login")
     */
    public function loginAction()
    {
        $_user = $this->request->getJsonRawBody();

        $user = User::findFirst(
            array(
                "username = :username: AND password = :password:",
                'bind' => array(
                    'username' => $_user->username,
                    'password' => sha1($_user->password)
                )
            )
        );

        $this->session->set('auth', array(
            'id' => $user->id,
            'name' => $user->name
        ));

        $response = new Response();

        if ($user) {
            $response->setStatusCode(200);
            $response->setJsonContent(
                array(
                    'id' => $user->id,
                    'name' => $user->name
                )
            );
        }
        else {
            return $response->setStatusCode(401);
        }

        return $response;
    }

    /**
     * @Post("/register")
     */
    public function registerAction() // DATE !!!
    {
        $user = new User();

        $_user = $this->request->getJsonRawBody();
        
        $user->assign(array(
            'username' => $_user->username,
            'password' => sha1($_user->password),
            'name' => $_user->name,
            'email' => $_user->email,
            'created' => $_user->created
        ));

        $response = new Response();

        if ($user->save())
            return $response->setStatusCode(200);
        else
            return $response->setStatusCode(409);
    }
}