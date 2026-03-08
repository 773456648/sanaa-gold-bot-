const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(express.json());
// هذا السطر يخلي السيرفر يقرأ الواجهة من مجلد public
app.use(express.static(path.join(__dirname, 'public'))); 

app.post('/build-now', async (req, res) => {
    const { name, url } = req.body;
    
    try {
        // الربط مع GitHub Actions (المصنع السحابي)
        await axios.post('https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches', 
        { 
            event_type: 'build_apk', 
            client_payload: { app_name: name, app_url: url } 
        },
        { 
            headers: { 
                'Authorization': 'token YOUR_GITHUB_TOKEN',
                'Accept': 'application/vnd.github.v3+json' 
            } 
        });
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Fadi Pro Hub is live on port ${PORT}`));