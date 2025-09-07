import express from "express";
import "dotenv/config";

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

console.log("run");
app.get("/health", (_, res) => {
    res.status(200).send("gtg");
});

app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
