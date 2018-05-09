import io from 'socket.io-client';
import React from 'react';
import Draggable from 'react-draggable';
import Dropzone from 'react-dropzone';
import { filter, find } from 'lodash';

const SRV_URL = 'http://localhost:3000';

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
    .on('s_new', (img) => {
      const { images } = this.state;
      this.setState({ images: [...images, img] });
    })
    .on('s_drag', (img) => {
      const rest = filter(this.state.images, ({ id }) => img.id !== id);
      this.setState({ images: [...rest, img] });
    });

  getImg = id => find(this.state.images, { id });

  getRest = id => filter(this.state.images, obj => obj.id !== id);

  onStop = id => () => this.socket.emit('set_db_position', this.getImg(id));

  onControlledDrag = (id) => {
    const throttledEmit = getThrottled(this.socket);
    return (e, { x, y }) => {
      const rest = this.getRest(id);
      const oldImg = this.getImg(id);
      const newImg = { ...oldImg, position: { x, y } };
      this.setState({ images: [...rest, newImg] });
      throttledEmit('c_drag', newImg);
    };
  };

  addNewImg = (img) => {
    this.socket.emit('c_new', img);
    const { images } = this.state;
    this.setState({ images: [...images, img] });
  }

  uploadImg = (files) => {
    const formData = new FormData();
    formData.append('image', files[0]);
    fetch(`${SRV_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
      .then(this.addNewImg);
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
      </div>
    );
  }
}
