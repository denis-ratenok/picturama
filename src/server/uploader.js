import multer from 'multer';
import nodePath from 'path';
import { Router } from 'express';
import { STORAGE } from './config';

export default (db) => {
  const router = Router();
  // on this moment collection is stll creating
  // const images = db.getCollection('images');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, STORAGE);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${nodePath.extname(file.originalname)}`);
    },
  });

  // eslint-disable-next-line
  const fileFilter = (req, { originalname }, cb) => {
    if (!originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };
  const upload = multer({ storage, fileFilter });

  router.post('/upload', upload.single('image'), (req, res) => {
    const { $loki } = db.getCollection('images').insert(req.file);
    res.json({
      message: 'File uploaded successfully',
      $loki,
    });
  });

  router.get('/images/:id', (req, res) => {
    const img = db.getCollection('images').findOne({ $loki: Number(req.params.id) });
    if (!img) {
      res.sendStatus(404);
      return;
    }
    res.setHeader('Content-Type', img.mimetype);
    res.sendFile(img.path, { root: process.cwd() });
  });

  return router;
};
