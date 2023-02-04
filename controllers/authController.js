const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const { promisify } = require("util");

const roles = ["admin", "lead-guide"];
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });
  //removes password from data sent to browser
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.register = async (req, res) => {
  //generate new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  try {
    //create new user
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User exists already",
      });
    }
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    if (newUser) {
      createSendToken(newUser, 201, req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: "There was an error please try again",
      });
    }
  } catch {
    (err) => {
      console.log(err);
    };
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  //1. check if email and password exist
  if (!email || !password)
    return next(new AppError("Please enter your email and password", 400));
  //2. verify password is correct,
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res
      .status(401)
      .json({ success: false, message: "Incorrect Email or Password" });

  //3. create and send token to client to login
  createSendToken(user, 200, req, res);
};

exports.protect = async (req, res, next) => {
  // check if token exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // check if token is valid
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "You are not Logged in, Please Login to view this page",
    });
  }
  const isTokenExpired = (token) =>
    Date.now() >= JSON.parse(atob(token.split(".")[1])).exp * 1000;
  if (isTokenExpired(token)) {
    return res.status(401).json({
      success: false,
      message: "Token Expired, Please Login again",
    });
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "You are not Logged in, Please Login to view this page",
    });
  }
  //check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized User, Please Login Again!",
    });
  }

  //grant access to route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles is an array of ['admin', 'supervisor']
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permissions to perform this action",
      });
    }
    next();
  };
