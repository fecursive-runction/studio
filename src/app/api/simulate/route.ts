import { NextResponse } from 'next/server';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();
const topicName = 'sensor-data-raw';

function generateSensorData() {
  const now = new Date();
  
  // Simulate daily patterns for base values
  const hour = now.getHours();
  let baseTemp = (hour >= 6 && hour < 18) ? 1460 : 1440; // Day vs. Night
  let baseFeedRate = (hour >= 8 && hour < 16) ? 225 : 215; // Peak shift vs. off-peak

  // Add cyclical and random variations
  const kiln_temp = baseTemp + Math.sin(now.getTime() / (60 * 60 * 1000)) * 15 + (Math.random() - 0.5) * 10;
  const feed_rate = baseFeedRate + Math.sin(now.getTime() / (2 * 60 * 60 * 1000)) * 10 + (Math.random() - 0.5) * 5;
  const energy_kwh = 100 + (kiln_temp - 1450) / 10 + (feed_rate - 220) / 5 + (Math.random() - 0.5) * 2;
  const quality_score = 0.92 - Math.abs(kiln_temp - 1455) * 0.0005 - Math.abs(feed_rate - 220) * 0.0001 + (Math.random() - 0.5) * 0.01;

  return {
    timestamp: now.toISOString(),
    plant_id: 'poc_plant_01',
    kiln_temp: parseFloat(kiln_temp.toFixed(2)),
    feed_rate: parseFloat(feed_rate.toFixed(2)),
    energy_kwh_per_ton: parseFloat(energy_kwh.toFixed(2)),
    clinker_quality_score: parseFloat(quality_score.toFixed(3)),
    raw_material_composition: {
      sio2: parseFloat((30 + Math.random() * 2).toFixed(2)),
      al2o3: parseFloat((5 + Math.random()).toFixed(2)),
      fe2o3: parseFloat((3 + Math.random() * 0.5).toFixed(2)),
      cao: parseFloat((60 + Math.random()).toFixed(2)),
    },
    exhaust_gas: {
      o2: parseFloat((2 + Math.random() * 0.5).toFixed(2)),
      co: parseFloat((0.1 + Math.random() * 0.05).toFixed(2)),
      nox: parseFloat((300 + Math.random() * 50).toFixed(2)),
    }
  };
}

export async function POST() {
  try {
    const data = generateSensorData();
    const dataBuffer = Buffer.from(JSON.stringify(data));

    const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
    
    console.log(`Message ${messageId} published.`);

    return NextResponse.json({ success: true, messageId, data });
  } catch (error: any) {
    console.error('Error publishing message:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
