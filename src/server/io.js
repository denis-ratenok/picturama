/* eslint no-param-reassign: 0 */

import socketio from 'socket.io';

const addOldData = (core, funcToForEach) => {
  core.chain()
    .data()
    .forEach(funcToForEach);
};

export default (server, db) => {
  const io = socketio(server);
  let sockets = [];

  io.on('connection', (socket) => {
    sockets.push(socket);
    const user = socket.handshake.query;
    const images = db.getCollection('images');
    const users = db.getCollection('users');
    const pairs = db.getCollection('pairs');
    const connectUser = users.find({ $loki: Number(user.$loki) })[0];
    if (connectUser) {
      connectUser.connect = true;
    }
    addOldData(images, ({ $loki, position, url }) =>
      socket.emit('s_new', { id: $loki, position, url }));
    addOldData(users, (usr) => {
      if (usr.connect) {
        socket.emit('add_user', usr);
      }
    });

    pairs.data.map((pair) => {
      socket.emit('select', pair);
      socket.broadcast.emit('select', pair);
    });

    socket.broadcast.emit('add_user', connectUser);

    socket.on('c_new', (imgPercent) => {
      socket.broadcast.emit('s_new', imgPercent);
    });

    socket.on('c_drag', (imgPercent) => {
      socket.broadcast.emit('s_drag', imgPercent);
    });

    socket.on('set_db_position', ({ id, position }) => {
      const img = images.get(Number(id), false);
      img.position = position;
      images.update(img);
    });

    socket.on('select', (pair) => {
      const [onLock] = pairs.find({ idImg: pair.idImg });
      if (!onLock) {
        pairs.insert(pair);
        socket.emit('select', pair);
        socket.broadcast.emit('select', pair);
      }
    });

    socket.on('un_select', (pair) => {
      pairs.findAndRemove({ idImg: pair.idImg });
      socket.emit('un_select', pair);
      socket.broadcast.emit('un_select', pair);
    });

    socket.on('disconnect', () => {
      connectUser.connect = false;
      socket.emit('remove_user', connectUser);
      socket.broadcast.emit('remove_user', connectUser);
      sockets = sockets.filter(s => s !== socket);
    });
  });
};

