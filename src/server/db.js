import Loki from 'lokijs';

export default (DB_PATH) => {
  const db = new Loki(DB_PATH, {
    autoload: true,
    autoloadCallback() {
      // console.log('collection CB');
      let images = db.getCollection('images');
      if (images === null) {
        // console.log('creating collection');
        images = db.addCollection('images');
      }
    },
    autosave: true,
    autosaveInterval: 5000,
  });

  return db;
};
