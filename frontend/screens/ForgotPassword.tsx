import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onReset = async () => {
    setError(null);
    setMsg(null);
    if (!email) {
      setError("Enter your email.");
      return;
    }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setMsg("Password reset email sent.");
    } catch (e: any) {
      setError("Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Reset password</Text>
      <TextInput
        style={s.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      {msg ? <Text style={s.msg}>{msg}</Text> : null}
      {error ? <Text style={s.error}>{error}</Text> : null}
      <TouchableOpacity style={s.btn} onPress={onReset} disabled={loading}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={s.btnText}>Send reset link</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={s.link}>Back to login</Text>
      </TouchableOpacity>
    </View>
  );
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
  msg: { color: "#8ce99a", marginBottom: 8 },
  error: { color: "#ff6b6b", marginBottom: 8 },
  link: { color: "#9aa0ff", textAlign: "center", marginTop: 10 },
});
