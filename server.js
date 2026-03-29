const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let browser = null;
let page = null;

app.post('/api/start', async (req, res) => {
    try {
        if (browser) {
            await browser.close();
        }

        browser = await puppeteer.launch({
            headless: false, // مهم
            args: ['--no-sandbox']
        });

        page = await browser.newPage();

        await page.setViewport({ width: 1200, height: 800 });

        await page.goto('https://www.instagram.com/', {
            waitUntil: 'networkidle2'
        });

        res.json({
            success: true,
            message: 'تم فتح المتصفح - سجل دخولك بنفسك'
        });

    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

app.post('/api/keep-alive', async (req, res) => {
    try {
        if (!page) return res.json({ success: false });

        setInterval(async () => {
            try {
                await page.mouse.move(
                    Math.random() * 800,
                    Math.random() * 600
                );

                await page.evaluate(() => {
                    window.scrollBy(0, Math.random() * 200);
                });

            } catch (e) {}
        }, 20000);

        res.json({ success: true });

    } catch (e) {
        res.json({ success: false });
    }
});

app.post('/api/stop', async (req, res) => {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
    }
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});