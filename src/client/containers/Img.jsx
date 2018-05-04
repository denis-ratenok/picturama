import React, { Component } from 'react';
import Draggable from 'react-draggable';

export default class Img extends Component {
  constructor(props) {
    super(props);

  }
  UNSAFE_componentWillMount() {
    console.log('99900');
  }
  render() {
    const { url, id, position, idImgSelected } = this.props;
    const boxStyle = { width: '28%', heigth: '28%', cursor: 'move' };
    return (
      <Draggable
        key={id}
        onStart={this.props.onStart}
        onStop={this.props.onStop}
        onDrag={this.props.onControlledDrag(id)}
        position={position}
        bounds="parent"
        disabled={idImgSelected !== id}
      >
        <div style={boxStyle}>
          <img
            id={id}
            className="img-fluid"
            draggable="false"
            src={url}
            onMouseDown={this.props.handleSelect}
          />
        </div>
      </Draggable>
    );
  }
}
