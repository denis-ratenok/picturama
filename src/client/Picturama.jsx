import React from 'react';
import Whiteboard from './Whiteboard.jsx';


export default class Picturama extends React.Component {
  state = {
    userName: 'rick',
  };

  render() {
    return (
      <div className="container">
        <h2>Drag</h2>
        <Whiteboard user={this.state.userName}/>
      </div>
    );
  }
}
