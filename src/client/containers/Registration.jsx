import React from 'react';

export default class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    this.props.onFormSubmit(event);
  }

  handleChange(event) {
    this.props.onLoginChange(event);
  }

  render() {
    const { valueLogin } = this.props;
    return (
      <form id="publish" className="form-inline" onSubmit={this.handleSubmit} >
        <label>
          Name:
          <input type="text" value={valueLogin} onChange={this.handleChange} />
        </label>
        <input type="submit" value="Submit" className="btn btn-primary" />
      </form>
    );
  }
}
