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

1. **Install and Setup Harper on your machine**
   ```sh
   npm install -g harperdb
   ```

2. **Clone the repository:**
   ```sh
   git clone https://github.com/baileydunning/wildscapes.git
   cd wildscapes
   ```

3. **Install dependencies and build:**
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

## API Endpoints

Wildscapes uses Harper as its data layer. Every type in the schema that includes `@table` automatically becomes a real table inside the wildscapes database, and Harper gives each one full CRUD functionality out of the box. Fields in the type become columns, and decorators like `@primaryKey`, `@indexed`, `@createdTime`, and `@updatedTime` map directly to Harper’s built-in features.

Each table also exposes a clean resource name through the `@export` tag. These exported names (user, player, game_stats) act as the API-facing resources you interact with in your custom routes. Custom resources in the `resources.js` file let you define exactly how your API behaves on top of Harper—your routes can query tables, join data, apply logic, or bundle multiple operations together.

Relationships in the schema (`@relationship`) are lightweight metadata rather than enforced joins. Your API decides how to fetch related records, letting you shape responses however you need without being locked into strict relational constraints.

Because all exported tables automatically come with create, read, update, and delete support through Harper operations, the routing layer stays simple and consistent. Every resource maps cleanly to the endpoints below.

| Table         | Method | Endpoint             | Description                          |
|---------------|--------|----------------------|--------------------------------------|
| **user**      | GET    | `/user`              | Get all users                        |
| user          | GET    | `/user/:id`          | Get a user by ID                     |
| user          | POST   | `/user`              | Create a new user                    |
| user          | PUT    | `/user/:id`          | Replace a user record                |
| user          | PATCH  | `/user/:id`          | Partially update a user              |
| user          | DELETE | `/user/:id`          | Delete a user by ID                  |
| **player**    | GET    | `/player`            | Get all players                      |
| player        | GET    | `/player/:id`        | Get a player by ID                   |
| player        | POST   | `/player`            | Create a new player                  |
| player        | PUT    | `/player/:id`        | Replace a player record              |
| player        | PATCH  | `/player/:id`        | Partially update a player            |
| player        | DELETE | `/player/:id`        | Delete a player by ID                |
| **game_stats**| GET    | `/game_stats`        | Get all game stats                   |
| game_stats    | GET    | `/game_stats/:id`    | Get a game stats record by ID        |
| game_stats    | POST   | `/game_stats`        | Create a new game stats entry        |
| game_stats    | PUT    | `/game_stats/:id`    | Replace a game stats record          |
| game_stats    | PATCH  | `/game_stats/:id`    | Partially update game stats          |
| game_stats    | DELETE | `/game_stats/:id`    | Delete a game stats record by ID     |
