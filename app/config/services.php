<?php

use Phalcon\Mvc\View;
use Phalcon\DI\FactoryDefault;
use Phalcon\Mvc\Router\Annotations as RouterAnnotations;
use Phalcon\Mvc\Dispatcher;
use Phalcon\Mvc\Url as UrlProvider;
use Phalcon\Mvc\View\Engine\Volt as VoltEngine;
use Phalcon\Mvc\Model\Metadata\Memory as MetaData;
use Phalcon\Session\Adapter\Files as SessionAdapter;
use Phalcon\Flash\Session as FlashSession;
use Phalcon\Events\Manager as EventsManager;
use Phalcon\Mvc\Model\Manager as ModelsManager;

$di = new FactoryDefault();

$di->set('url', function () use ($config) {
	$url = new UrlProvider();
	$url->setBaseUri($config->application->baseUri);
	return $url;
});

$di->set('view', function () use ($config) {

	$view = new View();

//	$view->setViewsDir(APP_PATH . $config->application->viewsDir);

	return $view;
});

/**
 * Database connection is created based in the parameters defined in the configuration file
 */
$di->setShared('db', function () use ($config) {
	$config = $config->get('database')->toArray();

	$dbClass = 'Phalcon\Db\Adapter\Pdo\\' . $config['adapter'];
	unset($config['adapter']);

	return new $dbClass($config);
});

/**
 * Start the session the first time some component request the session service
 */
$di->set('session', function () {
	$session = new SessionAdapter();
	$session->start();
	return $session;
});

/**
 * Router
 */
$di['router'] = function () {

	// Используем маршрутизатор на аннотациях
	$router = new RouterAnnotations(true);

	// Чтение аннотаций из контроллера ProductsController для ссылок начинающихся на /
	$router->addResource('User', '/user');

	return $router;
};

/**
 * Models Manager
 */
$di->set('modelsManager', function() {
	return new ModelsManager();
});
