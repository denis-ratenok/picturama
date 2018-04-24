import express from 'express';

const app = express();
app.use(express.static('dist/client'));

export default app;
