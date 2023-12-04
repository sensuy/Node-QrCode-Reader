import express, { Express, Request, Response, Application } from 'express';
import multer from 'multer';
import Jimp from 'jimp';
import jsQR from 'jsqr';

const app: Application = express();
const port = 5000;


// Configure storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Express & TypeScript Server');
});

const verifyFile = (req: Request, res: Response, next: any) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  next();
}

app.post('/upload', upload.single('file'), verifyFile, async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }

  const qrBuffer = req.file.buffer;
  const image = await Jimp.read(qrBuffer);

  const imageData = {
    data: new Uint8ClampedArray(image.bitmap.data),
    width: image.bitmap.width,
    height: image.bitmap.height,
  };

  // Use jsQR to decode the QR code
  const decodedQR = jsQR(imageData.data, imageData.width, imageData.height);

  if (!decodedQR) {
    res.status(400).send('Could not decode QR code');
    return;
  }



  const urlString = decodedQR.data;
  const parsedUrl = new URL(urlString);

  const pValue = parsedUrl.searchParams.get('p');

  if (parsedUrl.searchParams.get('p') === null) {
    res.status(400).send({message: 'Could not decode nfe', result: decodedQR.data});
    return;
  }

  // Save the decoded QR code to a file
  res.send({
    url: urlString,
    nfe: pValue?.substring(0, 44)
  });
});


app.listen(port, () => {
  console.log(`Server is Fire at http://localhost:${port}`);
});