import express, { Request, Response } from "express";
import { MulterFile } from "./types";
import multer from 'multer'
import fs from 'fs'
import path from "path";
import sharp from "sharp";
import { rejects } from "assert";
const app = express();
const port = 3000;

const destinationPath = './public/data/uploads/'

const storage = multer.diskStorage({
	destination: function (req: Request, file: MulterFile, cb: Function) {
		cb(null, destinationPath)
	},
	filename: function (req: Request, file: MulterFile, cb: Function) {
		cb(null, file.originalname)
	}
})

const upload = multer({ storage })

app.get('/', (req: Request, res: Response) => {
	res.send("Hello World")
});

app.post('/gallery/upload', upload.single('image'), async (req: Request, res: Response) => {
	const imagePath = req.file?.path || ''
	const image = sharp(imagePath);
	const resizeLow = image.clone().resize(480);
	const resizeHigh = image.resize(1080)
	// sharp(imagePath)
	// 	.resize(480)
	// 	.toFile('public/result/output_lr.jpg', (err, info) => { console.log(err, info) })

	await Promise.all([
		new Promise<void>((resolve, reject) => {
			resizeLow.toFile('public/result/output_lr.jpg', (err, info) => {
				if (err) reject(err);
				else resolve();
			});
		}),
		new Promise<void>((resolve, reject) => {
			resizeHigh.toFile('public/result/output_hr.jpg', (err, info) => {
				if (err) reject(err);
				else resolve();
			});
		})
	]);
	res.json(req.file);
});

app.listen(port, () => {
	console.log(`Listening on Port: ${port}`)
});