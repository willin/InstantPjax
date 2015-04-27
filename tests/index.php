<?php
	$nocache = '&amp;nocache=' . microtime(true) * 10000;
?>
<!doctype html>
<head>
	<meta charset="utf-8">
	<title>InstantPjax Test</title>
	<!--[if lte IE 8]>
		<script type="application/javascript" src="https://raw.githubusercontent.com/douglascrockford/JSON-js/master/json2.js"></script>
	<![endif]-->
</head>
<body>

<script src="/tests/jquery.js.php?<?php echo $nocache ?>" data-no-instant></script>
<script src="/tests/instantpjax.js.php?<?php echo $nocache ?>" data-no-instant></script>
<script data-no-instant>
	alert($.ipjax({}));
</script>
</body>
</html>
