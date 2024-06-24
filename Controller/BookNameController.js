const bookName = require('../Schema/BookNameSchema');
const BookName = require('../Schema/BookNameSchema');
const User = require('../Schema/UsersSchema');
const AppError = require('../utils/AppError');

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
const createBook = async (req, res, next) => {
  try {
    const name = req.body.name;
    const userId = [req.user.email];
    const originalOwner = req.user.email;
    const data = await BookName.create({ name, userId, originalOwner });
    const response = {
      status: 'success',
      data: {
        data,
      },
    };
    res.status(201).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const updateBook = async (req, res, next) => {
  try {
    const name = req.body.name;
    const newUserId = req.body.newUserId;
    if (!name && !newUserId) {
      return next(
        new AppError(
          'Atleast enter one parameter either name or newUserId',
          403
        )
      );
    }
    const bookId = req.params.id;
    const email = req.user.email;

    const bookDetails = await BookName.findOne({ _id: bookId });
    if (!bookDetails) {
      return next(
        new AppError('No book exists with the id please check id again', 403)
      );
    }
    if (newUserId) {
      const user = await User.findOne({ email: newUserId });
      if (!user) {
        return next(
          new AppError(
            'The user you wish to add is not there. Please ask user to register on platform or check email address'
          )
        );
      }
    }

    bookDetails.name = name || bookDetails.name;
    bookDetails.updatedLast = Date.now();
    if (newUserId) {
      if (email === bookDetails.originalOwner) {
        const bookId = bookDetails.userId;

        if (bookId.includes(newUserId)) {
          return next(
            new AppError(
              `the person with this ${newUserId} is already included`,
              403
            )
          );
        }

        bookId.push(newUserId);
        bookDetails.userId = bookId;
      } else {
        return next(new AppError('Only owner of the book can add new members'));
      }
    }
    await bookDetails.save();
    const response = {
      status: 'success',
      message: 'successfully updated',
    };
    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const deleteBook = async (req, res, next) => {
  try {
    const email = req.user.email;
    const bookId = req.params.id;

    const removeUser = req.body.removeUser;
    const book = await BookName.findById(bookId);
    if (!book) {
      return next(new AppError('Book with this id does not exists', 401));
    }

    if (book.originalOwner === email) {
      if (!removeUser) {
        await BookName.findByIdAndDelete(bookId);
      } else {
        let bookUser = book.userId;

        for (let i = 0; i < removeUser.length; i++) {
          const ele = removeUser[i];
          for (let j = 0; j < bookUser.length; j++) {
            if (bookUser[j] === ele) {
              bookUser.splice(j, 1);
              break;
            }
          }
        }

        if (bookUser.length === 0) {
          await BookName.findByIdAndDelete(bookId);
        } else {
          book.userId = bookUser;
          await book.save();
        }
      }
    } else {
      return next(
        new AppError('Only owner of the book can delete this book', 404)
      );
    }
    res.status(204).json({
      status: 'success',
      message: 'successfully deleted',
    });
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
const getBookOfParticularUser = async (req, res, next) => {
  try {
    const userIdd = req.user.email;
    const data = await BookName.aggregate([
      {
        $unwind: '$userId',
      },
      {
        $match: { userId: userIdd },
      },
      {
        $group: {
          _id: null,
          bookName: { $push: '$name' },
          bookId: { $push: '$_id' },
          updatedLast: { $push: '$updatedLast' },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);
    if (data.length === 0) {
      return next(new AppError('a user has not created any book', 401));
    }
    let actualData = [];
    for (let i = 0; i < data[0].bookName.length; i++) {
      const entry = {
        bookName: data[0].bookName[i],
        bookId: data[0].bookId[i],
        updatedLast: data[0].updatedLast[i],
      };
      actualData.push(entry);
    }

    const response = {
      status: 'success',
      data: {
        data: actualData,
      },
    };
    res.status(200).json(response);
  } catch (err) {
    errorMessage(err, 400, res, next);
  }
};
module.exports = {
  createBook,
  updateBook,
  deleteBook,
  getBookOfParticularUser,
};
