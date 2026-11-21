/**
 * Hikayat Marakarma (Bagian 1) - Interactive 8-Bit Animated Cinema Engine
 * Palette:
 *   Saffron:      #F8C662 (Dark Gold: #C9932E)
 *   Ultra Violet: #595082 (Light: #7B71AD)
 *   Dark Purple:  #2C263F (Deep: #1B1729)
 *   Hunter Green: #41644A (Light: #5A8866)
 *   Dark Green:   #213722
 *   Cream:        #FFF7E0
 */
(function () {
    'use strict';

    const PAL = {
        saffron: '#F8C662',
        saffronDark: '#C9932E',
        violet: '#595082',
        violetLight: '#7B71AD',
        purple: '#2C263F',
        purpleDeep: '#1B1729',
        green: '#41644A',
        greenLight: '#5A8866',
        greenDark: '#213722',
        cream: '#FFF7E0',
        lavender: '#C7C0DE',
        skin: '#E8B88A',
        danger: '#E05A5A',
    };

    class RetroAudio {
        constructor() {
            this.ctx = null;
            this.enabled = true;
            this.bgmTimer = null;
            this.noteIndex = 0;
        }

        ensureCtx() {
            if (!this.enabled) return null;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return null;
            if (!this.ctx) {
                this.ctx = new AudioCtx();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
            return this.ctx;
        }

        tone(freq, duration, type = 'square', volume = 0.04, delay = 0) {
            const ctx = this.ensureCtx();
            if (!ctx || !this.enabled) return;
            const now = ctx.currentTime + delay;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(volume, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + duration + 0.02);
        }

        blip() {
            this.tone(540 + Math.random() * 70, 0.035, 'square', 0.018);
        }

        click() {
            this.tone(440, 0.05, 'square', 0.035);
            this.tone(660, 0.06, 'square', 0.035, 0.04);
        }

        heal() {
            [392, 493.88, 587.33, 783.99].forEach((f, i) => {
                this.tone(f, 0.12, 'triangle', 0.05, i * 0.07);
            });
        }

        dig() {
            this.tone(140, 0.08, 'sawtooth', 0.05);
            this.tone(100, 0.1, 'triangle', 0.04, 0.05);
        }

        coin() {
            [659.25, 830.61, 987.77, 1318.51].forEach((f, i) => {
                this.tone(f, 0.14, 'square', 0.045, i * 0.08);
            });
        }

        fanfare() {
            const seq = [
                [523.25, 0.12, 0],
                [659.25, 0.12, 0.12],
                [783.99, 0.12, 0.24],
                [1046.5, 0.28, 0.36],
                [783.99, 0.12, 0.66],
                [1046.5, 0.4, 0.78],
            ];
            seq.forEach(([f, d, dl]) => this.tone(f, d, 'square', 0.045, dl));
        }

        startBGM() {
            if (this.bgmTimer || !this.enabled) return;
            // Gentle Nusantara Slendro-feel 8-bit loop
            const melody = [261.63, 293.66, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66];
            this.bgmTimer = setInterval(() => {
                if (!this.enabled) return;
                const freq = melody[this.noteIndex % melody.length];
                this.tone(freq, 0.28, 'triangle', 0.018);
                this.noteIndex++;
            }, 520);
        }

        stopBGM() {
            if (this.bgmTimer) {
                clearInterval(this.bgmTimer);
                this.bgmTimer = null;
            }
        }

        toggle() {
            this.enabled = !this.enabled;
            if (!this.enabled) {
                this.stopBGM();
            } else {
                this.ensureCtx();
                this.click();
                this.startBGM();
            }
            return this.enabled;
        }
    }

    const SCENES = [
        {
            id: 1,
            title: 'Babak 1.1: Kerajaan Ananta Beranta',
            speaker: 'NARATOR',
            portrait: '📜',
            text:
                'Di Kerajaan Ananta Beranta yang megah, hidup pasangan Si Miskin yang terkena sumpah Batara Indera. ' +
                'Kerap terusir ke rimba, Si Miskin tetap tabah merawat istrinya yang terluka dengan dedaunan hutan.',
            actionType: 'heal',
            actionLabel: '🍃 Petik Daun Obat untuk Istri',
            actionHint: 'Klik tombol aksi atau semak hijau di layar!',
            doneText:
                'Dengan penuh kasih sayang, Si Miskin meramu daun hutan. Sang istri pun tenang kembali, yakin ketabahan akan berbuah manis.',
        },
        {
            id: 2,
            title: 'Babak 1.2: Ngidam Buah Ampelam Istana',
            speaker: 'SI MISKIN',
            portrait: '🥭',
            text:
                'Ketika hamil tiga bulan, sang istri mengidam buah ampelam dari taman Maharaja Indera Dewa. ' +
                'Dengan sujud rendah hati, Si Miskin hanya berani memohon sehelai daun yang gugur...',
            actionType: 'mango',
            actionLabel: '🥭 Mohon Buah Ampelam',
            actionHint: 'Klik buah ampelam emas di pohon atau tekan tombol!',
            doneText:
                'Tersentuh hatinya, Maharaja Indera Dewa justru memerintahkan pembantu memetik buah ampelam terbaik—lalu nangka—untuk Si Miskin!',
        },
        {
            id: 3,
            title: 'Babak 1.3: Malam Purnama, Lahirnya Marakarma',
            speaker: 'NARATOR',
            portrait: '🌕',
            text:
                'Genap bulan mengandung, tepat pada malam ke-14 saat purnama terang temaram, lahirlah seorang putra elok parasnya. ' +
                'Ia dinamai MARAKARMA—yang berarti anak laki-laki di dalam kesukaran.',
            actionType: null,
        },
        {
            id: 4,
            title: 'Babak 1.4: Tujuh Batang Emas di Dalam Tanah',
            speaker: 'SI MISKIN',
            portrait: '⛏️',
            text:
                'Berniat mendirikan pondok layak untuk Marakarma, Si Miskin mencangkul tanah di hutan. ' +
                'Tiba-tiba cangkulnya membentur benda keras berkilauan! Ayo bantu gali tanahnya!',
            actionType: 'dig',
            actionLabel: '⛏️ Gali Tanah! (0/3)',
            actionHint: 'Ketuk tombol atau area tanah berkilau 3 kali!',
            doneText:
                'KLANG! Tujuh batang emas tergolek-golek! "Sampai anak cucu sekalipun tiada habis kita belanjakan!" seru istrinya haru.',
        },
        {
            id: 5,
            title: 'Babak 1.5: Menjelmanya Negeri Puspa Sari',
            speaker: 'MAHARAJA INDERA ANGKASA',
            portrait: '🏰',
            text:
                'Si Miskin memanggil putranya: "Jikalau sungguh engkau anak dewa, jadikanlah sebuah negeri di hutan rimba ini!" ' +
                'Dengan takdir Allah SWT, berdirilah Kerajaan PUSPA SARI yang adil lagi sejahtera!',
            actionType: null,
        },
        {
            id: 6,
            title: 'Babak 1.6: Bayang Fitnah & Gerbang Gameloka',
            speaker: 'NARATOR',
            portrait: '🔮',
            text:
                'Kemasyhuran Puspa Sari membuat Maharaja Indera Dewa iri dan menghasut 7 ahli nujum untuk memfitnah Marakarma. ' +
                'Babak 2 & 3 masih TERKUNCI! Asah dulu kecakapan bahasa & budaya Betawi-mu di Gameloka!',
            actionType: 'ending',
        },
    ];

    function initMarakarmaCinema() {
        const canvas = document.getElementById('marakarmaCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        const W = canvas.width;  // 320
        const H = canvas.height; // 180

        const titleOverlay = document.getElementById('cinemaTitleOverlay');
        const startBtn = document.getElementById('cinemaStartBtn');
        const speakerBadge = document.getElementById('cinemaSpeaker');
        const portraitEl = document.getElementById('cinemaPortrait');
        const sceneLabelEl = document.getElementById('cinemaSceneLabel');
        const dialogTextEl = document.getElementById('cinemaDialogText');
        const dialogBoxEl = document.getElementById('cinemaDialogBox');
        const actionSlot = document.getElementById('cinemaActionSlot');
        const endingSlot = document.getElementById('cinemaEndingSlot');
        const prevBtn = document.getElementById('cinemaPrevBtn');
        const nextBtn = document.getElementById('cinemaNextBtn');
        const autoBtn = document.getElementById('cinemaAutoBtn');
        const sfxBtn = document.getElementById('cinemaSfxBtn');
        const dotsWrap = document.getElementById('cinemaDots');

        const audio = new RetroAudio();

        const state = {
            started: false,
            sceneIdx: 0, // 0..5 correspond to SCENES[0..5]
            t: 0,
            sceneTime: 0,
            autoPlay: true,
            typingIdx: 0,
            currentFullText: '',
            isTyping: false,
            lastTypeTime: 0,
            actionDone: false,
            digCount: 0,
            shakeFrames: 0,
            particles: [],
            autoAdvanceTimer: null,
            stars: Array.from({ length: 34 }, (_, i) => ({
                x: (i * 47 + 13) % W,
                y: (i * 29 + 7) % 88,
                phase: i * 0.7,
                big: i % 5 === 0,
            })),
        };

        // ---- Pixel Drawing Primitives ----
        function px(x, y, w, h, color) {
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        }

        function spawnParticles(x, y, color, count = 14) {
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
                const speed = 0.4 + Math.random() * 1.4;
                state.particles.push({
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 0.6,
                    life: 32 + Math.random() * 20,
                    maxLife: 52,
                    color,
                    size: Math.random() > 0.5 ? 3 : 2,
                });
            }
        }

        function drawSky(topColor, midColor, lowColor, t) {
            px(0, 0, W, 62, topColor);
            px(0, 62, W, 44, midColor);
            px(0, 106, W, 38, lowColor);

            // Pixel stars
            state.stars.forEach((s) => {
                const twinkle = Math.sin(t * 3 + s.phase);
                if (twinkle > -0.3) {
                    const col = twinkle > 0.5 ? PAL.cream : PAL.saffron;
                    const size = s.big && twinkle > 0.6 ? 2 : 1;
                    px(s.x, s.y, size, size, col);
                }
            });

            // Drifting stepped pixel clouds
            const c1 = ((t * 6) % (W + 60)) - 40;
            const c2 = ((t * 4 + 160) % (W + 60)) - 40;
            drawCloud(c1, 26);
            drawCloud(c2, 42);
        }

        function drawCloud(x, y) {
            px(x, y, 28, 6, PAL.violetLight);
            px(x + 4, y - 4, 18, 4, PAL.violetLight);
            px(x + 8, y - 6, 10, 2, PAL.lavender);
            px(x + 2, y + 4, 24, 2, PAL.violet);
        }

        function drawHillsAndGround(t, withPath = true) {
            // Distant Hunter Green hills
            for (let x = 0; x < W; x += 4) {
                const h1 = 112 + Math.round(Math.sin(x * 0.032) * 10);
                px(x, h1, 4, H - h1, PAL.green);
                const h2 = 124 + Math.round(Math.cos(x * 0.045 + 1.2) * 8);
                px(x, h2, 4, H - h2, PAL.greenDark);
            }
            // Foreground pixel turf
            px(0, 138, W, 42, PAL.greenDark);
            px(0, 138, W, 3, PAL.greenLight);

            // Winding Saffron pixel path
            if (withPath) {
                for (let row = 0; row < 40; row += 2) {
                    const ratio = row / 40;
                    const pathX = 160 - ratio * 55 + Math.sin(ratio * 4) * 18;
                    const pathW = 8 + ratio * 24;
                    px(pathX - pathW / 2, 140 + row, pathW, 2, row % 4 === 0 ? PAL.saffron : PAL.saffronDark);
                }
            }
        }

        function drawPalace(x, y, scale = 1, isGolden = false, riseRatio = 1) {
            const s = scale;
            const wall = isGolden ? PAL.saffron : PAL.violet;
            const trim = isGolden ? PAL.cream : PAL.saffron;
            const shade = isGolden ? PAL.saffronDark : PAL.purpleDeep;
            const roof = isGolden ? PAL.green : PAL.violetLight;

            ctx.save();
            const fullH = 64 * s;
            const clipH = Math.max(2, fullH * riseRatio);
            ctx.beginPath();
            ctx.rect(x - 50 * s, y + fullH - clipH, 100 * s, clipH + 10);
            ctx.clip();

            // Main Base
            px(x - 34 * s, y + 26 * s, 68 * s, 38 * s, wall);
            px(x - 34 * s, y + 26 * s, 68 * s, 3 * s, trim);
            px(x - 30 * s, y + 32 * s, 60 * s, 32 * s, shade);

            // Side Towers
            px(x - 42 * s, y + 16 * s, 14 * s, 48 * s, wall);
            px(x + 28 * s, y + 16 * s, 14 * s, 48 * s, wall);
            // Tower roofs
            px(x - 44 * s, y + 12 * s, 18 * s, 4 * s, roof);
            px(x - 40 * s, y + 7 * s, 10 * s, 5 * s, trim);
            px(x - 36 * s, y + 3 * s, 2 * s, 4 * s, PAL.saffron);

            px(x + 26 * s, y + 12 * s, 18 * s, 4 * s, roof);
            px(x + 30 * s, y + 7 * s, 10 * s, 5 * s, trim);
            px(x + 34 * s, y + 3 * s, 2 * s, 4 * s, PAL.saffron);

            // Central Royal Spire / Limas
            px(x - 16 * s, y + 12 * s, 32 * s, 14 * s, wall);
            px(x - 20 * s, y + 8 * s, 40 * s, 5 * s, roof);
            px(x - 12 * s, y + 2 * s, 24 * s, 6 * s, trim);
            px(x - 4 * s, y - 5 * s, 8 * s, 7 * s, PAL.saffron);
            px(x - 1 * s, y - 10 * s, 2 * s, 5 * s, PAL.cream);

            // Gate & Glowing Windows
            px(x - 8 * s, y + 44 * s, 16 * s, 20 * s, PAL.purpleDeep);
            px(x - 6 * s, y + 46 * s, 12 * s, 18 * s, isGolden ? PAL.cream : PAL.saffronDark);
            px(x - 24 * s, y + 36 * s, 6 * s, 8 * s, PAL.saffron);
            px(x + 18 * s, y + 36 * s, 6 * s, 8 * s, PAL.saffron);

            ctx.restore();
        }

        function drawTree(x, y, withFruit = false, fruitGlow = false, t = 0) {
            // Trunk
            px(x - 4, y - 22, 8, 24, '#5A3E2B');
            px(x - 6, y - 2, 12, 3, '#3B281B');
            // Pixel foliage canopy
            px(x - 20, y - 42, 40, 22, PAL.greenDark);
            px(x - 16, y - 48, 32, 18, PAL.green);
            px(x - 10, y - 52, 20, 10, PAL.greenLight);

            if (withFruit) {
                const pulse = Math.sin(t * 5) > 0;
                const fx = x + 6;
                const fy = y - 34;
                if (fruitGlow) {
                    px(fx - 2, fy - 2, 10, 10, pulse ? PAL.cream : PAL.saffron);
                }
                px(fx, fy, 6, 6, PAL.saffron);
                px(fx + 1, fy + 1, 2, 2, PAL.cream);
                px(x - 10, y - 38, 4, 4, PAL.saffronDark);
            }
        }

        function drawPerson(x, y, opts = {}) {
            const {
                robe = PAL.violet,
                turban = PAL.cream,
                walkPhase = 0,
                facing = 1,
                hasStickBundle = false,
                hasCrown = false,
                hasHoe = false,
                hoeAngle = 0,
                hasBaby = false,
                ragged = false,
                crouching = false,
            } = opts;

            const bob = walkPhase ? Math.abs(Math.sin(walkPhase)) * 2 : 0;
            const py = Math.round(y - bob + (crouching ? 4 : 0));
            const pxX = Math.round(x);

            // Shadow
            px(pxX - 6, y + 18, 12, 3, PAL.purpleDeep);

            // Legs
            const stride = walkPhase ? Math.round(Math.sin(walkPhase) * 3) : 0;
            px(pxX - 4 - stride, py + 11, 3, crouching ? 4 : 7, PAL.purpleDeep);
            px(pxX + 1 + stride, py + 11, 3, crouching ? 4 : 7, PAL.purpleDeep);

            // Body / Tunic
            px(pxX - 5, py, 10, 12, robe);
            if (ragged) {
                px(pxX - 5, py + 10, 2, 3, PAL.saffronDark);
                px(pxX + 3, py + 9, 2, 4, PAL.saffronDark);
            } else {
                px(pxX - 2, py + 1, 4, 10, PAL.saffron);
            }

            // Head
            px(pxX - 4, py - 9, 8, 9, PAL.skin);
            // Eye
            px(pxX + (facing > 0 ? 1 : -3), py - 6, 2, 2, PAL.purpleDeep);

            // Headgear
            if (hasCrown) {
                px(pxX - 5, py - 12, 10, 3, PAL.saffron);
                px(pxX - 5, py - 14, 2, 2, PAL.saffron);
                px(pxX - 1, py - 15, 2, 3, PAL.cream);
                px(pxX + 3, py - 14, 2, 2, PAL.saffron);
            } else {
                px(pxX - 5, py - 12, 10, 4, turban);
                px(pxX - 3, py - 14, 6, 2, turban);
            }

            // Stick & Bundle (inspired by Si Miskin reference illustration!)
            if (hasStickBundle) {
                const dir = -facing;
                for (let k = 0; k < 14; k++) {
                    px(pxX + dir * k, py - 1 - Math.floor(k * 0.4), 2, 2, '#8A5D3B');
                }
                const bx = pxX + dir * 13;
                const by = py - 5;
                px(bx - 3, by, 7, 7, PAL.saffronDark);
                px(bx - 2, by + 1, 5, 5, PAL.saffron);
            }

            // Hoe (Cangkul)
            if (hasHoe) {
                const lift = hoeAngle ? -4 : 0;
                px(pxX + 4, py + lift - 4, 2, 16, '#8A5D3B');
                px(pxX + 4, py + lift + 10, 7, 3, PAL.lavender);
            }

            // Baby Marakarma bundle
            if (hasBaby) {
                px(pxX - 1, py + 2, 9, 6, PAL.saffron);
                px(pxX + 2, py + 1, 4, 4, PAL.skin);
                px(pxX + 3, py - 1, 2, 2, PAL.cream);
            }
        }

        function drawFullMoon(x, y, r, t) {
            const pulse = 1 + Math.sin(t * 2) * 0.08;
            ctx.fillStyle = 'rgba(248, 198, 98, 0.16)';
            ctx.beginPath();
            ctx.arc(x, y, r * 1.45 * pulse, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.saffron;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            px(x - 4, y - 5, 5, 4, PAL.cream);
            px(x + 3, y + 2, 3, 3, PAL.saffronDark);
        }

        function drawGoldBars(x, y, count, t) {
            for (let i = 0; i < count; i++) {
                const row = i < 4 ? 0 : 1;
                const col = i < 4 ? i : i - 4;
                const bx = x + col * 11 + (row === 1 ? 5 : 0);
                const by = y - row * 6;
                px(bx, by, 9, 5, PAL.saffronDark);
                px(bx + 1, by, 7, 3, PAL.saffron);
                if (Math.floor(t * 6 + i) % 5 === 0) {
                    px(bx + 2, by - 2, 2, 2, PAL.cream);
                }
            }
        }

        function drawParticles() {
            for (let i = state.particles.length - 1; i >= 0; i--) {
                const p = state.particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.03;
                p.life--;
                if (p.life <= 0) {
                    state.particles.splice(i, 1);
                    continue;
                }
                px(p.x, p.y, p.size, p.size, p.color);
            }
        }

        // ---- Scene Renderers ----
        function renderFrame() {
            const t = state.t;
            const st = state.sceneTime;

            let shakeX = 0;
            let shakeY = 0;
            if (state.shakeFrames > 0) {
                shakeX = (Math.random() - 0.5) * 4;
                shakeY = (Math.random() - 0.5) * 4;
                state.shakeFrames--;
            }

            ctx.save();
            ctx.translate(shakeX, shakeY);

            if (!state.started) {
                // Title Screen Panorama: Si Miskin walking past Istana Ananta Beranta
                drawSky(PAL.purpleDeep, PAL.purple, PAL.violet, t);
                drawFullMoon(268, 36, 14, t);
                drawHillsAndGround(t, true);
                drawPalace(96, 56, 0.9, false, 1);
                drawTree(262, 138, true, false, t);
                const walkX = ((t * 22) % 340) - 15;
                drawPerson(walkX, 142, {
                    robe: PAL.violetLight,
                    turban: PAL.saffronDark,
                    walkPhase: t * 6,
                    facing: 1,
                    hasStickBundle: true,
                    ragged: true,
                });
            } else {
                const sc = SCENES[state.sceneIdx].id;

                if (sc === 1) {
                    // Scene 1: Expelled from Ananta Beranta -> Healing in Forest
                    drawSky(PAL.purpleDeep, PAL.purple, PAL.violet, t);
                    drawHillsAndGround(t, true);
                    drawPalace(58, 60, 0.85, false, 1);
                    drawPerson(58, 122, { robe: PAL.saffronDark, hasCrown: true, facing: 1 });
                    // Forest on right
                    drawTree(230, 140, false, false, t);
                    drawTree(275, 144, false, false, t);

                    // Healing bush sparkle target
                    px(244, 134, 14, 8, PAL.greenLight);
                    px(247, 132, 8, 3, state.actionDone ? PAL.saffron : PAL.cream);

                    // Si Miskin & Wife
                    const moveX = Math.min(205, 115 + st * 22);
                    drawPerson(moveX, 142, {
                        robe: PAL.violetLight,
                        turban: PAL.saffronDark,
                        walkPhase: moveX < 204 ? t * 7 : 0,
                        facing: 1,
                        hasStickBundle: true,
                        ragged: true,
                    });
                    drawPerson(moveX + 24, 144, {
                        robe: PAL.violet,
                        turban: PAL.lavender,
                        crouching: !state.actionDone,
                        facing: -1,
                        ragged: true,
                    });
                    if (state.actionDone && Math.floor(t * 4) % 2 === 0) {
                        px(moveX + 22, 126, 4, 4, PAL.saffron);
                        px(moveX + 28, 123, 3, 3, PAL.greenLight);
                    }
                } else if (sc === 2) {
                    // Scene 2: Palace Garden Mango Tree (Buah Ampelam)
                    drawSky(PAL.purple, PAL.violet, PAL.violetLight, t);
                    drawHillsAndGround(t, false);
                    drawPalace(70, 58, 0.9, false, 1);
                    drawPerson(92, 130, { robe: PAL.saffron, hasCrown: true, facing: 1 });

                    // Lush Mango Tree with glowing Buah Ampelam
                    drawTree(228, 142, true, !state.actionDone, t);

                    // Si Miskin pleading / receiving fruit
                    drawPerson(168, 142, {
                        robe: PAL.violetLight,
                        turban: PAL.saffronDark,
                        crouching: !state.actionDone,
                        facing: -1,
                        ragged: true,
                    });

                    if (state.actionDone) {
                        // Floating fruit celebration
                        const fy = 122 + Math.sin(t * 4) * 3;
                        px(176, fy, 7, 7, PAL.saffron);
                        px(178, fy + 1, 2, 2, PAL.cream);
                    }
                } else if (sc === 3) {
                    // Scene 3: Full Moon Birth of Marakarma
                    drawSky(PAL.purpleDeep, PAL.purple, PAL.violet, t);
                    drawFullMoon(160, 44, 22, t);
                    drawHillsAndGround(t, false);
                    drawTree(54, 140, false, false, t);
                    drawTree(268, 142, false, false, t);

                    // Humble forest hut
                    px(124, 114, 72, 34, '#4B3626');
                    px(118, 108, 84, 8, PAL.greenDark);
                    px(130, 102, 60, 6, PAL.green);

                    // Parents holding glowing baby Marakarma
                    drawPerson(146, 142, {
                        robe: PAL.violetLight,
                        turban: PAL.saffronDark,
                        facing: 1,
                        hasBaby: true,
                    });
                    drawPerson(176, 142, {
                        robe: PAL.violet,
                        turban: PAL.cream,
                        facing: -1,
                    });

                    // Golden fireflies
                    for (let f = 0; f < 10; f++) {
                        const fx = 90 + ((f * 37 + Math.sin(t * 2 + f) * 18) % 150);
                        const fy = 95 + Math.cos(t * 2.5 + f * 1.4) * 22;
                        px(fx, fy, 2, 2, f % 2 === 0 ? PAL.saffron : PAL.cream);
                    }
                } else if (sc === 4) {
                    // Scene 4: Digging 7 Gold Bars
                    drawSky(PAL.purpleDeep, PAL.purple, PAL.violet, t);
                    drawHillsAndGround(t, false);
                    drawTree(48, 140, false, false, t);
                    drawTree(274, 142, false, false, t);

                    // Soil mound
                    px(158, 148, 48, 12, '#5A3E2B');
                    px(164, 145, 36, 4, state.actionDone ? PAL.saffron : '#7A5438');

                    // Si Miskin with Hoe
                    drawPerson(138, 142, {
                        robe: PAL.violetLight,
                        turban: PAL.saffronDark,
                        facing: 1,
                        hasHoe: true,
                        hoeAngle: Math.sin(t * 10) > 0 && !state.actionDone,
                    });

                    // Wife watching amazed
                    drawPerson(228, 142, {
                        robe: PAL.violet,
                        turban: PAL.cream,
                        facing: -1,
                    });

                    if (state.actionDone) {
                        drawGoldBars(162, 143, 7, t);
                    } else if (Math.floor(t * 4) % 2 === 0) {
                        px(180, 140, 3, 3, PAL.saffron);
                    }
                } else if (sc === 5) {
                    // Scene 5: Kerajaan Puspa Sari Rises!
                    drawSky(PAL.purpleDeep, PAL.violet, PAL.greenDark, t);
                    drawFullMoon(52, 36, 13, t);
                    drawHillsAndGround(t, true);

                    const rise = Math.min(1, st / 2.2);
                    // Golden sky beam
                    if (st < 2.6) {
                        px(148, 0, 24, 135, 'rgba(248, 198, 98, 0.25)');
                    }

                    drawPalace(160, 52, 1.25, true, rise);

                    // Royal Maharaja Indera Angkasa & Ratna Dewi + Marakarma
                    drawPerson(98, 146, { robe: PAL.saffronDark, hasCrown: true, facing: 1 });
                    drawPerson(116, 146, { robe: PAL.violetLight, turban: PAL.saffron, facing: 1 });
                    drawPerson(132, 150, { robe: PAL.greenLight, turban: PAL.cream, facing: 1 });

                    // Pixel fireworks
                    if (rise >= 0.9 && Math.floor(t * 2) !== Math.floor((t - 0.03) * 2)) {
                        spawnParticles(70 + Math.random() * 180, 25 + Math.random() * 45, PAL.saffron, 12);
                    }
                } else if (sc === 6) {
                    // Scene 6: Envious Shadows & Cliffhanger
                    drawSky('#151122', PAL.purpleDeep, PAL.violet, t);
                    drawHillsAndGround(t, false);
                    drawPalace(82, 62, 0.95, true, 1);

                    // Lightning flash
                    if (Math.floor(t * 3) % 7 === 0) {
                        px(240, 0, 3, 45, PAL.saffron);
                        px(236, 45, 3, 35, PAL.cream);
                    }

                    // 7 Ahli Nujum silhouettes on right hill
                    for (let i = 0; i < 7; i++) {
                        const nx = 186 + i * 17;
                        const ny = 136 + (i % 2) * 3;
                        px(nx - 4, ny, 8, 14, PAL.purpleDeep);
                        px(nx - 3, ny - 6, 6, 6, PAL.purpleDeep);
                        px(nx - 1, ny - 4, 2, 2, PAL.saffron);
                    }
                }
            }

            drawParticles();
            ctx.restore();
        }

        // ---- UI & Story Flow ----
        function buildDots() {
            if (!dotsWrap) return;
            dotsWrap.innerHTML = '';
            SCENES.forEach((sc, idx) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'cinema-dot' + (state.started && state.sceneIdx === idx ? ' active' : '');
                btn.textContent = String(idx + 1);
                btn.title = sc.title;
                btn.addEventListener('click', () => {
                    audio.click();
                    if (!state.started) startCinema(idx);
                    else goToScene(idx);
                });
                dotsWrap.appendChild(btn);
            });
        }

        function startTyping(text) {
            clearTimeout(state.autoAdvanceTimer);
            state.currentFullText = text;
            state.typingIdx = 0;
            state.isTyping = true;
            if (dialogTextEl) dialogTextEl.textContent = '';
        }

        function finishTypingNow() {
            if (!state.isTyping) return;
            state.typingIdx = state.currentFullText.length;
            state.isTyping = false;
            if (dialogTextEl) dialogTextEl.textContent = state.currentFullText;
            scheduleAutoAdvance();
        }

        function scheduleAutoAdvance() {
            clearTimeout(state.autoAdvanceTimer);
            const scene = SCENES[state.sceneIdx];
            if (!state.started || !state.autoPlay) return;
            if (scene.actionType && scene.actionType !== 'ending' && !state.actionDone) return;
            if (state.sceneIdx >= SCENES.length - 1) return;

            state.autoAdvanceTimer = setTimeout(() => {
                goToScene(state.sceneIdx + 1);
            }, 3400);
        }

        function renderControls() {
            const scene = SCENES[state.sceneIdx];
            if (sceneLabelEl) {
                sceneLabelEl.textContent = state.started ? `BABAK 1 • ADEGAN ${state.sceneIdx + 1}/${SCENES.length}` : 'BABAK 1 • SIAP DIPUTAR';
            }
            if (speakerBadge) speakerBadge.textContent = scene.speaker;
            if (portraitEl) portraitEl.textContent = scene.portrait;

            if (prevBtn) prevBtn.disabled = !state.started || state.sceneIdx === 0;
            if (nextBtn) {
                nextBtn.style.display = state.sceneIdx < SCENES.length - 1 ? 'inline-flex' : 'none';
            }

            if (actionSlot) {
                actionSlot.innerHTML = '';
                if (state.started && scene.actionType && scene.actionType !== 'ending' && !state.actionDone) {
                    const actBtn = document.createElement('button');
                    actBtn.type = 'button';
                    actBtn.className = 'pixel-btn pixel-btn-gold pixel-btn-sm';
                    if (scene.actionType === 'dig') {
                        actBtn.textContent = `⛏️ Gali Tanah! (${state.digCount}/3)`;
                    } else {
                        actBtn.textContent = scene.actionLabel;
                    }
                    actBtn.addEventListener('click', triggerSceneAction);
                    actionSlot.appendChild(actBtn);

                    const hint = document.createElement('span');
                    hint.style.cssText = 'font-size:0.78rem;color:#F8C662;';
                    hint.textContent = scene.actionHint;
                    actionSlot.appendChild(hint);
                }
            }

            if (endingSlot) {
                endingSlot.style.display = state.started && scene.actionType === 'ending' ? 'flex' : 'none';
            }

            buildDots();
        }

        function triggerSceneAction() {
            const scene = SCENES[state.sceneIdx];
            if (!state.started || state.actionDone) return;

            if (scene.actionType === 'heal') {
                audio.heal();
                state.actionDone = true;
                spawnParticles(225, 134, PAL.greenLight, 18);
                spawnParticles(225, 134, PAL.saffron, 10);
                startTyping(scene.doneText);
                renderControls();
            } else if (scene.actionType === 'mango') {
                audio.coin();
                state.actionDone = true;
                spawnParticles(234, 108, PAL.saffron, 22);
                spawnParticles(176, 126, PAL.cream, 14);
                startTyping(scene.doneText);
                renderControls();
            } else if (scene.actionType === 'dig') {
                state.digCount++;
                state.shakeFrames = 7;
                if (state.digCount < 3) {
                    audio.dig();
                    spawnParticles(180, 144, '#8A5D3B', 10);
                    renderControls();
                } else {
                    audio.coin();
                    state.actionDone = true;
                    spawnParticles(180, 140, PAL.saffron, 28);
                    spawnParticles(180, 136, PAL.cream, 14);
                    startTyping(scene.doneText);
                    renderControls();
                }
            }
        }

        function goToScene(idx) {
            clearTimeout(state.autoAdvanceTimer);
            state.sceneIdx = Math.max(0, Math.min(SCENES.length - 1, idx));
            state.sceneTime = 0;
            state.actionDone = false;
            state.digCount = 0;

            const scene = SCENES[state.sceneIdx];
            if (scene.id === 5) {
                audio.fanfare();
            } else if (scene.id === 6) {
                try {
                    localStorage.setItem('gameloka-marakarma-lvl1-done', 'true');
                    const lvl1Badge = document.getElementById('lvl1-complete-badge');
                    if (lvl1Badge) lvl1Badge.style.display = 'inline-flex';
                } catch (e) {}
            }

            startTyping(scene.text);
            renderControls();
        }

        function startCinema(idx = 0) {
            state.started = true;
            if (titleOverlay) titleOverlay.style.display = 'none';
            audio.ensureCtx();
            audio.click();
            audio.startBGM();
            goToScene(idx);
        }

        // ---- Event Bindings ----
        startBtn?.addEventListener('click', () => startCinema(0));

        document.getElementById('replayCinemaBtn')?.addEventListener('click', () => {
            audio.click();
            startCinema(0);
        });

        document.getElementById('lvl1PlayBtn')?.addEventListener('click', () => {
            document.getElementById('cinema-stage')?.scrollIntoView({ behavior: 'smooth' });
            startCinema(0);
        });

        prevBtn?.addEventListener('click', () => {
            audio.click();
            if (state.sceneIdx > 0) goToScene(state.sceneIdx - 1);
        });

        nextBtn?.addEventListener('click', () => {
            audio.click();
            if (state.isTyping) {
                finishTypingNow();
            } else if (state.sceneIdx < SCENES.length - 1) {
                goToScene(state.sceneIdx + 1);
            }
        });

        dialogBoxEl?.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;
            finishTypingNow();
        });

        autoBtn?.addEventListener('click', () => {
            state.autoPlay = !state.autoPlay;
            autoBtn.textContent = state.autoPlay ? '⏯ AUTO: ON' : '⏸ AUTO: OFF';
            audio.click();
            if (state.autoPlay && !state.isTyping) {
                scheduleAutoAdvance();
            } else {
                clearTimeout(state.autoAdvanceTimer);
            }
        });

        sfxBtn?.addEventListener('click', () => {
            const on = audio.toggle();
            sfxBtn.textContent = on ? '🔊 SFX ON' : '🔇 SFX OFF';
        });

        // Canvas click hotspot support for scenes 1, 2, 4
        canvas.addEventListener('click', () => {
            if (!state.started) return;
            const scene = SCENES[state.sceneIdx];
            if (scene.actionType && scene.actionType !== 'ending' && !state.actionDone) {
                triggerSceneAction();
            }
        });

        // Check if Level 1 completed previously
        try {
            if (localStorage.getItem('gameloka-marakarma-lvl1-done') === 'true') {
                const lvl1Badge = document.getElementById('lvl1-complete-badge');
                if (lvl1Badge) lvl1Badge.style.display = 'inline-flex';
            }
        } catch (e) {}

        // Main animation loop (requestAnimationFrame)
        let lastTs = performance.now();
        function loop(ts) {
            const dt = Math.min(0.05, (ts - lastTs) / 1000);
            lastTs = ts;
            state.t += dt;
            state.sceneTime += dt;

            if (state.isTyping && ts - state.lastTypeTime > 24) {
                state.lastTypeTime = ts;
                state.typingIdx++;
                if (state.typingIdx >= state.currentFullText.length) {
                    finishTypingNow();
                } else {
                    if (dialogTextEl) {
                        dialogTextEl.textContent = state.currentFullText.slice(0, state.typingIdx);
                    }
                    if (state.typingIdx % 4 === 0) audio.blip();
                }
            }

            renderFrame();
            requestAnimationFrame(loop);
        }

        buildDots();
        renderControls();
        requestAnimationFrame(loop);
    }

    document.addEventListener('DOMContentLoaded', initMarakarmaCinema);
})();
