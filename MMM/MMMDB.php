<?php

header("Access-Control-Allow-Origin: http://0.0.0.0:8080"); // Smart mirror run on 8080 nên phải để localhost:8080
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header("Access-Control-Allow-Headers: Content-Type, Authorization");

require "./db/db.php"; // Connect to DB

if(isset($_GET["fn"]) && isset($_GET["what"]) && isset($_GET["from"]))
{	
	$parent = array();		// Tạo một mảng $parent để phục vụ cho việc tạo JSON Array
	$getFunction = $_GET["fn"];
	$getWhat = $_GET["what"];
	$getFrom = $_GET["from"];
	$getWhere = "";
	if(isset($_GET["where"]))
	{
		$getWhere = $_GET["where"];
		$combineStr = $getFunction." ".$getWhat." FROM ".$getFrom." WHERE ".$getWhere;
		$result = $conn->query($combineStr);	  // Truy vấn

		while($row = $result->fetch_assoc())  // Trỏ đến từng hàng trong database để kiểm tra
		{
			array_push($parent,	
			[
			"ID" => $row["ID"],
			"DOW" => $row["DOW"],
			"POSCAL" => $row["POSCAL"],
			"NEGCAL" => $row["NEGCAL"],
			"EVENT" => $row["EVENT"],
			"YEAR" => $row["YEAR"]
			]);
		}
	}
	else
	{
		$combineStr = $getFunction." ".$getWhat." FROM ".$getFrom;
		$result = $conn->query($combineStr);	  // Truy vấn

		while($row = $result->fetch_assoc())  // Trỏ đến từng hàng trong database để kiểm tra
		{
			array_push($parent,	
			[
			"ID" => $row["ID"],
			"DOW" => $row["DOW"],
			"POSCAL" => $row["POSCAL"],
			"NEGCAL" => $row["NEGCAL"],
			"EVENT" => $row["EVENT"],
			"YEAR" => $row["YEAR"]
			]);
		}
	}

	if(!empty($parent))
		echo json_encode($parent);
	else 
		echo "FAILED";
}
else 
{
	echo "FAILED";
}
$conn->close();			// Đóng kết nối đến database 

?>
