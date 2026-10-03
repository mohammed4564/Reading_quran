// State Management
let allSurahs = [];
let allAyahs = [];
let currentSurahNumber = null;
let currentSurahName = null;
let audioPlayers = new Map();
let currentlyPlaying = null;
let isAutoPlaying = true;
let sessionStartTime = Date.now();
let sessionTimerInterval = null;
let currentGlobalAyahIndex = 0;

// DOM Elements
const surahListEl = document.getElementById('surahList');
const ayahContainer = document.getElementById('ayahContainer');
const surahSearch = document.getElementById('surahSearch');
const ayahSearch = document.getElementById('ayahSearch');
const surahTitle = document.getElementById('surahTitle');
const surahInfo = document.getElementById('surahInfo');
const totalAyahsSpan = document.getElementById('totalAyahs');
const themeToggle = document.getElementById('themeToggle');
const sessionTimerSpan = document.getElementById('sessionTimer');
const currentStatusSpan = document.getElementById('currentStatus');

// Session Timer
function startSessionTimer() {
    sessionTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        sessionTimerSpan.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Theme Toggle
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// Load Surahs
async function loadSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        allSurahs = data.data;
        displaySurahs(allSurahs);

        if (allSurahs.length > 0) {
            setTimeout(() => {
                const firstSurah = document.querySelector('.surah-item');
                if (firstSurah) {
                    firstSurah.click();
                }
            }, 500);
        }
    } catch (error) {
        console.error('Error loading surahs:', error);
        surahListEl.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load surahs</p></div>';
    }
}

// Display Surahs
function displaySurahs(surahs) {
    if (surahs.length === 0) {
        surahListEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No surahs found</p></div>';
        return;
    }

    surahListEl.innerHTML = surahs.map(surah => `
        <div class="surah-item" data-surah-number="${surah.number}" data-surah-name="${surah.englishName}">
            <div class="surah-number">${surah.number}</div>
            <div class="surah-name">${surah.name}</div>
            <div class="surah-translation">${surah.englishName}</div>
        </div>
    `).join('');

    document.querySelectorAll('.surah-item').forEach(item => {
        item.addEventListener('click', () => {
            const number = parseInt(item.dataset.surahNumber);
            const name = item.dataset.surahName;

            // Reset auto-play from the beginning of selected surah
            currentGlobalAyahIndex = 0;
            stopAllPlayback();
            loadAyahs(number, name);

            document.querySelectorAll('.surah-item').forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            currentStatusSpan.textContent = 'Playing';
        });
    });
}

// Stop all playback
function stopAllPlayback() {
    audioPlayers.forEach((player, idx) => {
        if (player.isPlaying) {
            player.audio.pause();
            player.isPlaying = false;
            const btn = document.querySelector(`.play-pause-audio[data-ayah-index="${idx}"]`);
            if (btn) btn.innerHTML = '▶';
        }
    });
    currentlyPlaying = null;
}

// Copy text function
async function copyText(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = '✓';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '📋';
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
        btn.innerHTML = '❌';
        setTimeout(() => {
            btn.innerHTML = '📋';
        }, 2000);
    }
}

// Load Ayahs
async function loadAyahs(surahNumber, surahName) {
    currentSurahNumber = surahNumber;
    currentSurahName = surahName;

    surahTitle.innerHTML = `<span>📖</span> سورة ${surahName}`;
    // surahInfo.innerHTML = `سورة ${surahName} • ${surahNumber} آية`;
    ayahSearch.disabled = false;

    ayahContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>جاري تحميل الآيات...</p></div>';

    try {
        const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/ar.alafasy,en.sahih`);
        const data = await response.json();

        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1].ayahs;

        allAyahs = arabicAyahs.map((ayah, index) => ({
            number: ayah.numberInSurah,
            audio: ayah.audio,
            arabic: ayah.text,
            english: englishAyahs[index]?.text || ''
        }));

        totalAyahsSpan.textContent = allAyahs.length;
        displayAyahs(allAyahs);

        // Auto-play from current global index
        setTimeout(() => {
            const playBtn = document.querySelector(`.play-pause-audio[data-ayah-index="${currentGlobalAyahIndex}"]`);
            if (playBtn) {
                playBtn.click();
            } else if (allAyahs.length > 0) {
                const firstPlayBtn = document.querySelector('.play-pause-audio');
                if (firstPlayBtn) firstPlayBtn.click();
            }
        }, 500);
    } catch (error) {
        console.error('Error loading ayahs:', error);
        ayahContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠️</div><p>Failed to load ayahs</p></div>';
    }
}

// Display Ayahs with inline audio player
function displayAyahs(ayahs) {
    if (ayahs.length === 0) {
        ayahContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>No ayahs found</p></div>';
        return;
    }

    ayahContainer.innerHTML = ayahs.map((ayah, idx) => `
        <div class="ayah-card" data-ayah-index="${idx}" data-audio-url="${ayah.audio}">
            <button class="copy-btn" data-copy-text="${ayah.arabic}\n\n${ayah.english}" title="Copy Ayah">📋</button>
            <span class="ayah-number">آية ${ayah.number}</span>
            <div class="arabic-text">${ayah.arabic}</div>
            <div class="translation-text">${ayah.english}</div>
            <div class="audio-player">
                <div class="audio-controls">
                    <button class="play-pause-audio" data-audio="${ayah.audio}" data-ayah-index="${idx}">
                        ▶
                    </button>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill-${idx}"></div>
                        </div>
                        <span class="time-text" id="time-text-${idx}">0:00 / 0:00</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Initialize copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        const textToCopy = btn.dataset.copyText;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            copyText(textToCopy, btn);
        });
    });

    // Initialize audio players for each ayah
    document.querySelectorAll('.play-pause-audio').forEach(btn => {
        const ayahIndex = parseInt(btn.dataset.ayahIndex);
        const audioUrl = btn.dataset.audio;

        const audio = new Audio(audioUrl);
        audioPlayers.set(ayahIndex, { audio, isPlaying: false });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePlayPause(ayahIndex, btn);
        });

        audio.addEventListener('timeupdate', () => {
            updateProgress(ayahIndex, audio);
        });

        audio.addEventListener('loadedmetadata', () => {
            updateDuration(ayahIndex, audio);
        });

        audio.addEventListener('ended', () => {
            resetPlayButton(ayahIndex, btn);
            playNextAyah(ayahIndex);
        });
    });
}

