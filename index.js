const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const Meme = require("./models/meme");
const uploadImage = require("./helpers/helpers");
const detectText = require("./textFromImage");
const app = express();

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.disable("x-powered-by");
app.use(multerMid.single("file"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/api/memes", (request, response) => {
  Meme.find({}).then((memes) => {
    response.json(memes);
  });
});

app.post("/api/memes", async (req, res, next) => {
  try {
    console.log(req.body);
    const url = req.body.url;
    const tags = await detectText(url);
    const meme = new Meme({ ...req.body, tags });
    const savedMeme = await meme.save();
    res.status(200).json({
      message: "Created a meme succecfully",
      data: savedMeme,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/images", async (req, res, next) => {
  try {
    const myFile = req.file;
    const imageUrl = await uploadImage(myFile);
    res.status(200).json({
      message: "Upload was successful",
      data: imageUrl,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err,
    message: err,
  });
  next();
});

app.listen(3003, () => {
  console.log("app now listening for requests!!!");
});
