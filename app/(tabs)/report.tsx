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
import { useState } from "react";
import api from "../../services/api";
import { useRouter } from "expo-router";

interface AttendanceRecord {
  id: number;
  user_id: number;
  in_time: string | null;
  out_time: string | null;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  clock_in_ip_address: string | null;
  clock_out_ip_address: string | null;
  time_late: string | null;
  early_leaving: string | null;
  overtime: string | null;
  total_work: string | null;
  attendance_status: string | null;
  status?: string; // API might return 'status' instead of 'attendance_status' in some contexts
}

export default function AttendanceReportScreen() {
  const router = useRouter();
  // ... (state declarations remain same)
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState({
    present: 0,
    holidays: 0,
    absent: 0,
  });

  // ... (rest of state and functions)

  // Default to empty or current month, but we want user to select explicitly?
  // User request: "only after selecting this date range should the attendance records be displayed"
  // So let's start with empty state and maybe pre-fill dates but NOT fetch.
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  });

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<"start" | "end" | null>(
    null,
  );

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get("/attendances", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      const records = response.data.attendances || [];
      setAttendances(records);

      const presentCount = records.filter((r: AttendanceRecord) =>
        r.attendance_status === "present" || r.status === "Present"
      ).length;

      setSummary({
        present: presentCount,
        holidays: 0,
        absent: 0,
      });
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching report:", error);
      Alert.alert("Error", "Failed to generate report");
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "--:--";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Date Picker Logic (Reused)
  const DatePickerModal = () => {
    if (!showDatePicker) return null;

    const isStart = showDatePicker === "start";
    const currentDate = new Date(isStart ? startDate : endDate);
    const [tempDate, setTempDate] = useState(currentDate);

    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const changeMonth = (delta: number) => {
      setTempDate(new Date(year, month + delta, 1));
    };

    return (
      <Modal
        transparent
        animationType="fade"
        visible={!!showDatePicker}
        onRequestClose={() => setShowDatePicker(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.datePickerContent}>
            <View style={styles.datePickerHeader}>
              <TouchableOpacity onPress={() => changeMonth(-1)}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.datePickerTitle}>
                {tempDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)}>
                <Ionicons name="chevron-forward" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.daysGrid}>
              {days.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayCell,
                    tempDate.getDate() === day && styles.activeDayCell,
                  ]}
                  onPress={() => {
                    const newDate = new Date(year, month, day);
                    const offset = newDate.getTimezoneOffset();
                    const adjustedDate = new Date(
                      newDate.getTime() - offset * 60 * 1000,
                    );

                    const dateStr = adjustedDate.toISOString().split("T")[0];

                    if (isStart) setStartDate(dateStr);
                    else setEndDate(dateStr);
                    setShowDatePicker(null);
                  }}
                >
                  <Text
                    style={[
                      styles.dayText,
                      tempDate.getDate() === day && styles.activeDayText,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.closePickerBtn}
              onPress={() => setShowDatePicker(null)}
            >
              <Text style={styles.closePickerText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <LinearGradient colors={["#444743", "#1a1a1a"]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Attendance Report</Text>
            <View style={styles.titleUnderline} />
          </View>

          {/* Date Selection Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Select Date Range</Text>

            <View style={styles.dateInputsContainer}>
              <View style={styles.dateInputWrapper}>
                <Text style={styles.inputLabel}>From</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker("start")}
                >
                  <Ionicons name="calendar-outline" size={20} color="#10b981" />
                  <Text style={styles.dateValue}>{startDate}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.arrowContainer}>
                <Ionicons
                  name="arrow-down"
                  size={20}
                  color="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.dateInputWrapper}>
                <Text style={styles.inputLabel}>To</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowDatePicker("end")}
                >
                  <Ionicons name="calendar-outline" size={20} color="#ff4444" />
                  <Text style={styles.dateValue}>{endDate}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.generateBtn}
              onPress={fetchReport}
              disabled={loading}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#fff" />
                    <Text style={styles.btnText}>Get Report</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Results Section */}
          {hasSearched && (
            <>
              {/* Summary Cards */}
              <View style={styles.summarySection}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCount}>{summary.present}</Text>
                  <Text style={[styles.summaryLabel, { color: "#10b981" }]}>
                    Present
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCount}>{summary.holidays}</Text>
                  <Text style={[styles.summaryLabel, { color: "#fbbf24" }]}>
                    Holidays
                  </Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryCount}>{summary.absent}</Text>
                  <Text style={[styles.summaryLabel, { color: "#ef4444" }]}>
                    Absent
                  </Text>
                </View>
              </View>

              {/* Table List */}
              <View style={styles.tableCard}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View>
                    {/* Table Header */}
                    <View style={styles.tableHeaderRow}>
                      <Text style={[styles.columnHeader, { width: 80 }]}>Date</Text>
                      <Text style={[styles.columnHeader, { width: 80 }]}>Status</Text>
                      <Text style={[styles.columnHeader, { width: 80 }]}>Clock In</Text>
                      <Text style={[styles.columnHeader, { width: 80 }]}>Clock Out</Text>
                      <Text style={[styles.columnHeader, { width: 70 }]}>Late</Text>
                      <Text style={[styles.columnHeader, { width: 70 }]}>Early</Text>
                      <Text style={[styles.columnHeader, { width: 70 }]}>OT</Text>
                      <Text style={[styles.columnHeader, { width: 80 }]}>Work</Text>
                    </View>

                    {attendances.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>No records found</Text>
                      </View>
                    ) : (
                      attendances.map((record, index) => (
                        <View key={index} style={styles.tableRow}>
                          <View style={{ width: 80 }}>
                            <Text style={styles.rowText}>
                              {new Date(record.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Text>
                            <Text style={styles.rowSubText}>
                              {new Date(record.date).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </Text>
                          </View>

                          <View style={{ width: 80 }}>
                            <View style={[
                              styles.miniStatusBadge,
                              record.status === "Present" || record.attendance_status === "present"
                                ? styles.completedBadge
                                : record.status === "Holiday"
                                  ? styles.holidayBadge
                                  : styles.absentBadge
                            ]}>
                              <Text style={styles.miniStatusText}>
                                {record.attendance_status || record.status || "Absent"}
                              </Text>
                            </View>
                          </View>

                          <Text style={[styles.rowText, { width: 80 }]}>
                            {record.clock_in || "--:--"}
                          </Text>
                          <Text style={[styles.rowText, { width: 80 }]}>
                            {record.clock_out || "--:--"}
                          </Text>
                          <Text style={[styles.rowText, { width: 70, color: record.time_late !== '00:00:00' ? '#ff4444' : '#fff' }]}>
                            {record.time_late || "00:00"}
                          </Text>
                          <Text style={[styles.rowText, { width: 70, color: record.early_leaving !== '00:00:00' ? '#ff4444' : '#fff' }]}>
                            {record.early_leaving || "00:00"}
                          </Text>
                          <Text style={[styles.rowText, { width: 70, color: record.overtime !== '00:00:00' ? '#10b981' : '#fff' }]}>
                            {record.overtime || "00:00"}
                          </Text>
                          <Text style={[styles.rowText, { width: 80, fontWeight: 'bold' }]}>
                            {record.total_work || "--:--"}
                          </Text>
                        </View>
                      ))
                    )}
                  </View>
                </ScrollView>
              </View>
            </>
          )}

          {!hasSearched && (
            <View style={styles.initialState}>
              <Ionicons
                name="stats-chart-outline"
                size={64}
                color="rgba(255,255,255,0.2)"
              />
              <Text style={styles.initialText}>
                Select a date range to view your attendance history
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <DatePickerModal />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1, padding: 20 },

  header: {
    marginBottom: 20,
    marginTop: 10,
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

  card: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    marginBottom: 25,
    overflow: "hidden",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 20,
  },
  dateInputsContainer: {
    flexDirection: "column",
    gap: 15,
    marginBottom: 25,
  },
  dateInputWrapper: {
    width: "100%",
    gap: 8,
  },
  inputLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginLeft: 4,
    marginBottom: 4,
    fontWeight: "500",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    gap: 10,
  },
  dateValue: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 15,
  },
  arrowContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },

  generateBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  btnGradient: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Results Styles matching Attendance Screen
  summarySection: {
    flexDirection: "row",
    marginBottom: 25,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  tableCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 20,
    padding: 10,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  tableHeaderRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 10,
  },
  columnHeader: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  rowText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
  },
  rowSubText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "center",
  },
  miniStatusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  completedBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  holidayBadge: {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
  },
  absentBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
  },
  initialState: {
    alignItems: "center",
    marginTop: 40,
    gap: 20,
  },
  initialText: {
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    width: "70%",
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  datePickerContent: {
    width: "90%",
    backgroundColor: "#2a2d2a",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    maxHeight: "80%",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  datePickerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  activeDayCell: {
    backgroundColor: "#10b981",
  },
  dayText: {
    color: "#fff",
    fontSize: 14,
  },
  activeDayText: {
    fontWeight: "bold",
  },
  closePickerBtn: {
    marginTop: 20,
    alignItems: "center",
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
  },
  closePickerText: {
    color: "#fff",
    fontWeight: "600",
  },
});
