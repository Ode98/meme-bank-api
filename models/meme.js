require("dotenv").config();
const mongoose = require("mongoose");
const test = false;
const url = test ? process.env.TEST_MONGODB_URI : process.env.MONGODB_URI;

mongoose.set("strictQuery", false);

console.log("connecting to", url);
mongoose
  .connect(url)
  .then((result) => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const memeSchema = new mongoose.Schema({
  url: String,
  tags: String,
  likes: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  likedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

memeSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Meme", memeSchema);
