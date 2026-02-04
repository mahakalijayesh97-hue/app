import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import api from "../../services/api";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [isChangePasswordEnabled, setIsChangePasswordEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [confirmEmail, setConfirmEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility Toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!confirmEmail || !newPassword || !confirmPassword) {
      showAlert("Error", "Please fill in all fields.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Error", "New passwords do not match.", "error");
      return;
    }

    if (newPassword.length < 8) {
      showAlert(
        "Error",
        "New password must be at least 8 characters long.",
        "error",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/change-password", {
        email: confirmEmail,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      showAlert("Success", "Password changed successfully.", "success");

      // Reset form
      setConfirmEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setIsChangePasswordEnabled(false);
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update password.";
      const errors = error.response?.data?.errors;
      let errorMessage = message;
      if (errors) {
        errorMessage += "\n" + Object.values(errors).flat().join("\n");
      }
      showAlert("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Router replacement handled in AuthContext or standard flow
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>My Profile</Text>
              <View style={styles.titleUnderline} />
            </View>
          </View>

          {/* Profile Details Card */}
          <View style={styles.glassCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user?.name || "User Name"}</Text>
                <Text style={styles.userEmail}>
                  {user?.email || "user@example.com"}
                </Text>
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Security Settings</Text>
          </View>

          <View style={styles.glassCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLabelContainer}>
                <View style={styles.iconBox}>
                  <Ionicons name="lock-closed-outline" size={20} color="#fff" />
                </View>
                <Text style={styles.settingLabel}>Change Password</Text>
              </View>
              <Switch
                trackColor={{ false: "#767577", true: "#ff4444" }}
                thumbColor={isChangePasswordEnabled ? "#fff" : "#f4f3f4"}
                onValueChange={setIsChangePasswordEnabled}
                value={isChangePasswordEnabled}
              />
            </View>

            {/* Password Change Form - Collapsible */}
            {isChangePasswordEnabled && (
              <View style={styles.formContainer}>
                {/* Confirm Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email to verify"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={confirmEmail}
                      onChangeText={setConfirmEmail}
                    />
                  </View>
                </View>

                {/* New Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-off-outline" : "eye-outline"
                        }
                        size={20}
                        color="rgba(255,255,255,0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="rgba(255,255,255,0.6)"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm new password"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="rgba(255,255,255,0.6)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdatePassword}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <LinearGradient
                      colors={["#ff4444", "#cc2b2b"]}
                      style={styles.gradientButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.updateButtonText}>
                        Update Password
                      </Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
              style={styles.logoutGradient}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color="#ff4444"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  titleUnderline: {
    width: 30,
    height: 3,
    backgroundColor: "#ff4444",
    marginTop: 5,
    borderRadius: 2,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 25,
    overflow: "hidden",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  sectionTitleContainer: {
    marginBottom: 10,
    paddingLeft: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  formContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  updateButton: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    paddingVertical: 15,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    borderRadius: 15,
  },
  logoutText: {
    color: "#ff4444",
    fontWeight: "600",
    fontSize: 16,
  },
});
