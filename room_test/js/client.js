var inInitiator;
room = prompt('Enter room name:'); //弹出一个输入窗口 ，加入房间号

const socket = io.connect('http://210.37.1.20:2013');  //与服务器链接 ，指定服务器


if(room !== ''){
    console.log('Joining room ' + room);
    socket.emit('create or join',room); //发送消息到服务端
}

// socket.on('full',(room) => {
//     console.log('Room'+room+'is full!');
// })

// socket.on('created', (room) => {  //如果从服务端收到 “join" 消息 
//     console.log('Making request to join room ' + room); 
//     console.log('You are the initiator!');
// });

// socket.on('joined', (room) => {  //如果从服务端收到 “join" 消息 
//     console.log('joined room ' + room); 
// });

socket.on('log', (array) => {  
    console.log.apply(console, array);
});