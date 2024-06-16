const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    bio: { type: String, default: null },
    avatar: {
      public_id: { type: String, default: null },
      url: { type: String, default: null },
    },
    about: { type: String, default: null },
    books: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
