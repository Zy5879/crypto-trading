import { Auth } from "firebase-admin/auth";
import serviceAccount from "../firebaseAdminConfig.json";
import admin from "firebase-admin";

const serviceAccountJSON: admin.ServiceAccount =
  serviceAccount as admin.ServiceAccount;

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJSON),
});

export const adminApp = admin.app();
export const db = admin.firestore();
export const auth: Auth = admin.auth();
export default admin;
