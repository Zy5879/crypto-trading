import "react-native-gesture-handler";
import "react-native-reanimated";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import Tabs from "./navigation/tabs";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { marketApi } from "./store/api/marketApi";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./services/firebase";
import LoginScreen from "./screens/Login";
import ForgotPasswordScreen from "./screens/ForgotPassword";
import RegisterScreen from "./screens/Register";
import { Provider } from "react-redux";
import { store } from "./store";
import { setUser, clearUser } from "./store/slices/userSlice";
import { setHoldings, clearPortfolio } from "./store/slices/portfolioSlice";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "./services/firebase";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
};

// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: 1,
//       refetchOnReconnect: true,
//       refetchOnWindowFocus: false,
//     },
//   },
// });

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUserApp] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let unsubHoldings: undefined | (() => void);
    let unsubMarket: undefined | (() => void); // RTKQ prefetch cleanup

    const unSubAuth = onAuthStateChanged(auth, (u) => {
      // clean previous subs on user switch
      if (unsubHoldings) {
        unsubHoldings();
        unsubHoldings = undefined;
      }
      if (unsubMarket) {
        unsubMarket();
        unsubMarket = undefined;
      }

      if (u) {
        // 1) auth → redux
        store.dispatch(
          setUser({ uid: u.uid, email: u.email, name: u.displayName ?? null })
        );

        // 2) live holdings → redux
        const colRef = collection(db, `users/${u.uid}/holdings`);

        // simple last-payload guard to avoid redundant dispatches
        let lastJson = "";
        unsubHoldings = onSnapshot(
          colRef,
          (snap) => {
            const rows = snap.docs.map((d) => {
              const h = d.data() as any;
              return {
                id: d.id,
                image: h.image ?? "",
                name: h.name ?? d.id,
                symbol: (h.symbol ?? "").toUpperCase(),
                amount: Number(h.amount ?? 0),
                valueUsd: 0, // join with market in the screen
                deltaUsd24h: 0, // join with market in the screen
              };
            });
            const json = JSON.stringify(rows);
            if (json !== lastJson) {
              lastJson = json;
              store.dispatch(setHoldings(rows));
            }
          },
          (err) => {
            console.warn("holdings onSnapshot error:", err);
            store.dispatch(setHoldings([]));
          }
        );

        // 3) (optional) prefetch market once via RTK Query so all screens share it
        const sub = store.dispatch(
          marketApi.endpoints.getMarket.initiate({
            category: "layer-1",
            perPage: 250,
            vs: "usd",
          })
        );
        unsubMarket = () => sub.unsubscribe();
      } else {
        // signed out → clear redux
        store.dispatch(clearUser());
        store.dispatch(clearPortfolio());
      }

      setUserApp(u); // your local state to toggle Tabs vs Auth
      setBooting(false);
    });

    return () => {
      unSubAuth();
      if (unsubHoldings) unsubHoldings();
      if (unsubMarket) unsubMarket();
    };
  }, []);
  if (booting) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              {user ? (
                <Tabs />
              ) : (
                <Stack.Navigator
                  id={undefined}
                  screenOptions={{ headerShown: false }}
                >
                  <Stack.Screen name="Login" component={LoginScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                  />
                </Stack.Navigator>
              )}
            </NavigationContainer>
          </SafeAreaProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
