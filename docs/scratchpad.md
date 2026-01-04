# GAME CONFIGURATION
1. Enable export/import/save of dedicated worlds/projects
2. Enable export/import/save of settings

# MAIN CHAT
1. Relatinship description - this is generated at runtime when the relationship is created. It risks becoming stale. We should either udpate it at runtime as changes to the relationship are made, or we should leave the PRQC descriptors as the only input into the LLM.
2. Timestamp in the Chat History should be related to in-game time in a way that is meaningful to the LLM.
3. "Interpret the JSON as follows" instruction should be replaced by contextualized instructions in each section of the prompt