const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
dotenv.config({path:'./.env'})
const app = express();
const userRoute = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
async function startServer() {
  try {
    await mongoose.connect(process.env.URI, {});
    console.log('CONNECTED TO DATABASE SUCCESSFULLY');

   // middleware
   app.use(express.json())
   app.use(helmet())
   app.use(morgan("common"))
  
  app.use("/api/user",userRoute)
  app.use("/api/auth",authRoute)
  app.use("/api/posts",postRoute)
    app.listen(8800, () => {
      console.log('Server is running on port 8800');
    });
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); // Exit with error code
  }
}

startServer();
