import 'babel-polyfill';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../webpack.config';
import srvApp from './server';

const compiler = webpack(config);
const app = express();

// Serve hot-reloading bundle to client if Dev
if (process.env.NODE_ENV !== 'production') {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: '/',
  }));
  app.use(webpackHotMiddleware(compiler));
}

// Include server routes as a middleware
app.use((req, res, next) => {
  srvApp(req, res, next);
});

app.listen(3000, () => console.log('Picturama listening on port 3000!'));
