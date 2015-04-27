<?php
	$nocache = '&amp;nocache=' . microtime(true) * 10000;
?>
<!doctype html>
<head>
	<meta charset="utf-8">
	<title>InstantPjax Test <?php echo $nocache; ?></title>
	<!--[if lte IE 8]>
		<script type="application/javascript" src="https://raw.githubusercontent.com/douglascrockford/JSON-js/master/json2.js" data-no-instant></script>
	<![endif]-->
</head>
<body>

<div id="container">
	<h2>Container</h2>
	<a href="/tests">Index</a>
</div>

<script src="/tests/jquery.js.php?<?php echo $nocache ?>" data-no-ipjax></script>
<script src="/tests/instantpjax.js.php?<?php echo $nocache ?>" data-no-ipjax></script>
<script data-no-ipjax>
	$(document).ipjax('a','#container',{});
</script>
</body>
</html>
