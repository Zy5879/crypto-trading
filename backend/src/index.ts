import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import serviceAccount from "../firebaseAdminConfig.json";
import { getCoin } from "./routes/getCoin";
import { holdingsRouter } from "./routes/holdings";
import transfer from "./routes/transfer";

const port = 8000;

const app = express();
// const serviceAccountJSON: admin.ServiceAccount =
//   serviceAccount as admin.ServiceAccount;

// // initialize firebase
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountJSON),
// });

app.use(cors());
app.use(express.json());

app.use("/coins", getCoin);
app.use("/holdings", holdingsRouter);
app.use("/transfer", transfer);

app.listen(port, () => {
  console.log(`Starting on server on port ${port}`);
});
