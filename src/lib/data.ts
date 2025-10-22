

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
].map(a => ({...a, timestamp: new Date(a.timestamp)}));
