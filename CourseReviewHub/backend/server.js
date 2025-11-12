import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import userRoute from "./routes/userRoute.js";
import courseRoute from "./routes/courseRoute.js";
import reviewRoute from "./routes/reviewRoute.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from backend!");
});

app.use("/api/users",userRoute)
app.use('/api/courses', courseRoute);
app.use('/api/reviews', reviewRoute);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));