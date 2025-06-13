document.addEventListener('DOMContentLoaded', () => {
    // --- Konfigurasi API ---
    const GEMINI_API_KEY = ""; // Disediakan oleh environment, biarkan kosong.
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    // !! PENTING !! Ganti nilai di bawah ini dengan kredensial Anda sendiri
    // !! dari Google Cloud Console agar fitur Google Drive berfungsi.
    const GOOGLE_CLIENT_ID = '719464254563-lanu41fmths6824822jgese38lusrcum.apps.googleusercontent.com'; 
    const GOOGLE_API_KEY = 'AIzaSyDREGjfiQyBm2P7t9J5JdHARC1G2tBkrg8'; // Bisa sama dengan GEMINI_API_KEY jika dari project yang sama
    
    const SCOPES = 'https://www.googleapis.com/auth/drive.file';

    // --- Data Aplikasi ---
   const playlist = [
    { 
        title: "All I Want", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/3HHqVJHqwgkxWhOQ4MhLB6?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    },
    { 
        title: "It's You", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/0NlGoUyOJSuSHmngoibVAs?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    },
    { 
        title: "Don't You Remember", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/1CRtJS94Hq3PbBZT9LuF90?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    },
    { 
        title: "Here With Me", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/5LrN7yUQAzvthd4QujgPFr?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    },
    { 
        title: "If I Knew", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/7lXOqE38eCr979gp27O5wr?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    },
    { 
        title: "Walking Back Home", 
        spotifyEmbed: '<iframe style="border-radius:12px" src="https://open.spotify.com/embed/track/7lu5yyLdgRTMTnYw8yCWvM?utm_source=generator&theme=0" width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>' 
    }
];

    const galleryImages = [
        { src: "https://placehold.co/600x600/000000/FFFFFF?text=1" }, 
        { src: "https://placehold.co/600x600/1a1a1a/FFFFFF?text=2" },
        { src: "https://placehold.co/600x600/333333/FFFFFF?text=3" }
    ];
    const SYSTEM_INSTRUCTION = { "role": "system", "parts": [{ "text": "Kamu adalah 'Kaii-Bot', asisten AI pribadi yang santai, sedikit puitis, dan selalu merespons dengan gaya teman akrab. Gunakan bahasa Indonesia yang kasual dan modern." }] };

    // --- Referensi Elemen & Variabel ---
    let tokenClient, gapiInited = false, gisInited = false;
    const scrollContainer = document.getElementById('scroll-container');
    const playlistWrapper = document.getElementById('playlist-wrapper');
    const galleryGrid = document.getElementById('gallery-grid');
    const lyricsDisplay = document.getElementById('lyrics-display');
    const lyricsContent = document.getElementById('lyrics-content');
    const backHomeLink = document.getElementById('back-home-link');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const authorizeButton = document.getElementById('authorize_button');
    const signoutButton = document.getElementById('signout_button');
    const saveChatButton = document.getElementById('save_chat_button');
    const authStatus = document.getElementById('auth-status');
    let chatHistory = []; 
    let currentSongIndex = -1;
    let isPlaying = false;
    let lyricInterval;

    // --- Populasi Konten ---
    function populatePlaylist() {
        playlist.forEach((song) => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `<div class="playlist-card rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl"><img src="${song.art}" alt="${song.title}" class="w-full h-full rounded-lg object-cover"><h3 class="absolute bottom-24 text-2xl font-bold truncate w-full px-6">${song.title}</h3><p class="absolute bottom-16 text-md opacity-70">${song.artist}</p><button class="play-btn absolute bottom-4 bg-white text-black rounded-full p-4 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><i data-feather="play" class="w-6 h-6"></i></button></div>`;
            playlistWrapper.appendChild(slide);
        });
    }
    function populateGallery() {
        galleryImages.forEach(img => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="${img.src}" class="w-full h-full object-cover rounded-lg">`;
            galleryGrid.appendChild(item);
        });
    }

    // --- Logika Swiper & Playlist ---
    const swiper = new Swiper('.swiper', {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        loop: true,
        coverflowEffect: {
          rotate: 0,
          stretch: 0,
          depth: 300,
          modifier: 1,
          slideShadows: false
        },
        on: {
            progress: (s, progress) => {
                for (let i = 0; i < s.slides.length; i++) {
                    const slide = s.slides[i];
                    const slideProgress = slide.progress;
                    const scale = 1 - Math.abs(slideProgress) * 0.2;
                    const rotateY = -slideProgress * 45;
                    const opacity = 1 - Math.pow(Math.abs(slideProgress), 2);
                    const filter = `blur(${Math.abs(slideProgress) * 3}px)`;
                    slide.style.transform = `perspective(1000px) scale(${scale}) rotateY(${rotateY}deg)`;
                    slide.style.opacity = opacity;
                    slide.style.filter = filter;
                    slide.style.zIndex = Math.floor(100 - Math.abs(slideProgress * 100));
                }
            },
            setTransition: (s, duration) => {
                s.slides.forEach(slide => slide.style.transitionDuration = `${duration}ms`);
            },
            slideChange: () => {
                if (isPlaying) pauseSong();
                updatePlayButtons();
                lyricsDisplay.classList.remove('visible');
            },
        }
    });
    function updatePlayButtons() {
        document.querySelectorAll('.swiper-slide').forEach(slide => {
            slide.querySelector('.play-btn').disabled = !slide.classList.contains('swiper-slide-active');
        });
    }
    playlistWrapper.addEventListener('click', (e) => {
        const playButton = e.target.closest('.play-btn');
        if (playButton) {
            const slide = e.target.closest('.swiper-slide');
            if (slide && slide.classList.contains('swiper-slide-active')) {
                const realIndex = swiper.realIndex;
                if (isPlaying && currentSongIndex === realIndex) pauseSong(); else playSong(realIndex);
            }
        }
    });
    function playSong(index) {
        if(isPlaying) pauseSong();
        currentSongIndex = index; isPlaying = true;
        const activeSlide = document.querySelector(`.swiper-slide[data-swiper-slide-index="${index}"]`);
        if(activeSlide) {
            const buttonIcon = activeSlide.querySelector('.play-btn i');
            buttonIcon.setAttribute('data-feather', 'pause');
            feather.replace();
        }
        lyricsDisplay.classList.add('visible');
        startLyricSync();
    }
    function pauseSong() {
        const activeSlide = document.querySelector(`.swiper-slide[data-swiper-slide-index="${currentSongIndex}"]`);
        if(activeSlide){
            const buttonIcon = activeSlide.querySelector('.play-btn i');
            buttonIcon.setAttribute('data-feather', 'play');
            feather.replace();
        }
        isPlaying = false; clearInterval(lyricInterval); currentSongIndex = -1;
    }
    function startLyricSync() {
        const currentLyrics = playlist[currentSongIndex].lyrics;
        let lyricIndex = 0;
        updateLyricLine(currentLyrics[lyricIndex].text, false);
        lyricInterval = setInterval(() => {
            lyricIndex = (lyricIndex + 1) % currentLyrics.length;
            updateLyricLine(currentLyrics[lyricIndex].text, true);
        }, 3000);
    }
    function updateLyricLine(text, animateOldLineOut) {
        const oldLine = lyricsContent.querySelector('.lyric-line.active');
        if (oldLine && animateOldLineOut) {
            oldLine.classList.remove('active');
            oldLine.classList.add('exit');
            oldLine.addEventListener('transitionend', () => oldLine.remove());
        } else if (oldLine) {
            oldLine.remove();
        }
        const newLine = document.createElement('p');
        newLine.textContent = text;
        newLine.className = 'lyric-line';
        lyricsContent.appendChild(newLine);
        setTimeout(() => newLine.classList.add('active'), 50);
    }

    // --- Logika Chat & Google Drive ---
    function gapiLoaded() { gapi.load('client', initializeGapiClient); }
    async function initializeGapiClient() {
        if (GOOGLE_API_KEY === 'YOUR_GOOGLE_API_KEY') {
            console.error("Google API Key is not set. Please update it in the code.");
            authStatus.textContent = "Google API Key missing.";
            return;
        }
        await gapi.client.init({ apiKey: GOOGLE_API_KEY, discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"] });
        gapiInited = true; maybeEnableButtons();
    }
    function gisLoaded() {
        if (GOOGLE_CLIENT_ID === 'YOUR_CLIENT_ID.apps.googleusercontent.com') {
            console.error("Google Client ID is not set. Please update it in the code.");
            authStatus.textContent = "Google Client ID missing.";
            return;
        }
        tokenClient = google.accounts.oauth2.initTokenClient({ client_id: GOOGLE_CLIENT_ID, scope: SCOPES, callback: '' });
        gisInited = true; maybeEnableButtons();
    }
    function maybeEnableButtons() { if (gapiInited && gisInited) authorizeButton.style.visibility = 'visible'; }
    function handleAuthClick() {
        tokenClient.callback = async (resp) => {
            if (resp.error) throw (resp);
            updateUiWithAuthState(true);
            saveChatButton.disabled = false;
            gapi.client.setToken(resp);
        };
        if (!gapi.client.getToken()) tokenClient.requestAccessToken({ prompt: 'consent' });
        else tokenClient.requestAccessToken({ prompt: '' });
    }
    function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            updateUiWithAuthState(false);
            saveChatButton.disabled = true;
        }
    }
    function updateUiWithAuthState(isSignedIn) {
        authorizeButton.style.display = isSignedIn ? 'none' : 'block';
        signoutButton.style.display = isSignedIn ? 'block' : 'none';
        authStatus.textContent = isSignedIn ? "Signed in to Google." : "Sign in to save chat.";
    }
    const gapiScript = document.createElement('script'); gapiScript.src = 'https://apis.google.com/js/api.js'; gapiScript.async = true; gapiScript.defer = true; gapiScript.onload = gapiLoaded; document.body.appendChild(gapiScript);
    const gisScript = document.createElement('script'); gisScript.src = 'https://accounts.google.com/gsi/client'; gisScript.async = true; gisScript.defer = true; gisScript.onload = gisLoaded; document.body.appendChild(gisScript);
    
    function appendMessage(sender, text, isLoading = false) {
        const bubble = document.createElement('div');
        bubble.classList.add('chat-bubble', sender);
        if (isLoading) {
            bubble.classList.add('loading'); bubble.id = 'loading-bubble';
            bubble.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
        } else {
            bubble.textContent = text;
            if (sender === 'user' || (sender === 'model' && text !== "Halo! Silakan login dengan Google untuk menyimpan riwayat chat.")) {
                 if (chatHistory.length > 12) {
                    chatHistory.splice(0, 2); 
                }
                chatHistory.push({role: sender, parts: [{text}]});
            }
        }
        chatMessages.appendChild(bubble);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    async function handleChatSubmit(e) {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (!userMessage) return;
        appendMessage('user', userMessage);
        chatInput.value = '';
        appendMessage('model', '', true);
        try {
            const payload = { contents: [SYSTEM_INSTRUCTION, ...chatHistory] };
            const response = await fetch(GEMINI_API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            const aiMessage = result.candidates[0].content.parts[0].text;
            document.getElementById('loading-bubble')?.remove();
            appendMessage('model', aiMessage);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            document.getElementById('loading-bubble')?.remove();
            appendMessage('model', "Maaf, terjadi kesalahan. Coba lagi.");
        }
    }
    async function saveChatToDrive() {
        if (!gapi.client.getToken()) { alert("Please sign in with Google first."); handleAuthClick(); return; }
        let chatText = `Riwayat Chat AI - Kaii's Corner\nDisimpan pada: ${new Date().toLocaleString('id-ID')}\n\n---\n\n`;
        chatText += `Instruksi Sistem: ${SYSTEM_INSTRUCTION.parts[0].text}\n\n---\n\n`;
        chatHistory.forEach(entry => {
            if(entry.role !== 'system') chatText += `${entry.role === 'user' ? 'Anda' : 'AI'}: ${entry.parts[0].text}\n\n`;
        });
        const fileMetadata = { name: `Chat History ${new Date().toISOString()}.txt`, mimeType: 'text/plain' };
        const boundary = '-------314159265358979323846', delimiter = `\r\n--${boundary}\r\n`, close_delim = `\r\n--${boundary}--`;
        const multipartRequestBody = delimiter + `Content-Type: application/json\r\n\r\n${JSON.stringify(fileMetadata)}${delimiter}Content-Type: ${fileMetadata.mimeType}\r\n\r\n${chatText}${close_delim}`;
        try {
            await gapi.client.request({ path: '/upload/drive/v3/files', method: 'POST', params: {'uploadType': 'multipart'}, headers: {'Content-Type': `multipart/related; boundary="${boundary}"`}, body: multipartRequestBody });
            alert('Chat berhasil disimpan ke Google Drive Anda!');
        } catch(err) { console.error("Error saving to Drive: ", err); alert('Gagal menyimpan chat.'); }
    }
    chatForm.addEventListener('submit', handleChatSubmit);
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    saveChatButton.onclick = saveChatToDrive;

    // --- Inisialisasi Akhir ---
    const screenObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => entry.target.classList.toggle('is-visible', entry.isIntersecting));
    }, { threshold: 0.5 });
    document.querySelectorAll('.screen').forEach(screen => screenObserver.observe(screen));
    backHomeLink.addEventListener('click', () => scrollContainer.scrollTo({ top: 0, behavior: 'smooth' }));
    
    populatePlaylist();
    populateGallery();
    feather.replace();
    updatePlayButtons();
});
