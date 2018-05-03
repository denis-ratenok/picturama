import multer from 'multer';
import nodePath from 'path';
import { Router } from 'express';

export default (db) => {
  const router = Router();
  const images = db.addCollection('images', { unique: ['id'] });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'dist/uploads');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${nodePath.extname(file.originalname)}`);
    },
  });

  // accept image only
  // eslint-disable-next-line
  const fileFilter = (req, { originalname }, cb) => {
    if (!originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  };
  const upload = multer({ storage, fileFilter });

  router.post('/upload', upload.single('image'), (req, res) => {
    const { $loki, path, originalname } = images.insert(req.file);
    console.log(`file /images/${$loki}`);
    res.json({
      message: 'File uploaded successfully',
      $loki,
      path,
      originalname,
    });
  });

  router.get('/images/:id', (req, res) => {
    const img = images.findOne({ $loki: Number(req.params.id) });
    if (!img) {
      res.sendStatus(404);
      return;
    }
    res.setHeader('Content-Type', img.mimetype);
    res.sendfile(img.path);
  });

  return router;
};
