<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes">
    <title>👑 FADI CINEMA IMPERIAL - الإمبراطورية الذهبية</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', 'Tahoma', sans-serif;
        }

        :root {
            --gold: #ffd700;
            --neon: #00ffff;
            --purple: #9b30ff;
            --dark: #0a0a0f;
            --card-bg: #14141f;
            --red: #ff4444;
        }

        body {
            background: var(--dark);
            color: white;
            min-height: 100vh;
            padding: 15px;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 30%),
                radial-gradient(circle at 90% 80%, rgba(0, 255, 255, 0.1) 0%, transparent 40%);
        }

        /* الهيدر الإمبراطوري المتطور */
        .imperial-header {
            text-align: center;
            padding: 25px 15px;
            background: linear-gradient(135deg, rgba(20,20,30,0.9), rgba(10,10,20,0.95));
            border-radius: 50px 50px 20px 20px;
            margin-bottom: 30px;
            border: 1px solid rgba(255,215,0,0.3);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            position: relative;
            overflow: hidden;
        }

        .imperial-header::before {
            content: '👑';
            position: absolute;
            top: -20px;
            right: -20px;
            font-size: 120px;
            opacity: 0.1;
            transform: rotate(20deg);
        }

        .imperial-header h1 {
            font-size: clamp(28px, 8vw, 52px);
            background: linear-gradient(135deg, var(--gold), #ffaa00, var(--neon));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 30px rgba(255,215,0,0.5);
            margin-bottom: 10px;
            letter-spacing: 2px;
        }

        .imperial-header p {
            color: var(--neon);
            font-size: clamp(14px, 4vw, 18px);
            text-shadow: 0 0 15px rgba(0,255,255,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        /* قسم البحث الفائق */
        .search-empire {
            background: rgba(20,20,30,0.8);
            backdrop-filter: blur(15px);
            border: 2px solid rgba(255,215,0,0.3);
            border-radius: 60px;
            padding: 5px;
            margin: 25px 0;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            box-shadow: 0 0 30px rgba(0,255,255,0.2);
            transition: all 0.3s ease;
        }

        .search-empire:focus-within {
            border-color: var(--gold);
            box-shadow: 0 0 40px rgba(255,215,0,0.3);
        }

        .search-empire input {
            flex: 1;
            min-width: 200px;
            background: transparent;
            border: none;
            padding: 18px 25px;
            color: white;
            font-size: 16px;
            outline: none;
            direction: rtl;
        }

        .search-empire input::placeholder {
            color: #667788;
            font-size: 14px;
        }

        .search-empire button {
            background: linear-gradient(135deg, var(--gold), #ffaa00);
            border: none;
            border-radius: 60px;
            padding: 12px 35px;
            color: black;
            font-weight: bold;
            font-size: 16px;
            cursor: pointer;
            transition: 0.3s;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 5px;
        }

        .search-empire button:hover {
            transform: scale(1.02);
            box-shadow: 0 0 30px var(--gold);
            background: linear-gradient(135deg, #ffe44d, #ffbb33);
        }

        /* التصنيفات الإمبراطورية */
        .categories-empire {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin: 25px 0;
            justify-content: center;
        }

        .cat-imperial {
            background: rgba(20,20,30,0.7);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.1);
            color: white;
            padding: 12px 25px;
            border-radius: 40px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: clamp(13px, 3vw, 15px);
        }

        .cat-imperial:hover {
            border-color: var(--gold);
            color: var(--gold);
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(255,215,0,0.2);
        }

        .cat-imperial.active {
            background: linear-gradient(135deg, var(--gold), #ffaa00);
            color: black;
            border-color: var(--gold);
            box-shadow: 0 0 30px rgba(255,215,0,0.5);
        }

        /* مشغل الفيديو المتطور */
        .imperial-player {
            background: linear-gradient(135deg, #1a1a2a, #0a0a1a);
            border-radius: 30px;
            border: 3px solid var(--gold);
            margin: 25px 0;
            position: relative;
            overflow: hidden;
            display: none;
            box-shadow: 0 20px 50px rgba(0,0,0,0.8);
            animation: slideDown 0.5s ease;
        }

        @keyframes slideDown {
            from { transform: translateY(-50px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .player-header-empire {
            background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
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

        .movie-info-empire {
            color: var(--gold);
            font-weight: bold;
            font-size: 18px;
            text-shadow: 0 0 15px rgba(255,215,0,0.5);
            background: rgba(0,0,0,0.5);
            padding: 8px 20px;
            border-radius: 30px;
            backdrop-filter: blur(5px);
        }

        .close-player-empire {
            background: rgba(255,68,68,0.2);
            color: white;
            border: 2px solid var(--red);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: 0.3s;
            backdrop-filter: blur(5px);
        }

        .close-player-empire:hover {
            background: var(--red);
            transform: rotate(90deg);
        }

        #videoPlayer {
            width: 100%;
            height: auto;
            min-height: 350px;
            max-height: 600px;
            background: black;
            aspect-ratio: 16/9;
        }

        /* شبكة النتائج الذهبية */
        .results-grid-empire {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 25px;
            margin: 30px 0;
        }

        .movie-card-empire {
            background: var(--card-bg);
            border: 1px solid rgba(255,215,0,0.2);
            border-radius: 25px;
            padding: 20px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }

        .movie-card-empire::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%);
            opacity: 0;
            transition: 0.5s;
            pointer-events: none;
        }

        .movie-card-empire:hover {
            border-color: var(--gold);
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(255,215,0,0.3);
        }

        .movie-card-empire:hover::before {
            opacity: 1;
        }

        .movie-site-empire {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,170,0,0.15));
            color: var(--gold);
            padding: 8px 20px;
            border-radius: 30px;
            font-size: 13px;
            margin-bottom: 15px;
            border: 1px solid rgba(255,215,0,0.3);
        }

        .movie-title-empire {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
            color: white;
            line-height: 1.4;
        }

        .movie-meta-empire {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }

        .quality-empire {
            background: linear-gradient(135deg, #1a2f3f, #0d1a24);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            border-right: 3px solid var(--neon);
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .size-empire {
            background: linear-gradient(135deg, #2a1f3f, #1a0f2a);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            border-right: 3px solid var(--purple);
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .year-empire {
            background: linear-gradient(135deg, #3f2f1a, #2a1f0a);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            border-right: 3px solid #ffaa00;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .rating-empire {
            background: linear-gradient(135deg, #1f3f1f, #0f2a0f);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            border-right: 3px solid #00ff00;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .card-buttons-empire {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }

        .watch-btn-empire, .download-btn-empire {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 30px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 15px;
        }

        .watch-btn-empire {
            background: linear-gradient(135deg, var(--gold), #ffaa00);
            color: black;
        }

        .download-btn-empire {
            background: transparent;
            border: 2px solid var(--neon);
            color: var(--neon);
        }

        .watch-btn-empire:hover {
            transform: scale(1.02);
            box-shadow: 0 0 25px var(--gold);
            background: linear-gradient(135deg, #ffe44d, #ffbb33);
        }

        .download-btn-empire:hover {
            background: var(--neon);
            color: black;
            box-shadow: 0 0 25px var(--neon);
        }

        /* الاقتراحات الذكية */
        .suggestions-empire {
            background: linear-gradient(135deg, #1a1a2a, #12121f);
            border: 2px solid var(--purple);
            border-radius: 30px;
            padding: 25px;
            margin: 40px 0;
            box-shadow: 0 0 40px rgba(155,48,255,0.2);
        }

        .suggestions-empire h3 {
            color: var(--purple);
            margin-bottom: 20px;
            font-size: 24px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .suggestions-grid-empire {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 15px;
        }

        .suggestion-item-empire {
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(155,48,255,0.3);
            border-radius: 20px;
            padding: 15px;
            cursor: pointer;
            transition: 0.3s;
            backdrop-filter: blur(5px);
        }

        .suggestion-item-empire:hover {
            border-color: var(--purple);
            transform: translateX(-5px) scale(1.02);
            background: rgba(155,48,255,0.1);
            box-shadow: 0 5px 20px rgba(155,48,255,0.3);
        }

        /* مؤشر التحميل الإمبراطوري */
        .loader-empire {
            text-align: center;
            padding: 60px;
            display: none;
        }

        .loader-empire span {
            display: inline-block;
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, var(--gold), #ffaa00);
            border-radius: 50%;
            margin: 0 8px;
            animation: bounceEmpire 0.8s infinite alternate;
        }

        .loader-empire span:nth-child(2) { 
            animation-delay: 0.2s; 
            background: linear-gradient(135deg, var(--neon), #00cccc);
        }
        .loader-empire span:nth-child(3) { 
            animation-delay: 0.4s; 
            background: linear-gradient(135deg, var(--purple), #7b1fa2);
        }

        @keyframes bounceEmpire {
            to { 
                transform: translateY(-30px) scale(1.2); 
                opacity: 0.7;
            }
        }

        /* رسائل الخطأ */
        .error-empire {
            text-align: center;
            padding: 50px;
            background: rgba(255,68,68,0.1);
            border: 2px solid var(--red);
            border-radius: 40px;
            color: var(--red);
            font-size: 20px;
            margin: 30px 0;
            display: none;
            backdrop-filter: blur(5px);
        }

        /* الفوتر الإمبراطوري */
        .footer-empire {
            text-align: center;
            padding: 40px 0 20px;
            color: #8899aa;
            border-top: 2px solid rgba(255,215,0,0.2);
            margin-top: 50px;
            position: relative;
        }

        .footer-empire span {
            color: var(--gold);
            font-weight: bold;
            text-shadow: 0 0 10px rgba(255,215,0,0.5);
        }

        /* تحسينات للشاشات الصغيرة */
        @media (max-width: 600px) {
            body { padding: 10px; }
            
            .search-empire {
                border-radius: 30px;
            }
            
            .search-empire button {
                width: 100%;
                justify-content: center;
                margin: 5px 10px;
            }
            
            .results-grid-empire {
                grid-template-columns: 1fr;
            }
            
            .movie-meta-empire {
                justify-content: center;
            }
            
            .card-buttons-empire {
                flex-direction: column;
            }
            
            .suggestions-grid-empire {
                grid-template-columns: 1fr;
            }
            
            .imperial-header h1 {
                font-size: 32px;
            }
        }

        @media (min-width: 601px) and (max-width: 900px) {
            .results-grid-empire {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        /* تأثيرات إضافية */
        .glow-text {
            text-shadow: 0 0 10px currentColor;
        }
        
        .no-select {
            user-select: none;
        }
        
        /* شريط التمرير المخصص */
        ::-webkit-scrollbar {
            width: 10px;
        }
        
        ::-webkit-scrollbar-track {
            background: #1a1a2a;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, var(--gold), var(--neon));
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(to bottom, #ffaa00, #00cccc);
        }
    </style>
</head>
<body>
    <div class="imperial-header">
        <h1>👑 FADI CINEMA IMPERIAL</h1>
        <p>
            <span>🎬 السينما الإمبراطورية الذهبية</span>
            <span>•</span>
            <span>⚡ أكثر من 1000 فيلم</span>
            <span>•</span>
            <span>💎 بجودة 4K</span>
        </p>
    </div>

    <!-- البحث المتطور -->
    <div class="search-empire">
        <input type="text" id="searchInput" placeholder="🔍 اكتب اسم الفيلم، المسلسل، الممثل...">
        <button onclick="searchMovies()">
            <span>🔍</span> بحث في الإمبراطورية
        </button>
    </div>

    <!-- التصنيفات -->
    <div class="categories-empire" id="categories">
        <div class="cat-imperial active" onclick="filterCategory('الكل')">
            <span>🏠</span> الكل
        </div>
        <div class="cat-imperial" onclick="filterCategory('اكشن')">
            <span>🔫</span> اكشن
        </div>
        <div class="cat-imperial" onclick="filterCategory('رومانسي')">
            <span>❤️</span> رومانسي
        </div>
        <div class="cat-imperial" onclick="filterCategory('رعب')">
            <span>👻</span> رعب
        </div>
        <div class="cat-imperial" onclick="filterCategory('كوميدي')">
            <span>😂</span> كوميدي
        </div>
        <div class="cat-imperial" onclick="filterCategory('دراما')">
            <span>🎭</span> دراما
        </div>
        <div class="cat-imperial" onclick="filterCategory('خيال علمي')">
            <span>🚀</span> خيال علمي
        </div>
        <div class="cat-imperial" onclick="filterCategory('وثائقي')">
            <span>📽️</span> وثائقي
        </div>
    </div>

    <!-- مشغل الفيديو -->
    <div class="imperial-player" id="mainPlayer">
        <div class="player-header-empire">
            <span class="movie-info-empire" id="currentMovie">
                <span>🎬</span> جاري التشغيل...
            </span>
            <button class="close-player-empire" onclick="closePlayer()">✕</button>
        </div>
        <video id="videoPlayer" controls controlsList="nodownload">
            <source src="" type="video/mp4">
        </video>
    </div>

    <!-- مؤشر التحميل -->
    <div class="loader-empire" id="loader">
        <span></span>
        <span></span>
        <span></span>
        <p style="margin-top: 20px; color: var(--gold);">جاري البحث في الإمبراطورية...</p>
    </div>

    <!-- رسالة الخطأ -->
    <div class="error-empire" id="errorMsg">
        <span>😢</span> عفواً الإمبراطور! ما لقينا نتائج لهذا البحث
    </div>

    <!-- نتائج البحث -->
    <div id="results" class="results-grid-empire"></div>

    <!-- الاقتراحات الذكية -->
    <div class="suggestions-empire" id="suggestions" style="display: none;">
        <h3>
            <span>🤖</span> 
            اقتراحات ذكية للإمبراطور
            <span style="font-size: 14px; color: var(--neon);">(بناءً على بحثك)</span>
        </h3>
        <div class="suggestions-grid-empire" id="suggestionsList"></div>
    </div>

    <!-- الفوتر -->
    <div class="footer-empire">
        <p>تم التطوير بواسطة <span>الإمبراطور فادي</span> | جميع الحقوق محفوظة لجمهور الإمبراطورية ❤️</p>
        <p style="font-size: 12px; margin-top: 10px;">⭐ الإصدار 2.0 - الإمبراطورية الذهبية ⭐</p>
    </div>

    <script>
        // قاعدة بيانات الأفلام الموسعة
        const moviesDatabase = [
            {
                id: 1,
                title: "المهمة المستحيلة 7",
                site: "ايجي بست",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                quality: "4K HDR",
                size: "8.2 GB",
                year: "2024",
                category: "اكشن",
                rating: "9.2",
                description: "فيلم الأكشن المنتظر"
            },
            {
                id: 2,
                title: "البيت المسكون",
                site: "فاصل إعلاني",
                url: "https://commondatorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                downloadUrl: "https://commondatorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
                quality: "1080p",
                size: "2.1 GB",
                year: "2023",
                category: "رعب",
                rating: "7.8",
                description: "فيلم رعب نفسي"
            },
            {
                id: 3,
                title: "حب في روما",
                site: "موفيز لاند",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                quality: "4K",
                size: "5.5 GB",
                year: "2024",
                category: "رومانسي",
                rating: "8.9",
                description: "قصة حب إيطالية"
            },
            {
                id: 4,
                title: "العميل السري",
                site: "اكوام",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
                quality: "1080p",
                size: "3.2 GB",
                year: "2023",
                category: "اكشن",
                rating: "8.5",
                description: "فيلم تجسس وتشويق"
            },
            {
                id: 5,
                title: "عائلة فريزر",
                site: "سيما كلوب",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
                quality: "720p",
                size: "1.8 GB",
                year: "2024",
                category: "كوميدي",
                rating: "8.2",
                description: "كوميديا عائلية"
            },
            {
                id: 6,
                title: "الحرب الكونية",
                site: "ايجي بست",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
                quality: "4K HDR",
                size: "9.1 GB",
                year: "2024",
                category: "خيال علمي",
                rating: "9.5",
                description: "حرب بين المجرات"
            },
            {
                id: 7,
                title: "الغابة المحرمة",
                site: "موفيز فور يو",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
                quality: "1080p",
                size: "2.9 GB",
                year: "2023",
                category: "رعب",
                rating: "7.5",
                description: "رعب في الغابة"
            },
            {
                id: 8,
                title: "قصة الأمس",
                site: "بانيت",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
                quality: "4K",
                size: "4.8 GB",
                year: "2022",
                category: "دراما",
                rating: "8.7",
                description: "دراما اجتماعية"
            },
            {
                id: 9,
                title: "عالم الديناصورات",
                site: "نيتفليكس",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
                quality: "4K HDR",
                size: "7.3 GB",
                year: "2024",
                category: "وثائقي",
                rating: "9.0",
                description: "وثائقي عن الديناصورات"
            },
            {
                id: 10,
                title: "الرجل الأخير",
                site: "ايجي بست",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                quality: "1080p",
                size: "3.5 GB",
                year: "2023",
                category: "دراما",
                rating: "8.3",
                description: "دراما ما بعد نهاية العالم"
            },
            {
                id: 11,
                title: "الساحر الأخير",
                site: "فاصل إعلاني",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
                quality: "4K",
                size: "6.2 GB",
                year: "2024",
                category: "خيال علمي",
                rating: "8.8",
                description: "خيال علمي وسحر"
            },
            {
                id: 12,
                title: "أيام البرد",
                site: "سيما لايت",
                url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
                quality: "720p",
                size: "1.5 GB",
                year: "2022",
                category: "دراما",
                rating: "7.9",
                description: "دراما شتوية"
            }
        ];

        // متغيرات عامة
        let currentCategory = 'الكل';
        let currentResults = [];
        let allSearchResults = [];
        let currentVideo = null;

        // دالة البحث الرئيسية
        function searchMovies() {
            const query = document.getElementById('searchInput').value.trim();
            
            if (!query) {
                showNotification("يا إمبراطور اكتب اسم الفيلم أولاً!", "warning");
                return;
            }

            // إظهار مؤشر التحميل
            document.getElementById('loader').style.display = 'block';
            document.getElementById('results').innerHTML = '';
            document.getElementById('errorMsg').style.display = 'none';
            document.getElementById('suggestions').style.display = 'none';

            // محاكاة وقت البحث
            setTimeout(() => {
                document.getElementById('loader').style.display = 'none';
                
                const searchTerm = query.toLowerCase();
                
                // فلترة النتائج بذكاء
                currentResults = moviesDatabase.filter(movie => 
                    movie.title.toLowerCase().includes(searchTerm) ||
                    movie.category.toLowerCase().includes(searchTerm) ||
                    movie.description.toLowerCase().includes(searchTerm) ||
                    movie.year.includes(searchTerm) ||
                    movie.rating.includes(searchTerm)
                );

                // حفظ جميع نتائج البحث
                allSearchResults = [...currentResults];

                if (currentResults.length > 0) {
                    displayResults(currentResults);
                    showSmartSuggestions(searchTerm);
                    
                    // رسالة نجاح
                    showNotification(`تم العثور على ${currentResults.length} نتيجة`, "success");
                } else {
                    document.getElementById('errorMsg').style.display = 'block';
                    showSmartSuggestions(searchTerm, true);
                }
            }, 1500);
        }

        // عرض النتائج
        function displayResults(movies) {
            const container = document.getElementById('results');
            container.innerHTML = '';

            movies.forEach(movie => {
                const card = document.createElement('div');
                card.className = 'movie-card-empire';
                card.innerHTML = `
                    <span class="movie-site-empire">
                        <span>📺</span> ${movie.site} 
                        <span style="margin-right: 5px;">⭐</span> ${movie.rating}
                    </span>
                    <div class="movie-title-empire">${movie.title}</div>
                    <div class="movie-meta-empire">
                        <span class="quality-empire">
                            <span>🎥</span> ${movie.quality}
                        </span>
                        <span class="size-empire">
                            <span>💾</span> ${movie.size}
                        </span>
                        <span class="year-empire">
                            <span>📅</span> ${movie.year}
                        </span>
                        <span class="rating-empire">
                            <span>⭐</span> ${movie.rating}
                        </span>
                    </div>
                    <p style="color: #99aabb; font-size: 14px; margin-bottom: 15px;">${movie.description}</p>
                    <div class="card-buttons-empire">
                        <button class="watch-btn-empire" onclick="watchMovie('${movie.url}', '${movie.title}')">
                            <span>▶️</span> مشاهدة
                        </button>
                        <button class="download-btn-empire" onclick="downloadMovie('${movie.downloadUrl}', '${movie.title}')">
                            <span>⬇️</span> تحميل
                        </button>
                    </div>
                `;
                container.appendChild(card);
            });

            // تحديث عدد النتائج
            updateResultsCount(movies.length);
        }

        // تحديث عداد النتائج
        function updateResultsCount(count) {
            const header = document.querySelector('.imperial-header p');
            if (header) {
                const countSpan = document.createElement('span');
                countSpan.style.background = 'rgba(255,215,0,0.2)';
                countSpan.style.padding = '3px 15px';
                countSpan.style.borderRadius = '20px';
                countSpan.style.marginRight = '10px';
                countSpan.innerHTML = `🔍 ${count} نتيجة`;
                
                // إزالة القديم إذا وجد
                const oldCount = header.querySelector('.result-count');
                if (oldCount) oldCount.remove();
                
                countSpan.className = 'result-count';
                header.appendChild(countSpan);
            }
        }

        // مشاهدة الفيلم
        function watchMovie(url, title) {
            if (!url) {
                showNotification("عذراً، رابط المشاهدة غير متاح", "error");
                return;
            }

            // إيقاف أي فيديو سابق
            if (currentVideo) {
                currentVideo.pause();
            }

            const player = document.getElementById('mainPlayer');
            const video = document.getElementById('videoPlayer');
            const currentMovie = document.getElementById('currentMovie');
            
            video.src = url;
            currentVideo = video;
            currentMovie.innerHTML = `<span>🎬</span> الآن: ${title}`;
            player.style.display = 'block';
            
            // التمرير للمشغل
            player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // محاولة التشغيل التلقائي
            video.play().catch(e => {
                console.log("التشغيل التلقائي محظور", e);
                showNotification("اضغط على تشغيل لبدء الفيلم", "info");
            });
        }

        // تحميل الفيلم
        function downloadMovie(url, title) {
            if (!url) {
                showNotification("عذراً، رابط التحميل غير متاح", "error");
                return;
            }

            // محاكاة تحميل
            showNotification(`🚀 جاري تجهيز ${title} للتحميل...`, "info");
            
            // فتح الرابط في نافذة جديدة
            setTimeout(() => {
                window.open(url, '_blank');
            }, 1500);
        }

        // إغلاق المشغل
        function closePlayer() {
            const player = document.getElementById('mainPlayer');
            const video = document.getElementById('videoPlayer');
            
            player.style.display = 'none';
            video.pause();
            video.src = '';
            currentVideo = null;
        }

        // فلترة حسب التصنيف
        function filterCategory(category) {
            currentCategory = category;
            
            // تحديث الأزرار
            document.querySelectorAll('.cat-imperial').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent.includes(category)) {
                    btn.classList.add('active');
                }
            });

            // تحديد مصدر الفلترة
            const sourceToFilter = allSearchResults.length > 0 ? allSearchResults : moviesDatabase;

            if (category === 'الكل') {
                displayResults(sourceToFilter);
            } else {
                const filtered = sourceToFilter.filter(movie => movie.category === category);
                if (filtered.length > 0) {
                    displayResults(filtered);
                } else {
                    showNotification(`لا توجد أفلام ${category} في النتائج`, "warning");
                    displayResults(sourceToFilter);
                }
            }
        }

        // اقتراحات ذكية متطورة
        function showSmartSuggestions(searchTerm, noResults = false) {
            const suggestions = [];
            
            if (noResults) {
                // اقتراحات عشوائية من جميع الأفلام
                const shuffled = [...moviesDatabase].sort(() => 0.5 - Math.random());
                suggestions.push(...shuffled.slice(0, 6));
            } else {
                // فلترة ذكية حسب كلمة البحث
                const searchLower = searchTerm.toLowerCase();
                
                // كلمات مفتاحية للتصنيفات
                const categoriesMap = {
                    'اكشن': ['اكشن', 'action', 'قتال', 'حرب', 'مطاردة'],
                    'رومانسي': ['رومانسي', 'حب', 'عشق', 'romantic', 'love'],
                    'رعب': ['رعب', 'خوف', 'horror', ' scary'],
                    'كوميدي': ['كوميدي', 'ضحك', 'comedy', 'funny'],
                    'دراما': ['دراما', 'drama', 'حزين'],
                    'خيال علمي': ['خيال', 'علمي', 'فضاء', 'sci-fi', '科幻']
                };

                // البحث في الخريطة
                for (let [cat, keywords] of Object.entries(categoriesMap)) {
                    if (keywords.some(k => searchLower.includes(k))) {
                        suggestions.push(...moviesDatabase.filter(m => m.category === cat));
                        break;
                    }
                }

                // إذا ما لقينا اقتراحات، نجيب من نفس تصنيف أول نتيجة
                if (suggestions.length === 0 && currentResults.length > 0) {
                    const firstCategory = currentResults[0].category;
                    suggestions.push(...moviesDatabase.filter(m => 
                        m.category === firstCategory && 
                        !currentResults.some(r => r.id === m.id)
                    ));
                }

                // نضيف بعض الاقتراحات الإضافية
                if (suggestions.length < 4) {
                    const additional = moviesDatabase
                        .filter(m => !suggestions.some(s => s.id === m.id))
                        .sort(() => 0.5 - Math.random())
                        .slice(0, 6 - suggestions.length);
                    suggestions.push(...additional);
                }
            }

            // إزالة التكرارات
            const uniqueSuggestions = suggestions.filter((movie, index, self) =>
                index === self.findIndex(m => m.id === movie.id)
            ).slice(0, 6);

            if (uniqueSuggestions.length > 0) {
                const suggestionsDiv = document.getElementById('suggestions');
                const suggestionsList = document.getElementById('suggestionsList');
                
                suggestionsList.innerHTML = '';
                uniqueSuggestions.forEach(movie => {
                    const item = document.createElement('div');
                    item.className = 'suggestion-item-empire';
                    item.innerHTML = `
                        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${movie.title}</div>
                        <div style="display: flex; gap: 5px; flex-wrap: wrap; color: #99aabb; font-size: 12px;">
                            <span style="background: rgba(155,48,255,0.3); padding: 2px 8px; border-radius: 12px;">${movie.category}</span>
                            <span style="background: rgba(0,255,255,0.3); padding: 2px 8px; border-radius: 12px;">${movie.quality}</span>
                            <span style="background: rgba(255,215,0,0.3); padding: 2px 8px; border-radius: 12px;">⭐ ${movie.rating}</span>
                        </div>
                        <div style="font-size: 12px; color: var(--neon); margin-top: 10px;">اضغط للمشاهدة</div>
                    `;
                    item.onclick = () => watchMovie(movie.url, movie.title);
                    suggestionsList.appendChild(item);
                });
                
                suggestionsDiv.style.display = 'block';
            }
        }

        // نظام الإشعارات
        function showNotification(message, type = "info") {
            // إنشاء عنصر الإشعار
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'success' ? 'linear-gradient(135deg, #00ff00, #00aa00)' : 
                              type === 'warning' ? 'linear-gradient(135deg, #ffaa00, #ff6600)' :
                              type === 'error' ? 'linear-gradient(135deg, #ff4444, #ff0000)' :
                              'linear-gradient(135deg, #00ffff, #0088ff)'};
                color: ${type === 'success' ? 'black' : 'white'};
                padding: 15px 30px;
                border-radius: 50px;
                font-weight: bold;
                z-index: 9999;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                border: 2px solid ${type === 'success' ? '#00ff00' : 
                                     type === 'warning' ? '#ffaa00' : 
                                     type === 'error' ? '#ff4444' : '#00ffff'};
                backdrop-filter: blur(10px);
                animation: slideDown 0.3s ease;
                text-align: center;
                direction: rtl;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            // إزالة الإشعار بعد 3 ثواني
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        // إضافة تأثيرات CSS إضافية
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // تشغيل بحث افتراضي عند تحميل الصفحة
        window.onload = () => {
            document.getElementById('searchInput').value = "اكشن";
            setTimeout(searchMovies, 500);
        };

        // البحث عند الضغط على Enter
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchMovies();
            }
        });

        // إحصائيات سريعة
        console.log('🚀 الإمبراطورية جاهزة للانطلاق!');
        console.log(`📊 إجمالي الأفلام: ${moviesDatabase.length}`);
        console.log('👑 بإشراف الإمبراطور فادي');
    </script>
</body>
</html>
