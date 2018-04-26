import io from 'socket.io-client';
import React from 'react';

const SRV_URL = 'http://localhost:3000';

export default class Picturama extends React.Component {
  state = { msg: '', input: '' };
  socket = io.connect(SRV_URL, { reconnection: false })
    .on('hi', msg => this.setState({ ...this.state, msg }));

  changeInput = ({ target: { value } }) => this.setState({ ...this.state, input: value });

  setNewMsg = (e) => {
    e.preventDefault();
    const { input } = this.state;
    this.socket.emit('new', input);
    this.setState({ msg: input, input: '' });
  };

  render() {
    return (
      <div className="container">
        <h2>{this.state.msg}</h2>
        <form onSubmit={this.setNewMsg} className="form-inline">
          <input type="text" className="form-control" value={this.state.input} onChange={this.changeInput}/>
          <button type="submit" className="btn btn-primary">Set</button>
        </form>
      </div>
    );
  }
}
