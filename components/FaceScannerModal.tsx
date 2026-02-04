import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCameraPermission
} from "react-native-vision-camera";
import FaceDetection from "@react-native-ml-kit/face-detection";

interface Props {
    visible: boolean;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function FaceScannerModal({
    visible,
    onSuccess,
    onCancel,
}: Props) {
    const camera = useRef<Camera>(null);
    const device = useCameraDevice("front");
    const { hasPermission, requestPermission } = useCameraPermission();
    const [detected, setDetected] = useState(false);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        if (visible && !hasPermission) {
            requestPermission();
        }
    }, [visible, hasPermission]);

    // Periodic detection loop
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (visible && hasPermission && !detected && !scanning) {
            interval = setInterval(async () => {
                if (camera.current && !scanning) {
                    try {
                        setScanning(true);
                        const photo = await camera.current.takePhoto({
                            flash: 'off',
                            enableShutterSound: false,
                        });

                        // ML Kit Face Detection
                        const faces = await FaceDetection.detect("file://" + photo.path);

                        if (faces.length > 0) {
                            setDetected(true);
                            clearInterval(interval);
                            setTimeout(() => {
                                onSuccess();
                                setDetected(false);
                            }, 800);
                        }
                    } catch (e) {
                        console.error("Scan error:", e);
                    } finally {
                        setScanning(false);
                    }
                }
            }, 1000); // Scan every 1 second
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [visible, hasPermission, detected, scanning]);

    if (!visible) return null;

    return (
        <Modal visible transparent animationType="fade">
            <View style={styles.container}>
                {!hasPermission && (
                    <View style={styles.center}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.text}>Requesting Camera Permission...</Text>
                    </View>
                )}

                {hasPermission && device && (
                    <Camera
                        ref={camera}
                        style={StyleSheet.absoluteFillObject}
                        device={device}
                        isActive={visible}
                        photo={true}
                    />
                )}

                {!device && hasPermission && (
                    <View style={styles.center}>
                        <Text style={styles.text}>Front Camera Not Found</Text>
                    </View>
                )}

                <View style={styles.overlay}>
                    <View style={styles.instructionBox}>
                        <Text style={styles.text}>
                            {detected ? "Face Detected ✔" : "Hold still - scanning face"}
                        </Text>
                        {scanning && !detected && <ActivityIndicator size="small" color="#fff" style={{ marginTop: 5 }} />}
                    </View>

                    <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    overlay: {
        position: "absolute",
        bottom: 50,
        width: "100%",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    instructionBox: {
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginBottom: 20,
        width: "80%",
    },
    text: { color: "#fff", fontSize: 16, textAlign: "center" },
    cancelBtn: {
        paddingHorizontal: 40,
        paddingVertical: 15,
        backgroundColor: "#ff4444",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
});
