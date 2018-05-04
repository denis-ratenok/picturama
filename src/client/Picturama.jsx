import React, { Component } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import Whiteboard from './Whiteboard.jsx';
import Registration from './containers/Registration.jsx';

export const SRV_URL = 'http://localhost:3000';

export default class Picturama extends Component {
  state = {
    user: {},
    valueLogin: '',
    users: [],
  };

  socket = io.connect(SRV_URL, { reconnection: false })
    .on('newUser', (user) => {
      this.setState({ users: [...this.state.users, user] });
      console.log(this.state.users);
    });
  handleSubmit(e) {
    axios.post('/login', {
      login: this.state.valueLogin,
    })
      .then((res) => {
        console.log(res);
        if (res.statusText === 'Partial Content') {
          this.setState({ user: res.data });
        } else if (res.statusText === 'OK') {
          this.setState({ user: res.data });
          this.setState({ users: [...this.state.users, res.data] });
        }
      })
      .catch((error) => {
        console.log(error);
      });
    this.setState({ valueLogin: '' });
    e.preventDefault();
  }

  handleChange({ target }) {
    this.setState({ valueLogin: target.value });
  }


  render() {
    const { valueLogin, user, users } = this.state;
    return (
      <div className="container">
        <Registration valueLogin={valueLogin}
                      onLoginChange={this.handleChange.bind(this)}
                      onFormSubmit={this.handleSubmit.bind(this)} />
        <Whiteboard user={user} users={users} />
      </div>

    );
  }
}
