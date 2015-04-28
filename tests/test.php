<?php
	$nocache = '&amp;nocache=' . microtime(true) * 10000;
	if (isset($_GET['ipjax'])) {
      //usleep(4 * 1000000);
    }
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
	<a href="/tests/test.php">Test</a>
	<h3><?php echo $_GET['ipjax']; ?></h3>
	<p>This is a test page.</p>
</div>

<script src="/tests/jquery.js.php?<?php echo $nocache ?>" data-no-ipjax></script>
<script src="/tests/instantpjax.js.php?<?php echo $nocache ?>" data-no-ipjax></script>
<script data-no-ipjax>
	$(document).ipjax('a','#container',{});
	$(document).on('ipjax.start',function(){
		console.log('ipjax.start');
	});
	$(document).on('ipjax.end',function(){
    	console.log('ipjax.end');
    });
    $(document).on('ipjax.cached',function(){
		console.log('ipjax.cached');
	});
    $(document).on('ipjax.cancel',function(){
		console.log('ipjax.cancel');
	});
</script>
</body>
</html>
