import mongoose from "mongoose";


const connectDB = async () => {
  try {
    const isDocker = process.env.IS_DOCKER === "true";

    const mongoHost = isDocker ? "host.docker.internal" : "127.0.0.1";
    const mongoURI = process.env.MONGO_URI || `mongodb://${mongoHost}:27017/epudubackend`

    // const conn = await mongoose.connect(`mongodb://${mongoHost}:27017/epudubackend`);

    const conn = await mongoose.connect(mongoURI);

    // const conn = await mongoose.connect(process.env.MONGO_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
