import io from 'socket.io-client';
import React from 'react';
import Draggable from 'react-draggable';
import Dropzone from 'react-dropzone';

const SRV_URL = 'http://localhost:3000';

const getThrottled = (socket, delay) => {
  let previousCall = new Date().getTime();
  return (...args) => {
    const time = new Date().getTime();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      socket.emit(...args);
    }
  };
};

export default class Picturama extends React.Component {
  state = {
    images: [],
    coordinates: {},
  };
  socket = io.connect(SRV_URL, { reconnection: false })
    .on('new', (img) => {
      const { images, coordinates } = this.state;
      this.setState({
        images: [...images, img],
        coordinates: { ...coordinates, [img.id]: { x: 200, y: 200 } },
      });
    })
    .on('dragsrv', (imgPosition) => {
      this.setState({ coordinates: { ...this.coordinates, ...imgPosition } });
    });

  // onStart = () => {
  //   this.setState({ activeDrags: this.state.activeDrags + 1 });
  // };

  // onStop = () => {
  //   this.setState({ activeDrags: this.state.activeDrags - 1 });
  // };

  onControlledDrag = (id, delay = 15) => {
    const throttledEmit = getThrottled(this.socket, delay);
    return (e, position) => {
      const { coordinates } = this.state;
      const { x, y } = position;
      this.setState({ coordinates: { ...coordinates, [id]: { x, y } } });
      throttledEmit('drag', { [id]: { x, y } });
    };
  };

  // onInput = (e) => {
  //   e.preventDefault();
  //   this.setState({ file: e.target.files[0] });
  // };

  addImg = (files) => {
    const formData = new FormData();
    formData.append('image', files[0]);
    fetch(`${SRV_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
      .then(({ $loki }) => {
        this.socket.emit('new', { id: $loki, url: `${SRV_URL}/images/${$loki}` });
      });
  };

  renderImg = ({ url, id }) => {
    const boxStyle = { width: '200px', heigth: '200px', cursor: 'move' };
    const position = this.state.coordinates[id];
    return (
      <Draggable
        key={id}
        onStart={this.onStart}
        onStop={this.onStop}
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
          onDrop={this.addImg}
          ref={(node) => { dropzoneRef = node; }}
        >
          {this.state.images.map(this.renderImg)}
        </Dropzone>
        <button className="btn btn-primary mt-2" onClick={() => dropzoneRef.open() }>
          Open File Dialog
        </button>
      </div>
    );
  }
}
