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

function findMinSizeBoard() {
  return Math.min(
    document.documentElement.clientWidth * 0.75,
    document.documentElement.clientHeight * 0.75,
  );
}

export default class Picturama extends React.Component {
  state = {
    activeDrags: 0,
    inputURL: '',
    images: [],
    coordinates: {},
    minSizeBoard: 0,
    idImgSelected: null,
  };
  socket = io.connect(SRV_URL, { reconnection: false })
    .on('new', (img) => {
      const { images, coordinates } = this.state;
      this.setState({
        images: [...images, img],
        coordinates: { ...coordinates, [img.id]: { x: 0, y: 0 } },
      });
    })
    .on('select', ({ user, idImg }) => {
      console.log(user);
      const img = document.querySelector(`img[id='${idImg}']`).parentElement;
      img.style.border = `2px solid ${user.color}`;
      if (user.login === this.props.user.login) {
        this.setState({
          idImgSelected: idImg,
        });
      }
    })
    .on('unSelect', (idImg) => {
      const img = document.querySelector(`img[id='${idImg}']`).parentElement;
      img.style.border = 'none';
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
        disabled={ this.state.idImgSelected !== id }
      >
        <div style={boxStyle}>
          <img
            id={id}
            className="img-fluid"
            draggable="false"
            src={url}
            onMouseDown={this.handleSelect}
          />
        </div>
      </Draggable>
    );
  };
  handleSelect = ({ target }) => {
    if (this.props.user.login) {
      const idImg = target.id;
      if (idImg !== this.state.idImgSelected) {
        console.log(idImg);
        this.socket.emit('select', {
          user: this.props.user,
          idImg,
        });
      }
    }
  };
  unSelect = () => {
    if (this.state.idImgSelected) {
      const img = document.querySelector(`img[id='${this.state.idImgSelected}']`).parentElement;
      img.style.border = 'none';
      this.socket.emit('unSelect', {
        user: this.props.user,
        idImg: this.state.idImgSelected,
      });
      this.setState({
        idImgSelected: null,
      });
    }
  };
  componentDidMount() {
    this.setState({
      minSizeBoard: findMinSizeBoard(),
    });
    window.onresize = () => {
      const coordinates = [];
      Object.keys(this.state.coordinates).forEach((img) => {
        const imgX = (this.state.coordinates[img].x * findMinSizeBoard()) / this.state.minSizeBoard;
        const imgY = (this.state.coordinates[img].y * findMinSizeBoard()) / this.state.minSizeBoard;
        coordinates.push({ img: { imgX, imgY } });
        this.setState({ ...coordinates });
      });
      this.setState({
        minSizeBoard: findMinSizeBoard(),
      });
    };
  }
  render() {
    const { user } = this.props;
    const { minSizeBoard, images } = this.state;
    return (
      <div>
        <h4 style={{ color: user.color }}>{user.login}</h4>
        <form className="inline-form" onSubmit={this.addImg}>
          <input type="text" value={this.state.inputURL} onChange={this.onInput}/>
          <button className="btn btn-primary">Add</button>
        </form>
        <div className="rounded border position-relative" style={{
          width: `${minSizeBoard}px`,
          height: `${minSizeBoard}px`,
        }}
        >
          {images.map(this.renderImg)}
        </div>
        <br/>
        <button onClick={this.unSelect} className="btn btn-primary">UnSelect</button>
      </div>
    );
  }
}

