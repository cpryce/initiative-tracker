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
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (used to run MongoDB)
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
   MONGO_URI=mongodb://localhost:27017/initiative-tracker
   ```

   In the Google Cloud Console, add the following as an **Authorized redirect URI**:
   ```
   http://localhost:3001/auth/google/callback
   ```

### Running MongoDB

MongoDB runs in Docker. The `start.sh` script handles this automatically, but you can also start it manually:

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb_data:/data/db \
  mongodb/mongodb-community-server:latest
```

**Connection string:** `mongodb://localhost:27017/initiative-tracker`

The container persists data in a Docker volume (`mongodb_data`) so session data survives restarts.

### Running in Development

The easiest way to start everything at once:
```bash
./start.sh
```
This will start MongoDB (via Docker), wait for it to be ready, then start the Express server and Vite client in sequence.

Or start each service manually:

```bash
# Terminal 1 — MongoDB
docker start mongodb

# Terminal 2 — Express server (port 3001)
cd server && npm run dev

# Terminal 3 — Vite client (port 5173)
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
