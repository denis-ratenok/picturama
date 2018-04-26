import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from '../../webpack.config';
import runIO from './io';

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
app.use(express.static('dist/client'));

const server = app.listen(3000, () => console.log('Picturama listening on port 3000!'));
runIO(server);
