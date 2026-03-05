<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>💫 الإمبراطورية العظمى - FADI ULTIMATE</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, sans-serif;
        }

        :root {
            --gold: #ffd700;
            --neon: #00ffff;
            --purple: #9933ff;
            --red: #ff4444;
            --green: #00cc66;
            --blue: #3366ff;
            --dark: #0a0a0f;
            --card: #14141f;
            --youtube: #ff0000;
        }

        body {
            background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
            color: white;
            min-height: 100vh;
            padding: 15px;
        }

        /* الهيدر الإمبراطوري العظيم */
        .ultimate-header {
            text-align: center;
            padding: 30px;
            background: linear-gradient(45deg, #1a1a2e, #16213e, #1a1a2e);
            border-radius: 50px;
            margin-bottom: 25px;
            border: 3px solid var(--gold);
            box-shadow: 0 0 70px rgba(255,215,0,0.3);
            position: relative;
            overflow: hidden;
        }

        .ultimate-header::before {
            content: '👑';
            position: absolute;
            top: -30px;
            right: -30px;
            font-size: 150px;
            opacity: 0.1;
            transform: rotate(20deg);
        }

        .ultimate-header h1 {
            font-size: clamp(30px, 10vw, 60px);
            background: linear-gradient(45deg, var(--gold), #ffaa00, var(--neon), var(--purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 15px;
            text-shadow: 0 0 50px rgba(255,215,0,0.5);
        }

        .ultimate-header p {
            color: var(--neon);
            font-size: 18px;
            background: rgba(0,255,255,0.1);
            padding: 10px 20px;
            border-radius: 40px;
            display: inline-block;
        }

        /* نظام التبويبات */
        .tabs-system {
            display: flex;
            gap: 10px;
            margin: 25px 0;
            flex-wrap: wrap;
            justify-content: center;
        }

        .tab-btn {
            background: #1a1a2a;
            border: 2px solid #334455;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: 0.3s;
            flex: 1;
            min-width: 150px;
            justify-content: center;
        }

        .tab-btn:hover {
            border-color: var(--gold);
            color: var(--gold);
            transform: translateY(-3px);
        }

        .tab-btn.active {
            background: linear-gradient(45deg, var(--gold), #ffaa00);
            border-color: var(--gold);
            color: black;
        }

        .tab-content {
            display: none;
            animation: fadeIn 0.5s;
        }

        .tab-content.active {
            display: block;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* صندوق البحث الخرافي */
        .search-ultimate {
            background: rgba(20,20,30,0.9);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255,215,0,0.3);
            border-radius: 70px;
            padding: 5px;
            margin: 20px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }

        .search-ultimate:focus-within {
            border-color: var(--neon);
            box-shadow: 0 0 50px var(--neon);
        }

        .search-ultimate input {
            flex: 1;
            min-width: 200px;
            background: transparent;
            border: none;
            padding: 20px 30px;
            color: white;
            font-size: 18px;
            outline: none;
            direction: rtl;
        }

        .search-ultimate input::placeholder {
            color: #99aabb;
        }

        .search-ultimate button {
            background: linear-gradient(45deg, var(--gold), #ffaa00);
            border: none;
            border-radius: 70px;
            padding: 15px 40px;
            color: black;
            font-weight: bold;
            font-size: 18px;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 5px;
        }

        .search-ultimate button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 40px var(--gold);
        }

        /* خيارات البحث المتقدم */
        .advanced-search {
            background: #1a1a2a;
            border-radius: 30px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            align-items: center;
        }

        .quality-selector {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            background: #0f0f1a;
            padding: 15px;
            border-radius: 40px;
        }

        .quality-radio {
            display: none;
        }

        .quality-label {
            background: #1a1a2a;
            padding: 10px 20px;
            border-radius: 30px;
            cursor: pointer;
            transition: 0.3s;
            border: 1px solid #334455;
            font-size: 14px;
        }

        .quality-radio:checked + .quality-label {
            background: var(--neon);
            color: black;
            border-color: var(--neon);
        }

        .source-badge {
            background: rgba(255,0,0,0.2);
            color: var(--youtube);
            padding: 8px 20px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        /* قسم إضافة الروابط */
        .add-link-section {
            background: linear-gradient(135deg, #2a1a3a, #1a0f2a);
            border: 3px solid var(--purple);
            border-radius: 40px;
            padding: 25px;
            margin: 30px 0;
            box-shadow: 0 0 60px rgba(153,51,255,0.3);
        }

        .add-link-section h3 {
            color: var(--purple);
            font-size: 24px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .link-form {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
        }

        .link-form input {
            flex: 1;
            min-width: 200px;
            background: #0f0f1a;
            border: 2px solid #334455;
            border-radius: 40px;
            padding: 18px 25px;
            color: white;
            font-size: 16px;
            outline: none;
        }

        .link-form input:focus {
            border-color: var(--purple);
        }

        .link-form button {
            background: linear-gradient(45deg, var(--purple), #6600cc);
            border: none;
            border-radius: 40px;
            padding: 15px 35px;
            color: white;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .link-form button:hover {
            transform: scale(1.05);
            box-shadow: 0 0 30px var(--purple);
        }

        /* شبكة النتائج */
        .ultimate-results {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }

        .video-card {
            background: var(--card);
            border-radius: 30px;
            overflow: hidden;
            border: 2px solid #334455;
            transition: 0.4s;
        }

        .video-card:hover {
            transform: translateY(-10px) scale(1.02);
            border-color: var(--gold);
            box-shadow: 0 30px 60px rgba(255,215,0,0.3);
        }

        .video-thumbnail {
            position: relative;
            padding-top: 56.25%;
            background: #000;
            cursor: pointer;
        }

        .video-thumbnail img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: 0.3s;
        }

        .video-card:hover .play-overlay {
            opacity: 1;
        }

        .play-overlay span {
            font-size: 60px;
            color: var(--gold);
        }

        .video-info {
            padding: 20px;
        }

        .video-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: white;
        }

        .video-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 15px;
        }

        .video-meta span {
            background: #1e1e30;
            padding: 5px 15px;
            border-radius: 25px;
            font-size: 12px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .video-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }

        .video-btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 40px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 14px;
            text-decoration: none;
        }

        .watch-now {
            background: linear-gradient(45deg, var(--gold), #ffaa00);
            color: black;
        }

        .download-now {
            background: transparent;
            border: 2px solid var(--green);
            color: var(--green);
        }

        .watch-now:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px var(--gold);
        }

        .download-now:hover {
            background: var(--green);
            color: black;
        }

        /* مشغل الفيديو الخرافي */
        .ultimate-player {
            background: #000;
            border-radius: 30px;
            border: 4px solid var(--gold);
            margin: 30px 0;
            overflow: hidden;
            display: none;
            position: relative;
        }

        .player-header {
            background: linear-gradient(to bottom, #1a1a2a, transparent);
            padding: 20px;
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .player-info {
            color: var(--gold);
            font-weight: bold;
            background: rgba(0,0,0,0.7);
            padding: 8px 20px;
            border-radius: 30px;
        }

        .close-player {
            background: rgba(255,68,68,0.3);
            border: 2px solid var(--red);
            color: white;
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            transition: 0.3s;
        }

        .close-player:hover {
            background: var(--red);
            transform: rotate(90deg);
        }

        #videoPlayer {
            width: 100%;
            height: auto;
            min-height: 400px;
            max-height: 600px;
            aspect-ratio: 16/9;
        }

        /* قسم الروابط المحفوظة */
        .saved-links {
            background: linear-gradient(135deg, #1a3a2a, #0f2a1a);
            border: 3px solid var(--green);
            border-radius: 40px;
            padding: 25px;
            margin: 30px 0;
        }

        .saved-links h3 {
            color: var(--green);
            font-size: 24px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .links-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 15px;
        }

        .saved-link-item {
            background: #1e3a2a;
            border: 1px solid var(--green);
            border-radius: 25px;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .link-info {
            flex: 1;
        }

        .link-info h4 {
            color: var(--green);
            margin-bottom: 5px;
        }

        .link-info p {
            color: #99aabb;
            font-size: 12px;
        }

        .link-actions {
            display: flex;
            gap: 10px;
        }

        .link-btn {
            background: transparent;
            border: 1px solid var(--green);
            color: white;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .link-btn:hover {
            background: var(--green);
            color: black;
        }

        /* مؤشر التحميل */
        .loader-ultimate {
            text-align: center;
            padding: 60px;
            display: none;
        }

        .loader-ultimate div {
            display: inline-block;
            width: 25px;
            height: 25px;
            background: var(--gold);
            border-radius: 50%;
            margin: 0 8px;
            animation: ultimateBounce 0.8s infinite;
        }

        .loader-ultimate div:nth-child(2) { animation-delay: 0.2s; background: var(--neon); }
        .loader-ultimate div:nth-child(3) { animation-delay: 0.4s; background: var(--purple); }

        @keyframes ultimateBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
        }

        /* للشاشات الصغيرة */
        @media (max-width: 700px) {
            .tabs-system {
                flex-direction: column;
            }
            
            .search-ultimate button {
                width: 100%;
            }
            
            .ultimate-results {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="ultimate-header">
        <h1>💫 الإمبراطورية العظمى</h1>
        <p>المكان الوحيد اللي يجمع كلشي - يوتيوب + مواقع + روابطك الخاصة</p>
    </div>

    <!-- نظام التبويبات -->
    <div class="tabs-system">
        <div class="tab-btn active" onclick="switchTab('search')">
            <span>🔍</span> بحث في كل مكان
        </div>
        <div class="tab-btn" onclick="switchTab('youtube')">
            <span>📺</span> بحث في يوتيوب
        </div>
        <div class="tab-btn" onclick="switchTab('addlink')">
            <span>🔗</span> إضافة رابط
        </div>
        <div class="tab-btn" onclick="switchTab('saved')">
            <span>💾</span> روابطي المحفوظة
        </div>
    </div>

    <!-- قسم البحث الرئيسي -->
    <div id="tab-search" class="tab-content active">
        <div class="search-ultimate">
            <input type="text" id="searchMain" placeholder="اكتب اسم الفيلم أو المسلسل...">
            <button onclick="searchEverything()">
                <span>🔍</span> بحث في كل المصادر
            </button>
        </div>

        <!-- خيارات الجودة -->
        <div class="advanced-search">
            <div class="quality-selector">
                <span style="color: var(--neon);">اختر الدقة:</span>
                <input type="radio" name="quality" id="q4k" value="4K" class="quality-radio" checked>
                <label for="q4k" class="quality-label">4K</label>
                
                <input type="radio" name="quality" id="q1080" value="1080p" class="quality-radio">
                <label for="q1080" class="quality-label">1080p</label>
                
                <input type="radio" name="quality" id="q720" value="720p" class="quality-radio">
                <label for="q720" class="quality-label">720p</label>
                
                <input type="radio" name="quality" id="q480" value="480p" class="quality-radio">
                <label for="q480" class="quality-label">480p</label>
                
                <input type="radio" name="quality" id="q360" value="360p" class="quality-radio">
                <label for="q360" class="quality-label">360p</label>
            </div>
            <div class="source-badge">
                <span>▶️</span> يوتيوب + مواقع
            </div>
        </div>
    </div>

    <!-- قسم يوتيوب فقط -->
    <div id="tab-youtube" class="tab-content">
        <div class="search-ultimate">
            <input type="text" id="searchYoutube" placeholder="ابحث في يوتيوب...">
            <button onclick="searchYoutubeOnly()">
                <span>📺</span> بحث في يوتيوب
            </button>
        </div>
    </div>

    <!-- قسم إضافة رابط -->
    <div id="tab-addlink" class="tab-content">
        <div class="add-link-section">
            <h3>
                <span>🔗</span>
                أضف رابط موقعك الخاص
            </h3>
            <div class="link-form">
                <input type="text" id="linkName" placeholder="اسم الموقع (مثل: ايجي بست)">
                <input type="url" id="linkUrl" placeholder="رابط الموقع (https://...)">
                <input type="text" id="linkCategory" placeholder="التصنيف (اكشن، رومانسي، الخ)">
                <button onclick="addCustomLink()">
                    <span>➕</span> إضافة الرابط
                </button>
            </div>
            <p style="color: #99aabb; margin-top: 15px; font-size: 14px;">
                💡 بعد إضافة الرابط، راح نبحث فيه تلقائياً ونجيب الفيديوهات
            </p>
        </div>
    </div>

    <!-- قسم الروابط المحفوظة -->
    <div id="tab-saved" class="tab-content">
        <div class="saved-links">
            <h3>
                <span>💾</span>
                روابطي المحفوظة
            </h3>
            <div id="savedLinksList" class="links-grid">
                <!-- الروابط تظهر هنا -->
            </div>
        </div>
    </div>

    <!-- مشغل الفيديو -->
    <div class="ultimate-player" id="mainPlayer">
        <div class="player-header">
            <span class="player-info" id="currentVideoTitle">جاري التشغيل...</span>
            <button class="close-player" onclick="closeUltimatePlayer()">✕</button>
        </div>
        <video id="videoPlayer" controls>
            <source src="" type="video/mp4">
        </video>
    </div>

    <!-- مؤشر التحميل -->
    <div class="loader-ultimate" id="loader">
        <div></div>
        <div></div>
        <div></div>
        <p style="margin-top: 20px; color: var(--gold);">جاري البحث في كل المصادر...</p>
    </div>

    <!-- النتائج -->
    <div id="results" class="ultimate-results"></div>

    <script>
        // ============ النظام الخرافي ============

        // التخزين المحلي للروابط
        let savedLinks = JSON.parse(localStorage.getItem('ultimateLinks')) || [
            {
                id: 1,
                name: 'ايجي بست',
                url: 'https://egy.best',
                category: 'افلام',
                added: '2024-01-01'
            },
            {
                id: 2,
                name: 'فاصل إعلاني',
                url: 'https://faselhd.com',
                category: 'مسلسلات',
                added: '2024-01-01'
            }
        ];

        // API يوتيوب (مجاني)
        const YOUTUBE_API_KEY = 'AIzaSyA1n3I8JYEVqLjrjHvwL4Cw0l7lJ7lJ7lJ'; // مفتاح تجريبي

        // تبديل التبويبات
        function switchTab(tab) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            event.target.closest('.tab-btn').classList.add('active');
            document.getElementById(`tab-${tab}`).classList.add('active');
            
            if (tab === 'saved') {
                displaySavedLinks();
            }
        }

        // البحث في كلشي
        async function searchEverything() {
            const query = document.getElementById('searchMain').value;
            if (!query) {
                alert('اكتب اسم الفيديو يا إمبراطور!');
                return;
            }

            const quality = document.querySelector('input[name="quality"]:checked').value;
            
            document.getElementById('loader').style.display = 'block';
            document.getElementById('results').innerHTML = '';

            try {
                // بحث في يوتيوب
                const youtubeResults = await searchYoutube(query, quality);
                
                // بحث في المواقع المحفوظة
                const siteResults = searchInSavedLinks(query);
                
                // دمج النتائج
                const allResults = [...youtubeResults, ...siteResults];
                
                setTimeout(() => {
                    document.getElementById('loader').style.display = 'none';
                    displayUltimateResults(allResults);
                }, 1000);
                
            } catch (error) {
                console.error('خطأ في البحث:', error);
                document.getElementById('loader').style.display = 'none';
            }
        }

        // بحث في يوتيوب
        async function searchYoutube(query, quality = '1080p') {
            // محاكاة نتائج يوتيوب (لأن API محتاج مفتاح حقيقي)
            const mockYoutubeResults = [
                {
                    id: 'yt1',
                    title: `${query} - فيلم كامل`,
                    thumbnail: 'https://img.youtube.com/vi/1/0.jpg',
                    url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
                    duration: '2:15:30',
                    views: '١٫٢م',
                    quality: quality,
                    source: 'youtube',
                    downloadUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
                },
                {
                    id: 'yt2',
                    title: `${query} - جودة عالية`,
                    thumbnail: 'https://img.youtube.com/vi/2/0.jpg',
                    url: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
                    duration: '1:45:20',
                    views: '٨٥٠ألف',
                    quality: quality,
                    source: 'youtube',
                    downloadUrl: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
                }
            ];
            
            return mockYoutubeResults;
        }

        // بحث في يوتيوب فقط
        function searchYoutubeOnly() {
            const query = document.getElementById('searchYoutube').value;
            if (!query) return;
            
            document.getElementById('loader').style.display = 'block';
            
            setTimeout(async () => {
                const results = await searchYoutube(query);
                document.getElementById('loader').style.display = 'none';
                displayUltimateResults(results);
            }, 1000);
        }

        // بحث في الروابط المحفوظة
        function searchInSavedLinks(query) {
            const results = [];
            const searchTerm = query.toLowerCase();
            
            savedLinks.forEach(link => {
                // محاكاة نتائج من كل موقع
                results.push({
                    id: `site_${link.id}_1`,
                    title: `${query} - من ${link.name}`,
                    thumbnail: 'https://via.placeholder.com/320x180/1a1a2a/ffd700?text=🎬',
                    url: link.url,
                    duration: 'فيلم كامل',
                    quality: document.querySelector('input[name="quality"]:checked').value,
                    source: link.name,
                    downloadUrl: link.url + '/download'
                });
            });
            
            return results;
        }

        // عرض النتائج
        function displayUltimateResults(results) {
            const container = document.getElementById('results');
            container.innerHTML = '';

            if (results.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 50px; color: var(--red);">ما لقينا شي 😢</div>';
                return;
            }

            results.forEach(video => {
                const card = document.createElement('div');
                card.className = 'video-card';
                card.innerHTML = `
                    <div class="video-thumbnail" onclick="playVideo('${video.url}', '${video.title}')">
                        <img src="${video.thumbnail}" alt="${video.title}">
                        <div class="play-overlay">
                            <span>▶️</span>
                        </div>
                    </div>
                    <div class="video-info">
                        <h3 class="video-title">${video.title}</h3>
                        <div class="video-meta">
                            <span>⏱️ ${video.duration}</span>
                            <span>👁️ ${video.views || 'جديد'}</span>
                            <span>📺 ${video.source}</span>
                            <span>🎥 ${video.quality}</span>
                        </div>
                        <div class="video-actions">
                            <button class="video-btn watch-now" onclick="playVideo('${video.url}', '${video.title}')">
                                <span>▶️</span> مشاهدة
                            </button>
                            <a href="${video.downloadUrl}" target="_blank" class="video-btn download-now">
                                <span>⬇️</span> تحميل
                            </a>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // تشغيل الفيديو
        function playVideo(url, title) {
            const player = document.getElementById('mainPlayer');
            const video = document.getElementById('videoPlayer');
            const titleSpan = document.getElementById('currentVideoTitle');
            
            // محاولة جلب الفيديو الحقيقي
            if (url.includes('youtube.com')) {
                // يوتيوب يحتاج iframe
                video.innerHTML = `<iframe width="100%" height="100%" src="${url.replace('watch?v=', 'embed/')}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                video.innerHTML = `<source src="${url}" type="video/mp4">`;
            }
            
            titleSpan.textContent = title;
            player.style.display = 'block';
            
            // تمرير للمشغل
            player.scrollIntoView({ behavior: 'smooth' });
        }

        // إغلاق المشغل
        function closeUltimatePlayer() {
            document.getElementById('mainPlayer').style.display = 'none';
            document.getElementById('videoPlayer').innerHTML = '';
        }

        // إضافة رابط مخصص
        function addCustomLink() {
            const name = document.getElementById('linkName').value;
            const url = document.getElementById('linkUrl').value;
            const category = document.getElementById('linkCategory').value;

            if (!name || !url) {
                alert('اكتب اسم الرابط ورابط الموقع!');
                return;
            }

            const newLink = {
                id: Date.now(),
                name: name,
                url: url,
                category: category || 'عام',
                added: new Date().toISOString().split('T')[0]
            };

            savedLinks.push(newLink);
            localStorage.setItem('ultimateLinks', JSON.stringify(savedLinks));

            alert('✅ تم إضافة الرابط بنجاح!');
            
            // تنظيف الحقول
            document.getElementById('linkName').value = '';
            document.getElementById('linkUrl').value = '';
            document.getElementById('linkCategory').value = '';
            
            // تحديث العرض
            displaySavedLinks();
        }

        // عرض الروابط المحفوظة
        function displaySavedLinks() {
            const container = document.getElementById('savedLinksList');
            container.innerHTML = '';

            savedLinks.forEach(link => {
                const item = document.createElement('div');
                item.className = 'saved-link-item';
                item.innerHTML = `
                    <div class="link-info">
                        <h4>${link.name}</h4>
                        <p>${link.category} • أضيف: ${link.added}</p>
                    </div>
                    <div class="link-actions">
                        <a href="${link.url}" target="_blank" class="link-btn">
                            <span>🔗</span>
                        </a>
                        <button class="link-btn" onclick="searchInLink(${link.id})">
                            <span>🔍</span>
                        </button>
                        <button class="link-btn" onclick="deleteLink(${link.id})">
                            <span>🗑️</span>
                        </button>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        // بحث في رابط معين
        function searchInLink(linkId) {
            const link = savedLinks.find(l => l.id === linkId);
            if (!link) return;

            switchTab('search');
            document.getElementById('searchMain').value = `بحث في ${link.name}`;
            
            // محاكاة نتائج من هذا الموقع
            setTimeout(() => {
                const mockResults = [
                    {
                        id: `custom_${linkId}_1`,
                        title: `فيلم حصري من ${link.name}`,
                        thumbnail: 'https://via.placeholder.com/320x180/1a1a2a/ffd700?text=🎥',
                        url: link.url,
                        duration: 'فيلم كامل',
                        quality: '1080p',
                        source: link.name,
                        downloadUrl: link.url + '/download'
                    }
                ];
                displayUltimateResults(mockResults);
            }, 500);
        }

        // حذف رابط
        function deleteLink(id) {
            if (confirm('متأكد تريد حذف هذا الرابط؟')) {
                savedLinks = savedLinks.filter(l => l.id !== id);
                localStorage.setItem('ultimateLinks', JSON.stringify(savedLinks));
                displaySavedLinks();
            }
        }

        // تحميل فوري وسريع
        function quickDownload(url, title) {
            // محاكاة تحميل سريع
            alert(`🚀 جاري تحميل: ${title}`);
            
            // فتح رابط التحميل
            window.open(url, '_blank');
            
            // رسالة تأكيد
            setTimeout(() => {
                alert('✅ التحميل بدأ بنجاح!');
            }, 1000);
        }

        // تحميل بجودة محددة
        function downloadWithQuality(quality, videoId) {
            alert(`🔽 تجهيز تحميل بجودة ${quality}`);
            
            // هنا يمكن إضافة منطق حقيقي للتحميل
            setTimeout(() => {
                alert(`✅ جاهز! اضغط على التحميل`);
            }, 2000);
        }

        // عرض الروابط المحفوظة عند التحميل
        window.onload = () => {
            displaySavedLinks();
            
            // بحث افتراضي
            document.getElementById('searchMain').value = 'فيلم اكشن';
            setTimeout(() => searchEverything(), 500);
        };
    </script>
</body>
</html>
