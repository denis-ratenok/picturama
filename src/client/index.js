// import io from 'socket.io-client';
// import client from './client';

// const SRV_URL = 'http://localhost:3000';
// const socket = io.connect(SRV_URL, { reconnection: false });

// socket.on('connect', () => {
//   client.register(socket);
// });

const rootEl = document.getElementById('point');
const newEl = document.createElement('p');
newEl.textContent = 'test string in p block';
rootEl.appendChild(newEl);
