import { Image } from "expo-image";
import {
    StyleSheet,
    ActivityIndicator,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";
import { useState, useEffect } from "react";
import api from "../../services/api";

interface AttendanceRecord {
    id: number;
    user_id: number;
    in_time: string;
    out_time: string | null;
    date: string;
    clock_in: string;
    clock_in_ip_address: string;
    clock_out: string | null;
    clock_out_ip_address: string | null;
    time_late: string;
    early_leaving: string;
    overtime: string;
    total_work: string;
    attendance_status: string;
    created_at: string;
    updated_at: string;
}

export default function AttendanceScreen() {
    const { user, isLoading } = useAuth();
    const { showAlert } = useAlert();
    const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAttendances();
            fetchTodayAttendance();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchAttendances = async () => {
        try {
            const response = await api.get("/attendances");
            setAttendances(response.data.attendances || []);
        } catch (error) {
            console.error("Error fetching attendances:", error);
            setAttendances([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayAttendance = async () => {
        try {
            const response = await api.get("/attendance/today");
            setTodayAttendance(response.data.attendance);
        } catch (error) {
            console.error("Error fetching today's attendance:", error);
        }
    };

    const handleClockIn = () => {
        setShowModal(true);
    };

    const handleSaveAttendance = async () => {
        setActionLoading(true);
        try {
            const response = await api.post("/attendance/check-in");
            setTodayAttendance(response.data.attendance);
            fetchAttendances();
            setShowModal(false);
            showAlert("Success", "Clocked in successfully", "success");
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to clock in";
            const errors = error.response?.data?.errors;
            let errorMessage = message;
            if (errors) {
                errorMessage += "\n" + Object.values(errors).flat().join("\n");
            }
            showAlert("Error", errorMessage, "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClockOut = async () => {
        showAlert(
            "Confirm Clock Out",
            "Are you sure you want to end your session?",
            "info",
            async () => {
                setActionLoading(true);
                try {
                    const response = await api.post("/attendance/check-out");
                    setTodayAttendance(response.data.attendance);
                    fetchAttendances();
                    showAlert("Success", "Clocked out successfully", "success");
                } catch (error: any) {
                    const message = error.response?.data?.message || "Failed to clock out";
                    const errors = error.response?.data?.errors;
                    let errorMessage = message;
                    if (errors) {
                        errorMessage += "\n" + Object.values(errors).flat().join("\n");
                    }
                    showAlert("Error", errorMessage, "error");
                } finally {
                    setActionLoading(false);
                }
            },
            true, // Show Cancel
            "Clock Out"
        );
    };

    // Format time from HH:MM:SS to readable format
    const formatTimeString = (timeString: string) => {
        if (!timeString) return "N/A";

        // If it's already in HH:MM:SS format
        const timeParts = timeString.split(':');
        if (timeParts.length === 3) {
            const hours = parseInt(timeParts[0]);
            const minutes = timeParts[1];
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            return `${displayHours}:${minutes} ${period}`;
        }

        return timeString;
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const calculateDuration = (inTime: string, outTime: string | null) => {
        if (!outTime) return "In Progress";

        const start = new Date(inTime);
        const end = new Date(outTime);
        const diff = end.getTime() - start.getTime();

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    if (isLoading || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff4444" />
            </View>
        );
    }

    if (!user) {
        return (
            <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={80} color="rgba(255,255,255,0.3)" />
                        <Text style={styles.emptyText}>Please login to view attendance</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Attendance</Text>
                        <View style={styles.titleUnderline} />
                    </View>

                    {/* Manual Attendance Control */}
                    <View style={styles.actionSection}>
                        {!todayAttendance || todayAttendance.out_time ? (
                            <TouchableOpacity
                                style={styles.clockBtn}
                                onPress={handleClockIn}
                                activeOpacity={0.8}
                                disabled={actionLoading}
                            >
                                <LinearGradient
                                    colors={["#10b981", "#059669"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionBtnGradient}
                                >
                                    <Ionicons name="log-in" size={24} color="#fff" />
                                    <Text style={styles.actionBtnText}>Clock In</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.clockBtn}
                                onPress={handleClockOut}
                                activeOpacity={0.8}
                                disabled={actionLoading}
                            >
                                <LinearGradient
                                    colors={["#ff4444", "#cc2b2b"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.actionBtnGradient}
                                >
                                    <Ionicons name="log-out" size={24} color="#fff" />
                                    <Text style={styles.actionBtnText}>Clock Out</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Today's Status Card */}
                    {todayAttendance && (
                        <View style={styles.todayCard}>
                            <LinearGradient
                                colors={["rgba(68, 185, 129, 0.15)", "rgba(68, 185, 129, 0.05)"]}
                                style={styles.todayGradient}
                            >
                                <View style={styles.todayHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.statusRow}>
                                            <Ionicons name="calendar" size={24} color="#10b981" />
                                            <Text style={styles.todayTitle}>Today's Status</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, styles.completedBadge]}>
                                        <Text style={styles.statusText}>{todayAttendance.attendance_status || "Present"}</Text>
                                    </View>
                                </View>

                                <View style={styles.todayContent}>
                                    <View style={styles.timeRow}>
                                        <View style={styles.timeItem}>
                                            <Ionicons name="enter" size={20} color="#10b981" />
                                            <Text style={styles.timeLabel}>In Time</Text>
                                            <Text style={styles.timeValue}>
                                                {formatTimeString(todayAttendance.clock_in)}
                                            </Text>
                                            <Text style={styles.ipText}>{todayAttendance.clock_in_ip_address}</Text>
                                        </View>

                                        <View style={styles.timeDivider} />

                                        <View style={styles.timeItem}>
                                            <Ionicons
                                                name="exit"
                                                size={20}
                                                color={todayAttendance.out_time ? "#ff4444" : "rgba(255,255,255,0.3)"}
                                            />
                                            <Text style={styles.timeLabel}>Out Time</Text>
                                            <Text style={styles.timeValue}>
                                                {todayAttendance.clock_out ? formatTimeString(todayAttendance.clock_out) : "Active"}
                                            </Text>
                                            <Text style={styles.ipText}>{todayAttendance.clock_out_ip_address || ""}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.statsGrid}>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statLabel}>Late</Text>
                                            <Text style={[styles.statValue, { color: todayAttendance.time_late !== '00:00:00' ? '#ff4444' : '#fff' }]}>
                                                {todayAttendance.time_late || '00:00:00'}
                                            </Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statLabel}>Early Exit</Text>
                                            <Text style={[styles.statValue, { color: todayAttendance.early_leaving !== '00:00:00' ? '#ff4444' : '#fff' }]}>
                                                {todayAttendance.early_leaving || '00:00:00'}
                                            </Text>
                                        </View>
                                        <View style={styles.statBox}>
                                            <Text style={styles.statLabel}>Overtime</Text>
                                            <Text style={[styles.statValue, { color: todayAttendance.overtime !== '00:00:00' ? '#10b981' : '#fff' }]}>
                                                {todayAttendance.overtime || '00:00:00'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[
                                        styles.durationBadge,
                                        { backgroundColor: todayAttendance.out_time ? "#10b981" : "#ff4444" }
                                    ]}>
                                        <Ionicons name="time" size={16} color="#fff" />
                                        <Text style={styles.durationText}>
                                            Total Work: {todayAttendance.total_work || calculateDuration(todayAttendance.in_time, todayAttendance.out_time)}
                                        </Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </View>
                    )}

                    {/* Clock In Modal */}
                    <Modal
                        visible={showModal}
                        transparent={true}
                        animationType="fade"
                        onRequestClose={() => setShowModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Confirm Attendance</Text>
                                    <TouchableOpacity onPress={() => setShowModal(false)}>
                                        <Ionicons name="close" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalBody}>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="time-outline" size={24} color="#10b981" />
                                        <View>
                                            <Text style={styles.infoLabel}>Current Time</Text>
                                            <Text style={styles.infoValue}>{new Date().toLocaleTimeString()}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Ionicons name="calendar-outline" size={24} color="#10b981" />
                                        <View>
                                            <Text style={styles.infoLabel}>Date</Text>
                                            <Text style={styles.infoValue}>{new Date().toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.modalFooter}>
                                    <TouchableOpacity
                                        style={styles.cancelBtn}
                                        onPress={() => setShowModal(false)}
                                    >
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.saveBtn}
                                        onPress={handleSaveAttendance}
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <Text style={styles.saveBtnText}>Save</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Attendance History */}
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Attendance History</Text>

                        {attendances.length === 0 ? (
                            <View style={styles.emptyHistory}>
                                <Ionicons name="document-outline" size={48} color="rgba(255,255,255,0.3)" />
                                <Text style={styles.emptyHistoryText}>No attendance records yet</Text>
                            </View>
                        ) : (
                            attendances.map((record) => (
                                <View key={record.id} style={styles.recordCard}>
                                    <View style={styles.recordHeader}>
                                        <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                                        <View style={[
                                            styles.statusBadge,
                                            record.out_time ? styles.completedBadge : styles.activeBadge
                                        ]}>
                                            <Text style={styles.statusText}>
                                                {record.attendance_status || (record.out_time ? "Completed" : "Active")}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.recordContent}>
                                        <View style={styles.recordMainRow}>
                                            <View style={styles.recordItem}>
                                                <View style={styles.row}>
                                                    <Ionicons name="enter" size={14} color="#10b981" />
                                                    <Text style={styles.recordLabel}>In</Text>
                                                </View>
                                                <Text style={styles.recordValue}>{formatTimeString(record.clock_in)}</Text>
                                            </View>
                                            <View style={styles.recordItem}>
                                                <View style={styles.row}>
                                                    <Ionicons name="exit" size={14} color="#ff4444" />
                                                    <Text style={styles.recordLabel}>Out</Text>
                                                </View>
                                                <Text style={styles.recordValue}>
                                                    {record.clock_out ? formatTimeString(record.clock_out) : "N/A"}
                                                </Text>
                                            </View>
                                            <View style={styles.recordItem}>
                                                <View style={styles.row}>
                                                    <Ionicons name="timer" size={14} color="#ff4444" />
                                                    <Text style={styles.recordLabel}>Work</Text>
                                                </View>
                                                <Text style={styles.recordValue}>{record.total_work || calculateDuration(record.in_time, record.out_time)}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.divider} />

                                        <View style={styles.recordStatsRow}>
                                            <View style={styles.statMini}>
                                                <Text style={styles.statMiniLabel}>Late:</Text>
                                                <Text style={[styles.statMiniValue, record.time_late !== '00:00:00' && { color: '#ff4444' }]}>{record.time_late || '0'}</Text>
                                            </View>
                                            <View style={styles.statMini}>
                                                <Text style={styles.statMiniLabel}>Early:</Text>
                                                <Text style={[styles.statMiniValue, record.early_leaving !== '00:00:00' && { color: '#ff4444' }]}>{record.early_leaving || '0'}</Text>
                                            </View>
                                            <View style={styles.statMini}>
                                                <Text style={styles.statMiniLabel}>OT:</Text>
                                                <Text style={[styles.statMiniValue, record.overtime !== '00:00:00' && { color: '#10b981' }]}>{record.overtime || '0'}</Text>
                                            </View>
                                        </View>

                                        {record.clock_in_ip_address && (
                                            <View style={styles.ipRow}>
                                                <Ionicons name="location" size={12} color="rgba(255,255,255,0.4)" />
                                                <Text style={styles.ipText}>IP: {record.clock_in_ip_address}</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyText: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 16,
        marginTop: 20,
        textAlign: "center",
    },

    header: {
        marginBottom: 20,
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
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

    todayCard: {
        marginHorizontal: 25,
        marginBottom: 25,
        borderRadius: 20,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(68, 185, 129, 0.3)",
    },
    todayGradient: {
        padding: 20,
    },
    todayHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        gap: 10,
    },
    todayTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    todayContent: {
        gap: 15,
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },
    timeItem: {
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    timeDivider: {
        width: 1,
        height: 60,
        backgroundColor: "rgba(255,255,255,0.1)",
    },
    timeLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
        fontWeight: "500",
    },
    timeValue: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    durationBadge: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ff4444",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 15,
        gap: 8,
    },
    durationText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    historySection: {
        paddingHorizontal: 25,
        paddingBottom: 30,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 15,
    },
    emptyHistory: {
        alignItems: "center",
        paddingVertical: 40,
    },
    emptyHistoryText: {
        color: "rgba(255,255,255,0.5)",
        fontSize: 14,
        marginTop: 10,
    },

    recordCard: {
        backgroundColor: "rgba(255, 255, 255, 0.08)",
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.1)",
    },
    recordDate: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    completedBadge: {
        backgroundColor: "rgba(16, 185, 129, 0.2)",
    },
    activeBadge: {
        backgroundColor: "rgba(255, 68, 68, 0.2)",
    },
    statusText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "600",
    },
    recordContent: {
        gap: 8,
    },
    recordRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    recordLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 14,
        fontWeight: "500",
        width: 70,
    },
    recordValue: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },

    actionSection: {
        paddingHorizontal: 25,
        marginBottom: 25,
    },
    clockBtn: {
        width: "100%",
        height: 60,
        borderRadius: 18,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    actionBtnGradient: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
    },
    actionBtnText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },

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
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#fff",
    },
    modalBody: {
        marginBottom: 30,
        gap: 15,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 15,
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 15,
        borderRadius: 15,
    },
    infoLabel: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 12,
    },
    infoValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
    },
    cancelBtn: {
        flex: 1,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
    },
    cancelBtnText: {
        color: "#fff",
        fontWeight: "600",
    },
    saveBtn: {
        flex: 2,
        height: 50,
        backgroundColor: "#10b981",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 15,
    },
    saveBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    ipText: {
        fontSize: 10,
        color: "rgba(255,255,255,0.4)",
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 15,
        borderRadius: 15,
    },
    statBox: {
        alignItems: "center",
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: "rgba(255,255,255,0.5)",
        marginBottom: 4,
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#fff",
    },
    recordMainRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    recordItem: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginBottom: 2,
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginVertical: 10,
    },
    recordStatsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    statMini: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    statMiniLabel: {
        fontSize: 12,
        color: "rgba(255,255,255,0.4)",
    },
    statMiniValue: {
        fontSize: 12,
        fontWeight: "600",
        color: "#fff",
    },
    ipRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
});