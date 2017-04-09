const socketio = require('socket.io');

// assign each guest a default name before they use a nick
const assignGuestName = (socket, guestNumber, nickNames, namesUsed) => {
  const name = 'Guest' + guestNumber;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNumber + 1;
};

// handle join room
const joinRoom = (io, socket, room, nickNames, currentRoom) => {
  socket.join(room);
  
  currentRoom[socket.id] = room;
  socket.emit('joinResult', { room });
  socket.broadcast.to(room).emit('message', {
    text: `${nickNames[socket.id]} has joined ${room}.`
  });

  io.of('/').in(room).clients((err, usersInRoom) => {
    socket.emit('usersInRoom', {
      list: Array.prototype.map.call(usersInRoom, index => nickNames[index])
    });
    socket.broadcast.to(room).emit('usersInRoom', {
      list: Array.prototype.map.call(usersInRoom, index => nickNames[index])
    });

    if (usersInRoom.length > 1) {
      let otherUsers = [];

      for (let index in usersInRoom) {
        if (socket.id !== usersInRoom[index]) {
          otherUsers.push(nickNames[usersInRoom[index]]);
        }
      }

      socket.emit('message', {
        text: `Users Currently in ${room} are: ${otherUsers.join(', ')}.`
      })
    }
  });
};

const listen = server => {
  const io = socketio(server);
  let guestNumber = 1,
      nickNames   = {},
      namesUsed   = [],
      currentRoom = {};

  io.on('connection', socket => {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
    joinRoom(io, socket, 'chat-room', nickNames, currentRoom);
  });
};

exports.listen = listen;
