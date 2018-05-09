import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from 'react-hot-loader';
import Picturama from './Picturama.jsx';

const rootEl = document.getElementById('point');
const renderRoot = (Component) => {
  ReactDOM.render(<AppContainer>
    <BrowserRouter>
      <Component/>
    </BrowserRouter>
  </AppContainer>, rootEl);
};

renderRoot(Picturama);

if (module.hot) {
  module.hot.accept('./Picturama.jsx', () => {
    const nextRoot = require('./Picturama.jsx').default; // eslint-disable-line
    renderRoot(nextRoot);
  });
}
