const { model, Schema } = require("mongoose");

// const formatedDate = moment(Date.now()).format("MM.DD.YY");

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    tag: { type: String, required: true },
    desc: { type: String, required: true },
    thumbnail: {
      public_id: { type: String, require: true },
      url: { type: String, require: true },
    },
    authur: {
      name: { type: String, required: true },
      id: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = model("Post", postSchema);
