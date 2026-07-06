import { GoogleGenAI } from "@google/genai";
import config from "./config.js";

export const ai = new GoogleGenAI({
  apiKey: config.gemini_api_key,
});