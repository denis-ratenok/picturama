import Loki from 'lokijs';

export default (DB_PATH) => {
  const db = new Loki(DB_PATH, {
    autoload: true,
    autoloadCallback() {
      // console.log('collection CB');
      let images = db.getCollection('images');
      let users = db.getCollection('users');
      if (images === null) {
        images = db.addCollection('images');
      }
      if (users === null) {
        console.log('creating collection users');
        users = db.addCollection('users');
      }
    },
    autosave: true,
    autosaveInterval: 5000,
  });

  return db;
};
