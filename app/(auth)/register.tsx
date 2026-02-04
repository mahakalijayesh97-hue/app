import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import api from "../../services/api";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleRegister = async () => {
    setErrorMsg(null);
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      // Show success message and redirect to login
      showAlert(
        "Registration Successful",
        "Your account has been created. Please login with your credentials.",
        "success",
        () => router.push("/(auth)/login"),
      );
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong";
      const errors = error.response?.data?.errors;
      let errorMessage = message;
      if (errors) {
        errorMessage += "\n" + Object.values(errors).flat().join("\n");
      }
      setErrorMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Glassmorphism Card */}
        <View style={styles.glassWrapper}>
          <View style={styles.card}>
            {/* Larger Logo inside Card */}
            <View style={styles.cardLogoWrapper}>
              <Image
                source={require("@/assets/logo/logo_2.png")}
                style={styles.cardLogo}
                contentFit="contain"
              />
            </View>

            <View style={styles.titleWrapper}>
              <Text style={styles.title}>Register</Text>
              <View style={styles.titleUnderline} />
            </View>

            {errorMsg && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#ff4444"
                />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setErrorMsg(null);
                }}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setErrorMsg(null);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrorMsg(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="rgba(255,255,255,0.6)"
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setErrorMsg(null);
                }}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ff4444", "#cc2b2b"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Create Account</Text>
                    <Ionicons name="person-add" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.footerLink}>
                <Text style={styles.footerLinkText}>
                  Already a member?{" "}
                  <Text style={styles.linkHighlight}>Login</Text>
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },

  cardLogoWrapper: {
    width: "100%",
    height: 90,
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
    paddingHorizontal: 25,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: "relative",
  },
  titleWrapper: { alignItems: "center", marginBottom: 25 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  titleUnderline: {
    width: 25,
    height: 3,
    backgroundColor: "#ff4444",
    marginTop: 5,
    borderRadius: 2,
  },
  errorContainer: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    padding: 10,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
  },
  errorText: {
    color: "#ff6b6b",
    marginLeft: 8,
    fontWeight: "500",
    flex: 1,
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  buttonContainer: {
    width: "100%",
    height: 50,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 20,
  },
  buttonGradient: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
  },
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
