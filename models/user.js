const mongoose = require("mongoose");
uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, minLength: 4 },
  passwordHash: { type: String, required: true },
  memes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Meme",
    },
  ],
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
