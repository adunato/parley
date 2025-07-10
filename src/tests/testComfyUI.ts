import { generateImage } from "../lib/comfyui.js";
import { Character } from "../lib/entityStore.js";

async function runTest() {
  const dummyCharacter: Character = {
    id: "test-character",
    name: "Test Character",
    description: "a brave knight with shining armor",
    personalityTraits: ["brave", "loyal"],
    motives: ["protect the innocent"],
    affiliation: "knights of the round table",
    sceneIntroduced: "forest clearing",
    imageUrl: "", // This will be populated by the generateImage function
  };

  try {
    console.log("Attempting to generate image for:", dummyCharacter.name);
    const imageUrl = await generateImage(dummyCharacter);
    console.log("Successfully generated image. URL:", imageUrl);
  } catch (error) {
    console.error("Failed to generate image:", error);
  }
}

runTest();