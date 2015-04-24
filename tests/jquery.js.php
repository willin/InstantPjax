<?php
$file = '../bower_components/jQuery/dist/jquery.min.js';
if (file_exists('jquery.js')) {
	$file = 'jquery.js';
}
header('Content-Type: text/javascript');
echo file_get_contents($file);
