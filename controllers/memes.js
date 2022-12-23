const Meme = require("../models/meme");
const User = require("../models/user");
const detectText = require("../helpers/textFromImage");
const memesRouter = require("express").Router();
const jwt = require("jsonwebtoken");

const getTokenFrom = (request) => {
  const authorization = request.get("authorization");
  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.substring(7);
  }
  return null;
};

memesRouter.get("/", (req, res, next) => {
  try {
    Meme.find({}).then((memes) => {
      res.json(memes);
    });
  } catch (error) {
    next(error);
  }
});

memesRouter.post("/", async (req, res, next) => {
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

memesRouter.put("/:id", async (req, res, next) => {
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

module.exports = memesRouter;
