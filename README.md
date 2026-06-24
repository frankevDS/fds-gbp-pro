# FDS GBP Pro — Frankev Digital Services

Google My Business Complete Suite — built for professional GBP setup, client management, AI content generation, and sales.

---

## 🚀 DEPLOY IN 10 MINUTES — STEP BY STEP

### STEP 1 — Download the project files
Save all files from this project to a folder on your computer named `fds-gbp-pro`.

### STEP 2 — Install Node.js (if not already installed)
Go to **https://nodejs.org** → Download the **LTS version** → Install it.

To check it worked, open Terminal (Mac/Linux) or Command Prompt (Windows) and type:
```
node --version
```
You should see a version number like `v20.x.x`

### STEP 3 — Install project dependencies
In Terminal, navigate to your project folder:
```bash
cd fds-gbp-pro
npm install
```
Wait for it to finish (1–2 minutes).

### STEP 4 — Test locally
```bash
npm run dev
```
Open your browser and go to **http://localhost:5173**
You should see the FDS GBP Pro app running.

### STEP 5 — Push to GitHub
1. Go to **https://github.com** → Log in → Click **New repository**
2. Name it `fds-gbp-pro` → Set to **Private** → Click **Create repository**
3. In Terminal, run these commands one by one:
```bash
git init
git add .
git commit -m "Initial commit — FDS GBP Pro v1.0"
git branch -M main
git remote add origin https://github.com/frankevDS/fds-gbp-pro.git
git push -u origin main
```

### STEP 6 — Deploy to Vercel
1. Go to **https://vercel.com** → Log in with your GitHub account
2. Click **Add New Project**
3. Find and select `fds-gbp-pro` from your repositories
4. Vercel auto-detects Vite — click **Deploy**
5. Wait ~60 seconds → Your app is LIVE at a URL like `https://fds-gbp-pro.vercel.app`

### STEP 7 — Add your Groq API key
1. Open the live app in your browser
2. Tap **Settings** (bottom nav on mobile, sidebar on desktop)
3. Paste your Groq API key → Save Settings
4. All AI features are now active ✅

---

## 📱 INSTALL ON YOUR PHONE

### Android (Chrome):
1. Open the app URL in Chrome
2. Tap **⋮ menu** (top right)
3. Tap **"Add to Home Screen"**
4. Tap **"Install"**
The app now appears on your home screen like a native app.

### iPhone (Safari):
1. Open the app URL in Safari (must be Safari, not Chrome)
2. Tap the **Share button** (box with arrow)
3. Scroll down → Tap **"Add to Home Screen"**
4. Tap **"Add"**

### Desktop (Chrome or Edge):
1. Open the app URL
2. Look for the **install icon (⊕)** in the address bar (right side)
3. Click it → Click **"Install"**
The app opens in its own window without the browser UI.

---

## 💻 INSTALL ON YOUR COMPUTER (offline)

After installing as a desktop PWA, the app works even without internet (except AI features which need a connection to Groq).

---

## 🔧 MAKE UPDATES

After any code change:
```bash
git add .
git commit -m "Update description"
git push
```
Vercel automatically redeploys within 30 seconds.

---

## 🤖 GROQ API KEY

Get your free key at **https://console.groq.com**:
1. Sign up (free)
2. Click **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_`)
4. Paste in Settings inside the app

Free tier: 14,400 requests/day — more than enough for this app.

---

## 📁 PROJECT STRUCTURE

```
fds-gbp-pro/
├── index.html              # App entry point
├── vite.config.js          # Vite + PWA config
├── vercel.json             # Vercel deployment config
├── package.json            # Dependencies
└── src/
    ├── main.jsx            # React entry
    ├── App.jsx             # Navigation shell
    ├── index.css           # Global styles
    ├── components/
    │   └── ui.jsx          # Shared design components
    ├── modules/
    │   ├── AuditTool.jsx       # 5-minute business audit
    │   ├── SetupBlueprint.jsx  # Full GBP setup document
    │   ├── ProposalBuilder.jsx # Client proposal generator
    │   ├── PitchScript.jsx     # Sales script generator
    │   ├── ClientTracker.jsx   # CRM & pipeline tracker
    │   ├── AITools.jsx         # AI content generation
    │   ├── RevenueDashboard.jsx # Revenue & pipeline stats
    │   └── Settings.jsx        # API key & user settings
    └── utils/
        ├── storage.js      # localStorage data layer
        └── groq.js         # Groq AI integration
```

---

## 📦 APP MODULES

| Module | What it does |
|---|---|
| 💰 Revenue Dashboard | MRR, pipeline value, follow-ups due, sales funnel |
| 📊 Client Tracker | Full CRM — leads, pitched, won, active retainers |
| 🔍 Audit Tool | 10-point GBP audit with competitor analysis |
| 📋 GBP Blueprint | Complete 12-section setup document generator |
| 📝 Proposal Builder | Tailored client proposals with pricing table |
| 🎯 Pitch Script | Word-for-word sales scripts with objection handlers |
| 🤖 AI Tools | Review responder, post generator, Q&A, description writer, monthly report |
| ⚙️ Settings | Groq API key, your details, install instructions |

---

## 📞 SUPPORT

Frankev Digital Services  
Email: frankevgloballtd@gmail.com  
GitHub: github.com/frankevDS

---

*FDS GBP Pro v1.0 — Built for Frankev Digital Services*
