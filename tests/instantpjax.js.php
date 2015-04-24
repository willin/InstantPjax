<?php
$file = '../instantpjax.js';
if (file_exists('instantpjax.js')) {
	$file = 'instantpjax.js';
}
header('Content-Type: text/javascript');
echo file_get_contents($file);
