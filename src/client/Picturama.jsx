import React, { Component } from 'react';
import axios from 'axios';
import Whiteboard from './Whiteboard.jsx';
import Registration from './containers/Registration';


export default class Picturama extends Component {
  state = {
    user: {},
    valueLogin: '',
  };

  handleSubmit(e) {
    axios.post('/login', {
      login: this.state.valueLogin,
    })
      .then((res) => {
        console.log(res);
        if (res.statusText === 'OK') {
          this.setState({ user: res.data });
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
    const { valueLogin, user } = this.state;
    return (
      <div className="container">
        <Registration valueLogin={valueLogin} onLoginChange={this.handleChange.bind(this)}
                      onFormSubmit={this.handleSubmit.bind(this)} />
        <Whiteboard user={user}/>
      </div>

    );
  }
}
