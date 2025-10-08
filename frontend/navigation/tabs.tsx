import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Home as HomeIcon,
  ArrowLeftRight,
  BarChart3,
  User2,
} from "lucide-react-native";

import HomeScreen from "../screens/Home";
import MarketStack from "../screens/MarketStack";
import ProfileScreen from "../screens/Profile";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      id={undefined}
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#141416",
          borderTopColor: "transparent",
          height: 56 + insets.bottom,
          paddingBottom: Math.max(10, insets.bottom),
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#8b8b90",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <HomeIcon stroke={color} size={size} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Trade"
        component={TradeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <ArrowLeftRight stroke={color} size={size} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Market"
        component={MarketStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <BarChart3 stroke={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User2 stroke={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
