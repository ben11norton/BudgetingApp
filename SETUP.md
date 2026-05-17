# Franci & Ben Budget Tracker — Setup Guide

Everything you need to go from zero to live in about 15 minutes.

---

## Step 1 — Create your Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet
2. Name it something like **Franci & Ben Budget**
3. Leave it open — you'll come back to it

---

## Step 2 — Add the Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete all the default code in the editor
3. Open the file `Code.gs` (from the files I gave you) and paste the entire contents
4. Click **Save** (the floppy disk icon), name the project **Budget API**

---

## Step 3 — Deploy as a Web App

1. Click **Deploy → New deployment**
2. Click the gear icon ⚙ next to "Select type" and choose **Web app**
3. Fill in the settings:
   - **Description:** Budget API
   - **Execute as:** Me
   - **Who has access:** Anyone ← this is important, it's what lets the app talk to it
4. Click **Deploy**
5. Google will ask you to authorise — click **Authorise access**, choose your Google account, click **Advanced → Go to Budget API (unsafe)** → **Allow**
6. Copy the **Web app URL** — it looks like: `https://script.google.com/macros/s/AKfy.../exec`

---

## Step 4 — Connect the app

1. Open `index.html` in a text editor (VS Code, Notepad, anything)
2. Near the top of the `<script>` section, find this line:
   ```js
   const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 3:
   ```js
   const SCRIPT_URL = 'https://script.google.com/macros/s/AKfy.../exec';
   ```
4. Save the file

---

## Step 5 — Put it on GitHub Pages

1. Create a free account at [github.com](https://github.com) if Ben doesn't have one
2. Create a new repository — call it `budget` (make it **Public**)
3. Upload `index.html` to the repository
4. Go to **Settings → Pages**
5. Under "Source", select **main branch** and click **Save**
6. GitHub will give you a URL like: `https://bens-username.github.io/budget/`
7. Share that link with Franci — that's it!

---

## Step 6 — Configure your budgets

1. Open the live app
2. Click the ⚙️ settings icon (top right)
3. Enter Franci's and Ben's monthly take-home pay
4. Set budget targets for each category per person
5. Click **Save settings**

Settings are saved in your browser's local storage — so do this once on each device you use (phone + laptop).

---

## How it works day-to-day

| Action | How |
|--------|-----|
| Add an expense | Click **Add expense**, fill in date, description, category, total, drag the split slider |
| Change the split | Drag the purple/orange slider — defaults to 50/50 |
| See your share | Switch to the **Franci** or **Ben** tab |
| See everything | Stay on the **Household** tab |
| Browse past months | Use the **‹ ›** arrows next to the month name |
| Update a budget | Click ⚙️ Settings |
| See raw data | Open your Google Sheet — every expense is a row |

---

## Updating the app in future

If I update `index.html` for you, just upload the new file to GitHub — the live site updates automatically within a minute.

---

## Troubleshooting

**The warning banner keeps showing**
→ You haven't pasted the Script URL into `index.html` yet. Re-do Step 4.

**Expenses aren't saving**
→ In your Google Sheet, go to Extensions → Apps Script → Deploy → Manage deployments. Check the deployment is active. If you changed the script, you need to create a **new deployment** (not update the existing one) and copy the new URL.

**"Who has access" — is this secure?**
→ The URL is a long random string — no one can guess it. For a personal finance app shared between two people it's perfectly fine. If you want extra security, I can add a simple password to it.

**Data disappeared**
→ Check the Google Sheet directly — all data lives there. The app just reads from it.
