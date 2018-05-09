import io from 'socket.io-client';
import React from 'react';
import { Link } from 'react-router-dom';
import Draggable from 'react-draggable';
import { SRV_URL } from './Picturama.jsx';


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

const findSizeBoard = () => Math.min(
  document.documentElement.clientWidth * 0.75,
  document.documentElement.clientHeight * 0.75,
);

export default class Whiteboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeDrags: 0,
      inputURL: '',
      images: [],
      coordinates: {},
      sizeBoard: 0,
      idImgSelected: null,
    };
    this.handleExit = this.handleExit.bind(this);
  }

  socket = io.connect(SRV_URL, { reconnection: false })
    .on('new', (img) => {
      const { images, coordinates } = this.state;
      this.setState({
        images: [...images, img],
        coordinates: { ...coordinates, [img.id]: { x: 0, y: 0 } },
      });
    })
    .on('select', ({ user, idImg }) => {
      console.log('select');
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
      const x = (xPct * this.state.sizeBoard) / 100;
      const y = (yPct * this.state.sizeBoard) / 100;
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
    if (id === this.state.idImgSelected) {
      const throttledEmit = getThrottled(this.socket, delay);
      return (e, position) => {
        const { coordinates } = this.state;
        const { x, y } = position;
        this.setState({ coordinates: { ...coordinates, [id]: { x, y } } });
        const xPct = (100 * x) / this.state.sizeBoard;
        const yPct = (100 * y) / this.state.sizeBoard;
        throttledEmit('drag', { [id]: { xPct, yPct } });
      };
    }
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
        this.socket.emit('select', {
          user: this.props.user,
          idImg,
        });
      }
    }
  };
  handleUnSelect = () => {
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
      sizeBoard: findSizeBoard(),
    });
    window.onresize = () => {
      const coordinates = [];
      Object.keys(this.state.coordinates).forEach((idImg) => {
        const imgX = (this.state.coordinates[idImg].x * findSizeBoard()) / this.state.sizeBoard;
        const imgY = (this.state.coordinates[idImg].y * findSizeBoard()) / this.state.sizeBoard;
        coordinates[idImg] = { x: imgX, y: imgY };
      });
      this.setState({
        sizeBoard: findSizeBoard(),
        coordinates: { ...coordinates },
      });
    };
  }
  handleExit(event) {
    this.props.onHandleExit(event);
  }
  render() {
    const { user, users } = this.props;
    const { sizeBoard, images } = this.state;
    return (
      <div>
        <h4 style={{ color: user.color }}>{user.login}</h4>
        <ul>
          {users.map(({ login, color }, index) =>
            <li key={index} style={{ color: color }}>{login}</li>)}
        </ul>
        <form className="inline-form" onSubmit={this.addImg}>
          <input type="text" value={this.state.inputURL} onChange={this.onInput}/>
          <button className="btn btn-primary">Add</button>
        </form>
        <div className="rounded border position-relative" style={{
          width: `${sizeBoard}px`,
          height: `${sizeBoard}px`,
        }}>
          {images.map(this.renderImg)}
        </div>
        <br/>
        <button onClick={this.handleUnSelect} className="btn btn-primary">UnSelect</button>
        <Link onClick={this.handleExit} to="/registration" className="btn btn-primary">Exit</Link>
        <Link to="/registration" className="btn btn-primary">Registration</Link>
      </div>
    );
  }
}

