import React, { Component } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { Switch, Route } from 'react-router-dom';
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
  handleSubmit() {
    axios.post('/login', {
      login: this.state.valueLogin,
    })
      .then((res) => {
        const onExist = this.state.users.find(user => user.login === res.data.login);
        if (onExist) {
          this.setState({ user: res.data });
        } else {
          this.setState({ user: res.data });
          this.socket.emit('newUser', res.data);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    this.setState({ valueLogin: '' });
  }
  handleExit() {
    const indexExitUser = this.state.users.findIndex(user => user === this.user.login);
    this.setState({
      user: '',
      users: this.state.users.splice(indexExitUser, 1),
    });
  }

  handleChange({ target }) {
    this.setState({ valueLogin: target.value });
  }


  render() {
    const { valueLogin, user, users } = this.state;
    return (
      <div className="container">
        <Switch>
          <Route exact path='/registration' render={() => <Registration
            valueLogin={valueLogin}
            onLoginChange={this.handleChange.bind(this)}
            onFormSubmit={this.handleSubmit.bind(this)} />} />
          <Route exact path='/app' render={() => <Whiteboard
            user={user}
            users={users}
            onHandleExit={this.handleExit.bind(this)}/>}/>
        </Switch>
      </div>
    );
  }
}
