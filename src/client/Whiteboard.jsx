import io from 'socket.io-client';
import React from 'react';
import Draggable from 'react-draggable';

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
    activeDrags: 0,
    inputURL: '',
    images: [],
    coordinates: {},
    minSizeBoard: 0,
  };
  socket = io.connect(SRV_URL, { reconnection: false })
    .on('new', (img) => {
      const { images, coordinates } = this.state;
      this.setState({
        images: [...images, img],
        coordinates: { ...coordinates, [img.id]: { x: 0, y: 0 } },
      });
    })
    .on('dragsrv', (imgPositionPct) => {
      const imgPosition = JSON.parse(imgPositionPct);
      const id = Object.keys(imgPosition)[0];
      const { xPct, yPct } = imgPosition[id];
      const x = (xPct * this.state.minSizeBoard) / 100;
      const y = (yPct * this.state.minSizeBoard) / 100;
      const position = {};
      position[id] = { x, y };
      this.setState({ coordinates: { ...this.coordinates, ...position } });
    });

  onStart = () => {
    this.setState({ activeDrags: this.state.activeDrags + 1 });
  };

  onStop = () => {
    this.setState({ activeDrags: this.state.activeDrags - 1 });
  };

  onControlledDrag = (id, delay = 15) => {
    const throttledEmit = getThrottled(this.socket, delay);
    return (e, position) => {
      const { coordinates } = this.state;
      const { x, y } = position;
      this.setState({ coordinates: { ...coordinates, [id]: { x, y } } });
      const xPct = (100 * x) / this.state.minSizeBoard;
      const yPct = (100 * y) / this.state.minSizeBoard;
      throttledEmit('drag', { [id]: { xPct, yPct } });
      console.log(coordinates);
    };
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
    const boxStyle = { width: '28%', heigth: '28%', cursor: 'move' };
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

  componentDidMount() {
    this.setState({
      minSizeBoard: Math.min(
        document.documentElement.clientWidth * 0.75,
        document.documentElement.clientHeight * 0.75,
      ),
    });
    window.onresize = () => {
      Object.keys(this.state.coordinates).forEach((img) => {
        console.log(this.state.coordinates[img]);
        this.state.coordinates[img].x = (this.state.coordinates[img].x * Math.min(
          document.documentElement.clientWidth * 0.75,
          document.documentElement.clientHeight * 0.75,
        )) / this.state.minSizeBoard;
        this.state.coordinates[img].y = (this.state.coordinates[img].y * Math.min(
          document.documentElement.clientWidth * 0.75,
          document.documentElement.clientHeight * 0.75,
        )) / this.state.minSizeBoard;
      });
      this.setState({
        minSizeBoard: Math.min(
          document.documentElement.clientWidth * 0.75,
          document.documentElement.clientHeight * 0.75,
        ),
      });
    };
  }

  render() {
    return (
      <div>
        <h4>{this.props.user}</h4>
        <form className="inline-form" onSubmit={this.addImg}>
          <input type="text" value={this.state.inputURL} onChange={this.onInput}/>
          <button className="btn btn-primary">Add</button>
        </form>
        <div className="rounded border position-relative" style={{
          width: this.state.minSizeBoard + 'px',
          height:this.state.minSizeBoard + 'px',
        }}>
          {this.state.images.map(this.renderImg)}
        </div>
      </div>
    );
  }
}
