import { NextRequest, NextResponse } from 'next/server';
import { generateCharacterPrompt } from '@/lib/prompts/generatorPrompts';
import { generateJSON } from '@/lib/llm';
import { Character } from "@/lib/types";
import { BioMachine } from '@/lib/generator/BioMachine';
import { BioData, SymbolicMapping, BioGenerationRequest, BioState } from '@/lib/generator/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { characterDescription, worldDescription, aiStyle, generationModel, existingContext, bioData, symbolicMappings, gameAttributes } = body;

    // --- SEQUENCE STEP 1 & 2: Deterministic Simulation via BioMachine ---
    let generatedBioState: BioState | null = null;
    let bioPromptSupplement = "";

    if (bioData && existingContext) {
      const machine = new BioMachine(bioData as BioData);
      const mappings = (symbolicMappings || []) as SymbolicMapping[];
      const mappedAttributes = existingContext.mappedAttributes || {};

      // Step 2a: Convert explicit UI attributes to pinned node IDs
      const pinnedNodeIds: string[] = [];
      Object.entries(mappedAttributes).forEach(([categoryId, attributeId]) => {
        const mapping = mappings.find(m => m.category === categoryId && m.key === attributeId);
        if (mapping && mapping.nodeId) {
          pinnedNodeIds.push(mapping.nodeId);
        }
      });

      // Legacy support for Profession pinning if it has a direct node matching the role ID
      if (existingContext.role) {
        // Some professions might map exactly to professional spine nodes by ID
        pinnedNodeIds.push(existingContext.role);
      }

      // Run Engine
      const request: BioGenerationRequest = {
        age: existingContext.age || 30,
        pinnedNodeIds: pinnedNodeIds
      };

      generatedBioState = machine.generate(request);

      // --- SEQUENCE STEP 3: Resolve Missing UI Attributes (Reverse Mapping) ---
      // For any category the user left blank, see if the engine organically generated a node that we can map back to a UI attribute
      const generatedSpineIds = new Set(generatedBioState.spine.map((n: any) => n.id));

      mappings.forEach(mapping => {
        if (mapping.nodeId && generatedSpineIds.has(mapping.nodeId)) {
          if (!existingContext.mappedAttributes) existingContext.mappedAttributes = {};
          // Only fill it if the user didn't explicitly pick something else for this category
          if (!existingContext.mappedAttributes[mapping.category]) {
            existingContext.mappedAttributes[mapping.category] = mapping.key;
          }
        }
      });

      // Prepare context for the LLM
      bioPromptSupplement = `
--- SIMULATED LIFE PATH ---
The character has organically lived through the following sequence of life events:
${generatedBioState.spine.map((node: any) => `- Stage: ${node.slot} (${node.id})\n  Description: ${node.text}`).join('\n')}

Specific Events:
${generatedBioState.flesh.map((event: any) => `- ${event.id}: ${event.text}`).join('\n')}

Resulting Personality/Attribute Tags:
${Array.from(generatedBioState.tags).join(', ')}
---------------------------
`;
    }

    // --- SEQUENCE STEP 4: Narrative Synthesis (LLM Call) ---
    // Inject the bio simulation results into the existing context passed to the LLM
    let combinedContext = { ...existingContext };
    if (generatedBioState) {
      combinedContext._simulatedLifePath = bioPromptSupplement;
    }

    const placeholderRequirements: { type: string, count: number }[] = [];
    if (gameAttributes && combinedContext.mappedAttributes) {
      Object.values(combinedContext.mappedAttributes).forEach((attributeId) => {
        const attr = gameAttributes.find((a: any) => a.id === attributeId);
        if (attr && attr.relatedCharacterCount && attr.relatedCharacterCount > 0) {
          // If it's a sibling category we could map it to 'sibling' but using attr.name works too as a type hint for the LLM
          placeholderRequirements.push({ type: attr.name, count: attr.relatedCharacterCount });
        }
      });
    }

    if (placeholderRequirements.length > 0) {
      const requirementsList = placeholderRequirements.map(req => `- ${req.count}x "${req.type}"`).join('\n');
      combinedContext._placeholderRequests = `
--- REQUIRED PLACEHOLDER RELATIONSHIPS ---
You will be generating relationship statistics for the following placeholder characters which will be instantiated alongside this character:
${requirementsList}

CRITICAL INSTRUCTION: You MUST generate a new top-level JSON array field called \`placeholderRelationships\` alongside \`basicInfo\` and \`personality\`.
This array MUST contain exactly one object for every single placeholder requested above (e.g., if "2x Sibling" is requested, output 2 sibling objects).
Each object MUST have the following structure:
{
  "type": string, // The type of relation (e.g. "${placeholderRequirements[0]?.type}")
  "satisfaction": number, // 0 (active animosity) to 100 (complete satisfaction)
  "commitment": number, // 0 to 100
  "intimacy": number, // 0 to 100
  "trust": number, // 0 to 100
  "passion": number, // 0 to 100
  "description": string // A detailed 2-3 sentence narrative explaining the nuanced history and dynamics of this specific relationship. Avoid generic values like exactly 50.
}
------------------------------------------
`;
    }

    const prompt = generateCharacterPrompt(characterDescription, worldDescription, aiStyle, combinedContext);
    const parsedResult = await generateJSON(prompt, generationModel);

    // --- SEQUENCE STEP 5: Reassembly ---
    const character: Character = {
      id: parsedResult.id,
      basicInfo: {
        ...parsedResult.basicInfo,
        // Guarantee the mapped attributes determined in Step 3 are preserved
        mappedAttributes: existingContext.mappedAttributes
      },
      personality: parsedResult.personality,
      idealMatch: parsedResult.idealMatch,
      relationships: []
    }

    const serializableBioState = generatedBioState ? {
      ...generatedBioState,
      tags: Array.from(generatedBioState.tags)
    } : null;

    return NextResponse.json({
      character: character,
      generatedBioState: serializableBioState,
      placeholderRelationships: parsedResult.placeholderRelationships || []
    });
  } catch (error) {
    console.error('Error generating character data:', error);
    return NextResponse.json({ error: 'Failed to generate character data' }, { status: 500 });
  }
}
