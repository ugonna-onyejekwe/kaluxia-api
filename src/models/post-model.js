const { model, Schema } = require("mongoose");

// const formatedDate = moment(Date.now()).format("MM.DD.YY");

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, required: true },
    desc: { type: String, required: true },
    thumbnail: { type: String, require: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    authur: {
      name: { type: String, required: true },
      id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
