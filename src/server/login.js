import { Router } from 'express';

export default (db) => {
  const router = Router();
  // on this moment collection is stll creating
  // const images = db.getCollection('images');

  router.post('/login', (req, res) => {
    const user = req.body;
    const usersDB = db.getCollection('users').find(user)[0];
    if (!usersDB.find(user)[0]) {
      usersDB.insert(user);
    }
    res.send(usersDB.find(user)[0]);
  });

  return router;
};
