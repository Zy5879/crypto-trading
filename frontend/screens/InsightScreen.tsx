import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { askInsights } from "../services/Insights";

export default function InsightsScreen() {
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setErr(null);
    setAnswer("");
    try {
      const text = await askInsights(prompt.trim());
      setAnswer(text);
    } catch (e: any) {
      setErr(e?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.wrap}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.title}>Insights</Text>

          <TextInput
            style={s.input}
            placeholder="Ask about a coin (e.g., 'Price of Solana', 'What is Bitcoin?')"
            placeholderTextColor="#888"
            multiline
            value={prompt}
            onChangeText={setPrompt}
          />

          <TouchableOpacity
            style={[s.btn, !prompt.trim() && { opacity: 0.5 }]}
            onPress={onAsk}
            disabled={!prompt.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnTxt}>Ask</Text>
            )}
          </TouchableOpacity>

          {err ? <Text style={s.err}>Error: {err}</Text> : null}

          {!!answer && (
            <View style={s.card}>
              <Text style={s.cardText}>{answer}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, gap: 12, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "800" },
  input: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: "#f2f2f7",
    padding: 12,
    color: "#000",
    textAlignVertical: "top",
  },
  btn: {
    backgroundColor: "#6d5cff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  err: { color: "#cc0000" },
  card: {
    backgroundColor: "white",
    padding: 14,
  },
  cardText: { color: "#111", lineHeight: 20 },
});
