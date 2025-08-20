import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const { input } = await req.json();
  
  try {
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a helpful assistant that tailors resume text based on user input.
    
    Tailor my resume for: ${input}`;
    
    const result = await model.generateContent(prompt);
    const output = result.response.text();
    
    return NextResponse.json({ output });
  } catch (error) {
    console.error("Gemini error:", error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}