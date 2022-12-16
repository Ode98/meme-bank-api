require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const Meme = require("./models/meme");
const User = require("./models/user");
const uploadImage = require("./helpers/helpers");
const detectText = require("./textFromImage");
const loginRouter = require("./controllers/login");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");
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

app.get("/api/memes", (request, response, next) => {
  try {
    Meme.find({}).then((memes) => {
      response.json(memes);
    });
  } catch (error) {
    next(error);
  }
});

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

app.post("/api/memes", async (req, res, next) => {
  try {
    const token = getTokenFrom(req);
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: "token missing or invalid" });
    }
    const user = await User.findById(decodedToken.id);
    const url = req.body.url;
    const tags = await detectText(url);
    const meme = new Meme({ ...req.body, tags, user });
    const savedMeme = await meme.save();
    user.memes = user.memes.concat(savedMeme._id);
    await user.save();

    res.status(200).json({
      message: "Created a meme succecfully",
      data: savedMeme,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/memes/:id", async (req, res, next) => {
  try {
    const token = getTokenFrom(req);
    const memeId = req.params.id;
    const decodedToken = jwt.verify(token, process.env.SECRET);
    if (!token || !decodedToken.id) {
      return response.status(401).json({ error: "token missing or invalid" });
    }
    const user = await User.findById(decodedToken.id);
    const foundMeme = await Meme.findById(memeId);
    const users = foundMeme.likedUsers;
    if (users.includes(user._id)) {
      return res.status(409).json({ error: "User has already liked the meme" });
    }
    const meme = { ...req.body, likedUsers: users.concat(user) };
    user.likedMemes = user.likedMemes.concat(foundMeme);
    await user.save();
    const updatedMeme = await Meme.findByIdAndUpdate(req.params.id, meme, {
      new: true,
    });
    res.json(updatedMeme.toJSON());
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

app.post("/api/users", async (req, res, next) => {
  const { username, password } = req.body;
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const user = new User({
    username,
    passwordHash,
  });
  if (password.length < 5) {
    res
      .status(400)
      .json({ error: "Password must be at least 5 characters long" });
  }
  try {
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    next(error);
  }
});

app.get("/api/users", async (req, res) => {
  const users = await User.find({});
  response.json(users);
});

app.get("/api/users/likedMemes", async (req, res) => {
  const token = getTokenFrom(req);
  const decodedToken = jwt.verify(token, process.env.SECRET);
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: "token missing or invalid" });
  }
  const user = await User.findById(decodedToken.id);
  res.json(user.likedMemes);
});

app.use("/api/login", loginRouter);

app.use((err, req, res, next) => {
  res.status(500).json({
    error: err,
    message: err,
  });
  next();
});

app.listen(process.env.PORT, () => {
  console.log("app now listening for requests!!!");
});
