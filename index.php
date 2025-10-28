<?php
 	if (!isset($_SESSION)) {
		session_start();
	}
	
	require "connection.php";
	include 'assets/header.php';
?>

<center>
	<div class="col-6">	
		<a href="question.php">
			<button type="button" class="btn btn-lg btn-dark btn-mulai">Start</button>
		</a>
	</div>
<center>

<?php
	include 'assets/footer.php';
?>