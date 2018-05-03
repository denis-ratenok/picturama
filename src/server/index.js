import Loki from 'lokijs';
import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getUploader from './uploader';
import config from '../../webpack.config';
import runIO from './io';

const DB_NAME = 'dist/picturama.db';

const compiler = webpack(config);
const app = express();
const db = new Loki(DB_NAME);
const uploader = getUploader(db);

// Serve hot-reloading bundle to client if Dev
if (process.env.NODE_ENV !== 'production') {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: '/',
  }));
  app.use(webpackHotMiddleware(compiler));
}

// Include server routes as a middleware
app.use(express.static('dist/client'));

app.use(uploader);

const server = app.listen(3000, () => console.log('Picturama listening on port 3000!'));
runIO(server);
