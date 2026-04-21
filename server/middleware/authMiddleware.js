const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const env = require('../config/env');

const JWT_SECRET = env.jwtSecret;

const createHttpError = (status, message, code) => {
  const err = new Error(message);
  err.status = status;
  if (code) {
    err.code = code;
  }
  return err;
};

const getToken = (req) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
};

const signToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role === 'admin' ? 'admin' : 'user',
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

const verifyToken = (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return next(createHttpError(401, 'Authentication is required.', 'AUTH_REQUIRED'));
    }

    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch (error) {
    return next(createHttpError(401, 'Your session has expired. Please sign in again.', 'AUTH_REQUIRED'));
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  return next(createHttpError(403, 'Admin role is required.', 'ADMIN_REQUIRED'));
};

const requireQuestionAuthor = async (req, res, next) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return next(createHttpError(404, 'Question not found.', 'QUESTION_NOT_FOUND'));
    }

    const question = await Question.findById(questionId).select('author');

    if (!question) {
      return next(createHttpError(404, 'Question not found.', 'QUESTION_NOT_FOUND'));
    }

    if (String(question.author) !== String(req.user.id)) {
      return next(createHttpError(403, 'Only the author can modify this question.', 'QUESTION_AUTHOR_REQUIRED'));
    }

    req.question = question;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signToken,
  verifyToken,
  requireAdmin,
  requireQuestionAuthor,
};
