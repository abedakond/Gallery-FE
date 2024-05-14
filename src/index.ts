import express, { Request, Response } from "express";
import { MulterFile } from "./types";
import multer from 'multer'
import fs from 'fs'
import path from "path";
import sharp from "sharp";
import { rejects } from "assert";

const app = express();
const port = 3000;

const FILE_TYPE_MAP: { [key: string]: string } = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg',
	'image/JPG': 'JPG',
};

const destinationPath = './public/uploads/'
const compressedImgPath  = './public/compressed/'

// Ensure that the compressed image directory exists
fs.mkdirSync(compressedImgPath, { recursive: true });

const storage = multer.diskStorage({
	destination: function (req: Request, file: MulterFile, cb: Function) {
		const isValid = FILE_TYPE_MAP[file.mimetype]
		if(isValid) {
			cb(null, destinationPath);
		} else {
			const uploadError = new Error('invalid image type'); 
			cb(uploadError, destinationPath);
		} 
	},
	filename: function (req: Request, file: MulterFile, cb: Function) {
		const extension = FILE_TYPE_MAP[file.mimetype];
		cb(null, `${file.originalname}-${Date.now()}.${extension}`);
	}
})

const upload = multer({ storage })

app.get('/', (req: Request, res: Response) => {
	res.send("Hello World")
});

app.post('/gallery/upload', upload.single('image'), async (req: Request, res: Response) => {
	// const imagePath = req.file?.path || ''
	// const image = sharp(imagePath);
	// const resizeLow = image.clone().resize(480);
	// const resizeHigh = image.resize(1080);

	const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
	const fileName = req.file?.filename

	console.log(basePath)
	console.log(fileName)


	// Create low-resolution image
    const lowResImgPath = `${compressedImgPath}${fileName}_lr.jpg`;
    const lowResImgUrl = `${basePath}${fileName}_lr.jpg`;

	console.log("Low res image path:", lowResImgPath);
	console.log("Low res image url:", lowResImgUrl);

    await sharp(req.file?.path || '').resize(480).toFile(lowResImgPath);

    // Create high-resolution image
    const highResImgPath = `${compressedImgPath}${fileName}_hr.jpg`;
    const highResImgUrl = `${basePath}${fileName}_hr.jpg`;

	console.log("High res image path:", highResImgPath);
	console.log("High res image url:", highResImgUrl);

    await sharp(req.file?.path || '').resize(1080).toFile(highResImgPath);
	// sharp(imagePath)
	// 	.resize(480)
	// 	.toFile('public/result/output_lr.jpg', (err, info) => { console.log(err, info) })

	// await Promise.all([
	// 	new Promise<void>((resolve, reject) => {
	// 		resizeLow.toFile(`${lowResImgPath}`, (err, info) => {
	// 			if (err) reject(err);
	// 			else resolve();
	// 		});
	// 	}),
	// 	new Promise<void>((resolve, reject) => {
	// 		resizeHigh.toFile(`${highResImgPath}`, (err, info) => {
	// 			if (err) reject(err);
	// 			else resolve();
	// 		});
	// 	})
	// ]);
	
	//res.json(req.file);

	res.json({ lowResImgUrl, highResImgUrl });
});

app.listen(port, () => {
	console.log(`Listening on Port: ${port}`)
});