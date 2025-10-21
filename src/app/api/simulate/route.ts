import { NextResponse } from 'next/server';
import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();
const topicName = 'sensor-data-raw';

// Simple random data generator for a cement plant
function generateSensorData() {
    const plantId = `poc_plant_0${Math.ceil(Math.random() * 3)}`;
    return {
        timestamp: new Date().toISOString(),
        plant_id: plantId,
        kiln_temp: 1450 + (Math.random() - 0.5) * 50,         // Kiln temperature in Celsius
        feed_rate: 220 + (Math.random() - 0.5) * 40,          // Raw material feed rate in tons per hour
        energy_kwh_per_ton: 100 + (Math.random() - 0.5) * 10, // Energy consumption in kWh per ton
        clinker_quality_score: 0.9 + (Math.random() - 0.5) * 0.1, // A score from 0-1
    };
}


export async function GET() {
  try {
    const data = generateSensorData();
    const dataBuffer = Buffer.from(JSON.stringify(data));

    const messageId = await pubsub.topic(topicName).publishMessage({ data: dataBuffer });
    console.log(`Message ${messageId} published.`);
    
    return NextResponse.json({ success: true, messageId, data });

  } catch (error: any) {
    console.error(`Received error while publishing: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
