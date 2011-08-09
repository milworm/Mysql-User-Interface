<?php

	$connection = mysql_connect('localhost','root','23');
#	mysql_select_db($connection, 'cash');

	$idf = mysql_stat($connection);
	print_r($idf);exit;
	while($row = mysql_fetch_assoc($idf)){
		print_r($row);
	}

?>
