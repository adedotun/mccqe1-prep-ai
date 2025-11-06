
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Question, VideoExplanation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: "The MCCQE1 style multiple-choice question.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4 or 5 possible answers for the question.",
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description: "The 0-based index of the correct answer in the 'options' array.",
    },
    explanation: {
      type: Type.STRING,
      description: "A detailed explanation of why the correct answer is right and the others are wrong, citing medical principles.",
    },
    topics: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 2-4 relevant medical topics or keywords for the question (e.g., 'Cardiology', 'Myocardial Infarction', 'Pharmacology')."
    }
  },
  required: ["question", "options", "correctAnswerIndex", "explanation", "topics"],
};

const videoSchema = {
    type: Type.OBJECT,
    properties: {
      videoId: {
        type: Type.STRING,
        description: "The unique YouTube video ID.",
      },
      title: {
        type: Type.STRING,
        description: "A concise, relevant title for the video.",
      },
      description: {
        type: Type.STRING,
        description: "A brief (1-2 sentence) description of the video's content and why it's useful.",
      },
    },
    required: ["videoId", "title", "description"],
  };

export const generateQuizQuestions = async (count: number): Promise<Question[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} unique, high-quality multiple-choice questions (MCQs) for the Medical Council of Canada Qualifying Examination Part I (MCCQE1). The questions should cover a range of topics including internal medicine, surgery, pediatrics, psychiatry, and ethics. Ensure the format is a clinical vignette followed by a single best answer question. For each question, also provide a list of relevant medical topics/keywords.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: questionSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    const questions = JSON.parse(jsonText) as Question[];
    return questions;
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    return [];
  }
};

export const generateStudyGuide = async (topic: string, onStream: (chunk: string) => void): Promise<void> => {
  try {
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: `Generate a comprehensive study guide for the topic of "${topic}" for a physician preparing for the MCCQE1 exam. Use standard Markdown for formatting. This should include:
- Main headings using '##' and sub-headings using '###'.
- Bold text for key terms using '**term**'.
- Unordered lists using dashes ('-'), including nested lists (using indentation).
- Tables for comparative data (e.g., differential diagnoses, drug side effects).
- Code blocks with triple backticks for things like mnemonics, algorithms, or classification criteria.`,
    });

    for await (const chunk of responseStream) {
        onStream(chunk.text);
    }
  } catch (error) {
    console.error(`Error generating study guide for topic "${topic}":`, error);
    onStream(`\n\n---\n\n**An error occurred while generating the study guide for "${topic}". Please try again.**`);
  }
};

export const findRelevantVideos = async (topic: string): Promise<VideoExplanation[]> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find 4 highly relevant, educational YouTube videos for a physician studying the topic "${topic}" for the MCCQE1 exam. Focus on videos from reputable medical channels (e.g., Osmosis, Armando Hasudungan, Ninja Nerd, Strong Medicine). For each video, provide its YouTube Video ID, a clear title, and a brief description.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: videoSchema,
          },
        },
      });
  
      const jsonText = response.text.trim();
      const videos = JSON.parse(jsonText) as VideoExplanation[];
      return videos;
    } catch (error) {
      console.error(`Error finding videos for topic "${topic}":`, error);
      return [];
    }
  };

export const getTermDefinition = async (term: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Provide a concise definition for the medical term "${term}" suitable for a physician studying for the MCCQE1 exam. If the term is not a valid medical term, respond with "Term not found.".`,
      });
  
      return response.text.trim();
    } catch (error) {
      console.error(`Error getting definition for term "${term}":`, error);
      return `An error occurred while fetching the definition for "${term}". Please try again.`;
    }
  };

export const getIncorrectAnswerFeedback = async (question: string, incorrectAnswer: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `For the following medical question: "${question}", please explain in a single, concise sentence why the answer choice "${incorrectAnswer}" is incorrect. Focus only on the error in that specific option.`,
        config: {
            maxOutputTokens: 100,
        }
      });
  
      return response.text.trim();
    } catch (error) {
      console.error(`Error generating feedback for answer "${incorrectAnswer}":`, error);
      return "Could not generate feedback for this option.";
    }
  };

export const generatePronunciationAudio = async (term: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: term }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A standard, clear voice
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error(`Error generating pronunciation for term "${term}":`, error);
        throw error; // Re-throw to be handled by the component
    }
};

export const startEncounterChat = async (): Promise<{ chat: Chat; initialMessage: string }> => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are an advanced medical patient simulator for the MCCQE1 exam. Your goal is to present a clinical case and interact with a medical student who is trying to diagnose you.

RULES:
1.  **Start:** When the user begins, generate a new, random clinical case from a common medical domain (e.g., cardiology, respiratory, GI). Provide the patient's age, gender, and chief complaint in a short, clear opening statement.
2.  **Role-play:** You are the patient. Respond to the user's questions from the patient's perspective. Be realistic. Do not provide a diagnosis or medical jargon unless the user specifically asks you to explain something in those terms.
3.  **Structured Commands:** When you receive a command, provide ONLY the structured information requested, then add a patient comment in a new message.
    *   **"Perform a physical exam":** Respond with \`[EXAM_RESULTS] followed by a JSON object. This object MUST contain a 'vitals' object and string keys for other systems (e.g., 'Cardiovascular', 'Respiratory'). Example: {"vitals": {"Heart Rate": "88 bpm", "Blood Pressure": "130/85 mmHg", "Respiratory Rate": "18/min", "Temperature": "37.1 C"}, "Cardiovascular": "Regular rate and rhythm, no murmurs.", "Respiratory": "Clear to auscultation bilaterally."}.
    *   **"Order [Test Name]":** For lab orders like "Order CBC" or "Order BMP", respond with \`[LAB_RESULTS] followed by a JSON object. The key is the test panel name (e.g., "CBC", "BMP"). The value is an array of objects, where each object has 'test', 'value', 'unit', and 'reference' keys. Example: {"CBC": [{"test": "WBC", "value": "7.5", "unit": "x 10^9/L", "reference": "4.0-11.0"}, {"test": "Hemoglobin", "value": "140", "unit": "g/L", "reference": "135-175"}]}.
    *   **"Order [Imaging Type]":** For imaging orders like "Order Chest X-ray", respond with \`[IMAGING_RESULTS] followed by a JSON object. The key is the imaging type (e.g., "Chest X-ray"). The value is an object containing 'findings' and 'impression' strings. Example: {"Chest X-ray": {"findings": "The lungs are clear. The cardiomediastinal silhouette is normal.", "impression": "No acute cardiopulmonary process."}}.
4.  **Diagnosis:** When the user provides a final diagnosis with the format "My final diagnosis is: [their diagnosis]", your task changes.
    *   First, state the correct diagnosis clearly.
    *   Second, provide a detailed, constructive critique of the user's performance, including questions they missed, unnecessary tests, and their diagnostic reasoning.
    *   Third, provide a concise summary of the clinical case and key learning points relevant to the MCCQE1.
    *   End the entire simulation with the single token \`[ENCOUNTER_COMPLETE]\` on a new line.`,
        },
    });

    const response = await chat.sendMessage({ message: "Start the encounter." });
    return { chat, initialMessage: response.text };
};
