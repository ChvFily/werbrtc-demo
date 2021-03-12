'use strict'

var log4js = require('log4js');
var http = require('http');
var https = require('https');
var fs = require('fs');
var socketIo = require('socket.io');

var express = require('express');
var serveIndex = require('serve-index');

var USERCOUNT = 3; //房间最大人数

log4js.configure({
    appenders: {
        file: {
            type: 'file',
            filename: 'app.log',
            layout: {
                type: 'pattern',
                pattern: '%r %p - %m',
            }
        }
    },
    categories: {
       default: {
          appenders: ['file'],
          level: 'debug'
       }
    }
});

var logger = log4js.getLogger();

var app = express();
// app.use(serveIndex('./public/index.html'));
app.use(express.static('./public'));



//http server
var http_server = http.createServer(app);
http_server.listen(2021, '0.0.0.0');  //外网可以访问

var options = {
	key : fs.readFileSync('./public/myopenssl/server-key.pem'),
	ca :  fs.readFileSync('./public/myopenssl/ca-cert.pem'),
	cert: fs.readFileSync('./public/myopenssl/server-cert.pem')
}

//https server 
var https_server = https.createServer(options, app);
var io = socketIo.listen(https_server);

// 连接房间 不断监听
io.sockets.on('connection', (socket)=> {
	 
	// 添加做所有的数据 由服务器统一发送信息
	socket.on('message', (room, data)=>{
		logger.debug('message, room: ' + room + ", data, type:" + data.type);
		socket.to(room).emit('message',room, data);
	});

	/*
	socket.on('message', (room)=>{
		logger.debug('message, room: ' + room );
		socket.to(room).emit('message',room);
	});
	*/

	//加入房间
	socket.on('join', (room)=>{
		socket.join(room); //room == roomid ?
		var myRoom = io.sockets.adapter.rooms[room]; 
		var users = (myRoom)? Object.keys(myRoom.sockets).length : 0; //判断房间数
		logger.debug('the user number of room (' + room + ') is: ' + users);

		if(users < USERCOUNT){
			socket.emit('joined', room, socket.id); //发给除自己之外的房间内的所有人
			if(users > 1){
				socket.to(room).emit('otherjoin', room, socket.id);
			}
		
		}else{
			socket.leave(room);	
			socket.emit('full', room, socket.id);
		}
		//socket.emit('joined', room, socket.id); //发给自己
		//socket.broadcast.emit('joined', room, socket.id); //发给除自己之外的这个节点上的所有人
		//io.in(room).emit('joined', room, socket.id); //发给房间内的所有人
	});

	// 离开房间
	socket.on('leave', (room)=>{

		socket.leave(room);

		var myRoom = io.sockets.adapter.rooms[room]; 
		var users = (myRoom)? Object.keys(myRoom.sockets).length : 0;
		logger.debug('the user number of room is: ' + users);

		//socket.emit('leaved', room, socket.id);
		//socket.broadcast.emit('leaved', room, socket.id);
		socket.to(room).emit('bye', room, socket.id);
		socket.emit('leaved', room, socket.id);
		//io.in(room).emit('leaved', room, socket.id);
	});

});

https_server.listen(4433, '0.0.0.0');




