import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import serviceAccount from "../firebaseAdminConfig.json";
import admin from "firebase-admin";

const serviceAccountJSON: admin.ServiceAccount =
  serviceAccount as admin.ServiceAccount;

// initialize firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountJSON),
});

export const db = getFirestore();
export const authAdmin = getAuth();
export { FieldValue, Timestamp };
