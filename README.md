# Initiative Tracker

Initiative Tracker is a web-based utility designed to help Dungeon Masters (DMs) and players track initiative order during Dungeons & Dragons (D&D) tabletop sessions, specifically tailored for the 3.5 edition d20 ruleset.

## Features
- Add, edit, and remove player and NPC initiatives
- Automatically sort initiative order
- Support for initiative modifiers and ties
- Simple, intuitive interface for quick session management

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account with a cluster
- A Google Cloud project with OAuth 2.0 credentials ([create one here](https://console.cloud.google.com/apis/credentials))

### Installation

1. Clone the repository:
   ```bash
   git clone git@github.com:cpryce/initiative-tracker.git
   cd initiative-tracker
   ```

2. Install all dependencies:
   ```bash
   npm run install:all
   ```

3. Configure the server environment:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit `server/.env` and fill in your values:
   ```
   SESSION_SECRET=<a long random string>
   GOOGLE_CLIENT_ID=<your Google OAuth client ID>
   GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
   MONGO_URI=<your MongoDB Atlas connection string>
   ```

### Running in Development

The easiest way to start everything at once:
```bash
./start.sh
```
This will start the Express server and Vite client in sequence (MongoDB is hosted on Atlas).

Or start each service manually:

```bash
# Terminal 1 — Express server (port 3001)
cd server && npm run dev

# Terminal 2 — Vite client (port 5173)
cd client && npm run dev
```

Open **http://localhost:5173** in your browser and sign in with Google.

### Building for Production

```bash
cd client && npm run build
```

The compiled assets are output to `client/dist/`. Configure your Express server to serve that directory for production deployments.

## Usage
- Sign in with Google to access your encounter sessions.
- Create a named session for each combat encounter.
- Add **Players (PC)** and **NPCs** to the encounter.
- Enter each combatant's d20 initiative roll and DEX modifier — the total is calculated automatically.
- Click **Auto-Sort** to order combatants by initiative total (highest first), with ties broken by modifier per D&D 3.5 rules.
- Drag and drop cards to manually reorder the initiative list.
- Use **Next Turn** / **Prev** to advance through the initiative order.
- Toggle the **FF** badge on a combatant to mark them as flat-footed.
- The round counter increments automatically when all combatants have taken their turn.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
MIT

---

*Initiative Tracker is not affiliated with Wizards of the Coast. Dungeons & Dragons and d20 System are trademarks of Wizards of the Coast, Inc.*
