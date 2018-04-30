import io from 'socket.io-client';
import React from 'react';
import Draggable from 'react-draggable';

const SRV_URL = 'http://localhost:3000';

const getThrottled = (callback, delay) => {
  let previousCall = new Date().getTime();
  return (...args) => {
    const time = new Date().getTime();
    if ((time - previousCall) >= delay) {
      previousCall = time;
      callback(...args);
    }
  };
};

export default class Picturama extends React.Component {
  state = {
    activeDrags: 0,
    inputURL: '',
    boxStyle: { width: '200px', heigth: '200px', cursor: 'move' },
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
    .on('drag', imgPosition => this.setState({ coordinates: { ...this.coordinates, ...imgPosition } }));

  onStart = () => {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  };

  onStop = () => {
    this.setState({ activeDrags: this.state.activeDrags - 1 });
  };

  throttledEmit = getThrottled(this.socket.emit, 20);

  onControlledDrag = id => (e, position) => {
    const { coordinates } = this.state;
    const { x, y } = position;
    this.setState({ coordinates: { ...coordinates, [id]: { x, y } } });
    this.throttledEmit('drag', { [id]: { x, y } });
  };

  onInput = (e) => {
    e.preventDefault();
    this.setState({ inputURL: e.target.value });
  };

  addImg = (e) => {
    e.preventDefault();
    this.socket.emit('new', this.state.inputURL);
    this.setState({ inputURL: '' });
  };

  renderImg = ({ url, id }) => {
    const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
    const { boxStyle } = this.state;
    const position = this.state.coordinates[id];
    return (
      <Draggable
        key={id}
        {...dragHandlers}
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
            alt="rick"/>
        </div>
      </Draggable>
    );
  };

  render() {
    return (
      <div>
        <h4>{this.props.user}</h4>
        <form className="inline-form" onSubmit={this.addImg}>
          <input type="text" value={this.state.inputURL} onChange={this.onInput}/>
          <button className="btn btn-primary">Add</button>
        </form>
        <div className="rounded border position-relative" style={{ width: '700px', height: '700px' }}>
          {this.state.images.map(this.renderImg)}
        </div>
      </div>
    );
  }
}
