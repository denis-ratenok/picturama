/* eslint no-param-reassign: 0 */

import { uniqueId } from 'lodash';
import socketio from 'socket.io';

const selected = [];
const images =[];

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

      socket.broadcast.emit('dragsrv', JSON.stringify(imgPositionPct));
    });
    socket.on('select', (pair) => {
      const { idImg } = pair;
      const onExist = selected.find(pairSelected => pairSelected.idImg === idImg);
      if (!onExist) {
        selected.push(pair);
        socket.emit('select', pair);
        socket.broadcast.emit('select', pair);
      } else {
        console.log('this picture is already selected');
      }
    });
    socket.on('unSelect', (pair) => {
      const { idImg } = pair;
      const onExist = selected.find(pairSelected => pairSelected.idImg === idImg);
      const idPair = selected.indexOf(onExist);
      selected.splice(idPair, 1);
      socket.broadcast.emit('unSelect', idImg);
    });
    socket.on('newUser', (user) => {
      socket.emit('newUser', user);
      socket.broadcast.emit('newUser', user);
    });
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
