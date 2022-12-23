const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const app = express();

const loginRouter = require("./controllers/login");
const memesRouter = require("./controllers/memes");
const usersRouter = require("./controllers/users");
const imagesRouter = require("./controllers/images");

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("Body:  ", request.body);
  console.log("---");
  next();
};

app.disable("x-powered-by");
app.use(multerMid.single("file"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(requestLogger);

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err,
    message: err,
  });
  next();
});

app.use("/api/memes", memesRouter);
app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/images", imagesRouter);

module.exports = app;
