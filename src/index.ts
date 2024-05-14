import express, {Request, Response} from 'express';
import {MulterFile} from './types';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import {rejects} from 'assert';
import { uploadToSupabase } from './components/supabase-storage/upload-to-supabase';

const app = express();
const port = 3000;

const FILE_TYPE_MAP: {[key: string]: string} = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const destinationPath = './public/uploads/';
const compressedImgPath = './public/compressed/';

// Ensure that the compressed image directory exists
fs.mkdirSync(compressedImgPath, {recursive: true});

const storage = multer.diskStorage({
  destination: function (req: Request, file: MulterFile, cb: Function) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    if (isValid) {
      cb(null, destinationPath);
    } else {
      const uploadError = new Error('invalid image type');
      cb(uploadError, destinationPath);
    }
  },
  filename: function (req: Request, file: MulterFile, cb: Function) {
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${file.originalname}-${Date.now()}.${extension}`);
  },
});

const upload = multer({storage});

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World');
});

app.post(
  '/gallery/upload',
  upload.single('image'),
  async (req: Request, res: Response) => {
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const fileName = req.file?.filename;

    const lowResImgPath = `${compressedImgPath}${fileName}_lr.jpg`;
    const highResImgPath = `${compressedImgPath}${fileName}_hr.jpg`;

    console.log('Low res image path:', lowResImgPath);
    console.log('High res image path:', highResImgPath);

    await sharp(req.file?.path || '')
      .resize(480)
      .toFile(lowResImgPath);

    await sharp(req.file?.path || '')
      .resize(1080)
      .toFile(highResImgPath);
		
		const lowResFile = fs.readFileSync(lowResImgPath )
		const highResFile = fs.readFileSync(highResImgPath)

    await uploadToSupabase(lowResFile, lowResImgPath, highResFile, highResImgPath);

    res.json({lowResImgPath, highResImgPath});
  }
);

app.listen(port, () => {
  console.log(`Listening on Port: ${port}`);
});
