# Wildscapes

Wildscapes is a digital board game inspired by Harmonies, where players build vibrant landscapes and attract wildlife by strategically placing terrain tokens and animal cards. The game combines tactical tile placement, animal collection, and modular scoring for a rich, nature-themed experience.

## Features

- **Strategic Landscape Building:**
  - Place terrain tokens (field, water, mountain, trunk, treetop, building) on a hex-grid board.
  - Stack tokens according to unique rules (e.g., trunk below treetop, building roof on trunk/mountain/building base).
  - Solo and multiplayer modes supported.

- **Animal Card Collection:**
  - Collect animal cards, each with habitat requirements and species info.
  - Place cubes (emojis) to fulfill animal habitats and earn points.
  - Pokémon-style card visuals with vivid frames and large emoji art.

- **Turn-Based Gameplay:**
  - Select terrain slots, place tokens, take animal cards, and fulfill habitats each turn.
  - Interactive placement with visual feedback for valid/invalid moves.

- **Scoring System:**
  - Environment scoring for trees, mountains, fields, buildings, and rivers.
  - Animal scoring multiplies points by cubes placed, with a bonus for full completion.
  - Detailed score breakdown modal and end-of-game summary.

- **Visual & UI Features:**
  - Responsive design for desktop and mobile.
  - Completed animal cards are highlighted.
  - In-game rules reference for scoring and placement.

## Gameplay Overview

1. **Setup:**
   - Players choose colors and names.
   - Terrain tokens and animal cards are shuffled and dealt.
2. **Turns:**
   - Select a slot of terrain tokens.
   - Place tokens on your board, following stacking rules.
   - Optionally take an animal card into your hand.
   - Place cubes to fulfill animal habitats.
   - End turn, refill slots/cards, and score.
3. **Endgame:**
   - Game ends when terrain tokens run low or boards are nearly full.
   - Final scores are tallied and the winner is declared.

## Installation & Setup

1. **Clone the repository:**
   ```sh
   git clone https://github.com/baileydunning/wildscapes.git
   cd wildscapes
   ```
2. **Install dependencies and build:**
   ```sh
   cd web
   npm install
   npm run build
   ```
3. **Run the development server:**
   ```sh
   cd ..
   npm run dev
   ```
4. **Open in browser:**
   Visit `http://localhost:9926` (or the port shown in your terminal).

## Project Structure

- `web/src/components/game/` — Main game components (board, cards, controls, scoring, etc.)
- `web/src/data/animalCards.ts` — Animal card definitions and data
- `web/src/context/GameContext.tsx` — Game state and reducer logic
- `web/src/lib/environmentScoring.ts` — Modular scoring functions
- `web/src/types/game.ts` — Type definitions