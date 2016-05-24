<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 18.05.16
 * Time: 20:48
 */
use Phalcon\Mvc\Model\Query;
use Phalcon\Http\Response as response;
use Phalcon\Mvc\Controller;
use Phalcon\Paginator\Adapter\Model as PaginatorModel;

/**
 * @RoutePrefix("/event")
 */
class EventController extends Controller
{
    /**
     * @Get("/")
     */
    public function indexAction()
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];
        $type = (string)$_GET["type"];
        $name = (string)$_GET["name"];

        $events = Event::find(array(
            'conditions' => "type = '$type' AND name LIKE '%$name%'"
        ));

        if (empty($name)) $events = Event::find(array(
            'conditions' => "type = '$type'"
        ));

        if (empty($type)) $events = Event::find();

        $paginator = new PaginatorModel(
            array(
                "data" => $events,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if (!$events)
            $response->setStatusCode(404);
        else
            $response->setJsonContent($page);

        return $response;
    }

    /**
     * @Get("/profile/{id:[0-9]+}")
     */
    public function profileAction($id)
    {
        $event = Event::findFirst($id);

        $response = new Response();
        $response->setContentType("application/json");

        if (!$event) $response->setStatusCode(404);
        else $response->setJsonContent($event);

        return $response;
    }

    /**
     * @Post("/create")
     */
    public function createAction()
    {
        $event = new Event();

        $_event = $this->request->getJsonRawBody();

        $event->assign(array(
            'name' => $_event->name,
            'date' => date("now"),
            'time' => time(),
            'description' => $_event->description,
            'type' => $_event->type,
        ));

        $response = new Response();

        if ($event->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Put("/update")
     */
    public function updateAction()
    {
        $event = new Event();

        $_event = $this->request->getJsonRawBody();
        $event->assign(array(
            'id' => $_event->id,
            'name' => $_event->name,
            'date' => date("now"),
            'time' => time(),
            'description' => $_event->description,
            'type' => $_event->type,
            'user_id' => $_event->user_id
        ));

        $response = new Response();

        if ($event->update()) $response->setStatusCode(200);
        else $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Get("/search")
     */
    public function searchAction()
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];
        $type = (string)$_GET["type"];
        $name = (string)$_GET["name"];

        $events = Event::find(array(
            'conditions' => "name LIKE '%$name%'"
        ));

        $paginator = new PaginatorModel(
            array(
                "data" => $events,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if (!$events)
            $response->setStatusCode(404);
        else
            $response->setJsonContent($page);

        return $response;
    }

    /**
     * @Get("/image/{id:[0-9]+}")
     */
    public function imageAction($id)
    {
        $event = Event::findFirst($id);

        header('Content-Type: image/png');
        $response = new Response();
        if ($event->image != null)
            echo base64_decode($event->image);
        else return $response->setStatusCode(404);
    }

    /**
     * @Get("/comments/{id:[0-9]+}")
     */
    public function commentsAction($id)
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];

        $comments = $this->
        modelsManager->
        createQuery("SELECT User.id, Comment.comment, User.username 
FROM Comment JOIN User on User.id = Comment.user_id WHERE Comment.event_id = $id ORDER BY Comment.date ASC");

        $paginator = new PaginatorModel(
            array(
                "data" => $comments->execute(),
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if (!$comments)
            $response->setStatusCode(404);
        else
            $response->setJsonContent($page);

        return $response;
    }

    /**
     * @Post
     */
    public function commentAction()
    {
        $comment = new Comment();

        $_comment = $this->request->getJsonRawBody();

        $comment->assign(array(
            'username' => $_comment->username,
            'comment' => $_comment->comment,
            'event_id' => $_comment->event_id,
            'user_id' => $_comment->user_id,
            'date' => $_comment->date
        ));

        $response = new Response();

        if ($comment->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Get("/likes/{id:[0-9]+}")
     */
    public function likesAction($id)
    {
        $likes = Like::find(array(
            'conditions' => "event_id = '$id'"
        ))->toArray();

        $response = new Response();
        $response->setContentType("application/json");

        if ($likes)
            $response->setJsonContent($likes);
        else
            $response->setStatusCode(404);

        return $response;
    }

    /**
     * @Post
     */
    public function likeAction()
    {
        $like = new Like();

        $_like = $this->request->getJsonRawBody();

        $like->assign(array(
            'event_id' => $_like->event_id,
            'user_id' => $_like->user_id
        ));

        $response = new Response();

        if ($like->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Delete
     */
    public function dislikeAction($id)
    {
        $like = Like::findFirst("id = $id");

        $response = new Response();

        if ($like->delete())
            $response->setStatusCode(200);
        else
            $response->setStatusCode(409);

        return $response;
    }

}