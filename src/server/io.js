/* eslint no-param-reassign: 0 */

import socketio from 'socket.io';

export default (server, db) => {
  const io = socketio(server);
  let sockets = [];

  io.on('connection', (socket) => {
    sockets.push(socket);
    const images = db.getCollection('images');
    images.chain()
      .data()
      .forEach(({ $loki, position, url }) =>
        socket.emit('s_new', { id: $loki, position, url }));

    socket.on('c_new', (img) => {
      socket.broadcast.emit('s_new', img);
    });
    socket.on('c_drag', (img) => {
      socket.broadcast.emit('s_drag', img);
    });
    socket.on('set_db_position', ({ id, position }) => {
      const img = images.get(Number(id), false);
      img.position = position;
      images.update(img);
    });
    socket.on('disconnect', () => {
      sockets = sockets.filter(s => s !== socket);
    });
  });
};
