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

        foreach ($_events as $event) {
            $events[] = array(
                'id' => $event->id,
                'name' => $event->name,
                'date' => $event->date,
                'time' => $event->time,
                'description' => $event->description,
                'type' => $event->type,
                'location' => $event->location
            );
        }

        $paginator = new PaginatorModel(
            array(
                "data" => $_events,
                "limit" => 100,
                "page" => 1
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json; charset=utf-8");

        if ($page) $response->setJsonContent($page);
        else $response->setStatusCode(404);

        return $response;
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

    /**
     * @Get("/following/{id:[0-9]+}")
     */
    public function followingAction($id)
    {
        $following = $this->
        modelsManager->
        createQuery("SELECT Follower.id, Follower.user_id, Follower.current_user, User.username, User.name 
FROM Follower JOIN User ON User.id = Follower.user_id
Where Follower.current_user = $id");

        $paginator = new PaginatorModel(
            array(
                "data" => $following->execute(),
                "limit" => 100,
                "page" => 1
            )
        );
        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if ($page)
            $response->setJsonContent($page);
        else
            $response->setStatusCode(404);

        return $response;
    }

    /**
     * @Get("/followers/{id:[0-9]+}")
     */
    public function followersAction($id)
    {
        $followers = $this->
        modelsManager->
        createQuery("SELECT Follower.id, Follower.user_id, Follower.current_user, User.username, User.name 
FROM Follower JOIN User ON User.id = Follower.current_user
Where Follower.user_id = $id");

        $paginator = new PaginatorModel(
            array(
                "data" => $followers->execute(),
                "limit" => 100,
                "page" => 1
            )
        );
        $page = $paginator->getPaginate();


        $response = new Response();
        $response->setContentType("application/json");

        if ($page)
            $response->setJsonContent($page);
        else
            $response->setStatusCode(404);

        return $response;
    }

    /**
     * @Post
     */
    public function followAction()
    {
        $follow = new Follower();

        $_follow = $this->request->getJsonRawBody();

        $follow->assign(array(
            'current_user' => $_follow->current_user,
            'user_id' => $_follow->user_id
        ));

        $response = new Response();

        if ($follow->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Delete
     */
    public function unfollowAction($id)
    {
        $follow = Follower::findFirst("id = $id");

        $response = new Response();

        if ($follow->delete())
            $response->setStatusCode(200);
        else
            $response->setStatusCode(409);

        return $response;
    }

}
