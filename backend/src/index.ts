import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { getCoin } from "./routes/getCoin";

const port = 8000;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/coins", getCoin);

app.listen(port, () => {
  console.log(`Starting on server on port ${port}`);
});
