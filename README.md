# Tic Tac Toe — Play Together

Responsive Tic Tac Toe made with Next.js and React.

## Game modes
- **vs Computer:** play as X against an unbeatable minimax AI as O.
- **Multiplayer:** two people take turns on the same device.
- Win/draw detection and session score tracking.
- New round, reset scores, rules page, mobile-friendly layout.
- No database, accounts, environment variables, or paid API required.

## Run locally
Install Node.js 20.9 or newer, then run:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel
1. Push the contents of this folder to a GitHub repository.
2. Sign in at https://vercel.com and import that repository.
3. Keep the detected Next.js defaults and press Deploy.
4. Vercel will provide a public `*.vercel.app` URL.

This multiplayer mode is **local pass-and-play** on the same device. Online multiplayer with friends on separate devices requires a realtime backend/service, which is not included in this simple version.

# ticTacToeGame