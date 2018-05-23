import { Router } from 'express';

export default (db) => {
  const router = Router();

  router.post('/login', (req, res) => {
    const user = req.body;
    const usersDB = db.getCollection('users');
    const colors = db.getCollection('colors');
    if (!usersDB.find({ login: user.login }).length) {
      user.color = colors.find({ $loki: (usersDB.data.length + 1) % colors.data.length })[0].color;
      usersDB.insert(user);
    }
    res.send(usersDB.find({ login: user.login })[0]);
  });

  return router;
};
