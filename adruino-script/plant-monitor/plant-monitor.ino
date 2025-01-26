#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char* ssid = "Room 503";
const char* password = "22220000";

// WebSocket Server
WebSocketsServer webSocket = WebSocketsServer(81);

// Pin Configuration
const int soilMoisturePin = A0;
const int greenLedPin = 5;  // GPIO5 (D1 on NodeMCU)
const int redLedPin = 4;    // GPIO4 (D2 on NodeMCU)
const int buzzerPin = 0;    // GPIO0 (D3 on NodeMCU)
// System Variables
int threshold = 750;
unsigned long lastAlertTime = 0;
const unsigned long cooldownPeriod = 60000; // 1 minute
static bool wasAboveThreshold = false;

void setup() {
  Serial.begin(115200);
  
  // Initialize Pins
  pinMode(greenLedPin, OUTPUT);
  pinMode(redLedPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  digitalWrite(greenLedPin, LOW);
  digitalWrite(redLedPin, LOW);
  digitalWrite(buzzerPin, LOW);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Start WebSocket Server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 1000) {
    int moisture = analogRead(soilMoisturePin);
    webSocket.broadcastTXT(String(moisture).c_str());  // Send as C-string
    updateLeds(moisture);
    lastSend = millis();
  }
}

void updateLeds(int moisture) {
  if (moisture > threshold) {
    digitalWrite(greenLedPin, LOW);
    digitalWrite(redLedPin, HIGH);
    if (!wasAboveThreshold) {
      lastAlertTime = 0; // Reset cooldown timer
      wasAboveThreshold = true;
    }
    handleBuzzer();
  } else {
    digitalWrite(greenLedPin, HIGH);
    digitalWrite(redLedPin, LOW);
    digitalWrite(buzzerPin, LOW);
    wasAboveThreshold=false;
  }
}

void handleBuzzer() {
  if (millis() - lastAlertTime > cooldownPeriod) {
 // Beep 3 times quickly
    for (int i = 0; i < 3; i++) {
      digitalWrite(buzzerPin, HIGH);
      delay(100); // Beep for 100ms
      digitalWrite(buzzerPin, LOW);
      delay(100); // Pause for 100ms
    }
    lastAlertTime = millis();
  }
}

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_TEXT: {
      DynamicJsonDocument doc(128);
      deserializeJson(doc, payload);
      
      if (doc["type"] == "threshold") {
        threshold = doc["value"];
        Serial.print("Threshold updated to: ");
        Serial.println(threshold);
      }
      else if (doc["type"] == "buzzer") {
        digitalWrite(buzzerPin, doc["state"] ? HIGH : LOW);
      }
      break;
    }
    
     switch(type) {
    case WStype_CONNECTED:
      Serial.printf("[%u] Connected from %s\n", 
        num, webSocket.remoteIP(num).toString().c_str());
      break;
    case WStype_DISCONNECTED:
      Serial.printf("[%u] Disconnected\n", num);
      break;
  }
  }
}