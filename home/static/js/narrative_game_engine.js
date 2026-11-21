/**
 * Sekilas Kisah - Story-Synchronized 8-Bit Animated Visualization & RPG Engine
 * Palette:
 *   Saffron:      #F8C662 (Dark Gold: #C9932E)
 *   Ultra Violet: #595082 (Light: #7B71AD)
 *   Dark Purple:  #2C263F (Deep: #1B1729)
 *   Hunter Green: #41644A (Light: #5A8866)
 *   Dark Green:   #213722
 *   Cream:        #FFF7E0
 */

const STORY_PAL = {
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

const SCENE_CAPTIONS = {
    pitung: {
        map: '🌙 Setu Babakan — Pilih Tokoh Kisah',
        0: '🥋 Adegan 1: Perkenalan Si Pitung di Setu Babakan',
        1: '⛈️ Adegan 2: Penindasan Masa Penjajahan',
        2: '⚡ Adegan 3: Si Pitung Melawan Bandit & Membela Rakyat',
        3: '🌅 Adegan 4: Fajar Keberanian Sejati',
        4: '🎆 Adegan 5: Merdeka & Lestarinya Budaya Betawi',
        ending: '🎆 Pesan Moral Legenda Si Pitung',
    },
    maknani: {
        map: '🌳 Kampung Condet — Pilih Tokoh Kisah',
        0: '🧺 Adegan 1: Tradisi Kuliner Condet Mak Nani',
        1: '🍈 Adegan 2: Memetik & Menghormati Hasil Bumi',
        2: '🍲 Adegan 3: Dapur Anglo & Kehangatan Soto Betawi',
        3: '🌉 Adegan 4: Jembatan Masa Lalu & Masa Depan',
        ending: '🎆 Pesan Moral Kebijaksanaan Mak Nani',
    },
    kampung: {
        map: '🎭 Alun-Alun Kemayoran — Pilih Tokoh Kisah',
        0: '🏮 Adegan 1: Selamat Datang di Gapura Kemayoran',
        1: '🏗️ Adegan 2: Pendiri Betawi Membangun Kampung',
        2: '🤝 Adegan 3: Semangat Gotong Royong Warga',
        3: '🎊 Adegan 4: Festival Rakyat & Ondel-Ondel Kemayoran',
        ending: '🎆 Pesan Moral Sejarah Kemayoran',
    },
};

class StoryCanvasAnimator {
    constructor(storyId, npcs) {
        this.storyId = storyId;
        this.npcs = npcs || [];
        this.t = 0;
        this.sceneTime = 0;
        this.view = 'mapView';
        this.nodeIndex = 0;
        this.nodeId = 'start';
        this.activeSpeaker = '';
        this.isSpeaking = false;
        this.isCelebration = false;
        this.particles = [];
        this.stars = Array.from({ length: 30 }, (_, i) => ({
            x: (i * 53 + 17) % 320,
            y: (i * 23 + 7) % 58,
            phase: i * 0.65,
        }));
    }

    setState({ view, nodeIndex, nodeId, activeSpeaker = '', isSpeaking = false, isCelebration = false } = {}) {
        const changedScene =
            (view !== undefined && view !== this.view) ||
            (nodeIndex !== undefined && nodeIndex !== this.nodeIndex);

        if (view !== undefined) this.view = view;
        if (nodeIndex !== undefined) this.nodeIndex = nodeIndex;
        if (nodeId !== undefined) this.nodeId = nodeId;
        this.activeSpeaker = activeSpeaker;
        this.isSpeaking = isSpeaking;
        this.isCelebration = isCelebration;

        if (changedScene) {
            this.sceneTime = 0;
            this.particles = [];
        }
    }

    spawnSpark(x, y, color, count = 10) {
        for (let i = 0; i < count; i++) {
            const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
            const spd = 0.4 + Math.random() * 1.3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 0.5,
                life: 26 + Math.random() * 18,
                color,
                size: Math.random() > 0.4 ? 3 : 2,
            });
        }
    }

    drawFrame(ctx, dt) {
        this.t += dt;
        this.sceneTime += dt;
        const W = 320;
        const H = 148;
        const t = this.t;
        const st = this.sceneTime;

        const px = (x, y, w, h, c) => {
            ctx.fillStyle = c;
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        };

        if (this.storyId === 'pitung') {
            this.renderPitungStory(px, W, H, t, st);
        } else if (this.storyId === 'maknani') {
            this.renderMakNaniStory(px, W, H, t, st);
        } else {
            this.renderKampungStory(px, W, H, t, st);
        }

        // Fireworks on ending or celebration nodes
        if (this.isCelebration && Math.floor(t * 2.4) !== Math.floor((t - dt) * 2.4)) {
            this.spawnSpark(
                50 + Math.random() * 220,
                20 + Math.random() * 44,
                Math.random() > 0.4 ? STORY_PAL.saffron : STORY_PAL.cream,
                14
            );
        }

        // Update & draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.025;
            p.life--;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            px(p.x, p.y, p.size, p.size, p.color);
        }
    }

    // ---- Shared Scenery Primitives ----
    drawSky(px, W, t, mode = 'night') {
        const top = mode === 'storm' ? '#120E1D' : mode === 'dawn' ? STORY_PAL.violet : STORY_PAL.purpleDeep;
        const mid = mode === 'storm' ? STORY_PAL.purpleDeep : mode === 'dawn' ? STORY_PAL.violetLight : STORY_PAL.purple;
        const low = mode === 'storm' ? STORY_PAL.purple : mode === 'dawn' ? STORY_PAL.saffronDark : STORY_PAL.violet;

        px(0, 0, W, 44, top);
        px(0, 44, W, 36, mid);
        px(0, 80, W, 24, low);

        if (mode !== 'storm') {
            this.stars.forEach(s => {
                if (Math.sin(t * 3 + s.phase) > -0.2) {
                    px(s.x, s.y, 2, 2, s.phase % 2 > 1 ? STORY_PAL.saffron : STORY_PAL.cream);
                }
            });
        }

        if (mode === 'dawn') {
            // Rising golden sun
            const sy = Math.max(46, 86 - this.sceneTime * 10);
            px(142, sy, 36, 36, STORY_PAL.saffron);
            px(148, sy + 6, 24, 24, STORY_PAL.cream);
        } else if (mode === 'night') {
            px(268, 16, 18, 18, STORY_PAL.saffron);
            px(272, 19, 6, 5, STORY_PAL.cream);
        }

        // Clouds
        const speed = mode === 'storm' ? 16 : 6;
        const cx1 = ((t * speed) % (W + 60)) - 40;
        const cx2 = ((t * (speed * 0.7) + 155) % (W + 60)) - 40;
        const cloudCol = mode === 'storm' ? STORY_PAL.purple : STORY_PAL.violetLight;
        [cx1, cx2].forEach((cx, idx) => {
            const cy = idx === 0 ? 22 : 36;
            px(cx, cy, 30, 7, cloudCol);
            px(cx + 5, cy - 4, 18, 4, cloudCol);
        });
    }

    drawBetawiHouse(px, x, y, w, h, t, riseRatio = 1) {
        const totalH = h + 16;
        const curH = Math.max(4, totalH * riseRatio);
        const startY = y + h - curH;

        // Walls (clip bottom-up by ratio)
        const wallH = Math.max(0, Math.min(h, curH));
        if (wallH > 0) {
            px(x, y + h - wallH, w, wallH, STORY_PAL.green);
            if (wallH > 6) {
                px(x + 3, y + h - wallH + 3, w - 6, wallH - 6, STORY_PAL.purpleDeep);
            }
            if (wallH > 20) {
                px(x + w / 2 - 6, y + h - 18, 12, 18, STORY_PAL.saffronDark);
                px(x + 7, y + h - wallH + 9, 9, 9, STORY_PAL.saffron);
                px(x + w - 16, y + h - wallH + 9, 9, 9, STORY_PAL.saffron);
            }
        }
        // Roof appears once walls reach near top
        if (riseRatio > 0.65) {
            px(x - 6, startY + 6, w + 12, 8, STORY_PAL.saffronDark);
            for (let gx = x - 4; gx < x + w + 4; gx += 6) {
                px(gx, startY + 12, 3, 4, STORY_PAL.saffron);
            }
            if (riseRatio > 0.85) {
                px(x + 8, startY, w - 16, 7, STORY_PAL.saffron);
                const sway = Math.round(Math.sin(t * 3) * 1.5);
                px(x + w / 2 + sway, y + 2, 4, 5, STORY_PAL.cream);
            }
        }
    }

    drawPalmTree(px, x, y, t) {
        px(x - 3, y - 34, 6, 34, '#5A3E2B');
        const sway = Math.round(Math.sin(t * 2.5) * 2);
        px(x - 16 + sway, y - 38, 32, 6, STORY_PAL.greenLight);
        px(x - 12 + sway, y - 44, 24, 6, STORY_PAL.green);
    }

    drawOndelOndel(px, x, y, isMale) {
        px(x - 8, y + 10, 16, 22, isMale ? STORY_PAL.saffronDark : STORY_PAL.violetLight);
        px(x - 4, y + 12, 8, 20, STORY_PAL.saffron);
        px(x - 6, y - 2, 12, 12, isMale ? STORY_PAL.danger : STORY_PAL.cream);
        px(x - 4, y + 2, 2, 2, STORY_PAL.purpleDeep);
        px(x + 2, y + 2, 2, 2, STORY_PAL.purpleDeep);
        px(x - 8, y - 7, 16, 5, STORY_PAL.saffron);
        px(x - 5, y - 11, 2, 4, STORY_PAL.cream);
        px(x - 1, y - 12, 2, 5, STORY_PAL.saffron);
        px(x + 3, y - 11, 2, 4, STORY_PAL.cream);
    }

    drawHeart(px, x, y, color) {
        px(x - 3, y, 2, 2, color);
        px(x + 1, y, 2, 2, color);
        px(x - 4, y + 1, 8, 2, color);
        px(x - 2, y + 3, 4, 2, color);
        px(x - 1, y + 5, 2, 1, color);
    }

    drawSpeechBubble(px, x, y, t) {
        px(x, y, 18, 11, STORY_PAL.cream);
        px(x + 2, y + 2, 14, 7, STORY_PAL.purpleDeep);
        const dotShift = Math.floor(t * 6) % 3;
        for (let d = 0; d < 3; d++) {
            px(x + 4 + d * 4, y + 4 + (d === dotShift ? -1 : 0), 2, 2, STORY_PAL.saffron);
        }
    }

    drawPerson(px, x, y, opts = {}) {
        const {
            robe = STORY_PAL.violetLight,
            hat = STORY_PAL.saffron,
            walkPhase = 0,
            facing = 1,
            armSwing = 0,
            hasBasket = false,
            hasLantern = false,
            hasHatBrim = false,
            isSilhouette = false,
        } = opts;

        const bob = walkPhase ? Math.abs(Math.sin(walkPhase)) * 2.5 : 0;
        const py = Math.round(y - bob);
        const pxX = Math.round(x);
        const bodyCol = isSilhouette ? STORY_PAL.purpleDeep : robe;
        const skinCol = isSilhouette ? STORY_PAL.purpleDeep : STORY_PAL.skin;
        const trimCol = isSilhouette ? STORY_PAL.violet : STORY_PAL.saffron;

        const stride = walkPhase ? Math.round(Math.sin(walkPhase) * 3) : 0;
        px(pxX - 4 - stride, py + 12, 3, 8, STORY_PAL.purpleDeep);
        px(pxX + 1 + stride, py + 12, 3, 8, STORY_PAL.purpleDeep);

        // Torso
        px(pxX - 6, py, 12, 13, bodyCol);
        px(pxX - 2, py + 1, 4, 11, trimCol);

        // Arms
        px(pxX - 9, py + 2 - armSwing, 3, 7, skinCol);
        px(pxX + 6, py + 2 + armSwing, 3, 7, skinCol);

        // Head
        px(pxX - 5, py - 10, 10, 10, skinCol);
        if (!isSilhouette) {
            px(pxX + (facing > 0 ? 1 : -3), py - 6, 2, 2, STORY_PAL.purpleDeep);
        } else {
            px(pxX - 2, py - 6, 2, 2, STORY_PAL.danger);
        }

        // Headgear
        if (hasHatBrim) {
            px(pxX - 8, py - 12, 16, 3, hat);
            px(pxX - 5, py - 16, 10, 4, hat);
        } else {
            px(pxX - 6, py - 13, 12, 4, isSilhouette ? STORY_PAL.purpleDeep : hat);
            px(pxX - 4, py - 15, 8, 2, isSilhouette ? STORY_PAL.purpleDeep : hat);
        }

        if (hasBasket) {
            px(pxX + 7, py + 4, 8, 6, STORY_PAL.saffronDark);
            px(pxX + 8, py + 2, 6, 3, STORY_PAL.saffron);
        }
        if (hasLantern) {
            px(pxX + 8, py - 2, 5, 7, STORY_PAL.saffron);
            px(pxX + 9, py, 3, 3, STORY_PAL.cream);
        }
    }

    // =========================================================
    // 1. LEGENDA SI PITUNG (SETU BABAKAN) - PER-NODE ANIMATIONS
    // =========================================================
    renderPitungStory(px, W, H, t, st) {
        const scene = this.view === 'endingView' ? 4 : (this.view === 'mapView' ? -1 : this.nodeIndex);
        const skyMode = scene === 1 ? 'storm' : scene === 3 ? 'dawn' : 'night';
        this.drawSky(px, W, t, skyMode);

        // Rolling hills + Setu Babakan lake
        for (let x = 0; x < W; x += 4) {
            const h1 = 92 + Math.round(Math.sin(x * 0.04) * 6);
            px(x, h1, 4, H - h1, STORY_PAL.green);
        }
        px(0, 108, W, 16, STORY_PAL.greenDark);
        px(0, 108, W, 3, STORY_PAL.greenLight);

        // Lake water
        px(0, 124, W, 24, STORY_PAL.violet);
        px(0, 124, W, 2, STORY_PAL.violetLight);
        for (let r = 0; r < 6; r++) {
            const rx = ((r * 58 + t * 14) % (W + 30)) - 20;
            const ry = 129 + (r % 3) * 6;
            px(rx, ry, 18, 2, r % 2 === 0 ? STORY_PAL.saffron : STORY_PAL.cream);
        }

        if (scene === -1) {
            // Map opening: calm Rumah Kebaya + trio
            this.drawBetawiHouse(px, 24, 70, 56, 38, t);
            this.drawPalmTree(px, 286, 108, t);
            [88, 160, 232].forEach((nx, i) => {
                const robe = i === 0 ? STORY_PAL.purpleDeep : i === 1 ? STORY_PAL.saffronDark : STORY_PAL.green;
                const hat = i === 1 ? STORY_PAL.cream : STORY_PAL.purpleDeep;
                this.drawPerson(px, nx, 104, { robe, hat, armSwing: Math.round(Math.sin(t * 2 + i)) });
            });
            return;
        }

        if (scene === 0) {
            // Node 0: Si Pitung center stage under Betawi gate in silat greeting stance
            this.drawBetawiHouse(px, 18, 70, 54, 38, t);
            this.drawPalmTree(px, 290, 108, t);
            // Golden archway
            px(124, 62, 72, 6, STORY_PAL.saffron);
            px(126, 68, 6, 42, STORY_PAL.saffronDark);
            px(188, 68, 6, 42, STORY_PAL.saffronDark);

            const silatBob = Math.abs(Math.sin(t * 4)) * 2;
            const arm = Math.round(Math.sin(t * 5) * 3);
            this.drawPerson(px, 160, 104 - silatBob, { robe: STORY_PAL.purpleDeep, hat: STORY_PAL.purpleDeep, armSwing: arm });
            if (this.isSpeaking) this.drawSpeechBubble(px, 174, 80, t);
            // Golden silat aura sparks
            if (Math.floor(t * 6) % 2 === 0) {
                px(140, 96, 3, 3, STORY_PAL.saffron);
                px(178, 92, 3, 3, STORY_PAL.cream);
            }
        } else if (scene === 1) {
            // Node 1: Colonial oppression storm + marching guards + empty sacks
            if (Math.floor(t * 2.5) % 6 === 0) {
                px(236, 0, 3, 44, STORY_PAL.saffron);
                px(232, 44, 3, 32, STORY_PAL.cream);
            }
            this.drawBetawiHouse(px, 20, 74, 48, 34, t);
            // Empty slumped grain sacks
            px(76, 108, 12, 8, STORY_PAL.saffronDark);
            px(90, 110, 10, 6, STORY_PAL.saffronDark);
            // Si Pitung observing clenched + villager
            this.drawPerson(px, 114, 104, { robe: STORY_PAL.purpleDeep, hat: STORY_PAL.purpleDeep, facing: 1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 124, 82, t);
            // Marching colonial silhouettes on right
            const march = Math.sin(t * 2) * 14;
            this.drawPerson(px, 218 + march, 104, { isSilhouette: true, hasHatBrim: true, walkPhase: t * 6, facing: -1 });
            this.drawPerson(px, 254 + march, 104, { isSilhouette: true, hasHatBrim: true, walkPhase: t * 6 + 1, facing: -1 });
        } else if (scene === 2) {
            // Node 2: Action! Si Pitung & allies fighting bandits with golden shockwaves
            this.drawPalmTree(px, 28, 108, t);
            const dash = Math.min(48, st * 22);
            const punch = Math.round(Math.sin(t * 14) * 4);
            // Villagers + recovered sparkling grain/coins on left
            this.drawPerson(px, 52, 104, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, facing: 1 });
            px(72, 104, 10, 10, STORY_PAL.saffron);
            px(84, 106, 8, 8, STORY_PAL.saffronDark);
            if (Math.floor(t * 5) % 2 === 0) px(76, 98, 3, 3, STORY_PAL.cream);

            // Si Pitung & ally dashing forward
            const pitungX = 110 + dash;
            this.drawPerson(px, pitungX, 104, { robe: STORY_PAL.purpleDeep, hat: STORY_PAL.purpleDeep, walkPhase: t * 10, armSwing: punch, facing: 1 });
            this.drawPerson(px, pitungX - 24, 106, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, walkPhase: t * 9, armSwing: -punch, facing: 1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, pitungX + 8, 78, t);

            // Golden silat shockwave ring
            const waveX = pitungX + 22 + ((t * 45) % 28);
            px(waveX, 94, 4, 18, STORY_PAL.saffron);
            px(waveX + 3, 98, 3, 10, STORY_PAL.cream);

            // Bandits knocked back to right
            const knock = Math.min(42, Math.max(0, st * 15 - 10));
            this.drawPerson(px, 232 + knock, 104, { isSilhouette: true, walkPhase: t * 8, facing: -1 });
            this.drawPerson(px, 260 + knock, 104, { isSilhouette: true, walkPhase: t * 8 + 1, facing: -1 });
        } else if (scene === 3) {
            // Node 3: Dawn of True Courage atop hill
            this.drawBetawiHouse(px, 22, 72, 50, 36, t);
            // Elevated courage hill in center
            px(110, 98, 100, 22, STORY_PAL.greenDark);
            px(124, 90, 72, 12, STORY_PAL.greenLight);
            this.drawPerson(px, 160, 74, { robe: STORY_PAL.purpleDeep, hat: STORY_PAL.purpleDeep, facing: 1, armSwing: 2 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 174, 52, t);
            // Rising light sparkles
            for (let k = 0; k < 4; k++) {
                const ky = 88 - ((t * 18 + k * 14) % 45);
                px(136 + k * 16, ky, 3, 3, STORY_PAL.saffron);
            }
        } else {
            // Node 4 / Ending: Celebration in Setu Babakan
            this.drawBetawiHouse(px, 118, 66, 84, 42, t);
            this.drawPalmTree(px, 36, 108, t);
            this.drawPalmTree(px, 284, 108, t);
            // Festive banners
            for (let bx = 66; bx <= 254; bx += 22) {
                px(bx, 58, 10, 6, bx % 44 === 66 ? STORY_PAL.saffron : STORY_PAL.cream);
            }
            const cheer = Math.round(Math.abs(Math.sin(t * 7)) * 3);
            this.drawPerson(px, 86, 104 - cheer, { robe: STORY_PAL.purpleDeep, hat: STORY_PAL.purpleDeep, armSwing: 3 });
            this.drawPerson(px, 160, 104 - cheer, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, armSwing: 3 });
            this.drawPerson(px, 234, 104 - cheer, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, armSwing: 3 });
            if (this.isSpeaking && !this.isCelebration) this.drawSpeechBubble(px, 100, 78, t);
        }
    }

    // =========================================================
    // 2. KEBIJAKSANAAN MAK NANI (CONDET) - PER-NODE ANIMATIONS
    // =========================================================
    renderMakNaniStory(px, W, H, t, st) {
        const scene = this.view === 'endingView' ? 3 : (this.view === 'mapView' ? -1 : this.nodeIndex);
        this.drawSky(px, W, t, scene === 3 ? 'dawn' : 'night');

        // Condet orchard ground
        px(0, 96, W, 52, STORY_PAL.greenDark);
        px(0, 96, W, 3, STORY_PAL.greenLight);

        const drawBelimbingTree = (tx) => {
            px(tx - 4, 72, 8, 28, '#5A3E2B');
            px(tx - 20, 50, 40, 24, STORY_PAL.green);
            px(tx - 14, 44, 28, 12, STORY_PAL.greenLight);
            px(tx - 10, 60, 5, 5, STORY_PAL.saffron);
            px(tx + 8, 56, 5, 5, STORY_PAL.saffron);
        };

        if (scene === -1) {
            drawBelimbingTree(36);
            drawBelimbingTree(282);
            this.drawBetawiHouse(px, 118, 66, 84, 38, t);
            [88, 160, 232].forEach((nx, i) => {
                this.drawPerson(px, nx, 104, {
                    robe: i === 1 ? STORY_PAL.violet : STORY_PAL.saffronDark,
                    hat: i === 1 ? STORY_PAL.saffron : STORY_PAL.cream,
                    hasBasket: i === 0,
                });
            });
            return;
        }

        if (scene === 0) {
            // Node 0: Mak Nani greets Anak Muda with woven basket under belimbing trees
            drawBelimbingTree(38);
            drawBelimbingTree(280);
            this.drawBetawiHouse(px, 66, 66, 72, 38, t);

            const walkIn = Math.min(132, 92 + st * 22);
            this.drawPerson(px, walkIn, 104, {
                robe: STORY_PAL.saffronDark,
                hat: STORY_PAL.cream,
                walkPhase: walkIn < 131 ? t * 6 : 0,
                hasBasket: true,
                facing: 1,
            });
            this.drawPerson(px, 184, 104, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, walkIn + 10, 78, t);
        } else if (scene === 1) {
            // Node 1: Harvesting ingredients from earth with rising hearts
            drawBelimbingTree(42);
            drawBelimbingTree(278);

            // Wooden prep table in center
            px(116, 104, 88, 6, '#8A5D3B');
            px(124, 110, 6, 14, '#5A3E2B');
            px(190, 110, 6, 14, '#5A3E2B');

            // Fresh spices & belimbing floating/resting on table
            const floatY = Math.sin(t * 4) * 3;
            px(138, 97 + floatY, 7, 7, STORY_PAL.saffron);
            px(156, 98 - floatY, 8, 6, STORY_PAL.greenLight);
            px(174, 97 + floatY, 6, 7, STORY_PAL.saffronDark);

            // Mak Nani & Anak Muda preparing ingredients
            this.drawPerson(px, 98, 104, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, armSwing: Math.round(Math.sin(t * 5) * 2), facing: 1 });
            this.drawPerson(px, 222, 104, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 106, 78, t);

            // Rising pixel hearts for love & respect of earth
            for (let h = 0; h < 3; h++) {
                const hy = 92 - ((t * 16 + h * 15) % 40);
                this.drawHeart(px, 140 + h * 20, hy, h % 2 === 0 ? STORY_PAL.saffron : STORY_PAL.greenLight);
            }
        } else if (scene === 2) {
            // Node 2: Warm Betawi kitchen, anglo hearth, steaming Soto Betawi bowls
            drawBelimbingTree(32);
            this.drawBetawiHouse(px, 64, 64, 94, 42, t);

            // Anglo stove & steaming pot
            px(176, 110, 22, 14, STORY_PAL.purpleDeep);
            px(180, 117, 14, 6, Math.floor(t * 8) % 2 === 0 ? STORY_PAL.saffron : STORY_PAL.danger);
            px(178, 102, 18, 8, STORY_PAL.saffronDark);
            for (let s = 0; s < 4; s++) {
                const sy = 98 - ((t * 16 + s * 6) % 24);
                const sx = 184 + Math.sin(t * 4 + s) * 4;
                px(sx, sy, 3, 3, STORY_PAL.cream);
            }

            // Serving table with glowing Soto Betawi bowls
            px(210, 110, 60, 5, '#8A5D3B');
            px(218, 104, 12, 6, STORY_PAL.cream);
            px(220, 103, 8, 2, STORY_PAL.saffron);
            px(244, 104, 12, 6, STORY_PAL.cream);
            px(246, 103, 8, 2, STORY_PAL.saffron);

            this.drawPerson(px, 152, 106, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, facing: 1 });
            this.drawPerson(px, 286, 106, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 158, 80, t);
        } else {
            // Node 3 / Ending: Glowing Bridge connecting Past & Future
            // Ciliwung water beneath bridge
            px(0, 122, W, 26, STORY_PAL.violet);
            for (let r = 0; r < 5; r++) {
                const rx = ((r * 65 + t * 12) % (W + 30)) - 15;
                px(rx, 130 + (r % 2) * 6, 20, 2, STORY_PAL.saffron);
            }

            // Past house (left)
            this.drawBetawiHouse(px, 18, 66, 60, 38, t);

            // Glowing golden arch bridge across center
            for (let bx = 86; bx <= 234; bx += 6) {
                const arch = Math.round(Math.sin(((bx - 86) / 148) * Math.PI) * 14);
                px(bx, 110 - arch, 7, 6, STORY_PAL.saffron);
                px(bx, 116 - arch, 7, 4, STORY_PAL.saffronDark);
            }

            // Future skyline silhouettes on right
            px(244, 62, 18, 44, STORY_PAL.purpleDeep);
            px(266, 52, 22, 54, STORY_PAL.violet);
            px(292, 68, 16, 38, STORY_PAL.purpleDeep);
            px(250, 70, 4, 4, STORY_PAL.saffron);
            px(274, 62, 4, 4, STORY_PAL.saffron);

            // Mak Nani passing glowing lantern to Anak Muda atop bridge
            this.drawPerson(px, 144, 82, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, hasLantern: true, facing: 1 });
            this.drawPerson(px, 178, 82, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, facing: -1 });
            if (this.isSpeaking && !this.isCelebration) this.drawSpeechBubble(px, 128, 56, t);
        }
    }

    // =========================================================
    // 3. SEJARAH KEMAYORAN (KAMPUNG) - PER-NODE ANIMATIONS
    // =========================================================
    renderKampungStory(px, W, H, t, st) {
        const scene = this.view === 'endingView' ? 3 : (this.view === 'mapView' ? -1 : this.nodeIndex);
        this.drawSky(px, W, t, scene === 3 ? 'dawn' : 'night');

        px(0, 98, W, 50, STORY_PAL.greenDark);
        px(0, 98, W, 3, STORY_PAL.greenLight);

        if (scene === -1) {
            this.drawBetawiHouse(px, 18, 68, 52, 34, t);
            this.drawBetawiHouse(px, 248, 68, 52, 34, t);
            for (let bx = 12; bx < W - 12; bx += 18) {
                const sag = Math.round(Math.sin((bx / W) * Math.PI) * 8 + Math.sin(t * 3 + bx) * 1.5);
                px(bx, 18 + sag, 9, 6, bx % 36 === 12 ? STORY_PAL.saffron : STORY_PAL.violetLight);
            }
            this.drawOndelOndel(px, 128, 72 + Math.round(Math.sin(t * 4) * 2), true);
            this.drawOndelOndel(px, 192, 72 + Math.round(Math.cos(t * 4) * 2), false);
            [88, 160, 232].forEach((nx, i) => {
                this.drawPerson(px, nx, 104, {
                    robe: i === 0 ? STORY_PAL.green : i === 1 ? STORY_PAL.violet : STORY_PAL.saffronDark,
                    hat: i === 2 ? STORY_PAL.cream : STORY_PAL.purpleDeep,
                });
            });
            return;
        }

        if (scene === 0) {
            // Node 0: Welcome at Gapura Kemayoran
            this.drawBetawiHouse(px, 24, 68, 54, 34, t);
            this.drawBetawiHouse(px, 240, 68, 54, 34, t);
            // Grand Gapura Kemayoran archway
            px(114, 58, 92, 8, STORY_PAL.saffron);
            px(122, 50, 76, 8, STORY_PAL.saffronDark);
            px(118, 66, 8, 42, STORY_PAL.saffronDark);
            px(194, 66, 8, 42, STORY_PAL.saffronDark);
            // Swaying warm lanterns
            px(132, 68 + Math.round(Math.sin(t * 3)), 5, 6, STORY_PAL.cream);
            px(183, 68 + Math.round(Math.cos(t * 3)), 5, 6, STORY_PAL.cream);

            // Pewisata welcoming walking visitors
            this.drawPerson(px, 152, 104, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, armSwing: 2, facing: 1 });
            const visitorX = Math.max(182, 238 - st * 18);
            this.drawPerson(px, visitorX, 104, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, walkPhase: visitorX > 183 ? t * 6 : 0, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 134, 78, t);
        } else if (scene === 1) {
            // Node 1: Time-lapse building of kampung & Rumah Kebaya!
            this.drawPalmTree(px, 34, 102, t);
            this.drawPalmTree(px, 286, 102, t);

            const rise = Math.min(1, 0.25 + st / 2.2);
            this.drawBetawiHouse(px, 122, 62, 76, 40, t, rise);

            // Builders carrying timber planks in rhythm
            const carry = Math.round(Math.sin(t * 5) * 10);
            this.drawPerson(px, 84 + carry, 104, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, walkPhase: t * 6, facing: 1 });
            px(80 + carry, 95, 16, 4, '#8A5D3B');

            this.drawPerson(px, 234 - carry, 104, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, walkPhase: t * 6, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 94 + carry, 78, t);

            // Hammer sparks while building
            if (rise < 0.98 && Math.floor(t * 8) % 2 === 0) {
                px(158, 70, 4, 4, STORY_PAL.saffron);
                px(164, 66, 3, 3, STORY_PAL.cream);
            }
        } else if (scene === 2) {
            // Node 2: Semangat Gotong Royong (villagers working harmoniously)
            this.drawBetawiHouse(px, 32, 66, 56, 36, t);
            this.drawBetawiHouse(px, 232, 66, 56, 36, t);

            // Cooperative team lifting beam & planting tree in center
            this.drawPalmTree(px, 160, 102, t);
            const syncLift = Math.round(Math.sin(t * 6) * 2);
            this.drawPerson(px, 118, 104, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, armSwing: syncLift, facing: 1 });
            this.drawPerson(px, 160, 104, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, armSwing: -syncLift, facing: 1 });
            this.drawPerson(px, 202, 104, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, armSwing: syncLift, facing: -1 });
            if (this.isSpeaking) this.drawSpeechBubble(px, 116, 78, t);

            // Golden unity sparkles linking villagers
            for (let u = 124; u <= 196; u += 14) {
                const uy = 86 + Math.round(Math.sin(t * 4 + u) * 3);
                px(u, uy, 3, 3, STORY_PAL.saffron);
            }
        } else {
            // Node 3 / Ending: Kemayoran Festival & Dancing Ondel-ondel
            this.drawBetawiHouse(px, 18, 68, 52, 34, t);
            this.drawBetawiHouse(px, 248, 68, 52, 34, t);
            for (let bx = 12; bx < W - 12; bx += 18) {
                const sag = Math.round(Math.sin((bx / W) * Math.PI) * 8 + Math.sin(t * 3 + bx) * 1.5);
                px(bx, 18 + sag, 9, 6, bx % 36 === 12 ? STORY_PAL.saffron : STORY_PAL.violetLight);
            }

            const bob1 = Math.round(Math.sin(t * 5) * 3);
            const bob2 = Math.round(Math.cos(t * 5) * 3);
            this.drawOndelOndel(px, 124, 72 + bob1, true);
            this.drawOndelOndel(px, 196, 72 + bob2, false);

            const cheer = Math.round(Math.abs(Math.sin(t * 6)) * 2);
            this.drawPerson(px, 88, 104 - cheer, { robe: STORY_PAL.green, hat: STORY_PAL.purpleDeep, armSwing: 3 });
            this.drawPerson(px, 160, 104 - cheer, { robe: STORY_PAL.violet, hat: STORY_PAL.saffron, armSwing: 3 });
            this.drawPerson(px, 232, 104 - cheer, { robe: STORY_PAL.saffronDark, hat: STORY_PAL.cream, armSwing: 3 });
            if (this.isSpeaking && !this.isCelebration) this.drawSpeechBubble(px, 96, 78, t);
        }
    }
}

