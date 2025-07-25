import { generateImage } from "../lib/comfyui.js";
import { Character } from "../lib/types";

async function runTest() {
  const dummyCharacter: Character = {
    id: "test-character",
    basicInfo: {
      name: "Test Character",
      age: 30,
      gender: "Male",
      role: "Knight",
      faction: "Knights of the Round Table",
      reputation: "Renowned for bravery",
      background: "Trained since childhood in the art of chivalry.",
      firstImpression: "Stoic and honorable.",
      appearance: "Tall, with shining armor and a noble bearing.",
    },
    personality: {
      openness: 50,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 70,
      neuroticism: 20,
    },
    preferences: {
      attractedToTraits: ["courage", "kindness"],
      dislikesTraits: ["deceit", "cowardice"],
      gossipTendency: "low",
    },
    relationships: [],
  };

  try {
    console.log("Attempting to generate image for:", dummyCharacter.basicInfo.name);
    const imageUrl = await generateImage(dummyCharacter.basicInfo.appearance);
    console.log("Successfully generated image. URL:", imageUrl);
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
}

runTest();