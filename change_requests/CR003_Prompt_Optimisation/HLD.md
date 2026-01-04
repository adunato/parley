# High-Level Design: Prompt Optimisation (CR003)

## 1. Introduction
This Change Request focuses on optimizing the prompts used in the application.

## 2. Goals
- Improve prompt efficiency.
- Enhance response quality.
- Remove outdated or unused profile fields to reduce token usage and noise.

## 3. Proposed Changes

### 3.1 Data Model Updates
- Remove `preferences` object from `Character` interface.
- Remove `attractedToTraits` (string array).
- Remove `dislikesTraits` (string array).
- Remove `gossipTendency` (string enum).

### 3.2 UI Updates
- Remove "Preferences" section from Character Configuration screen.
- Remove inputs for Attracted Traits, Disliked Traits, and Gossip Tendency.

### 3.3 System Prompt Updates
- Remove instructions referencing `attractedToTraits`, `dislikesTraits`, and `gossipTendency`.
- Update `GenerateSystemPrompt` to exclude these fields.

