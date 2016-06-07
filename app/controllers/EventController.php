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
use Phalcon\Paginator\Adapter\NativeArray as PaginatorArray;

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
        $id = (int)$_GET["id"];

        $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event
WHERE type = '$type' AND name LIKE '%$name%'");

        if (empty($type)) $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event ORDER BY Event.created DESC");

        if (!empty($id)) $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event WHERE Event.user_id = $id");

        if (!empty($type) && !empty($id)) $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event WHERE Event.user_id = $id AND type = '$type'");

        if ($type == 'actual' && empty($id)) $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event ORDER BY Event.date ASC");

        if ($type == 'actual' && !empty($id)) $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event WHERE Event.user_id = $id ORDER BY Event.date ASC");

        $dateTimeZone = new DateTimeZone('Europe/Kiev');
        $now = new DateTime();
        $now->setTimezone($dateTimeZone);
        $now->format('Y\-m\-d\ h:i:s');
        if ($type == 'past') $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, 
Event.name, Event.location, Event.date, 
Event.description, Event.time, Event.user_id FROM Event WHERE Event.date < $now ORDER BY Event.date ASC");

        $paginator = new PaginatorModel(
            array(
                "data" => $_events->execute(),
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $paginator->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if (!$page)
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
            'date' => $_event->date,
            'description' => $_event->description,
            'type' => $_event->type,
            'image' => $_event->image,
            'location' => $_event->location,
            'user_id' => $_event->user_id,
            'created' => $_event->created
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

        $_events = $this->
        modelsManager->
        createQuery("SELECT Event.id, Event.name, Event.location, Event.user_id FROM Event where Event.name like '%%$name%%'")->execute();

        $_users = $this->
        modelsManager->
        createQuery("SELECT User.id, User.username FROM User where User.username like '%%$name%%'")->execute();

        foreach ($_events as $_event) {
            $__events[] = array(
                'id' => $_event->id,
                'name' => $_event->name,
                'user_id' => $_event->user_id,
                'location' => $_event->location,
                'type' => 'event'
            );
        }

        foreach ($_users as $_user) {
            $__users[] = array(
                'id' => $_user->id,
                'name' => $_user->username,
                'type' => 'user'
            );
        }

        if ($__users != null && $__events != null) $results = array_merge($__users, $__events);
        elseif ($__events != null) $results = $__events;
        elseif ($__users != null) $results = $__users;
        else $results = array();

        $pagination = new PaginatorArray(
            array(
                "data" => $results,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $pagination->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if ($page)
            $response->setJsonContent($page);
        else
            $response->setStatusCode(404);

        return $response;
    }

    /**
     * @Get("/search")
     */
    public function nameAction($name)
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];
        $type = (string)$_GET["type"];

        $events = $this->
        modelsManager->
        createQuery("SELECT Event.id, Event.name, Event.location, Event.user_id FROM Event where Event.name like '%%$name%%'")->execute();

        $pagination = new PaginatorModel(
            array(
                "data" => $events,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $page = $pagination->getPaginate();

        $response = new Response();
        $response->setContentType("application/json");

        if ($page)
            $response->setJsonContent($page);
        else
            $response->setStatusCode(404);

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
//        $likes = Likes::find(array(
//            'conditions' => "event_id = '$id'"
//        ))->toArray();

        $_likes = $this->
        modelsManager->
        createQuery("SELECT Likes.id, Likes.user_id, Likes.event_id, User.username 
FROM Likes JOIN User ON Likes.user_id = User.id WHERE Likes.event_id = $id ORDER BY Likes.created DESC")->execute();

        foreach ($_likes as $like)
            $likes[] = $like;

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
        $like = new Likes();

        $_like = $this->request->getJsonRawBody();

        $like->assign(array(
            'event_id' => $_like->event_id,
            'user_id' => $_like->user_id,
            'created' => $_like->created
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
        $like = Likes::findFirst("id = $id");

        $response = new Response();

        if ($like->delete())
            $response->setStatusCode(200);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Get("/members/{id:[0-9]+}")
     */
    public function membersAction($id)
    {
        $_members = Member::find(array(
            'conditions' => "event_id = '$id'"
        ))->toArray();

        $_members = $this->
        modelsManager->
        createQuery("SELECT Member.id, Member.user_id, Member.event_id, User.username 
FROM Member JOIN User ON Member.user_id = User.id WHERE event_id = $id")->execute();

        foreach ($_members as $member)
            $members[] = $member;

        $response = new Response();
        $response->setContentType("application/json");

        if ($members)
            $response->setJsonContent($members);
        else
            $response->setStatusCode(404);

        return $response;
    }

    /**
     * @Post
     */
    public function joinAction()
    {
        $members = new Member();

        $_members = $this->request->getJsonRawBody();

        $members->assign(array(
            'event_id' => $_members->event_id,
            'user_id' => $_members->user_id
        ));

        $response = new Response();

        if ($members->save())
            $response->setStatusCode(201);
        else
            $response->setStatusCode(409);

        return $response;
    }

    /**
     * @Delete
     */
    public function unjoinAction($id)
    {
        $member = Member::findFirst("id = $id");

        $response = new Response();

        if ($member->delete())
            $response->setStatusCode(200);
        else
            $response->setStatusCode(409);

        return $response;
    }

}
