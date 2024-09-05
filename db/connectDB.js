import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);
    console.log(
      "Connection to DB established successfully, data ==>",
      connection.version
    );
  } catch (err) {
    console.log("MongoDB connection failed, reason ==> ", err.message);
    return;
  }
};
export default connectDB;
