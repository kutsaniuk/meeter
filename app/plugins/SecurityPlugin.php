<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 18.05.16
 * Time: 16:33
 */

use Phalcon\Events\Event;
use Phalcon\Mvc\User\Plugin;
use Phalcon\Mvc\Dispatcher;

class SecurityPlugin extends Plugin
{
    public function beforeExecuteRoute(Event $event, Dispatcher $dispatcher)
    {
        // Проверяем, установлена ли в сессии переменная "auth" для определения активной роли.
        $auth = $this->session->get('auth');
        if (!$auth) {
            $role = 'Guests';
        } else {
            $role = 'Users';
        }

        // Получаем активный контроллер/действие от диспетчера
        $controller = $dispatcher->getControllerName();
        $action = $dispatcher->getActionName();

        // Получаем список ACL
        $acl = $this->getAcl();

        // Проверяем, имеет ли данная роль доступ к контроллеру (ресурсу)
        $allowed = $acl->isAllowed($role, $controller, $action);
        if ($allowed != Acl::ALLOW) {

            // Если доступа нет, перенаправляем его на контроллер "index".
            $this->flash->error("У вас нет доступа к данному модулю");
            $dispatcher->forward(
                array(
                    'controller' => 'index',
                    'action' => 'index'
                )
            );

            // Возвращая "false" мы приказываем диспетчеру прервать текущую операцию
            return false;
        }
    }
}