export type Conversation = {
  role: string;
  parts: { text: string; thought?: boolean }[];
};

export type modelAI = "gemini-2.5-flash";
