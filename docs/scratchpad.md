# GAME CONFIGURATION
1. Enable export/import/save of dedicated worlds/projects
2. Enable export/import/save of settings

# MAIN CHAT
X. CHARACTER DATA in the main chat prompt is currently a raw JSON export. This needs to be contextualized in the prompt for the LLM's benefit. A pragmatic way to do this is to break down characterData into smaller groups of data, e.g. basicInfo, personality, idealMatch, etc.
1. OCEAN traits as input into the LLM leave too much room for interpretation. We should create a series of trait descriptions for each trait/level. This will make it easier for the LLM to understand the character's personality.
2. PRQC levels for relationship as input into the LLM leave too much room for interpretation. We should create a series of trait descriptions for each trait/level. This will make it easier for the LLM to understand the character's personality.
3. Relatinship description - this is generated at runtime when the relationship is created. It risks becoming stale. We should either udpate it at runtime as changes to the relationship are made, or we should leave the PRQC descriptors as the only input into the LLM.
4. Timestamp in the Chat History should be related to in-game time in a way that is meaningful to the LLM.
5. PLAYER PERSONA DATA - same as character data, but for the player. This should be contextualized in the prompt for the LLM's benefit.
6. RELATIONSHIP DATA is duplicated with the json dump from the character data
7. PREVIOUS CONVERSATION SUMMARIES is duplicated with the json dump from the relationship data
8. "Interpret the JSON as follows" instruction should be replaced by contextualized instructions in each section of the prompt