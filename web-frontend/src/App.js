import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [chartKey, setChartKey] = useState(0); 
  const reportRef = useRef(); 

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    
    setLoading(true);
    setUploadProgress(0);
    setStats(null); 
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/upload/', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setTimeout(() => {
        setStats(res.data);
        setChartKey(prev => prev + 1); 
        setLoading(false);
      }, 500);

    } catch (err) {
      alert("Upload failed. Ensure the Django server is running.");
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const date = new Date().toLocaleString();

    doc.setFillColor(26, 42, 108); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Chemical Equipment Analysis Report", 15, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${date}`, 15, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 15, 55);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const summaryData = [
      ["Total Units Analyzed:", stats.total_count],
      ["Average Plant Pressure:", `${stats.avg_pressure} bar`],
      ["Maximum Temperature:", `${stats.max_temp} °C`],
      ["Average Flow Rate:", `${stats.avg_flowrate} m³/h`]
    ];

    let yPos = 65;
    summaryData.forEach(([label, value]) => {
      doc.text(label, 15, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(String(value), 80, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 8;
    });

    doc.line(15, yPos + 5, pageWidth - 15, yPos + 5);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Detailed Equipment Log", 15, yPos + 15);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos + 20, pageWidth - 30, 8, 'F');
    doc.setFontSize(10);
    doc.text("Equipment Name", 20, yPos + 25);
    doc.text("Temperature Status", 140, yPos + 25);

    yPos += 35;
    doc.setFont("helvetica", "normal");
    
    stats.raw_data.forEach((item, index) => {
      if (yPos > 275) { 
        doc.addPage(); 
        yPos = 20; 
      }
      doc.text(item['Equipment Name'] || "Unknown", 20, yPos);
      const temp = item['Temperature'];
      if (temp > 115) {
        doc.setTextColor(200, 0, 0); 
        doc.text(`${temp} °C (CRITICAL)`, 140, yPos);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text(`${temp} °C (NORMAL)`, 140, yPos);
      }
      yPos += 8;
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Confidential Industrial Analysis Report", pageWidth / 2, 288, { align: "center" });
    doc.save(`Analysis_Report_${stats.history[0]?.filename || "Unit"}.pdf`);
  };

  const performanceData = stats?.raw_data?.map(item => ({
    ...item,
    score: parseFloat((item['Temperature'] / item['Pressure']).toFixed(2)),
  })) || [];

  const filteredData = stats?.raw_data?.filter(item => 
    item['Equipment Name'].toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!stats && !loading) {
    return (
      <div style={heroContainerStyle}>
        <div style={heroCardStyle}>
          <h1 style={{ fontSize: '36px', fontWeight: '900', color: '#1a2a6c', marginBottom: '15px' }}>
            Chemical Equipment<br/>Parameter Visualizer
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '35px', lineHeight: '1.6' }}>
            Harness industrial-grade analytics to monitor plant pressure, temperature, and flow metrics in real-time.
          </p>
          <div style={uploadBoxStyle}>
            <input 
              type="file" 
              id="file-upload"
              onChange={(e) => setFile(e.target.files[0])} 
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" style={fileLabelStyle}>
              {file ? `📄 ${file.name}` : "📁 Choose CSV Dataset"}
            </label>
            <button onClick={handleUpload} style={heroBtnStyle}>
              Run Analysis →
            </button>
          </div>
          <div style={{ marginTop: '30px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Supports .CSV datasets • Secure local processing
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1a2a6c', padding: '15px 25px', borderRadius: '12px', color: 'white', marginBottom: '25px' }}>
          <h3 style={{ margin: 0 }}>Chemical Equipment Visualizer</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={downloadPDF} style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              📄 Export PDF Report
            </button>
            <button onClick={() => setStats(null)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '5px 15px', borderRadius: '6px', cursor: 'pointer' }}>
              Analyze New File
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ marginBottom: '25px' }}>
            <div style={{ color: '#1a2a6c', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
              Processing {file?.name}... {uploadProgress}%
            </div>
            <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, backgroundColor: '#1a2a6c', height: '100%', transition: 'width 0.4s ease-in-out' }}></div>
            </div>
          </div>
        )}

        {stats && (
          <div key={chartKey}> 
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '25px' }}>
              <Card title="Total Units" value={stats.total_count} icon="🏭" color="#1a2a6c" />
              <Card title="Avg Pressure" value={`${stats.avg_pressure} bar`} icon="🌡️" color="#b21f1f" />
              <Card title="Max Temp" value={`${stats.max_temp} °C`} icon="🔥" color="#006400" />
              <Card title="Avg Flow" value={`${stats.avg_flowrate} m³/h`} icon="💧" color="#b8860b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px', marginBottom: '25px' }}>
              <div style={{ ...panelStyle, borderTop: '5px solid #1a2a6c' }}>
                <Bar 
                  data={{ 
                    labels: Object.keys(stats.type_distribution), 
                    datasets: [{ 
                      label: 'Units', 
                      data: Object.values(stats.type_distribution), 
                      backgroundColor: ['#1a2a6c', '#b21f1f', '#006400', '#b8860b', '#4b0082', '#2f4f4f'],
                      borderRadius: 5 
                    }] 
                  }} 
                  options={{
                    animations: {
                        y: {
                            duration: 2000,
                            easing: 'easeOutQuart',
                            from: (ctx) => (ctx.type === 'data' ? ctx.chart.scales.y.getPixelForValue(0) : undefined)
                        }
                    },
                    scales: { y: { beginAtZero: true, grid: { display: false } } },
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }}
                  height={300}
                />
              </div>
              <div style={{ ...panelStyle, borderTop: '5px solid #b21f1f' }}>
                <Pie 
                  data={{ 
                    labels: Object.keys(stats.type_distribution), 
                    datasets: [{ 
                      data: Object.values(stats.type_distribution), 
                      backgroundColor: ['#1a2a6c', '#b21f1f', '#006400', '#b8860b'] 
                    }] 
                  }} 
                  options={{ animation: { animateRotate: true, animateScale: true, duration: 2000 } }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '20px' }}>
              <div style={{ ...panelStyle, borderTop: '5px solid #006400' }}>
                <h3 style={{ marginTop: 0 }}>Detailed Equipment Log</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}><th>NAME</th><th>TEMP</th></tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f9f9f9' }}>
                        <td style={{ padding: '10px' }}>{row['Equipment Name']}</td>
                        <td style={{ color: row['Temperature'] > 115 ? 'red' : 'black' }}>{row['Temperature']} °C</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ ...panelStyle, borderTop: '5px solid #fdbb2d' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>🏆 Leaderboard</h4>
                {performanceData.sort((a, b) => a.score - b.score).slice(0, 5).map((unit, i) => {
                  const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : "";
                  return (
                    <div key={i} style={{ ...sideCardStyle, borderLeft: i < 3 ? '4px solid #fdbb2d' : '1px solid #f1f5f9' }}>
                      <strong>{unit['Equipment Name']} {medal}</strong><br/>
                      <small>Efficiency Score: {unit.score}</small>
                    </div>
                  );
                })}
              </div>

              <div style={{ ...panelStyle, borderTop: '5px solid #1a2a6c' }}>
                <h4>📂 History</h4>
                {stats.history.map((h, i) => (
                  <div key={i} style={sideCardStyle}>
                    <strong>{h.filename}</strong><br/><small>{h.date}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const Card = ({ title, value, icon, color }) => (
  <div style={{ 
    backgroundColor: 'white', 
    padding: '20px', 
    borderRadius: '12px', 
    textAlign: 'center', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    borderTop: `5px solid ${color}` // Added borderTop for KPIs
  }}>
    <div style={{ fontSize: '24px' }}>{icon}</div>
    <div style={{ color: '#888', fontSize: '12px' }}>{title}</div>
    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{value}</div>
  </div>
);

// Styles
const heroContainerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)', fontFamily: 'sans-serif' };
const heroCardStyle = { backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '60px', borderRadius: '30px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center', maxWidth: '650px', width: '90%', backdropFilter: 'blur(10px)' };
const uploadBoxStyle = { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' };
const fileLabelStyle = { display: 'block', width: '100%', maxWidth: '350px', padding: '15px 20px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', color: '#475569' };
const heroBtnStyle = { backgroundColor: '#1a2a6c', color: 'white', border: 'none', padding: '16px 45px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(26, 42, 108, 0.4)' };
const panelStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }; // Removed hardcoded borderTop from here to apply dynamically
const sideCardStyle = { padding: '10px', marginBottom: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' };

export default App;