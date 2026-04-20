import React from "react";
import {
  Document,
  Page,
  renderToBuffer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type ReportData = {
  title: string;
  from: string;
  to: string;
  age: number | null;
  stats: Array<{ label: string; value: string }>;
  periods: Array<{ start: string; end: string | null }>;
  symptoms: Array<{ label: string; count: number }>;
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    color: "#111827",
    fontFamily: "Helvetica",
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#374151", marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 8 },
  row: { flexDirection: "row", gap: 12 },
  box: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 12, flex: 1 },
  label: { fontSize: 10, color: "#6B7280" },
  value: { fontSize: 12, fontWeight: 700, marginTop: 2 },
  table: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, overflow: "hidden" },
  th: { flexDirection: "row", backgroundColor: "#F9FAFB", padding: 8, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  td: { flexDirection: "row", padding: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  cell: { flex: 1 },
  tiny: { fontSize: 9, color: "#6B7280", marginTop: 12 },
});

function ReportDoc({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={styles.subtitle}>
          Range: {data.from} to {data.to}
          {data.age !== null ? `  |  Age: ${data.age}` : ""}
        </Text>

        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.row}>
          {data.stats.slice(0, 3).map((s) => (
            <View key={s.label} style={styles.box}>
              <Text style={styles.label}>{s.label}</Text>
              <Text style={styles.value}>{s.value}</Text>
            </View>
          ))}
        </View>
        {data.stats.length > 3 ? (
          <View style={{ marginTop: 10 }}>
            {data.stats.slice(3).map((s) => (
              <Text key={s.label}>
                <Text style={{ fontWeight: 700 }}>{s.label}: </Text>
                {s.value}
              </Text>
            ))}
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Periods</Text>
        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={[styles.cell, { fontWeight: 700 }]}>Start</Text>
            <Text style={[styles.cell, { fontWeight: 700 }]}>End</Text>
          </View>
          {data.periods.length === 0 ? (
            <View style={styles.td}>
              <Text>No periods in this range.</Text>
            </View>
          ) : (
            data.periods.map((p, idx) => (
              <View key={`${p.start}-${idx}`} style={styles.td}>
                <Text style={styles.cell}>{p.start}</Text>
                <Text style={styles.cell}>{p.end ?? "Ongoing / not set"}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Symptoms (frequency)</Text>
        <View style={styles.table}>
          <View style={styles.th}>
            <Text style={[styles.cell, { fontWeight: 700 }]}>Symptom</Text>
            <Text style={[styles.cell, { fontWeight: 700 }]}>Count</Text>
          </View>
          {data.symptoms.length === 0 ? (
            <View style={styles.td}>
              <Text>No symptom logs in this range.</Text>
            </View>
          ) : (
            data.symptoms.map((s) => (
              <View key={s.label} style={styles.td}>
                <Text style={styles.cell}>{s.label}</Text>
                <Text style={styles.cell}>{String(s.count)}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.tiny}>
          Fertility and cycle predictions are estimates only. Not medical advice and not birth control.
        </Text>
      </Page>
    </Document>
  );
}

export async function renderPeriodReportPdfBuffer(data: ReportData) {
  return renderToBuffer(<ReportDoc data={data} />);
}
