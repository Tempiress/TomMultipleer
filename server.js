const express = require('express');
const app = express();
server = require('http').createServer(app)
const { Server } = require("socket.io");
const io = require('socket.io')(server)
app.use(express.static(__dirname + '/public'));


var players = {};
num_players = 0;
var scores = {
  firstPlayer: 0,
  SecondPlayer: 0
};


console.log('Сервер запущен...');
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {
    console.log('подключился пользователь');
    players[socket.id] = {
      playerId: socket.id,
      x: Math.floor(Math.random() * (635 - 50 + 1 )) + 50, //начальная позиция по оси x
      y: 287,  //начальная позиция по оси y 
      playerId: socket.id
    };

    //отправляем объект players новому игроку
    socket.emit('currentPlayers', players);

    // обновляем всем другим игрокам информацию о новом игроке
    socket.broadcast.emit('newPlayer', players[socket.id]);

    //Когда игроки движутся, то обновляем информацию по ним
    socket.on('playerMovement', function(movementData){
      
      console.log(players[socket.id]);
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      socket.broadcast.emit('playerMoved', players[socket.id]);
    });


     socket.on('disconnect', function () {
       console.log('пользователь отключился');
       // отправляем сообщение всем игрокам, чтобы удалить этого игрока
       io.emit('playerDisconnect', players[socket.id].playerId);
       // удаляем игрока из нашего объекта players 
       delete players[socket.id];
     });


  });
 
  server.listen(8081, function () {
    console.log(`Прослушиваем ${server.address().port}`);
  });