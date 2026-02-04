import { Image } from "expo-image";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
  Text,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Link } from "expo-router";
import { useAuth } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4444" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.glassWrapper}>
          <View style={styles.glassCard}>
            <View style={styles.cardLogoWrapper}>
              <Image
                source={require("@/assets/logo/logo_2.png")}
                style={styles.cardLogo}
                contentFit="contain"
              />
            </View>

            <View style={styles.welcomeWrapper}>
              <Text style={styles.welcomeTitle}>Welcome</Text>
              <View style={styles.titleUnderline} />
            </View>

            {user ? (
              /* --- Logged In View --- */
              <View style={styles.innerContent}>
                <View style={styles.avatarWrapper}>
                  <LinearGradient
                    colors={["#ff4444", "#cc2b2b"]}
                    style={styles.avatarCircle}
                  >
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                  <View style={styles.onlineIndicator} />
                </View>

                <Text style={styles.userName}>Hello, {user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            ) : (
              /* --- Logged Out View --- */
              <View style={styles.innerContent}>

                <Link href="/(auth)/login" asChild>
                  <TouchableOpacity style={styles.authBtn} activeOpacity={0.8}>
                    <LinearGradient
                      colors={["#ff4444", "#cc2b2b"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryBtnGradient}
                    >
                      <Ionicons name="log-in" size={22} color="#fff" />
                      <Text style={styles.btnText}>Login to Account</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Link>

                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerLinkText}>
                      Don't have an account?{" "}
                      <Text style={styles.linkHighlight}>Register</Text>
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  safeArea: { flex: 1 },

  cardLogoWrapper: {
    width: "100%",
    height: 100,
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  cardLogo: {
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  glassWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  glassCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 35,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0,
    shadowRadius: 30,
    position: "relative",
  },

  welcomeWrapper: { alignItems: "center", marginBottom: 30 },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 30,
    height: 3,
    backgroundColor: "#ff4444",
    marginTop: 5,
    borderRadius: 2,
  },

  innerContent: { width: "100%", alignItems: "center" },
  avatarWrapper: { position: "relative", marginBottom: 20 },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.2)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    borderWidth: 3,
    borderColor: "#1a1a1a",
  },
  avatarText: { fontSize: 32, fontWeight: "bold", color: "#fff" },
  userName: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 5 },
  userEmail: { color: "rgba(255,255,255,0.6)", fontSize: 14, marginBottom: 20 },

  authBtn: {
    width: "100%",
    height: 55,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 15,
  },
  primaryBtnGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 17 },

  footerLink: {
    alignItems: "center",
    marginTop: 10,
  },
  footerLinkText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  linkHighlight: {
    color: "#ff4444",
    fontWeight: "bold",
  },
});
