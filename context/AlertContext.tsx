import React, { createContext, useContext, useState, ReactNode } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AlertType = "success" | "error" | "info";

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: AlertType;
  onConfirm?: () => void;
  showCancel?: boolean;
  confirmText?: string;
}

interface AlertContextType {
  showAlert: (
    title: string,
    message: string,
    type?: AlertType,
    onConfirm?: () => void,
    showCancel?: boolean,
    confirmText?: string,
  ) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = (
    title: string,
    message: string,
    type: AlertType = "success",
    onConfirm?: () => void,
    showCancel: boolean = false,
    confirmText: string = "OK",
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      showCancel,
      confirmText,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlertModal alertState={alertState} hideAlert={hideAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

// Internal Component for the Modal UI
const CustomAlertModal = ({
  alertState,
  hideAlert,
}: {
  alertState: AlertState;
  hideAlert: () => void;
}) => {
  if (!alertState.visible) return null;

  return (
    <Modal
      visible={alertState.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={hideAlert}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { maxWidth: 320, alignItems: "center" }]}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor:
                alertState.type === "success"
                  ? "rgba(16, 185, 129, 0.2)"
                  : alertState.type === "error"
                    ? "rgba(239, 68, 68, 0.2)"
                    : "rgba(59, 130, 246, 0.2)",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Ionicons
              name={
                alertState.type === "success"
                  ? "checkmark-circle"
                  : alertState.type === "error"
                    ? "close-circle"
                    : "information-circle"
              }
              size={32}
              color={
                alertState.type === "success"
                  ? "#10b981"
                  : alertState.type === "error"
                    ? "#ef4444"
                    : "#3b82f6"
              }
            />
          </View>

          <Text
            style={[
              styles.modalTitle,
              { textAlign: "center", marginBottom: 10 },
            ]}
          >
            {alertState.title}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              textAlign: "center",
              marginBottom: 25,
              lineHeight: 22,
            }}
          >
            {alertState.message}
          </Text>

          <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
            {alertState.showCancel && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                }}
                onPress={hideAlert}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                backgroundColor:
                  alertState.type === "success"
                    ? "#10b981"
                    : alertState.type === "error"
                      ? "#ef4444"
                      : "#3b82f6",
                alignItems: "center",
              }}
              onPress={() => {
                if (alertState.onConfirm) alertState.onConfirm();
                hideAlert();
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {alertState.confirmText || "OK"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#2a2d2a",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
