import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Coonected to mongoDB");
  } catch (err) {
    console.error("Couldn`t connect to database");
    process.exit(1);
  }
};

export default connectDB;
