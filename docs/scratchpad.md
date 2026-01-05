# GAME CONFIGURATION
1. Enable export/import/save of dedicated worlds/projects
2. Enable export/import/save of settings

# MAIN CHAT
1. Relationship description - this is generated at runtime when the relationship is created. It risks becoming stale. We should either update it at runtime as changes to the relationship are made, or we should leave the PRQC descriptors as the only input into the LLM.
2. Timestamp in the Chat History should be related to in-game time in a way that is meaningful to the LLM.

# CHARACTER GENERATION
1. Use faker dataset to generate people first names, last names, and locations based on a country of origin
2. Create a bio generator using a custom weights and tags system
3. Integrate the bio generator into the character creation process