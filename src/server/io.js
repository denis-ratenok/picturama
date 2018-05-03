/* eslint no-param-reassign: 0 */

import socketio from 'socket.io';

export default (server) => {
  const io = socketio(server);
  let sockets = [];

  io.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('new', (img) => {
      socket.emit('new', img);
      socket.broadcast.emit('new', img);
    });
    socket.on('drag', (imgPosition) => {
      // console.log(imgPosition);
      socket.broadcast.emit('dragsrv', imgPosition);
    });
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
