/* eslint no-param-reassign: 0 */

import socketio from 'socket.io';

export default (server) => {
  // const MSG = 'HI All!';
  const io = socketio(server);
  let sockets = [];

  io.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('new', data => socket.broadcast.emit('hi', data));
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
