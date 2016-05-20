<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 16.05.16
 * Time: 20:37
 */

use Phalcon\Mvc\Model\Query;
use Phalcon\Http\Response as response;
use Phalcon\Mvc\Controller;
use Phalcon\Paginator\Adapter\Model as PaginatorModel;

/**
 * @RoutePrefix("/user")
 */
class UserController extends Controller
{
    /**
     * @Get("/")
     */
    public function indexAction()
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];

        $users = User::find();
        $paginator = new PaginatorModel(
            array(
                "data" => $users,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if (!$users) return $response->setStatusCode(404);
        else return $response->setJsonContent($page);
    }

    /**
     * @Get("/profile/{id:[0-9]+}")
     */
    public function profileAction($id)
    {
        $_user = User::findFirst($id);

        $query = "SELECT * FROM Event WHERE Event.user_id = $id";
        $_events = $this->modelsManager->executeQuery($query);

        $events = array($_events);
        $i = 0;
        foreach ($_events as $event) {
            $events[$i] = $event;
            $i++;
        }

        $user = (array(
            'id' => $_user->id,
            'username' => $_user->username,
            'name' => iconv("ISO-8859-1", "UTF-8", $_user->name),
            'email' => $_user->email,
            'created' => $_user->created,
            'active' => $_user->active,
//            'events' => $events
        ));

        $response = new Response();
        $response->setContentType("application/json; UTF-8");

        if (!$user) $response->setStatusCode(404);
        else $response->setJsonContent($user);

        return $response;
    }

    /**
     * @Get("/avatar/{id:[0-9]+}")
     */
    public function avatarAction($id)
    {
        $avatar = Avatar::findFirst("user_id = $id");

        header('Content-Type: image/' . $avatar->type);

        echo base64_decode($avatar->image);
    }

    /**
     * @Get("/background/{id:[0-9]+}")
     */
    public function backgroundAction($id)
    {
        $background = Background::findFirst("user_id = $id");

        header('Content-Type: image/' . $background->type);

        echo base64_decode($background->image);
    }

    /**
     * @Get("/events/{id:[0-9]+}")
     */
    public function eventsAction($id)
    {
        $_events = Event::find(
            array(
                'conditions' => "user_id = $id"
            )
        );

        $i = 0;
        $events = array($_events);
        foreach ($_events as $event) {
            $events[$i] = array(
                'id' => $event->id,
                'name' => $event->name,
                'date' => $event->date,
                'time' => $event->time,
                'description' => $event->description,
                'type' => $event->type
            );
            $i++;
        }

        $response = new Response();
        $response->setContentType("application/json; charset=utf-8");

        if ($i == 0) return $response->setStatusCode(404);
        else return $response->setJsonContent($events);
    }

    /**
     * @Post("/create")
     */
    public function createAction()
    {
        $user = new User();

        $_user = $this->request->getJsonRawBody();

        $user->assign(array(
            'username' => $_user->username,
            'password' => $_user->password,
            'name' => $_user->name,
            'email' => $_user->email,
            'created' => $_user->created,
            'active' => $_user->active
        ));

        $response = new Response();

        if ($user->save())
            return $response->setStatusCode(201);
        else
            return $response->setStatusCode(409);
    }

    /**
     * @Put("/update")
     */
    public function updateAction()
    {
        $user = new User();

        $_user = $this->request->getJsonRawBody();
        $user->assign(array(
            'id' => $_user->id,
            'username' => $_user->username,
            'password' => sha1($_user->password),
            'name' => $_user->name,
            'email' => $_user->email,
            'created' => $_user->created,
            'active' => $_user->active
        ));

        $response = new Response();

        if ($user->update()) return $response->setStatusCode(200);
        else return $response->setStatusCode(409);
    }
}
