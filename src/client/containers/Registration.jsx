import React, { PureComponent } from 'react';

export default class Registration extends PureComponent {
  handleSubmit = (event) => {
    this.props.onFormSubmit(event);
  };

  handleChange = (event) => {
    this.props.onLoginChange(event);
  };

  render() {
    const { valueInputLogin } = this.props;
    return (
      <form id="publish" className="form-inline">
        <label>
          Name:
          <input type="text" value={valueInputLogin} onChange={this.handleChange} />
        </label>
        <button onClick={this.handleSubmit} className="btn btn-primary">GO</button>
      </form>
    );
  }
}
