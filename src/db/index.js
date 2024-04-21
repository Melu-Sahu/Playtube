import mongoose from "mongoose";
import { DB_NAME } from "../constents.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    // console.log("Connection Instance ", connectionInstance);
    console.log(
      "\n MongoDB Connected !! DB Host :: ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MongoDB Connection Error", error);
    process.exit(1);
  }
};

export default connectDB;
