import { Router } from "express";
import Groq from "groq-sdk";
 
export const insights = Router();
 
const groq = new Groq({
  apiKey: process.env.GROKAPI,
});
 
insights.post("/", async (req, res) => {
    const prompt = [
 
"you are a crypto insights assistant, give information in a paragraph or less about coins"
].join("\n")
  try {
    const chat = await groq.chat.completions.create({
      
        
      model: "openai/gpt-oss-20b",
      messages: [
        {"role": "system",content: prompt},
        {"role": "user", content: req.body.message }
      ]
    });
 
    const result = chat.choices?.[0]?.message?.content ?? "No content returned";
 
    return res.json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Groq failed" });
  }
});
 




