import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Enter email and password.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // onAuthStateChanged in App.tsx will switch to Tabs
    } catch (e: any) {
      setError(firebaseErrorToMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={s.title}>Welcome back</Text>

      <TextInput
        style={s.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
        placeholderTextColor={"black"}
      />
      <TextInput
        style={s.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        onSubmitEditing={onLogin}
        placeholderTextColor={"black"}
      />

      {error ? <Text style={s.error}>{error}</Text> : null}

      <TouchableOpacity style={s.btn} onPress={onLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={s.btnText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={s.link}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={{ height: 12 }} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={s.link}>Create an account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

function firebaseErrorToMessage(e: any) {
  const code = e?.code || "";
  if (code.includes("auth/invalid-email")) return "Invalid email address.";
  if (code.includes("auth/user-not-found"))
    return "No account with this email.";
  if (code.includes("auth/wrong-password")) return "Incorrect password.";
  if (code.includes("auth/too-many-requests"))
    return "Too many attempts. Try again later.";
  return "Unable to sign in. Please try again.";
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
    color: "#000",
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