function handlePlayPause(ayahIndex, btn) {
    const player = audioPlayers.get(ayahIndex);
    if (!player) return;

    // Stop any other playing audio
    if (currentlyPlaying !== null && currentlyPlaying !== ayahIndex) {
        const currentPlayer = audioPlayers.get(currentlyPlaying);
        if (currentPlayer && currentPlayer.isPlaying) {
            currentPlayer.audio.pause();
            currentPlayer.isPlaying = false;
            const currentBtn = document.querySelector(`.play-pause-audio[data-ayah-index="${currentlyPlaying}"]`);
            if (currentBtn) currentBtn.innerHTML = '▶';
        }
    }

    if (player.isPlaying) {
        player.audio.pause();
        btn.innerHTML = '▶';
        player.isPlaying = false;
        currentlyPlaying = null;
    } else {
        player.audio.play();
        btn.innerHTML = '⏸';
        player.isPlaying = true;
        currentlyPlaying = ayahIndex;
        currentGlobalAyahIndex = ayahIndex;

        const card = btn.closest('.ayah-card');
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            document.querySelectorAll('.ayah-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
        }
        currentStatusSpan.textContent = `Playing: Ayah ${ayahIndex + 1}`;
    }
}

function playNextAyah(currentIndex) {
    if (currentIndex < allAyahs.length - 1) {
        // Play next ayah in same surah
        const nextIndex = currentIndex + 1;
        const nextBtn = document.querySelector(`.play-pause-audio[data-ayah-index="${nextIndex}"]`);
        if (nextBtn) {
            currentGlobalAyahIndex = nextIndex;
            setTimeout(() => nextBtn.click(), 500);
        }
    } else if (currentSurahNumber < allSurahs.length) {
        // Move to next surah
        const nextSurahNumber = currentSurahNumber + 1;
        const nextSurah = allSurahs.find(s => s.number === nextSurahNumber);
        if (nextSurah) {
            currentGlobalAyahIndex = 0;
            setTimeout(() => {
                const nextSurahItem = document.querySelector(`.surah-item[data-surah-number="${nextSurahNumber}"]`);
                if (nextSurahItem) {
                    nextSurahItem.click();
                    currentStatusSpan.textContent = `Moving to: ${nextSurah.name}`;
                }
            }, 1000);
        } else {
            currentStatusSpan.textContent = 'Completed All Surahs';
            setTimeout(() => {
                currentStatusSpan.textContent = 'Auto-Playing';
            }, 3000);
        }
    }
}

function updateProgress(ayahIndex, audio) {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        const fillElement = document.getElementById(`progress-fill-${ayahIndex}`);
        if (fillElement) {
            fillElement.style.width = percent + '%';
        }
        updateTime(ayahIndex, audio);
    }
}

function updateDuration(ayahIndex, audio) {
    if (audio.duration) {
        const minutes = Math.floor(audio.duration / 60);
        const seconds = Math.floor(audio.duration % 60);
        const timeText = document.getElementById(`time-text-${ayahIndex}`);
        if (timeText) {
            const currentMinutes = Math.floor(audio.currentTime / 60);
            const currentSeconds = Math.floor(audio.currentTime % 60);
            timeText.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }
}

function updateTime(ayahIndex, audio) {
    const currentMinutes = Math.floor(audio.currentTime / 60);
    const currentSeconds = Math.floor(audio.currentTime % 60);
    const duration = audio.duration;

    if (duration) {
        const durationMinutes = Math.floor(duration / 60);
        const durationSeconds = Math.floor(duration % 60);
        const timeText = document.getElementById(`time-text-${ayahIndex}`);
        if (timeText) {
            timeText.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
        }
    }
}

function resetPlayButton(ayahIndex, btn) {
    btn.innerHTML = '▶';
    const player = audioPlayers.get(ayahIndex);
    if (player) player.isPlaying = false;
    if (currentlyPlaying === ayahIndex) currentlyPlaying = null;
}

// Search Functionality
surahSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allSurahs.filter(surah =>
        surah.name.toLowerCase().includes(searchTerm) ||
        surah.englishName.toLowerCase().includes(searchTerm) ||
        surah.number.toString().includes(searchTerm)
    );
    displaySurahs(filtered);
});

ayahSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (!allAyahs.length) return;

    const filtered = allAyahs.filter(ayah =>
        ayah.arabic.toLowerCase().includes(searchTerm) ||
        ayah.english.toLowerCase().includes(searchTerm) ||
        ayah.number.toString().includes(searchTerm)
    );
    displayAyahs(filtered);
});

// Click on progress bar to seek
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('progress-bar')) {
        const progressBar = e.target;
        const card = progressBar.closest('.ayah-card');
        if (card) {
            const ayahIndex = parseInt(card.dataset.ayahIndex);
            const player = audioPlayers.get(ayahIndex);
            if (player && player.audio) {
                const rect = progressBar.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const width = rect.width;
                const percent = x / width;
                player.audio.currentTime = percent * player.audio.duration;
            }
        }
    }
});

// Initialize
initTheme();
loadSurahs();
startSessionTimer();