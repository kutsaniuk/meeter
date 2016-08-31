<?php

/**
 * Created by PhpStorm.
 * User: root
 * Date: 11.06.16
 * Time: 16:58
 */

use Phalcon\Mvc\Controller;
use Phalcon\Http\Response;
use Phalcon\Mvc\Router;
use Phalcon\Paginator\Adapter\Model as PaginatorModel;
use Phalcon\Paginator\Adapter\NativeArray as PaginatorArray;

class ActivityController extends Controller
{
    /**
     * @Get("/")
     */
    public function indexAction()
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];
        $date = (string)$_GET["date"];

        $currentUser = $this->session->get('id');

        $id = intval($currentUser);

        $_followings = $this->modelsManager->createQuery("SELECT Follower.id, Follower.current_user, Follower.user_id, User.username, User.name 
FROM Follower JOIN User ON User.id = Follower.user_id
Where Follower.current_user = $id")->execute();

        $activities = array();
        foreach ($_followings as $following) {
            $paginationEvents = new PaginatorModel(
                array(
                    "data" => Event::find("user_id = $following->user_id AND created >= '$date'"),
                    "limit" => 3,
                    "page" => 1
                )
            );

            $activities[] = array(
                'id' => $following->user_id,
                'username' => $following->username,
                'events' => $paginationEvents->getPaginate()
            );

        }

        $paginationActivity = new PaginatorArray(
            array(
                "data" => $activities,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $response = new Response();
        $response->setJsonContent($paginationActivity->getPaginate());
        return $response;

    }

    public function membersAction()
    {
        $currentPage = (int)$_GET["page"];
        $limit = (int)$_GET["limit"];
        $date = (string)$_GET["date"];

        $currentUser = $this->session->get('id');

        $id = intval($currentUser);

        $_followings = $this->modelsManager->createQuery("SELECT Follower.id, Follower.current_user, Follower.user_id, User.username, User.name 
FROM Follower JOIN User ON User.id = Follower.user_id
Where Follower.current_user = $id")->execute();

        $activityMembers = array();
        foreach ($_followings as $following) {
            $paginationEvents = new PaginatorModel(
                array(
                    "data" => $this->modelsManager->createQuery("SELECT Member.event_id, Event.name, Event.location,
 Event.date, Event.id
FROM Member JOIN Event ON Event.id = Member.event_id
Where Member.user_id = $following->user_id")->execute(),
                    "limit" => 9,
                    "page" => 1
                )
            );

            $activityMembers[] = array(
                'id' => $following->user_id,
                'username' => $following->username,
                'events' => $paginationEvents->getPaginate()
            );

        }

        $paginationActivityMembers = new PaginatorArray(
            array(
                "data" => $activityMembers,
                "limit" => $limit,
                "page" => $currentPage
            )
        );

        $response = new Response();
        $response->setJsonContent($paginationActivityMembers->getPaginate());
        return $response;

    }
}