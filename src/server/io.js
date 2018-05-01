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
      const { xPct, yPct } = imgPosition[Object.keys(imgPosition)[0]];
      const id = Object.keys(imgPosition)[0];
      const imgPositionPct = {};
      imgPositionPct[id] = { xPct, yPct };
      console.log(JSON.stringify(imgPositionPct));

      socket.broadcast.emit('dragsrv', JSON.stringify(imgPositionPct));
    });
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
