import express from 'express';
import multer from 'multer';

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.post('/test', upload.single('doc'), (req, res) => {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);
    res.json({ ok: true, body: req.body });
});

app.listen(5005, () => console.log('Test server on 5005'));
