require("dotenv").config();
const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const upload = require("express-fileupload");

const usersRoute = require("./routes/users-route");
const postsRoute = require("./routes/posts-route");
const { notFound, errorHandler } = require("./middlewares/error-middlewares");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true, origin: "https://kaluxia-fe.vercel.app" }));
app.use(upload());
app.use("/uploads", express.static(__dirname + "/uploads"));

app.use("/api/users", usersRoute);
app.use("/api/posts", postsRoute);

app.use(notFound);
app.use(errorHandler);

connect(process.env.MONGO_DB_URI)
  .then(app.listen(PORT, () => console.log(`app runing on port ${PORT}`)))
  .catch((err) => console.log(err));
