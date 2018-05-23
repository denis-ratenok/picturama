import io from 'socket.io-client';
import React, { PureComponent } from 'react';
import Draggable from 'react-draggable';
import Dropzone from 'react-dropzone';
import update from 'immutability-helper';
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

const findSizeBoard = () => Math.min(
  document.documentElement.clientWidth * 0.75,
  document.documentElement.clientHeight * 0.75,
);

const pixelsToPercents = (positionPx, sizeBoard) => {
  const { x, y } = positionPx;
  const xPercent = (100 * x) / sizeBoard;
  const yPercent = (100 * y) / sizeBoard;
  return { xPercent, yPercent };
};

const percentsToPixels = (positionPrc, sizeBoard) => {
  const { xPercent, yPercent } = positionPrc;
  const x = (xPercent * sizeBoard) / 100;
  const y = (yPercent * sizeBoard) / 100;
  return { x, y };
};

export default class Whiteboard extends PureComponent {
  state = {
    images: [],
    users: [],
    idImgSelected: null,
    sizeBoard: 0,
  };

  socket = io.connect(SRV_URL, {
    reconnection: false,
    query: this.props.user,
  })
    .on('add_user', user => this.addUser(user))
    .on('s_new', imgPercent => this.addNewImgPercent(imgPercent))
    .on('s_drag', imgPercent => this.setPositionByPercent(imgPercent))
    .on('remove_user', user => this.removeUser(user))
    .on('select', ({ idImg, idUser }) => {
      const userSelect = this.state.users.find(user => user.$loki === idUser);
      const img = document.querySelector(`img[id='${idImg}']`);
      img.style.border = `2px solid ${userSelect.color}`;
      if (userSelect.$loki === this.props.user.$loki) {
        this.setState({ idImgSelected: idImg });
      }
    })
    .on('un_select', ({ idImg, idUser }) => {
      const userUnSelect = this.state.users.find(user => user.$loki === idUser);
      const img = document.querySelector(`img[id='${idImg}']`);
      img.style.border = 'none';
      if (userUnSelect.$loki === this.props.user.$loki) {
        this.setState({ idImgSelected: null });
      }
    });

  handleExit = () => {
    this.handleUnSelect();
    this.props.handleExit();
  };

  setPositionByPercent = (imgPercent) => {
    const { sizeBoard, images } = this.state;
    const { id, position } = imgPercent;
    const img = { id, position: percentsToPixels(position, sizeBoard) };
    const index = images.findIndex(item => img.id === item.id);
    const newImages = update(images, { [index]: { $merge: img } });
    this.setState({ images: newImages });
  };

  setPosition = (img) => {
    const { images } = this.state;
    const index = images.findIndex(({ id }) => img.id === id);
    const newImages = update(images, { [index]: { $merge: img } });
    this.setState({ images: newImages });
  };

  addUser = (user) => {
    this.setState({ users: [...this.state.users, user] });
  };

  removeUser = (user) => {
    const newUsers = this.state.users.filter(item => item.$loki !== user.$loki);
    this.setState({ users: newUsers });
  };

  addNewImgPercent = (imgPercent) => {
    const { sizeBoard, images } = this.state;
    const { id, url, position } = imgPercent;
    const img = { id, url, position: percentsToPixels(position, sizeBoard) };
    this.setState({ images: [...images, img] });
  };

  onStop = id => (e, { x, y }) => {
    const { sizeBoard } = this.state;
    const imgPercent = { id, position: pixelsToPercents({ x, y }, sizeBoard) };
    this.socket.emit('set_db_position', imgPercent);
  };

  onControlledDrag = (id) => {
    if (id === Number(this.state.idImgSelected)) {
      const { sizeBoard } = this.state;
      const throttledEmit = getThrottled(this.socket);
      return (e, { x, y }) => {
        const img = { id, position: { x, y } };
        this.setPosition(img);
        const imgPercent = { id, position: pixelsToPercents(img.position, sizeBoard) };
        throttledEmit('c_drag', imgPercent);
      };
    }
  };

  uploadImg = (files) => {
    const formData = new FormData();
    formData.append('image', files[0]);
    fetch(`${SRV_URL}/upload`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json())
      .then((img) => {
        this.addNewImgPercent(img);
        this.socket.emit('c_new', img);
      });
  };

  handleSelect = ({ target }) => {
    if (this.props.user.login) {
      const idImg = target.id;
      if (idImg !== this.state.idImgSelected) {
        this.socket.emit('select', {
          idUser: this.props.user.$loki,
          idImg,
        });
      }
    }
  };

  handleUnSelect = () => {
    if (this.state.idImgSelected) {
      const img = document.querySelector(`img[id='${this.state.idImgSelected}']`).parentElement;
      img.style.border = 'none';
      this.socket.emit('un_select', {
        idUser: this.props.user.$loki,
        idImg: this.state.idImgSelected,
      });
      this.setState({
        idImgSelected: null,
      });
    }
  };

  renderImages = ({ id, url, position }) => {
    const boxStyle = { width: '28%', heigth: '28%', cursor: 'move' };
    return (
      <Draggable
        idImgSelected={this.state.idImgSelected}
        key={id}
        onStop={this.onStop(id)}
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
            onMouseUp={this.handleUnSelect}
          />
        </div>
      </Draggable>
    );
  };

  componentDidMount() {
    this.setState({
      sizeBoard: findSizeBoard(),
    });
    window.onresize = () => {
      const { sizeBoard } = this.state;
      const images = [];
      this.state.images.map((img) => {
        const x = (img.position.x * findSizeBoard()) / sizeBoard;
        const y = (img.position.y * findSizeBoard()) / sizeBoard;
        const imgNewPosition = update(img, { position: { $set: { x, y } } });
        images.push(imgNewPosition);
        return false;
      });
      this.setState({
        sizeBoard: findSizeBoard(),
        images,
      });
    };
  }

  componentWillUnmount() {
    this.setState({
      images: [],
      users: [],
      idImgSelected: null,
      sizeBoard: 0,
    });
  }

  render() {
    // for dropzone from button call
    let dropzoneRef;
    const { users, sizeBoard } = this.state;
    return (
      <div>
        {users.map((user, index) => <li key={index} style={{ color: user.color }}>
          {user.login}
          </li>)}
        <Dropzone
          disableClick
          style={{
            position: 'relative',
            width: `${sizeBoard}px`,
            height: `${sizeBoard}px`,
          }}
          className="border border-primary"
          activeClassName="border border-success"
          rejectClassName="border border-danger"
          accept="image/jpeg, image/png, image/gif"
          onDrop={this.uploadImg}
          ref={(node) => { dropzoneRef = node; }}
          onMouseOut={this.handleUnSelect}
        >
          {this.state.images.map(this.renderImages)}
        </Dropzone>
        <button className="btn btn-primary mt-2" onClick={() => dropzoneRef.open() }>
          Open File Dialog
        </button>
        <button onClick={this.handleExit} className="btn btn-primary mt-2">Exit</button>
        <button onClick={this.handleUnSelect} className="btn btn-primary mt-2">UnSelect</button>
      </div>
    );
  }
}
