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

        header('Content-Type: image/jpg');

        if ($event->image != null)
            echo base64_decode($event->image);
    }

    /**
     * @Get("/comments/{id:[0-9]+}")
     */
    public function commentsAction($id)
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];

        $comments = Comment::find(array(
            'conditions' => "event_id = '$id'"
        ));

        $paginator = new PaginatorModel(
            array(
                "data" => $comments,
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
            'username' => $_comment ->username,
            'comment' => $_comment ->comment,
            'event_id' => $_comment->event_id,
            'user_id' => $_comment->user_id
        ));

        $response = new Response();

        if ($comment->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

}
