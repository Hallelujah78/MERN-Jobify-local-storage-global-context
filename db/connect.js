import mongoose from "mongoose";

//mongoose.connect returns a promise
// this means you have to use async/await when calling connectDB in server.js. you also have to return the mongoose.connect invocation
const connectDB = (url) => {
  return mongoose.connect(url);
};

export default connectDB;
