import express from "express";
import "dotenv/config";
import userRouter from "./routes/users.routes.ts";
import { authMiddleware } from "./middlewares/auth.middleware.ts";
import urlsRouter from "./routes/urls.routes.ts";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(authMiddleware);

console.log("run");
app.get("/health", (_, res) => {
    res.status(200).send("gtg");
});
app.use("/user", userRouter);
app.use(urlsRouter);

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
