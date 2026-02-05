# Chemical Equipment Parameter Visualizer(Hybrid Web + Destop App)

A robust monitoring solution featuring a **PyQt5 Desktop Application**, **Django REST API**, and a **React Web Dashboard**. This system provides real-time analytics and safety monitoring for industrial chemical equipment.

### 🌟 Key Features

* **Hybrid Architecture**: Seamless data interaction across Desktop, Web, and Backend platforms.
* **Efficiency Leaderboard**: Dynamic ranking system that calculates an Efficiency Score ($Temperature / Pressure$) to identify the top 5 best-performing units in the plant.
* **Persistent SQLite Integration**: Local desktop history management that tracks and stores the last 5 datasets for instant comparative analysis and persistent logging.
* **Intelligent Safety Logic**: Real-time monitoring with Bold Red Alerts for equipment exceeding critical thresholds (e.g., Temperature > 115°C or Pressure > 7.0 bar).
* **Dynamic Visualizations**: High-fidelity **Matplotlib** charts (Distribution and Proportions) with a professional pure black theme.
* **Automated Industrial Reporting**: One-click PDF generation using jsPDF that creates structured, multi-page reports featuring an Executive Summary, timestamped logs, and "CRITICAL" safety tags.
* **Modern Glassmorphism UI**: High-fidelity interface featuring linear gradients, modular 20px rounded boxes, and micro-interaction hover effects.
* **Real-time Search & Filter**: Integrated glass-style Search Bar allowing users to isolate specific plant units within massive datasets instantly.
---

### 🛠️ Tech Stack

* **Desktop**: Python, PyQt5, Pandas, Matplotlib
* **Backend**: Django, SQLite3, REST Framework
* **Frontend**: React.js, Tailwind CSS

---

## ⚙️ Setup & Installation

### 1. Backend (Django)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```



###  2. Desktop Application (PyQt5)

```bash

 cd desktop-app
 pip install pyqt5 pandas matplotlib
 python3 main.py
```


 ### 3. Web Frontend (React)
 
```bash 
  cd web-frontend
  npm install
  npm start
```

---

### 📋 Usage Instructions

* **Industrial Landing Hub**: Launch the application to access a centralized analysis portal designed for high-performance plant monitoring.your screen.
* **Dataset Processing**: Upload any standard .csv dataset to trigger an automated engine that calculates mean pressure, maximum temperature, and flow distribution.
* **Efficiency Audit**: Access the dynamic Leaderboard to identify which units (🥇, 🥈, 🥉) are operating with the optimal temperature-to-pressure efficiency ratio.
* **Hazard Mitigation**: Monitor the modular dashboard in real-time; equipment exceeding safety parameters is automatically highlighted in Bold Red within the logs.
* **Professional Export**: Utilize the "Export PDF Report" feature to generate a timestamped, audit-ready industrial document for official plant records.

### 🎓 Academic Context

* **Developer**: Rehmat Kaur

* **Institution**: VIT Bhopal University

* **Project Purpose**: Technical Portfolio for FOSSEE Internship Application.

