<?php
$file = '../package.json';
if (file_exists('package.json')) {
	$file = 'package.json';
}
header('Content-Type: text/json');
echo file_get_contents($file);
