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
      const id = uniqueId();
      socket.emit('new', { id, url });
      socket.broadcast.emit('new', { id, url });
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
