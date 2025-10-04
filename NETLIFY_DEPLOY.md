# 🚀 Netlify Deployment Instructions

## Quick Setup

### 1. **Push to GitHub**
```bash
git add .
git commit -m "Configure for Netlify deployment"
git push origin main
```

### 2. **Deploy to Netlify**

#### Option A: Via Netlify Dashboard (Recommended)
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and select your repository
4. Configure build settings:
   - **Build command:** `npm install`
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
5. Click "Deploy site"

#### Option B: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### 3. **Configure Environment Variables**

⚠️ **CRITICAL:** Add these environment variables in Netlify Dashboard:

Go to **Site settings** → **Environment variables** → **Add a variable**

| Variable Name | Value |
|--------------|-------|
| `GEMINI_API_KEY` | `AIzaSyADGD87cOOltIu6MdDj38OUAWI6hHoxNMc` |
| `NODE_ENV` | `production` |

**🔑 Get Your Own Gemini API Key (Recommended):**
1. Visit https://makersuite.google.com/app/apikey
2. Create a new API key
3. Use it instead of the demo key

---

## 📁 Project Structure

```
vsmeteor/
├── netlify/
│   └── functions/           # Serverless functions
│       ├── calculate-impact.js
│       ├── calculate-mitigation.js
│       ├── generate-ai-analysis.js
│       ├── physics.js       # Shared physics calculations
│       └── utils.js         # Shared utilities
├── public/                  # Static files (served by CDN)
│   ├── index.html
│   ├── styles.css
│   ├── images/
│   └── js/
│       ├── main.js
│       ├── ui.js
│       ├── api.js
│       ├── charts.js
│       └── ...
├── netlify.toml            # Netlify configuration
├── package.json
├── server.js              # Local development server
└── .env                   # Local environment variables (NOT COMMITTED)
```

---

## 🔧 How It Works

### Netlify Functions (Serverless)
Your API endpoints are now serverless functions:

- `/api/calculate-impact` → `/.netlify/functions/calculate-impact`
- `/api/ai-analysis` → `/.netlify/functions/generate-ai-analysis`
- `/api/calculate-mitigation` → `/.netlify/functions/calculate-mitigation`

### Redirects
The `netlify.toml` file automatically redirects `/api/*` calls to the appropriate serverless functions.

### Static Files
All files in `public/` are served via Netlify's global CDN for fast delivery.

---

## 🧪 Local Development

### Option 1: Netlify Dev (Recommended)
```bash
# Install dependencies
npm install

# Run with Netlify Dev (simulates production environment)
netlify dev
```

### Option 2: Traditional Node Server
```bash
# Use the original Express server
npm start
```

---

## ✅ Post-Deployment Checklist

After deploying, verify:

- [ ] Site is live at `https://your-site-name.netlify.app`
- [ ] Environment variables are set in Netlify dashboard
- [ ] Impact calculations work
- [ ] AI Analysis generates successfully
- [ ] 3D visualization loads
- [ ] 2D map displays correctly
- [ ] Charts render properly
- [ ] All interactive features function

---

## 🐛 Troubleshooting

### "GEMINI_API_KEY is not defined"
**Solution:** Add the environment variable in Netlify dashboard and redeploy.

### "404 on API calls"
**Solution:** Check that `netlify.toml` is in the root directory and functions are in `netlify/functions/`.

### "Functions not deploying"
**Solution:** 
1. Verify `netlify/functions/` folder exists
2. Check that all function files export a `handler`
3. Review build logs in Netlify dashboard

### "Module not found" errors
**Solution:** Run `npm install` locally and ensure `package.json` has all dependencies.

---

## 📊 Expected Performance

- **Cold Start:** ~1-2 seconds (first request to a function)
- **Warm Start:** ~100-300ms (subsequent requests)
- **Static Files:** Served from CDN (~50-100ms globally)
- **AI Analysis:** ~3-8 seconds (depends on Gemini API)

---

## 🌐 Custom Domain (Optional)

To add a custom domain:

1. Go to **Site settings** → **Domain management**
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. HTTPS is automatically enabled

---

## 🔒 Security

✅ **Already Configured:**
- CORS headers on all API endpoints
- Environment variables secured
- `.env` file excluded from Git
- HTTPS enforced by Netlify
- Security headers in `netlify.toml`

---

## 📈 Monitoring

View function logs and performance:
1. Go to Netlify dashboard
2. Click on your site
3. Navigate to **Functions** tab
4. View execution logs and metrics

---

## 🎯 API Key Management

### For Gemini AI:
- **Free tier:** 60 requests/minute
- **Upgrade:** Visit https://ai.google.dev/pricing

### For NASA API (if needed):
- **Demo key:** 30 requests/hour
- **Get your own:** https://api.nasa.gov/

---

## 💡 Tips

1. **Deploy early, deploy often** - Netlify auto-deploys on Git push
2. **Use Netlify Dev** for local testing with functions
3. **Monitor function logs** to debug issues
4. **Enable automatic deployments** for continuous integration
5. **Use preview deploys** for pull requests (automatic)

---

## 📞 Support

- **Netlify Docs:** https://docs.netlify.com/
- **Netlify Functions:** https://docs.netlify.com/functions/overview/
- **Netlify Community:** https://answers.netlify.com/

---

Your Asteroid Impact Simulator is now ready for the world! 🌍💥

**Live Site:** `https://your-site-name.netlify.app`
