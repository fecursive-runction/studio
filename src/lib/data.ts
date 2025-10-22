
export const alerts = [
  {
    id: 'alert_xyz',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    severity: 'CRITICAL',
    message: 'Kiln temperature over 1500°C!',
    sensor_id: 'kiln_temp',
    value: 1502.5,
    icon: 'AlertTriangle',
  },
  {
    id: 'alert_abc',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    severity: 'WARNING',
    message: 'Feed rate is unusually low.',
    sensor_id: 'feed_rate',
    value: 175.2,
    icon: 'AlertTriangle',
  },
  {
    id: 'alert_def',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    severity: 'INFO',
    message: 'Raw material batch #B789 analysis complete.',
    sensor_id: 'material_cao',
    value: 44.8,
    icon: 'Info',
  },
  {
    id: 'alert_ghi',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    severity: 'RESOLVED',
    message: 'AI recommendation REC-045 successfully implemented.',
    sensor_id: 'optimization',
    value: null,
    icon: 'ShieldCheck',
  },
];

const generateData = () => {
  const data = [];
  const now = new Date();
  for (let i = 24 * 60; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const hour = time.getHours();
    
    // Simulate daily pattern
    let baseTemp;
    if (hour >= 6 && hour < 18) {
      baseTemp = 1460; // Day time
    } else {
      baseTemp = 1440; // Night time
    }
    
    const value = baseTemp + Math.sin(i / 60) * 15 + (Math.random() - 0.5) * 10;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      temperature: parseFloat(value.toFixed(1)),
    });
  }
  // We only want to show a few labels on the chart
  return data.map((d, i) => (i % 36 === 0 ? d : { ...d, time: '' }));
};

export const historicalTemperatureData = generateData();
