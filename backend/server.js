const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const assignmentRoutes=require("./routes/assignmentRoutes")
const testRoutes=require("./routes/testRoutes");
const studentDetailsRoutes=require('./routes/studentDetailsRoutes');
const classRoutes=require("./routes/classRoutes")
const alertRoutes=require("./routes/alertRoutes");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments",assignmentRoutes);
app.use("/api/tests",testRoutes);
app.use('/api/student-details',studentDetailsRoutes);
app.use("/api/classes",classRoutes);
app.use("/api/alerts",alertRoutes);
app.use("/uploads",express.static("uploads"));
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});