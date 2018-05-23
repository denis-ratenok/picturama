import Loki from 'lokijs';

export default (DB_PATH) => {
  const db = new Loki(DB_PATH, {
    autoload: true,
    autoloadCallback() {
      let colors = db.getCollection('colors');
      let images = db.getCollection('images');
      let users = db.getCollection('users');
      let pairs = db.getCollection('pairs');
      if (colors === null) {
        colors = db.addCollection('colors');
        colors.insert([{ color: '#DC1010' }, { color: '#005DC7' }, { color: '#00C7B3' },
          { color: '#EFFF07' }, { color: '#F807FF' }, { color: '#07924C' }]);
      }
      if (images === null) {
        images = db.addCollection('images');
      }
      if (users === null) {
        users = db.addCollection('users');
      }
      if (pairs === null) {
        pairs = db.addCollection('pairs');
      }
    },
    autosave: true,
    autosaveInterval: 5000,
  });

  return db;
};
