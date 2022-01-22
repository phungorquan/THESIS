var mysql = require('mysql'); // Khởi tạo câu lệnh DB
var pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost", // Host mặc định
    user: "root", // User mặc định
    password: "", // Password mặc định
    dateStrings: true, 
    database: "modules" // Tên database
});

// Get all modules name + status
exports.queryGetAllModulesStatus = function () {
	return new Promise (function (resolve, reject) {
		pool.query("SELECT * FROM allmodules;", function(err, rows, fields) {
			if (err){
				resolve("queryGetAllModulesStatus-ERROR");
				return;
			}
			if(rows.length>0){
				resolve(rows);
			}
		});
	});
}

// Update status of modules
exports.queryUpdateStatus = function (id, stt) {
	return new Promise (function (resolve, reject) {
		pool.query("UPDATE allmodules SET STATUS = '" + stt + "' WHERE ID = '" + id +"';", function(err, rows, fields) { // Truy vấn
			if (err){
				resolve("queryUpdateStatus-ERROR");
				return;
			}
			resolve("queryUpdateStatus-OK");
		});
	});
}

// Update status of all modules
exports.queryUpdateAllStatus = function () {
	return new Promise (function (resolve, reject) {
		pool.query("UPDATE allmodules SET STATUS = '1';", function(err, rows, fields) { // Truy vấn
			if (err){
				resolve("queryUpdateAllStatus-ERROR");
				return;
			}
			resolve("queryUpdateAllStatus-OK");
		});
	});
}

