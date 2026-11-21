/**
 * Peta Budaya - Real Interactive Jakarta Map (Leaflet + 8-Bit Landmark Preview + Geo SVG Fallback)
 */

const JAKARTA_META = {
    'kemayoran': {
        lat: -6.1618,
        lng: 106.8544,
        wilayah: 'Jakarta Pusat',
        emoji: '🎭'
    },
    'condet': {
        lat: -6.2785,
        lng: 106.8568,
        wilayah: 'Kramat Jati, Jakarta Timur',
        emoji: '🍈'
    },
    'setu-babakan': {
        lat: -6.3414,
        lng: 106.8240,
        wilayah: 'Jagakarsa, Jakarta Selatan',
        emoji: '🏛️'
    }
};

class PetaBudaya {
    constructor() {
        this.locations = [];
        this.selectedLocation = null;
        this.map = null;
        this.tileLayers = {};
        this.activeLayerKey = 'street';
        this.markersById = {};
        this.bounds = null;
        this.osmErrorCount = 0;
        this.init();
    }

    async init() {
        await this.loadLocations();
        this.setupEventListeners();
        this.initMap();
        this.renderLocationsList();
    }

    escHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    getFallbackLocations() {
        return [
            {
                id: 'kemayoran',
                name: 'Kemayoran',
                coords: { x: 48, y: 34 },
                description: 'Kawasan bersejarah dengan festival rakyat dan jejak sejarah Betawi tempo dulu.',
                category: 'Festival & Sejarah',
                story: 'kampung'
            },
            {
                id: 'condet',
                name: 'Condet',
                coords: { x: 68, y: 58 },
                description: 'Kampung tradisi yang terkenal dengan buah belimbing dan kuliner khas Betawi.',
                category: 'Tradisi & Kuliner',
                story: 'maknani'
            },
            {
                id: 'setu-babakan',
                name: 'Setu Babakan',
                coords: { x: 45, y: 65 },
                description: 'Perkampungan Budaya Betawi - pusat pelestarian seni, tradisi, dan kuliner Betawi.',
                category: 'Pusat Budaya',
                story: 'pitung'
            }
        ];
    }

    enrichLocation(raw) {
        const meta = JAKARTA_META[raw.id] || {
            lat: -6.2088,
            lng: 106.8456,
            wilayah: 'DKI Jakarta',
            emoji: '📍'
        };
        return {
            ...raw,
            lat: meta.lat,
            lng: meta.lng,
            wilayah: meta.wilayah,
            emoji: meta.emoji
        };
    }

    async loadLocations() {
        let baseList = null;
        try {
            const resp = await fetch('/peta/api/locations/');
            if (resp.ok) {
                const payload = await resp.json();
                if (payload.locations && payload.locations.length > 0) {
                    baseList = payload.locations.map(loc => ({
                        id: loc.id,
                        name: loc.name,
                        coords: { x: loc.coord_x, y: loc.coord_y },
                        description: loc.description,
                        category: loc.category,
                        story: loc.story ? loc.story.id : null,
                    }));
                }
            }
        } catch (err) {
            console.warn('Menggunakan data lokasi default:', err);
        }

        const list = baseList || this.getFallbackLocations();
        this.locations = list.map(loc => this.enrichLocation(loc));
    }

