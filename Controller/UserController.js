const AppError = require('../utils/AppError');
const User = require('./../Schema/UsersSchema');
const errorMessage = (err, statusCode, res, next) => {
  if (process.env.DEV_ENV === 'Development') {
    const response = {
      status: err.status || 'fail',
      message: err.message,
      err,
      errStack: err.stack,
    };
    res.status(statusCode).json(response);
  } else {
    return next(new AppError(err.message, statusCode));
  }
};
const getUser = async (req, res, next) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('No user exists for this token', 401));
    }
    console.log(user);
    const response = {
      status: 'success',
      data: {
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        Id: user._id,
      },
    };

    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};

const updateMe = async (req, res, next) => {};
module.exports = {
  getUser,
};
