<?php
	$nocache = '&amp;nocache=' . microtime(true) * 10000;
?>
<!doctype html>
<head>
	<meta charset="utf-8">
	<title>InstantPjax Test</title>
</head>
<body>

<script src="jquery.js.php?<?php echo $nocache ?>" data-no-instant></script>
<script src="instantpjax.js.php?<?php echo $nocache ?>" data-no-instant></script>
</body>
</html>
