const { getFilteredVideos } = require("../models/videoModel");
const OpenAI = require("openai");
require('dotenv').config();

const openai = new OpenAI({
  apiKey: "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",
});

const generateFitnessPlan = async (req, res) => {
  const { age, weight, level, muscle } = req.body;

  try {
    const filteredVideos = await getFilteredVideos(muscle, level);

    if (filteredVideos.length === 0) {
      return res.status(404).json({ error: "No videos found for this level and muscle group." });
    }

    const videoTitles = filteredVideos.map(v => v.name || v.title);
    const limitedTitles = videoTitles.slice(0, 100);

    const prompt = `
You are a professional fitness coach. Based on:
- Age: ${age}
- Weight: ${weight} kg
- Level: ${level}
- Muscle group to target: ${muscle}

Create a 4-week fitness plan (4 sessions per week). Each session must use 1 to 3 videos from this list:
${limitedTitles.map(t => `- ${t}`).join("\n")}

Return JSON ONLY in this format:
[
  {
    "week": 1,
    "sessions": [
      { "day": "Monday", "videos": ["Video Title 1", "Video Title 2"] },
      ...
    ]
  },
  ...
]
`;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const planText = gptResponse.choices[0].message.content;

    let plan;
    try {
      plan = JSON.parse(planText);
    } catch (e) {
      return res.status(400).json({ error: "Invalid JSON from AI", raw: planText });
    }

    res.json({ success: true, plan });

  } catch (err) {
    console.error("AI Error:", err.message);
    res.status(500).json({ error: "Failed to generate plan." });
  }
};

module.exports = { generateFitnessPlan };
