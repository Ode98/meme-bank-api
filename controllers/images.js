const imagesRouter = require("express").Router();
const uploadImage = require("../helpers/uploadImage");

imagesRouter.post("/", async (req, res, next) => {
  try {
    const myFile = req.file;
    const supportedFileTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!supportedFileTypes.includes(myFile.mimetype)) {
      return res.status(400).json({ message: "File type is not supported" });
    }

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
