import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: boolean;
};
const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  console.log("Trying to connect to db")
  if (connection.isConnected) {
    return;
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState === 1;
    console.log("Connected to the database");
  } catch (error) {
    console.log("Error connecting to the database: ", error);
    process.exit(1);
  }
}

export default dbConnect