import express from "express";
import "dotenv/config";
import userRouter from "./routes/users.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import urlsRouter from "./routes/urls.routes";

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());
app.use(authMiddleware);

app.get("/health", (_, res) => {
    res.status(200).send("gtg");
});

app.use("/user", userRouter);
app.use(urlsRouter);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
