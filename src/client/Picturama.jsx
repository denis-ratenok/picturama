import React, { Component } from 'react';
import { Route } from 'react-router';
import Whiteboard from './Whiteboard.jsx';
import Registration from './containers/Registration.jsx';

export const SRV_URL = 'http://localhost:3000';

export default class Picturama extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      valueInputLogin: '',
      color: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleExit = this.handleExit.bind(this);
  }

  handleChange({ target }) {
    this.setState({ valueInputLogin: target.value });
  }

  handleSubmit(e) {
    const { valueInputLogin } = this.state;
    if (valueInputLogin) {
      const user = {
        login: valueInputLogin,
        connect: false,
      };
      this.setState({ valueInputLogin: '' });
      fetch('/login', {
        method: 'POST',
        body: JSON.stringify(user),
        headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json())
        .then((data) => { this.setState({ user: data }); });
    }
    e.preventDefault();
  }

  handleExit() {
    this.setState({ user: {} });
  }

  render() {
    const { valueInputLogin, user } = this.state;
    return (
      <div className="container">
        <Route path="/" render={() => (
          user.login ? (
            <Whiteboard
              handleExit={this.handleExit}
              user={user}
            />
            ) : (
            <Registration
              user={user}
              valueInputLogin={valueInputLogin}
              onFormSubmit={this.handleSubmit}
              onLoginChange={this.handleChange}
            />
            )
          )}/>
      </div>
    );
  }
}
