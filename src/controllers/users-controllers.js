const HttpError = require("../models/error-model");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { cloudinary } = require("../utils/cloudinary");

// authSession
const authSession = async (req, res, next) => {
  if (!req.user) {
    return next(new HttpError("User session expired"), 403);
  }

  res.status(200).send({ msg: "User session not yet expired" });
};

// sign in
//unprotected
const create_new_user = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return next(new HttpError("Fill in all fields", 422));
    }

    const newEmail = email.toLowerCase();

    if (newEmail.includes("@") === false) {
      return next(new HttpError("Invalid email, email must contain '@' ", 422));
    }

    const userExist = await User.findOne({ email: newEmail });

    if (userExist) {
      return next(new HttpError(`User with email ${email} already exist`, 422));
    }

    // Trim password
    const newPassword = password.trim();

    if (newPassword.length < 6) {
      return next(new HttpError("password must be at least 6 characters", 422));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(newPassword, salt);

    const newName = firstName + " " + lastName;

    const unknowUserImage = "app-unknown-user.jpg";
    const newUser = await User.create({
      name: newName,
      email: newEmail,
      password: hashedPass,
      avatar: unknowUserImage,
    });

    if (!newUser) {
      return next(new HttpError("Error occured. Try again ", 422));
    }

    const { _id: id, name } = newUser;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({ id, name, token: token });
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Login user
//unprotected
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new HttpError("Fill in all field", 422));
    }

    const newEmail = email.toLowerCase();

    if (newEmail.includes("@") === false) {
      return next(new HttpError("Invalid email, email must contain '@' ", 422));
    }

    const user = await User.findOne({ email: newEmail });

    if (!user) {
      return next(
        new HttpError("Email does not exist. Please, create account ", 422)
      );
    }

    const comparedPass = await bcrypt.compare(password, user.password);

    if (!comparedPass) {
      return next(new HttpError("Invalid credientials", 422));
    }

    const { _id: id, name } = user;
    const token = jwt.sign({ id, name }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).send({ id, name, token: token });
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Get all users
//unprotected
const allusers = async (req, res, next) => {
  try {
    const allUsers = await User.find().select("-password");

    res.status(200).send(allUsers);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Get single user
// unprotected
const singleUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return next(new HttpError("user not found", 410));
    }

    res.status(200).send(user);
  } catch (error) {
    return next(new HttpError(error));
  }
};

//Edit user profile
// protected
const editUser = async (req, res, next) => {
  try {
    const { firstName, lastName, bio, about } = req.body;

    if (!req.user) {
      return next(new HttpError("Unathorized. pls login", 403));
    }

    if (!firstName || !lastName || !bio || !about) {
      return next(new HttpError("fill in all fields", 422));
    }

    if (bio.length > 100) {
      return next(
        new HttpError("Bio field must not contain more than 100 characters")
      );
    }

    if (about.length < 300) {
      return next(
        new HttpError("About field should container atleast 300 charaters")
      );
    }

    const newName = firstName + " " + lastName;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: newName, bio, about },
      { new: true }
    );
    res.status(200).send(updatedUser);
  } catch (error) {
    return next(new HttpError(error));
  }
};

// Change Avater
// protectted
const changeAvatar = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new HttpError("Unauthorized. Pls Login", 403));
    }

    if (!req.file) {
      return next(new HttpError("Pls, upload an image", 422));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new HttpError("User not found", 422));
    }

    if (user.id !== req.user.id) {
      return next(
        new HttpError(
          "You can't edit another person image. pls login to your account to do that.",
          403
        )
      );
    }

    if (user.avatar.url && user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const image = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      upload_preset: "kaluxia-images",
    });

    if (!image) {
      return next(new HttpError("unable to upload image", 500));
    }

    const { public_id, url } = image;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: { public_id, url },
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(new HttpError("Error occured, Can't update user"));
    }

    res.status(201).send(updatedUser);
  } catch (error) {
    console.log(error);
    return next(new HttpError(error));
  }
};

//
// exproting all functions
module.exports = {
  create_new_user,
  changeAvatar,
  loginUser,
  allusers,
  singleUser,
  editUser,
  authSession,
};
