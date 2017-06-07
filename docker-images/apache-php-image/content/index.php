<html>
<body>
<h1><span> A beer please </span></h1>
<script src="jquery.js"></script>
<script>
$(function() {
	console.log("loading beers");
	
	function loadBeer() {
	$.getJSON("/api/students/", function(beers) {
			console.log(beers);
			var message = "no beer :(";
			if(beers.length > 0) {
				message = beers[0].name + " " + beers[0].type;
			}
			console.log(message);
			$("span").text(message);
		});
	};
	
	loadBeer();
	setInterval(loadBeer, 2000);
});</script>
</body>
</html>
<?php

phpinfo();