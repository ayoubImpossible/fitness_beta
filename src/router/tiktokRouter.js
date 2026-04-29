const express = require('express');
const router = express.Router();

const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_APP_ID = process.env.TIKTOK_APP_ID;

router.post('/track', async (req, res) => {
  try {
    const { eventName, properties, deviceId } = req.body;

    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    const payload = {
      event_source: 'app',
      event_source_id: TIKTOK_APP_ID,
      data: [
        {
          event: eventName,
          event_time: timestamp,
          context: {
            app: {
              app_id: 'com.fitness.com',
            },
            device: {
              device_id: deviceId || 'unknown',
            },
            ip: req.headers['x-forwarded-for'] || req.ip,
            user_agent: req.headers['user-agent'],
          },
          properties: properties || {},
        },
      ],
    };

    const response = await fetch(
      'https://business-api.tiktok.com/open_api/v1.3/event/track/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': TIKTOK_ACCESS_TOKEN,
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (response.ok && result.code === 0) {
      console.log(`✅ TikTok Event sent: ${eventName}`);
      return res.json({ success: true, event: eventName });
    } else {
      console.warn(`⚠️ TikTok API error:`, result);
      return res.status(500).json({ error: result });
    }
  } catch (error) {
    console.error('❌ TikTok tracking error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
