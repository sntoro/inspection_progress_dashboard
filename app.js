'use strict';

var http = require('http');
var express = require('express');
var app = module.exports.app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var sql = require("mssql")

app.use(express.static('public'));

//run localhost:8080 
app.get('/', function (req, res) {
    res.sendFile('index.html', {root: __dirname});
});

//configure database 
var config = {
    user: 'your_user',
    password: 'your_password',
    server: 'your_server', // You can use 'localhost\\instance' to connect to named instance
    database: 'your_database'
}

sql.connect(config)

//set interval 10seconds
setInterval(function () {

    const request = new sql.Request()

    //quering
    request.query("SELECT SC.CHR_WORK_CENTER, RTRIM(SC.CHR_PART_NO) CHR_PART_NO, CHR_BACK_NO, INT_QTY_TARGET, INT_QTY_TOTAL , SCH.CHR_DATE \n\
        FROM PRD.TT_SETUP_CHUTE SC INNER JOIN QUA.TM_INSPECTION_SCHEDULE SCH  \n\
        ON SC.CHR_WORK_CENTER = SCH.CHR_WORK_CENTER AND SC.CHR_PART_NO = SCH.CHR_PART_NO \n\
        WHERE INT_FLG_PRD <> 2 AND INT_STATUS_UNCOMPLETE = 1 \n\
        ORDER BY CONVERT(INT, INT_SEQUENCE) ASC", (err, result) => {
        if(err){
            console.log(err)
        }else{
            //console.log(result.recordset)
            io.emit('broadcast', result.recordset);
        }
    })

}, 10000);

io.on('connection', function (socket) {
    // console.log(socket)
});

server.listen(8080, function () {
    console.log('Connected Port: 8080');
});