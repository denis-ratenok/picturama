/* eslint no-param-reassign: 0 */

import { uniqueId } from 'lodash';
import socketio from 'socket.io';

export default (server) => {
  // const MSG = 'HI All!';
  const io = socketio(server);
  let sockets = [];

  io.on('connection', (socket) => {
    sockets.push(socket);
    socket.on('new', (url) => {
      socket.emit('new', { id: uniqueId(), url });
      socket.broadcast.emit('new', { id: uniqueId(), url });
    });
    socket.on('drag', (imgPosition) => {
      socket.broadcast.emit('drag', imgPosition);
    });
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
