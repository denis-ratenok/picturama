import express from 'express';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getUploader from './uploader';
import config from '../../webpack.config';
import { DB_PATH, STATIC_FILES, PORT } from './config';
import runIO from './io';
import getDB from './db';


const compiler = webpack(config);
const app = express();
const db = getDB(DB_PATH);
const uploader = getUploader(db);

// Serve hot-reloading bundle to client if Dev
if (process.env.NODE_ENV !== 'production') {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: '/',
  }));
  app.use(webpackHotMiddleware(compiler));
}

// Include server routes as a middleware
app.use(express.static(STATIC_FILES));

app.use(uploader);

const server = app.listen(PORT, () => console.log(`Picturama listening on port ${PORT}!`));
runIO(server, db);
