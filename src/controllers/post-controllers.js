const HttpError = require("../models/error-model");
const Post = require("../models/post-model");
const User = require("../models/user-model");
const { cloudinary } = require("../utils/cloudinary");

// send post
//protected
const sendPost = async (req, res, next) => {
  try {
    const { title, tag, desc } = req.body;

    if (!req.user) {
      return next(
        new HttpError("unauthorized. login to be able to create a post", 403)
      );
    }

    const { name: userName, id } = req.user;

    let user = await User.findById(id);

    if (!user) {
      return next(
        new HttpError("Unathorized. Login to be able to create a post,", 403)
      );
    }

    const { posts: postCount } = user;

    if (!title || !tag || !desc) {
      return next(new HttpError(" Fill in all field"));
    }

    if (desc.length < 200) {
      return next(
        new HttpError("Post description field must be more than 300 characters")
      );
    }

    if (!req.file) {
      return next(new HttpError("please unpload an image"));
    }

    const image = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      upload_preset: "kaluxia-images",
    });

    if (!image) {
      return next(new HttpError("unable to upload image", 500));
    }

    const { public_id, url } = image;

    const newPost = await Post.create({
      title,
      tag,
      desc,
      thumbnail: {
        public_id,
        url,
      },
      authur: {
        name: userName,
        id,
      },
    });

    if (!newPost) {
      return next(new HttpError("Unknown error occured", 500));
    }

    let userAccount = await User.findByIdAndUpdate(id, {
      posts: postCount + 1,
    });
    if (!userAccount) {
      return next(new HttpError("can't update post count", 422));
    }

    res.status(200).send(newPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//single post
//unprotected
const singlePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return next(new HttpError(`post not found`, 404));
    }

    res.status(200).send(post);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// all pospost
//unprotected
const allPost = async (req, res, next) => {
  try {
    const allPost = await Post.find().sort({ updatedAt: -1 });
    res.status(200).send(allPost);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Edit post
//protected
const editPost = async (req, res, next) => {
  try {
    const { title, tag, desc } = req.body;
    const { id } = req.params;

    if (!req.user) {
      return next(new HttpError("unauthorized. Not login in"));
    }

    const { id: userId } = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return next(new HttpError("Unauthorized. ", 500));
    }

    if (userId !== post.authur.id) {
      return next(new HttpError("Unauthorized. You can't edit this post"), 403);
    }

    if (!desc || !tag || !title) {
      return next(new HttpError("Fill in all fields", 422));
    }

    if (desc.length < 200) {
      return next(
        new HttpError(
          "Post description field must contain more than 200 characters",
          422
        )
      );
    }

    if (req.file) {
      await cloudinary.uploader.destroy(post.thumbnail.public_id);

      const image = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        upload_preset: "kaluxia-images",
      });

      if (!image) {
        return next(new HttpError("unable to upload image", 500));
      }

      const { public_id, url } = image;

      const editedPost = await Post.findByIdAndUpdate(
        id,
        {
          title,
          tag,
          desc,
          thumbnail: {
            public_id,
            url,
          },
        },
        { new: true }
      );

      if (!editedPost) {
        return next(new HttpError("Unknown error occured", 500));
      }

      res.status(200).send(editedPost);
    } else {
      const editedPost = await Post.findByIdAndUpdate(
        id,
        {
          title,
          tag,
          desc,
        },
        { new: true }
      );

      if (!editedPost) {
        return next(new HttpError("Unknown error occured", 500));
      }

      res.status(200).send(editedPost);
    }
  } catch (error) {
    return next(new HttpError(error));
  }
};

//delete post
//protected
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return next(new HttpError("Unauthorized. you can't delete this post"));
    }

    const { id: userId } = req.user;

    const post = await Post.findById(id);

    if (!post) {
      return next(new HttpError("Unauthorized."));
    }

    if (userId !== post.authur.id) {
      return next(new HttpError("Unauthorized. you can't delete this post"));
    }

    const creator = await User.findById(post.authur.id);

    const postCount = creator.posts - 1;

    await cloudinary.uploader.destroy(post.thumbnail.public_id);

    await User.findByIdAndUpdate(post.authur.id, { posts: postCount });

    if (!creator) {
      return new HttpError(
        "Creator profile does not exist. Can't delete post",
        500
      );
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return new HttpError("unKnown error occured.", 500);
    }

    res.status(200).send({ msg: "post deleted successfully" });
  } catch (error) {
    return next(new HttpError(error));
  }
};

module.exports = {
  sendPost,
  allPost,
  deletePost,
  editPost,
  singlePost,
};
