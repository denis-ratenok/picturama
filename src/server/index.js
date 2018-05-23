import express from 'express';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import getUploader from './uploader';
import getLogin from './login';
import config from '../../webpack.config';
import { DB_PATH, STATIC_FILES, PORT, APP_PATH } from './config';
import runIO from './io';
import getDB from './db';

const compiler = webpack(config);
const app = express();
const db = getDB(DB_PATH);
const uploader = getUploader(db);
const login = getLogin(db);

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve hot-reloading bundle to client if Dev
if (process.env.NODE_ENV !== 'production') {
  app.use(webpackDevMiddleware(compiler, {
    noInfo: true, publicPath: '/',
  }));
  app.use(webpackHotMiddleware(compiler));
}

// Include server routes as a middleware
app.use(express.static(STATIC_FILES));

app.get(/\/(app|registration)$/, (req, res) => {
  res.sendFile(APP_PATH);
});

app.use(uploader);
app.use(login);
const server = app.listen(PORT, () => console.log(`Picturama listening on port ${PORT}!`));
runIO(server, db);
