import React from 'react';
import io from 'socket.io-client';
import { Switch, Route, Redirect } from 'react-router';
import Whiteboard from './Whiteboard.jsx';
import Registration from './containers/Registration.jsx';

export const SRV_URL = 'http://localhost:3000';

export default class Picturama extends React.Component {
  state = {
    user: {},
    valueLogin: '',
    users: '',
  };

  handleChange({ target }) {
    this.setState({ valueLogin: target.value });
  }
  handleSubmit(e) {
    e.preventDefault();
    const user = {
      login: this.state.valueLogin,
    };
    fetch('/login', {
      method: 'POST',
      body: JSON.stringify(user),
    }).then((res) => {
      this.socket = io.connect(SRV_URL, { reconnection: false });
    });
  }
  render() {
    const { valueLogin, user } = this.state;
    return (
      <div className="container">
        <Switch>
          <Route exact path="/" render={() => (
            userName ? (
              <Redirect to="/app"/>
            ) : (
              <Redirect to="/registration"/>
            )
          )}/>
          <Route exact path='/registration' render={() => <Registration
            valueLogin={valueLogin}
            onLoginChange={this.handleChange.bind(this)}
            onFormSubmit={this.handleSubmit.bind(this)} />} />
          <Route exact path='/app' render={() => <Whiteboard
            user={user}
            /*onHandleExit={this.handleExit.bind(this)}*//>}/>
        </Switch>
      </div>
    );
  }
}
