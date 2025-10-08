import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../services/firebase";
import { ensureUserDoc } from "../services/users";

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onRegister = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter email and password.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (name) await updateProfile(cred.user, { displayName: name });
      // Optionally create a Firestore user doc with defaults
      try {
        await ensureUserDoc();
      } catch {}
      // onAuthStateChanged will route to Tabs
    } catch (e: any) {
      setError(codeToMsg(e?.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Create account</Text>
      <TextInput
        style={s.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={"black"}
      />
      <TextInput
        style={s.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={"black"}
      />
      <TextInput
        style={s.input}
        placeholder="Password"
        autoCapitalize="none"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={"black"}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={onRegister} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={s.btnText}>Sign Up</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.link}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

function codeToMsg(code: string) {
  if (code?.includes("auth/email-already-in-use"))
    return "Email already in use.";
  if (code?.includes("auth/invalid-email")) return "Invalid email.";
  if (code?.includes("auth/weak-password")) return "Password is too weak.";
  return "Unable to create account.";
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    // backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 16 },
  input: {
    // backgroundColor: "#1b1b1e",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderColor: "black",
    borderWidth: 1,
    borderStyle: "solid",
  },
  btn: {
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  error: { color: "#ff6b6b", marginBottom: 8 },
  link: { color: "#9aa0ff", textAlign: "center", marginTop: 10 },
});