    setupEventListeners() {
        document.getElementById('closeLocationBtn')?.addEventListener('click', () => this.deselectLocation());
        document.getElementById('backToListBtn')?.addEventListener('click', () => this.deselectLocation());
        document.getElementById('openStoryBtn')?.addEventListener('click', () => this.openStory());
        document.getElementById('resetMapBtn')?.addEventListener('click', () => this.resetView());

        document.querySelectorAll('.map-layer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layerKey = btn.getAttribute('data-layer');
                if (layerKey) this.switchLayer(layerKey);
            });
        });
    }

    initMap() {
        const mapEl = document.getElementById('jakartaMap');
        if (!mapEl) return;

        if (typeof L !== 'undefined') {
            this.initLeafletMap(mapEl);
        } else {
            this.initOfflineGeoSvgMap(mapEl);
        }
    }

    initLeafletMap(mapEl) {
        this.map = L.map(mapEl, {
            center: [-6.2500, 106.8420],
            zoom: 11,
            scrollWheelZoom: true,
        });

        const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        });

        const voyagerFallback = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            maxZoom: 19,
        });

        osmLayer.on('tileerror', () => {
            this.osmErrorCount++;
            if (this.osmErrorCount >= 3 && this.activeLayerKey === 'street' && this.map.hasLayer(osmLayer)) {
                this.map.removeLayer(osmLayer);
                this.tileLayers.street = voyagerFallback;
                voyagerFallback.addTo(this.map);
            }
        });

        this.tileLayers = {
            street: osmLayer,
            dark: L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO',
                maxZoom: 19,
            }),
            satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri',
                maxZoom: 18,
            }),
        };

        this.tileLayers.street.addTo(this.map);

        // Connect Kemayoran -> Condet -> Setu Babakan with dashed Saffron route
        const order = ['kemayoran', 'condet', 'setu-babakan'];
        const routeCoords = order
            .map(id => this.locations.find(l => l.id === id))
            .filter(Boolean)
            .map(l => [l.lat, l.lng]);

        if (routeCoords.length >= 2) {
            L.polyline(routeCoords, {
                color: '#F8C662',
                weight: 4,
                opacity: 0.9,
                dashArray: '8, 8',
            }).addTo(this.map);
        }

        const latLngs = [];

        this.locations.forEach(location => {
            latLngs.push([location.lat, location.lng]);
            const icon = this.createDivIcon(location, false);
            const marker = L.marker([location.lat, location.lng], { icon }).addTo(this.map);

            const storyBtnHtml = location.story
                ? `<a href="/peta/cerita/${this.escHtml(location.story)}/" class="pixel-btn pixel-btn-sm pixel-btn-gold" style="width:100%;">📖 Main Sekilas Kisah</a>`
                : '';

            marker.bindPopup(`
                <div class="peta-popup-box">
                    <div class="peta-popup-title">${this.escHtml(location.emoji)} ${this.escHtml(location.name)}</div>
                    <div class="peta-popup-sub">${this.escHtml(location.wilayah)} • ${this.escHtml(location.category)}</div>
                    <div class="peta-popup-desc">${this.escHtml(location.description)}</div>
                    ${storyBtnHtml}
                </div>
            `);

            marker.on('click', () => {
                this.selectLocation(location, false);
            });

            this.markersById[location.id] = marker;
        });

        if (latLngs.length > 0) {
            this.bounds = L.latLngBounds(latLngs);
            this.map.fitBounds(this.bounds, { padding: [50, 50] });
        }

        setTimeout(() => {
            this.map?.invalidateSize();
        }, 250);
    }

    createDivIcon(location, isSelected) {
        return L.divIcon({
            className: 'peta-div-marker' + (isSelected ? ' selected' : ''),
            html: `
                <div class="peta-pin-wrap">
                    <div class="peta-pin-pulse"></div>
                    <div class="peta-pin-box">${this.escHtml(location.emoji)}</div>
                    <div class="peta-pin-label">${this.escHtml(location.name)}</div>
                </div>
            `,
            iconSize: [44, 62],
            iconAnchor: [22, 40],
            popupAnchor: [0, -44],
        });
    }

    switchLayer(layerKey) {
        document.querySelectorAll('.map-layer-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-layer') === layerKey);
        });

        if (!this.map || !this.tileLayers[layerKey]) return;
        if (this.tileLayers[this.activeLayerKey]) {
            this.map.removeLayer(this.tileLayers[this.activeLayerKey]);
        }
        this.tileLayers[layerKey].addTo(this.map);
        this.activeLayerKey = layerKey;
    }

    resetView() {
        this.deselectLocation();
        if (this.map && this.bounds) {
            this.map.closePopup();
            this.map.fitBounds(this.bounds, { padding: [50, 50] });
        }
        const statusEl = document.getElementById('mapStatusText');
        if (statusEl) {
            statusEl.textContent = '📍 Klik pin Kemayoran, Condet, atau Setu Babakan di peta Jakarta';
        }
    }

    initOfflineGeoSvgMap(mapEl) {
        mapEl.innerHTML = `
            <div class="svg-fallback-wrap">
                <svg viewBox="0 0 800 500" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-label="Peta Wilayah DKI Jakarta">
                    <rect width="800" height="500" fill="#1B1729"/>
                    <path d="M0,0 L800,0 L800,115 Q620,130 420,105 Q220,85 0,120 Z" fill="#595082" opacity="0.55"/>
                    <text x="410" y="55" fill="#FFF7E0" font-size="14" font-family="monospace" text-anchor="middle">TELUK JAKARTA</text>
                    <path d="M90,125 L340,105 L540,115 L710,130 L740,260 L660,380 L540,460 L380,475 L250,420 L140,310 Z"
                          fill="#213722" stroke="#F8C662" stroke-width="4"/>
                    <path d="M405,112 Q420,195 435,270 Q450,350 415,465" fill="none" stroke="#7B71AD" stroke-width="7" stroke-linecap="round"/>
                    <polyline points="445,175 495,315 390,415" fill="none" stroke="#F8C662" stroke-width="3" stroke-dasharray="8,8"/>
                    <text x="200" y="235" fill="#C7C0DE" font-size="12" font-family="monospace">JAKARTA BARAT</text>
                    <text x="380" y="230" fill="#FFF7E0" font-size="12" font-family="monospace">🏛️ MONAS (JAKPUS)</text>
                    <text x="580" y="255" fill="#C7C0DE" font-size="12" font-family="monospace">JAKARTA TIMUR</text>
                    <text x="230" y="365" fill="#C7C0DE" font-size="12" font-family="monospace">JAKARTA SELATAN</text>
                </svg>
                <div id="svgFallbackPins" style="position:absolute;inset:0;"></div>
            </div>
        `;

        const pinPositions = {
            'kemayoran': { x: 56, y: 35 },
            'condet': { x: 62, y: 63 },
            'setu-babakan': { x: 49, y: 83 },
        };

        const pinsWrap = document.getElementById('svgFallbackPins');
        this.locations.forEach(loc => {
            const pos = pinPositions[loc.id] || { x: loc.coords.x, y: loc.coords.y };
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'peta-div-marker';
            btn.id = `svg-marker-${loc.id}`;
            btn.style.cssText = `position:absolute;left:${pos.x}%;top:${pos.y}%;cursor:pointer;`;
            btn.innerHTML = `
                <div class="peta-pin-wrap">
                    <div class="peta-pin-pulse"></div>
                    <div class="peta-pin-box">${this.escHtml(loc.emoji)}</div>
                    <div class="peta-pin-label">${this.escHtml(loc.name)}</div>
                </div>
            `;
            btn.addEventListener('click', () => this.selectLocation(loc, false));
            pinsWrap.appendChild(btn);
        });
    }

    renderLocationPreview(locId) {
        const canvas = document.getElementById('locationPreviewCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        const W = canvas.width;
        const H = canvas.height;
        const px = (x, y, w, h, c) => {
            ctx.fillStyle = c;
            ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
        };

        // Sky
        px(0, 0, W, 65, '#2C263F');
        px(0, 42, W, 24, '#595082');
        // Stars
        [[25, 16], [70, 28], [130, 12], [205, 22], [248, 15]].forEach(([sx, sy]) => px(sx, sy, 3, 3, '#FFF7E0'));
        // Moon
        px(230, 16, 16, 16, '#F8C662');
        px(233, 19, 6, 5, '#FFF7E0');

        // Ground
        px(0, 66, W, 44, '#213722');
        px(0, 66, W, 4, '#5A8866');

        if (locId === 'setu-babakan') {
            // Lake water
            px(0, 82, W, 28, '#595082');
            px(18, 88, 28, 3, '#F8C662');
            px(96, 94, 34, 3, '#FFF7E0');
            px(195, 86, 26, 3, '#F8C662');
            // Rumah Kebaya
            px(90, 46, 86, 30, '#41644A');
            px(80, 38, 106, 10, '#F8C662');
            px(98, 28, 70, 10, '#C9932E');
            px(126, 54, 16, 22, '#1B1729');
            px(102, 54, 12, 10, '#F8C662');
            px(152, 54, 12, 10, '#F8C662');
        } else if (locId === 'condet') {
            // Lush belimbing trees + Mak Nani dapur hearth
            [48, 225].forEach(tx => {
                px(tx - 4, 48, 8, 22, '#5A3E2B');
                px(tx - 20, 26, 40, 24, '#41644A');
                px(tx - 10, 36, 5, 5, '#F8C662');
                px(tx + 6, 32, 5, 5, '#F8C662');
            });
            // Cooking pot & warm hearth
            px(120, 48, 44, 24, '#2C263F');
            px(134, 62, 16, 10, '#F8C662');
            px(138, 52, 8, 6, '#FFF7E0');
        } else {
            // Kemayoran Ondel-ondel & Festival Flags
            for (let fx = 10; fx < W - 20; fx += 24) {
                px(fx, 18, 12, 7, fx % 48 === 10 ? '#F8C662' : '#7B71AD');
            }
            // Ondel-ondel pair
            px(96, 42, 22, 34, '#C9932E');
            px(98, 24, 18, 18, '#E05A5A');
            px(96, 14, 22, 8, '#F8C662');

            px(164, 42, 22, 34, '#595082');
            px(166, 24, 18, 18, '#FFF7E0');
            px(164, 14, 22, 8, '#F8C662');
        }
    }

    selectLocation(location, shouldFly = true) {
        this.selectedLocation = location;
        this.updateUI();
        this.updateAllMarkers();
        this.updateLocationsList();
        this.renderLocationPreview(location.id);

        const statusEl = document.getElementById('mapStatusText');
        if (statusEl) {
            statusEl.textContent = `📍 ${location.name} (${location.wilayah}) — ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
        }

        if (this.map) {
            const marker = this.markersById[location.id];
            if (shouldFly) {
                this.map.flyTo([location.lat, location.lng], 14, { duration: 0.85 });
            }
            if (marker) {
                marker.openPopup();
            }
        }
    }

    deselectLocation() {
        this.selectedLocation = null;
        this.updateUI();
        this.updateAllMarkers();
        this.updateLocationsList();
    }

    updateAllMarkers() {
        this.locations.forEach(location => {
            const isSelected = this.selectedLocation?.id === location.id;
            const marker = this.markersById[location.id];
            if (marker) {
                marker.setIcon(this.createDivIcon(location, isSelected));
            }
            const svgMarker = document.getElementById(`svg-marker-${location.id}`);
            if (svgMarker) {
                svgMarker.classList.toggle('selected', isSelected);
            }
        });
    }

    updateUI() {
        const locationPanel = document.getElementById('location-panel');
        const defaultPanel = document.getElementById('default-panel');

        if (!this.selectedLocation) {
            locationPanel?.classList.add('hidden');
            defaultPanel?.classList.remove('hidden');
            return;
        }

        locationPanel?.classList.remove('hidden');
        defaultPanel?.classList.add('hidden');

        const nameEl = document.getElementById('location-name');
        const wilayahEl = document.getElementById('location-wilayah');
        const categoryEl = document.getElementById('location-category');
        const coordsEl = document.getElementById('location-coords');
        const descriptionEl = document.getElementById('location-description');

        if (nameEl) nameEl.textContent = `${this.selectedLocation.emoji} ${this.selectedLocation.name}`;
        if (wilayahEl) wilayahEl.textContent = this.selectedLocation.wilayah;
        if (categoryEl) categoryEl.textContent = this.selectedLocation.category;
        if (coordsEl) {
            coordsEl.textContent = `${this.selectedLocation.lat.toFixed(3)}, ${this.selectedLocation.lng.toFixed(3)}`;
        }
        if (descriptionEl) descriptionEl.textContent = this.selectedLocation.description;
    }

    renderLocationsList() {
        const listContainer = document.getElementById('locations-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        this.locations.forEach(location => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'location-item';
            item.id = `list-${location.id}`;

            const icon = document.createElement('div');
            icon.className = 'location-item-icon';
            icon.textContent = location.emoji || '📍';

            const content = document.createElement('div');
            content.className = 'location-item-content';

            const nameEl = document.createElement('p');
            nameEl.className = 'location-item-name';
            nameEl.textContent = location.name;

            const catEl = document.createElement('p');
            catEl.className = 'location-item-category';
            catEl.textContent = `${location.wilayah} • ${location.category}`;

            content.appendChild(nameEl);
            content.appendChild(catEl);
            item.appendChild(icon);
            item.appendChild(content);

            item.addEventListener('click', () => this.selectLocation(location, true));
            listContainer.appendChild(item);
        });

        this.updateLocationsList();
    }

    updateLocationsList() {
        this.locations.forEach(location => {
            const item = document.getElementById(`list-${location.id}`);
            if (item) {
                item.classList.toggle('active', this.selectedLocation?.id === location.id);
            }
        });
    }

    openStory() {
        if (!this.selectedLocation || !this.selectedLocation.story) {
            console.error('No story available for this location');
            return;
        }
        window.location.href = `/peta/cerita/${this.selectedLocation.story}/`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PetaBudaya();
});
