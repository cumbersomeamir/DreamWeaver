
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { MODELS, VOICE_NAME } from "../constants";
import { Story } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateStoryContent = async (theme: string, character: string, setting: string): Promise<{ title: string; content: string }> => {
  const prompt = `Write a gentle, magical, and original bedtime story for a 5-year-old child.
  Theme: ${theme}
  Main Character: ${character}
  Setting: ${setting}
  
  The story should be about 300 words long, have a soothing tone, and end with the character falling asleep happily.
  Return the result in JSON format with 'title' and 'content' fields.`;

  const response = await ai.models.generateContent({
    model: MODELS.STORY,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateStoryImage = async (storyTitle: string, content: string): Promise<string> => {
  const imagePrompt = `Whimsical, high-quality, storybook illustration for a children's book. 
  Style: Soft watercolor and dreamlike digital painting.
  Subject: ${storyTitle}. Based on this snippet: ${content.substring(0, 200)}.
  Vibe: Soothing, magical, pastel colors, gentle lighting. No text.`;

  const response = await ai.models.generateContent({
    model: MODELS.IMAGE,
    contents: [{ text: imagePrompt }],
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  let imageUrl = "";
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
      break;
    }
  }
  return imageUrl;
};

export const generateStoryAudio = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODELS.AUDIO,
    contents: [{ parts: [{ text: `Read this bedtime story in a very calm, slow, and soothing way: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: VOICE_NAME },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data received");
  return base64Audio;
};

// Audio Decoding helpers
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