class NarrativeGameEngine {
    constructor(storyId) {
        this.storyId = storyId;
        this.currentNodeIndex = 0;
        this.displayedText = '';
        this.fullText = '';
        this.isTyping = false;
        this.showChoices = false;
        this.gameEnded = false;
        this.selectedNPC = null;
        this.conversationStarted = false;
        this.typingTimeoutId = null;
        this.dialogEndTimeoutId = null;
        this.rafId = null;
        this.animator = null;
        this.storyData = null;
        this.startedAt = Date.now();
    }

    clearAllTimers() {
        if (this.typingTimeoutId) {
            clearTimeout(this.typingTimeoutId);
            this.typingTimeoutId = null;
        }
        if (this.dialogEndTimeoutId) {
            clearTimeout(this.dialogEndTimeoutId);
            this.dialogEndTimeoutId = null;
        }
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy() {
        this.clearAllTimers();
    }

    getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content && meta.content !== 'NOTPROVIDED') return meta.content;
        const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
        return m ? decodeURIComponent(m[1]) : '';
    }

    escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    getSceneCaption(viewKey, nodeIndex) {
        const map = SCENE_CAPTIONS[this.storyId] || SCENE_CAPTIONS.kampung;
        if (viewKey === 'mapView') return map.map;
        if (viewKey === 'endingView') return map.ending;
        return map[nodeIndex] || map[0];
    }

    async init() {
        try {
            const response = await fetch(`/peta/api/story/${this.storyId}/`);
            if (!response.ok) {
                throw new Error(`Failed to load story (${response.status})`);
            }
            this.storyData = await response.json();
            this.animator = new StoryCanvasAnimator(this.storyId, this.storyData.npcs || []);
            this.startedAt = Date.now();
            this.render('mapView');
        } catch (error) {
            console.error('[NarrativeGameEngine] Error initializing game:', error);
            this.showError('Gagal memuat kisah. Silakan muat ulang halaman.');
        }
    }

    startCanvasLoop(stateOpts) {
        const canvas = document.getElementById('storyStageCanvas');
        if (!canvas || !this.animator) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        this.animator.setState(stateOpts);

        let lastTs = performance.now();
        const step = (ts) => {
            const dt = Math.min(0.05, (ts - lastTs) / 1000);
            lastTs = ts;
            if (!document.getElementById('storyStageCanvas')) {
                this.rafId = null;
                return;
            }
            this.animator.drawFrame(ctx, dt);
            this.rafId = requestAnimationFrame(step);
        };
        this.rafId = requestAnimationFrame(step);
    }

    render(view) {
        this.clearAllTimers();
        const container = document.getElementById('gameContainer');
        if (!container) return;

        container.innerHTML = '';

        switch (view) {
            case 'mapView':
                this.renderMapView();
                break;
            case 'dialogView':
                this.renderDialogView();
                break;
            case 'endingView':
                this.renderEndingView();
                break;
        }
    }

    findSpeakerInfo(speakerName) {
        const raw = String(speakerName || '').trim();
        const lower = raw.toLowerCase();
        const npcs = this.storyData?.npcs || [];

        const matched = npcs.find(
            n => n.id.toLowerCase() === lower || n.name.toLowerCase() === lower
        ) || this.selectedNPC || npcs[0];

        return {
            name: raw || matched?.name || 'Karakter Betawi',
            emoji: matched?.emoji || '👤',
        };
    }

    renderMapView() {
        const bg = this.storyData.background || 'linear-gradient(135deg, #2C263F 0%, #41644A 100%)';
        const caption = this.getSceneCaption('mapView', 0);
        const npcCardsHtml = (this.storyData.npcs || []).map(npc => `
            <button type="button" class="rpg-npc-card npc-btn" data-npc-id="${this.escHtml(npc.id)}">
                <div class="rpg-npc-avatar">${this.escHtml(npc.emoji)}</div>
                <div class="rpg-npc-name">${this.escHtml(npc.name)}</div>
                <span class="pixel-badge pixel-badge-gold">▶ AJAK BICARA</span>
            </button>
        `).join('');

        const mapHTML = `
            <div class="rpg-stage" style="background:${bg};">
                <div class="rpg-shell">
                    <div class="rpg-arcade-frame">
                        <div class="rpg-hud-bar">
                            <a href="/peta/" class="pixel-btn pixel-btn-sm pixel-btn-violet">← PETA BUDAYA</a>
                            <h1 class="rpg-hud-title">${this.escHtml(this.storyData.title)}</h1>
                            <a href="/" class="pixel-btn pixel-btn-sm pixel-btn-gold">🏠 BERANDA</a>
                        </div>

                        <div class="rpg-canvas-wrap">
                            <canvas id="storyStageCanvas" width="320" height="148" aria-label="Animasi 8-Bit ${this.escHtml(this.storyData.title)}"></canvas>
                            <div class="rpg-scanlines pixel-scanlines"></div>
                            <div style="position:absolute;top:10px;left:10px;z-index:4;">
                                <span class="pixel-badge pixel-badge-gold">${this.escHtml(caption)}</span>
                            </div>
                        </div>

                        <div class="rpg-body-section">
                            <div class="rpg-prompt-bar">
                                <span>🎬 <strong>Pilih Tokoh</strong> di bawah ini untuk memulai percakapan &amp; animasi alur cerita:</span>
                                <span class="pixel-badge pixel-badge-gold">8-BIT INTERAKTIF</span>
                            </div>

                            <div class="rpg-npc-grid">
                                ${npcCardsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('gameContainer').innerHTML = mapHTML;
        this.attachMapEventListeners();
        this.startCanvasLoop({
            view: 'mapView',
            nodeIndex: 0,
            nodeId: 'start',
            activeSpeaker: '',
            isSpeaking: false,
            isCelebration: false
        });
    }

    renderDialogView() {
        const currentNode = this.storyData.dialogues[this.currentNodeIndex];
        if (!currentNode) {
            this.gameEnded = true;
            this.render('endingView');
            return;
        }

        const speaker = this.findSpeakerInfo(currentNode.speaker);
        const caption = this.getSceneCaption('dialogView', this.currentNodeIndex);
        const bg = this.storyData.background || 'linear-gradient(135deg, #2C263F 0%, #41644A 100%)';

        const choicesHtml = (currentNode.choices || []).map(choice => `
            <button type="button" class="rpg-choice-btn" data-next="${choice.next}">
                <span>▶</span>
                <span>${this.escHtml(choice.text)}</span>
            </button>
        `).join('');

        const dialogHTML = `
            <div class="rpg-stage" style="background:${bg};">
                <div class="rpg-shell">
                    <div class="rpg-arcade-frame">
                        <div class="rpg-hud-bar">
                            <button type="button" class="pixel-btn pixel-btn-sm pixel-btn-violet btn-back-map">← PILIH TOKOH</button>
                            <span class="pixel-badge pixel-badge-gold">
                                DIALOG ${this.currentNodeIndex + 1} / ${this.storyData.dialogues.length}
                            </span>
                            <a href="/" class="pixel-btn pixel-btn-sm pixel-btn-gold">🏠 BERANDA</a>
                        </div>

                        <div class="rpg-canvas-wrap">
                            <canvas id="storyStageCanvas" width="320" height="148" aria-label="Animasi dialog ${this.escHtml(speaker.name)}"></canvas>
                            <div class="rpg-scanlines pixel-scanlines"></div>
                            <div style="position:absolute;top:10px;left:10px;z-index:4;">
                                <span class="pixel-badge pixel-badge-gold">${this.escHtml(caption)}</span>
                            </div>
                        </div>

                        <div class="rpg-body-section">
                            <div class="rpg-dialog-box" id="rpgDialogBox" title="Klik untuk percepat teks">
                                <div class="rpg-dialog-speaker">
                                    <div style="display:flex;align-items:center;gap:12px;">
                                        <div class="rpg-dialog-portrait">${this.escHtml(speaker.emoji)}</div>
                                        <div>
                                            <h2 class="font-hud" style="margin:0;color:var(--saffron);font-size:1.08rem;">
                                                ${this.escHtml(speaker.name)}
                                            </h2>
                                            <p style="margin:2px 0 0;color:var(--lavender-muted);font-size:0.8rem;">
                                                ${this.escHtml(this.storyData.title)}
                                            </p>
                                        </div>
                                    </div>
                                    <span style="font-size:0.74rem;color:var(--lavender-muted);">Klik dialog untuk percepat teks</span>
                                </div>

                                <div class="rpg-dialog-body">
                                    <div class="dialog-text">${this.escHtml(this.displayedText)}<span class="typing-cursor" style="${this.isTyping ? '' : 'display:none;'}">▮</span></div>
                                </div>

                                <div class="rpg-choices-area" style="${!this.showChoices || !currentNode.choices ? 'display:none;' : ''}">
                                    <p class="font-hud" style="margin:0 0 10px;color:var(--saffron);font-size:0.82rem;">
                                        PILIH JAWABANMU:
                                    </p>
                                    <div style="display:grid;gap:10px;">
                                        ${choicesHtml}
                                    </div>
                                </div>

                                <div class="continue-hint" style="${this.isTyping || this.showChoices || this.gameEnded ? 'display:none;' : ''}padding:0 18px 18px;text-align:center;">
                                    <span class="pixel-badge pixel-badge-green">⏭️ Melanjutkan cerita...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('gameContainer').innerHTML = dialogHTML;
        this.attachDialogEventListeners();
        this.startCanvasLoop({
            view: 'dialogView',
            nodeIndex: this.currentNodeIndex,
            nodeId: currentNode.nodeId || 'start',
            activeSpeaker: currentNode.speaker,
            isSpeaking: true,
            isCelebration: false,
        });

        if (this.conversationStarted) {
            this.startTyping();
        }
    }

    renderEndingView() {
        const bg = this.storyData.background || 'linear-gradient(135deg, #2C263F 0%, #41644A 100%)';
        const caption = this.getSceneCaption('endingView', 0);

        const endingHTML = `
            <div class="rpg-stage" style="background:${bg};">
                <div class="rpg-shell">
                    <div class="rpg-arcade-frame">
                        <div class="rpg-hud-bar">
                            <a href="/peta/" class="pixel-btn pixel-btn-sm pixel-btn-violet">← PETA BUDAYA</a>
                            <span class="pixel-badge pixel-badge-green">✓ MISI KISAH SELESAI</span>
                            <a href="/" class="pixel-btn pixel-btn-sm pixel-btn-gold">🏠 BERANDA</a>
                        </div>

                        <div class="rpg-canvas-wrap">
                            <canvas id="storyStageCanvas" width="320" height="148" aria-label="Perayaan akhir kisah"></canvas>
                            <div class="rpg-scanlines pixel-scanlines"></div>
                            <div style="position:absolute;top:10px;left:10px;z-index:4;">
                                <span class="pixel-badge pixel-badge-gold">${this.escHtml(caption)}</span>
                            </div>
                        </div>

                        <div class="rpg-body-section" style="text-align:center;">
                            <h2 class="font-pixel" style="font-size:1.15rem;color:var(--saffron);margin-bottom:16px;">
                                ✨ KISAH SELESAI! ✨
                            </h2>

                            <div class="pixel-panel-green" style="padding:18px;margin-bottom:20px;text-align:left;">
                                <p class="font-hud" style="margin:0 0 8px;color:var(--saffron);font-size:0.9rem;">
                                    💡 PESAN MORAL BUDAYA BETAWI:
                                </p>
                                <p style="margin:0;color:var(--cream);line-height:1.65;font-size:0.95rem;">
                                    ${this.escHtml(this.storyData.moralMessage)}
                                </p>
                            </div>

                            <div class="rpg-ending-actions">
                                <button type="button" class="pixel-btn pixel-btn-violet pixel-btn-wrap btn-restart">🔄 Ulangi Kisah</button>
                                <a href="/peta/" class="pixel-btn pixel-btn-green pixel-btn-wrap">🗺️ Kembali ke Peta</a>
                                <a href="/" class="pixel-btn pixel-btn-gold pixel-btn-wrap">🏠 Beranda</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('gameContainer').innerHTML = endingHTML;
        this.attachEndingEventListeners();
        this.startCanvasLoop({
            view: 'endingView',
            nodeIndex: (this.storyData.dialogues?.length || 1) - 1,
            nodeId: 'end',
            activeSpeaker: '',
            isSpeaking: false,
            isCelebration: true
        });
        this.saveProgress();
    }

    async saveProgress() {
        const duration = Math.max(1, Math.round((Date.now() - this.startedAt) / 1000));
        const lastNode = this.storyData?.dialogues?.[this.storyData.dialogues.length - 1];
        try {
            await fetch(`/peta/api/story/${this.storyId}/progress/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                    nodeId: lastNode?.nodeId || null,
                    duration: duration,
                    completed: true,
                })
            });
        } catch (err) {
            console.warn('Gagal menyimpan progres cerita:', err);
        }
    }

    attachMapEventListeners() {
        document.querySelectorAll('.npc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const npcId = btn.dataset.npcId;
                const npc = this.storyData.npcs.find(n => n.id === npcId);
                this.selectedNPC = npc || null;
                this.conversationStarted = true;
                this.currentNodeIndex = 0;
                this.displayedText = '';
                this.isTyping = false;
                this.showChoices = false;
                this.gameEnded = false;
                this.startedAt = Date.now();
                this.render('dialogView');
            });
        });
    }

    attachDialogEventListeners() {
        document.querySelectorAll('.rpg-choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const rawNext = btn.dataset.next;
                const nextIndex = parseInt(rawNext, 10);
                if (Number.isNaN(nextIndex) || nextIndex < 0 || nextIndex >= this.storyData.dialogues.length) {
                    this.gameEnded = true;
                    this.render('endingView');
                    return;
                }
                this.currentNodeIndex = nextIndex;
                this.displayedText = '';
                this.isTyping = false;
                this.showChoices = false;
                this.render('dialogView');
            });
        });

        document.querySelector('.btn-back-map')?.addEventListener('click', () => {
            this.render('mapView');
        });

        document.getElementById('rpgDialogBox')?.addEventListener('click', (e) => {
            if (e.target.closest('button, a')) return;
            this.finishTypingImmediately();
        });
    }

    attachEndingEventListeners() {
        document.querySelector('.btn-restart')?.addEventListener('click', () => {
            this.selectedNPC = null;
            this.conversationStarted = false;
            this.currentNodeIndex = 0;
            this.displayedText = '';
            this.isTyping = false;
            this.showChoices = false;
            this.gameEnded = false;
            this.render('mapView');
        });
    }

    finishTypingImmediately() {
        if (!this.isTyping) return;
        if (this.typingTimeoutId) {
            clearTimeout(this.typingTimeoutId);
            this.typingTimeoutId = null;
        }
        const currentNode = this.storyData.dialogues[this.currentNodeIndex];
        this.isTyping = false;
        this.displayedText = this.fullText;
        this.animator?.setState({ activeSpeaker: currentNode?.speaker || '', isSpeaking: false, isCelebration: false });
        this.onTypingComplete(currentNode);
    }

    startTyping() {
        if (this.typingTimeoutId) clearTimeout(this.typingTimeoutId);
        if (this.dialogEndTimeoutId) clearTimeout(this.dialogEndTimeoutId);

        const currentNode = this.storyData.dialogues[this.currentNodeIndex];
        if (!currentNode) return;

        this.isTyping = true;
        this.displayedText = '';
        this.fullText = currentNode.text || '';
        let currentIndex = 0;

        const typeCharacter = () => {
            if (currentIndex <= this.fullText.length) {
                this.displayedText = this.fullText.slice(0, currentIndex);
                const delay = this.fullText[currentIndex] === '…' ? 450 : 28;
                currentIndex++;
                this.updateDialog();
                this.typingTimeoutId = setTimeout(typeCharacter, delay);
            } else {
                this.isTyping = false;
                this.typingTimeoutId = null;
                this.animator?.setState({ activeSpeaker: currentNode.speaker, isSpeaking: false, isCelebration: false });
                this.onTypingComplete(currentNode);
            }
        };

        typeCharacter();
    }

    onTypingComplete(currentNode) {
        if (currentNode && currentNode.choices && currentNode.choices.length > 0) {
            this.showChoices = true;
            this.updateDialog();
            return;
        }

        this.updateDialog();
        this.dialogEndTimeoutId = setTimeout(() => {
            if (currentNode && currentNode.next !== undefined && currentNode.next !== null) {
                this.currentNodeIndex = currentNode.next;
                this.displayedText = '';
                this.isTyping = false;
                this.showChoices = false;
                this.render('dialogView');
            } else {
                this.gameEnded = true;
                this.render('endingView');
            }
        }, 1800);
    }

    updateDialog() {
        const textElement = document.querySelector('.dialog-text');
        if (textElement) {
            textElement.innerHTML = `${this.escHtml(this.displayedText)}<span class="typing-cursor" style="${this.isTyping ? '' : 'display:none;'}">▮</span>`;
        }

        const choicesContainer = document.querySelector('.rpg-choices-area');
        const continueHint = document.querySelector('.continue-hint');
        if (choicesContainer) {
            choicesContainer.style.display = this.showChoices ? 'block' : 'none';
        }
        if (continueHint) {
            continueHint.style.display = !this.isTyping && !this.showChoices && !this.gameEnded ? 'block' : 'none';
        }
    }

    showError(message) {
        const container = document.getElementById('gameContainer');
        container.innerHTML = `
            <div class="pixel-page">
                <div class="pixel-container-narrow pixel-panel" style="padding:28px;text-align:center;">
                    <h2 class="font-hud" style="color:var(--danger);margin-bottom:10px;">⚠️ Terjadi Kesalahan</h2>
                    <p style="color:var(--cream);margin-bottom:18px;">${this.escHtml(message)}</p>
                    <a href="/peta/" class="pixel-btn pixel-btn-gold">← Kembali ke Peta Budaya</a>
                </div>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const storyId = window.CURRENT_STORY_ID || 'pitung';
    const game = new NarrativeGameEngine(storyId);
    game.init();
    window.game = game;
});
