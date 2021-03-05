
const static = require('node-static');
const http = require('http');
const file = new(static.Server)();
// 创建服务
const app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(2013);

const io = require('socket.io').listen(app); //侦听 2013

//开始链接工作
io.sockets.on('connection', (socket) => {

  // convenience function to log server messages to the client
  function log(){ 
    const array = ['>>> Message from server: ']; 
    for (var i = 0; i < arguments.length; i++) {
      array.push(arguments[i]); //在后面添加字段
    } 
    socket.emit('log', array); //发送成功连接日志
  }

  // socket.on('message', (message) => { //收到message时，进行广播
  //   log('Got message:', message);
  //   // for a real app, would be room only (not broadcast)
  //   socket.broadcast.emit('message', message); //在真实的应用中，应该只在房间内广播
  // });

  socket.on('create or join', (room) => { //收到 “create or join” 消息

    var clientsInRoom = io.sockets.adapter.rooms[room]; //room 返回该房间对象
    var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0; //房间里的人数

    var zt;

    // log('Room ' + room + ' has ' + numClients + ' client(s)'); //打印服务器发送到客户端的代码
    // log('Request to create or join room ' + room);


    // 房间控制逻辑
    if (numClients === 0){ //如果房间里没人
      socket.join(room);
      // socket.emit('created', room); //发送 "created" 消息
      zt = 'created Room '+room;
    } else if (numClients === 1) { //如果房间里有一个人
      // io.sockets.in(room).emit('join', room);
      socket.join(room);
      // socket.emit('joined', room); //发送 “joined”消息
      zt = 'joined Room '+room;
    } else { // max two clients
      socket.emit('full', room); //发送 "full" 消息
      zt = 'joining Room '+room+'failed! room is full!';
    }
    log(zt +' Room ' + room + ' has ' + numClients + ' client(s) now'); //打印服务器发送到客户端的代码


    // socket.emit('emit(): client ' + socket.id +
    //   ' joined room ' + room);
    // socket.broadcast.emit('broadcast(): client ' + socket.id +
    //   ' joined room ' + room);

  });

});