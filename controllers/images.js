const imagesRouter = require("express").Router();
const uploadImage = require("../helpers/uploadImage");

imagesRouter.post("/", async (req, res, next) => {
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

module.exports = imagesRouter;
