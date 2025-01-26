import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [moisture, setMoisture] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [threshold, setThreshold] = useState(750);
  const [ipAddress, setIpAddress] = useState('192.168.0.111');
  const [ws, setWs] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const connectWebSocket = useCallback(() => {
     // Force close existing connection
  if (ws) {
    ws.close();
    setWs(null);
  }

  const newWs = new WebSocket(`ws://${ipAddress}:81`, {
    headers: {
      'User-Agent': 'PlantGuardian/1.0'
    }
  });

  // Android-specific connection timeout
  const timeout = setTimeout(() => {
    if (!connected) {
      Alert.alert(
        "Connection Failed",
        `Couldn't reach ${ipAddress}:81\n\nCheck:\n• Same WiFi network\n• ESP is powered\n• No firewall restrictions`
      );
      newWs.close();
    }
  }, 8000);

  newWs.onopen = () => {
    clearTimeout(timeout);
    setConnected(true);
    setRetryCount(0);
    newWs.send(JSON.stringify({ type: 'threshold', value: threshold }));
  };
    newWs.onmessage = (event) => {
      const data = parseInt(event.data, 10);
      if (!isNaN(data) && isFinite(data)) {
        setMoisture(data);
        setHistory(prev => [...prev.slice(-59), data]);
      }
    };

    newWs.onerror = (error) => {
      console.error('WebSocket error:', error.message);
      setConnected(false);
    };

    newWs.onclose = () => {
      setConnected(false);
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          connectWebSocket();
        }, 2000);
      }
    };

    setWs(newWs);
  }, [ipAddress, threshold, retryCount]);

  useEffect(() => {
    connectWebSocket();
    return () => ws?.close();
  }, [connectWebSocket]);

  const sendCommand = (command) => {
    if (ws && connected) {
      ws.send(JSON.stringify(command));
    }
  };

  // Process chart data with validation
  const chartData = history
    .map(value => Number(value))
    .filter(value => !isNaN(value) && isFinite(value));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.title}>PlantGuardian</Text>
        <View style={styles.connectionStatus(connected)}>
          <Ionicons 
            name={connected ? 'wifi' : 'wifi-off'} 
            size={20} 
            color={connected ? '#4ECDC4' : '#FF6B6B'} 
          />
          <Text style={styles.statusText}>
            {connected ? 'Connected' : `Connecting... (${retryCount}/3)`}
          </Text>
        </View>
      </View>

      <BlurView intensity={30} style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="leaf" size={24} color="#4ECDC4" />
          <Text style={styles.cardTitle}>Live Data</Text>
        </View>

        <View style={styles.dataRow}>
          <Text style={styles.moistureValue}>{moisture ?? '--'}</Text>
          <View style={styles.statusIndicator(moisture > threshold)}>
            <Text style={styles.statusText}>
              {moisture > threshold ? 'NEEDS WATER' : 'HEALTHY'}
            </Text>
          </View>
        </View>

        {chartData.length > 0 ? (
          <LineChart
            data={{
              labels: Array(chartData.length).fill(''),
              datasets: [{ 
                data: chartData,
                strokeWidth: 2
              }]
            }}
            width={300}
            height={150}
            withVerticalLines={false}
            withHorizontalLines={false}
            chartConfig={{
              backgroundColor: 'transparent',
              backgroundGradientFrom: 'rgba(255,255,255,0.1)',
              backgroundGradientTo: 'rgba(255,255,255,0.05)',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(126, 215, 245, ${opacity})`,
              propsForDots: { r: "3" }
            }}
            bezier
            style={styles.chart}
          />
        ) : (
          <View style={styles.chartPlaceholder}>
            <ActivityIndicator size="small" color="#7ED7F5" />
            <Text style={styles.placeholderText}>Waiting for sensor data...</Text>
          </View>
        )}
      </BlurView>

      <BlurView intensity={30} style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="settings" size={24} color="#BB86FC" />
          <Text style={styles.cardTitle}>Settings</Text>
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setSettingsVisible(true)}
        >
          <Ionicons name="server" size={20} color="#F5F5F5" />
          <Text style={styles.settingText}>Device IP: {ipAddress}</Text>
          <Ionicons name="chevron-forward" size={20} color="#F5F5F5" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => sendCommand({ type: 'buzzer', state: true })}
        >
          <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
          <Text style={styles.settingText}>Test Buzzer</Text>
        </TouchableOpacity>
      </BlurView>

      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsVisible(false)}
      >
        <BlurView intensity={50} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Device Settings</Text>
            
            <Text style={styles.inputLabel}>ESP32 IP Address:</Text>
            <TextInput
              style={styles.input}
              value={ipAddress}
              onChangeText={setIpAddress}
              placeholder="192.168.x.x"
              keyboardType="numeric"
              placeholderTextColor="#666"
            />

            <Text style={styles.inputLabel}>Moisture Threshold:</Text>
            <TextInput
              style={styles.input}
              value={String(threshold)}
              onChangeText={(text) => {
                const num = Number(text);
                if (!isNaN(num)) setThreshold(num);
              }}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => {
                setSettingsVisible(false);
                connectWebSocket();
              }}
            >
              <Text style={styles.saveButtonText}>Save & Reconnect</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F5F5',
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  moistureValue: {
    fontSize: 48,
    fontWeight: '300',
    color: '#7ED7F5',
  },
  statusIndicator: (alert) => ({
    backgroundColor: alert ? 'rgba(255,107,107,0.2)' : 'rgba(78,205,196,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: alert ? '#FF6B6B' : '#4ECDC4',
  }),
  chartPlaceholder: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15
  },
  placeholderText: {
    color: '#7ED7F5',
    fontSize: 14,
    marginTop: 10
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingText: {
    color: '#F5F5F5',
    marginLeft: 10,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'rgba(40,40,40,0.9)',
    padding: 25,
    borderRadius: 25,
    width: '80%',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 15,
    color: '#F5F5F5',
    marginBottom: 20,
    fontSize: 16,
  },
  inputLabel: {
    color: '#F5F5F5',
    marginBottom: 8,
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#BB86FC',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#121212',
    fontWeight: '600',
    fontSize: 16,
  },
  connectionStatus: (connected) => ({
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: connected ? 'rgba(78,205,196,0.2)' : 'rgba(255,107,107,0.2)',
    borderWidth: 1,
    borderColor: connected ? '#4ECDC4' : '#FF6B6B',
  }),
});