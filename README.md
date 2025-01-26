
# 🌱 Plant Guardian

Plant Guardian is a smart app designed to help plant lovers keep their plants healthy and thriving. By measuring soil moisture levels, it alerts users when their plants need watering through push notifications, ensuring timely care and optimal plant health.

---

## 📜 Features

- **Real-Time Soil Monitoring:** Continuously measures the soil moisture of your plant.
- **Smart Notifications:** Sends push notifications to your device when it's time to water your plant.
- **User-Friendly Interface:** Displays soil dryness and historical readings in an intuitive app layout.
- **Custom Alerts:** Option to customize notifications based on plant type or personal watering schedules.

---

## 🛠️ Technology Stack

- **Frontend:** React.js for a responsive and interactive user interface.
- **Backend:** Node.js with Express.js for API handling and data processing.
- **Hardware Integration:** Uses microcontrollers (e.g., Arduino or Raspberry Pi) with soil moisture sensors to collect real-time data.
- **Push Notifications:** Firebase Cloud Messaging for instant notifications.
- **Styling:** Tailwind CSS for clean and modern design.

---

## 🚀 Getting Started

### Prerequisites

- Node.js installed (v16 or higher)
- Arduino IDE (if using Arduino-based soil moisture sensors)
- Firebase project for push notifications
- React environment setup

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/plant-guardian.git
   cd plant-guardian
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the app locally:**
   ```bash
   npm start
   ```

---

## 🔧 Hardware Setup

1. **Components Required:**
   - Soil Moisture Sensor
   - Microcontroller (e.g., Arduino, ESP8266)
   - Jumper Wires
   - Power Source

2. **Wiring:**
   Connect the soil moisture sensor to the microcontroller following the diagram in the `/hardware` directory.

3. **Programming:**
   Upload the code from `/firmware` directory to your microcontroller using Arduino IDE.

4. **Data Transmission:**
   Ensure the microcontroller sends soil readings to the backend API.

---

## 📈 Future Improvements

- Integration with smart home ecosystems like Google Home and Alexa.
- Advanced analytics and visualizations for plant health trends.
- Support for multiple plants with individual profiles.
- Plant database with care tips and guidelines.

---

## 🤝 Contributions

Contributions are welcome! If you'd like to help improve Plant Guardian, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request explaining your changes.

---

## 🛡️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 📧 Contact

For any inquiries or feedback, feel free to reach out:

- **Email:** mahimmasrafi04@gmail.com
- **GitHub:** [C.M. Mahim Masrafi](https://github.com/ThisIsMahim)

---

**Keep your plants happy and healthy with Plant Guardian! 🌿**
