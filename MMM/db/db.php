<?php

$server 	= "localhost:3306";		// Thủ tục truy cập đến database có port 3306
$username 	= "root";			// Cái này tên mặc định
$password 	= "";				// Không có password
$DB 		= "mmm_lunarcalendar";			// Tên database , tạm thời đặt là user


$conn = new mysqli($server, $username, $password,$DB);
mysqli_set_charset($conn, 'UTF8'); //Display vietnamese font

if ($conn->connect_error) 
    {
    	echo "Connection failed to database";
    	return;
    }

?>
