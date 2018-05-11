import io from 'socket.io-client';
import React from 'react';
import Draggable from 'react-draggable';
import Dropzone from 'react-dropzone';
import update from 'immutability-helper';
import { Link } from 'react-router-dom';
import { SRV_URL } from './Picturama.jsx';

const getThrottled = (socket, delay = 15) => {
  let previousCall = new Date().getTime();
  return (...args) => {
    const time = new Date().getTime();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      socket.emit(...args);
    }
  };
};

export default class Whiteboard extends React.Component {
  state = {
    images: [],
  };

  socket = io.connect(SRV_URL, { reconnection: false })
    .on('s_new', img => this.addNewImg(img))
    .on('s_drag', img => this.setPosition(img));

  setPosition = (img) => {
    const { images } = this.state;
    const index = images.findIndex(({ id }) => img.id === id);
    const newImages = update(images, { [index]: { $merge: img } });
    this.setState({ images: newImages });
  };

  addNewImg = (img) => {
    const { images } = this.state;
    this.setState({ images: [...images, img] });
  };

  onStop = id => (e, { x, y }) =>
    this.socket.emit('set_db_position', { id, position: { x, y } });

  onControlledDrag = (id) => {
    const throttledEmit = getThrottled(this.socket);
    return (e, { x, y }) => {
      const img = { id, position: { x, y } };
      this.setPosition(img);
      throttledEmit('c_drag', img);
    };
  };

  uploadImg = (files) => {
    const formData = new FormData();
    formData.append('image', files[0]);
    fetch(`${SRV_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
      .then((img) => {
        this.addNewImg(img);
        this.socket.emit('c_new', img);
      });
  };

  renderImages = ({ id, url, position }) => {
    const boxStyle = { width: '200px', heigth: '200px', cursor: 'move' };
    return (
      <Draggable
        key={id}
        onStop={this.onStop(id)}
        onDrag={this.onControlledDrag(id)}
        position={position}
        bounds="parent"
      >
        <div style={boxStyle} className="border">
          <img
            className="img-fluid"
            draggable="false"
            src={url}
          />
        </div>
      </Draggable>
    );
  };

  render() {
    // for dropzone from button call
    let dropzoneRef;
    return (
      <div>
        <Dropzone
          disableClick
          style={{ position: 'relative', width: '700px', height: '700px' }}
          className="border border-primary"
          activeClassName="border border-success"
          rejectClassName="border border-danger"
          accept="image/jpeg, image/png, image/gif"
          onDrop={this.uploadImg}
          ref={(node) => { dropzoneRef = node; }}
        >
          {this.state.images.map(this.renderImages)}
        </Dropzone>
        <button className="btn btn-primary mt-2" onClick={() => dropzoneRef.open() }>
          Open File Dialog
        </button>
        <Link to="/registration" className="btn btn-primary mt-2">Registration</Link>
      </div>
    );
  }
}
