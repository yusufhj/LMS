require('dotenv').config()
require('./config/database');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const verifyToken = require('./middleware/verify-token');

// Controllers
const testJwtCtrl = require('./controllers/test-jwt');
const usersRouter = require('./controllers/users');
const profilesRouter = require('./controllers/profiles');
const coursesRouter = require('./controllers/courses');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// Public Routes
app.use('/test-jwt', testJwtCtrl);
app.use('/users', usersRouter);

// Private Routes
app.use(verifyToken);
app.use('/profiles', profilesRouter);
app.use('/courses', coursesRouter);

app.listen(process.env.PORT || 3000, () => {
  console.log('The express app is ready!');
});