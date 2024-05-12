import express, { Request, Response} from "express";
import multer from 'multer'

const app = express();
const port = 3000;

const upload = multer({ dest: './public/data/uploads/' })

app.get('/', (req: Request, res: Response) => {
	res.send("Hello World")
})

app.post('/image/upload',upload.single('image'), (req: Request, res: Response) => {
	console.log(req.file)
	res.status(200).send()
})

app.listen(port, () => {
	console.log(`Listening on Port: ${port}`)
})