/**
 * Peta Budaya - Cultural Map Interactive System
 */

class PetaBudaya {
    constructor() {
        this.locations = [];
        this.selectedLocation = null;
        this.hoveredLocation = null;
        this.init();
    }

    async init() {
        await this.loadLocations();
        this.setupEventListeners();
        this.renderMarkers();
        this.renderLocationsList();
    }

    loadLocations() {
        // Locations data - would normally come from the backend
        this.locations = [
            {
                id: 'setu-babakan',
                name: 'Setu Babakan',
                coords: { x: 45, y: 60 },
                description: 'Perkampungan Budaya Betawi - pusat pelestarian seni, tradisi, dan kuliner Betawi.',
                category: 'Pusat Budaya',
                story: 'pitung'
            },
            {
                id: 'condet',
                name: 'Condet',
                coords: { x: 65, y: 55 },
                description: 'Kampung tradisi yang terkenal dengan buah belimbing dan kuliner khas Betawi.',
                category: 'Tradisi & Kuliner',
                story: 'maknani'
            },
            {
                id: 'kemayoran',
                name: 'Kemayoran',
                coords: { x: 50, y: 35 },
                description: 'Kawasan bersejarah dengan festival rakyat dan jejak sejarah Betawi tempo dulu.',
                category: 'Festival & Sejarah',
                story: 'kampung'
            }
        ];
    }

    setupEventListeners() {
        // Close location panel
        const closeLocationBtn = document.getElementById('closeLocationBtn');
        if (closeLocationBtn) {
            closeLocationBtn.addEventListener('click', () => this.deselectLocation());
        }

        // Open story
        const openStoryBtn = document.getElementById('openStoryBtn');
        if (openStoryBtn) {
            openStoryBtn.addEventListener('click', () => this.openStory());
        }

        // Modal controls
        const storyModal = document.getElementById('storyModal');
        const closeStoryBtn = document.getElementById('closeStoryBtn');
        if (closeStoryBtn && storyModal) {
            closeStoryBtn.addEventListener('click', () => this.closeStoryModal());
            storyModal.addEventListener('click', (e) => {
                if (e.target === storyModal) this.closeStoryModal();
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeStoryModal();
        });
    }

    renderMarkers() {
        const container = document.getElementById('markers-container');
        if (!container) return;

        container.innerHTML = '';

        this.locations.forEach(location => {
            const marker = this.createMarker(location);
            container.appendChild(marker);
        });
    }

    createMarker(location) {
        const button = document.createElement('button');
        button.className = 'map-marker';
        button.id = `marker-${location.id}`;
        button.style.left = `${location.coords.x}%`;
        button.style.top = `${location.coords.y}%`;

        button.innerHTML = `
            <div class="marker-pulse ${this.selectedLocation?.id === location.id ? 'active' : 'default'}"></div>
            <div class="marker-icon">📍</div>
            <div class="marker-tooltip">
                <div class="marker-tooltip-name">${location.name}</div>
                <div class="marker-tooltip-category">${location.category}</div>
            </div>
        `;

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.selectLocation(location);
        });

        button.addEventListener('mouseenter', () => {
            this.hoveredLocation = location.id;
            this.updateMarkerState(location.id);
        });

        button.addEventListener('mouseleave', () => {
            this.hoveredLocation = null;
            this.updateMarkerState(this.selectedLocation?.id);
        });

        return button;
    }

    selectLocation(location) {
        this.selectedLocation = location;
        this.updateUI();
        this.updateAllMarkers();
    }

    deselectLocation() {
        this.selectedLocation = null;
        this.updateUI();
        this.updateAllMarkers();
    }

    updateAllMarkers() {
        this.locations.forEach(location => {
            this.updateMarkerState(location.id);
        });
    }

    updateMarkerState(locationId) {
        const marker = document.getElementById(`marker-${locationId}`);
        if (!marker) return;

        const isSelected = this.selectedLocation?.id === locationId;
        const isHovered = this.hoveredLocation === locationId;

        // Update class states with proper z-index handling (selected=20, hovered=15, default=10)
        marker.classList.toggle('selected', isSelected);
        marker.classList.toggle('hovered', isHovered && !isSelected);

        // Update pulse animation
        const pulse = marker.querySelector('.marker-pulse');
        if (pulse) {
            pulse.classList.toggle('active', isSelected);
            pulse.classList.toggle('default', !isSelected);
        }
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

        // Update location panel content
        const nameEl = document.getElementById('location-name');
        const categoryEl = document.getElementById('location-category');
        const descriptionEl = document.getElementById('location-description');

        if (nameEl) nameEl.textContent = this.selectedLocation.name;
        if (categoryEl) {
            categoryEl.textContent = this.selectedLocation.category;
        }
        if (descriptionEl) {
            descriptionEl.textContent = this.selectedLocation.description;
        }

        // Scroll to selected location in list
        const locationItem = document.getElementById(`list-${this.selectedLocation.id}`);
        if (locationItem) {
            locationItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    renderLocationsList() {
        const listContainer = document.getElementById('locations-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        this.locations.forEach(location => {
            const item = document.createElement('button');
            item.className = 'location-item';
            item.id = `list-${location.id}`;

            item.innerHTML = `
                <div class="location-item-icon">📍</div>
                <div class="location-item-content">
                    <p class="location-item-name">${location.name}</p>
                    <p class="location-item-category">${location.category}</p>
                </div>
            `;

            item.addEventListener('click', () => this.selectLocation(location));

            listContainer.appendChild(item);
        });

        this.updateLocationsList();
    }

    updateLocationsList() {
        this.locations.forEach(location => {
            const item = document.getElementById(`list-${location.id}`);
            if (item) {
                if (this.selectedLocation?.id === location.id) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }

    openStory() {
        if (!this.selectedLocation || !this.selectedLocation.story) {
            console.error('No story available for this location');
            return;
        }

        const storyId = this.selectedLocation.story;
        const storyUrl = `/peta/cerita/${storyId}/`;
        
        console.log(`[PetaBudaya] Opening story: ${storyId} -> ${storyUrl}`);

        // Navigate directly to story page instead of using iframe
        window.location.href = storyUrl;
    }

    closeStoryModal() {
        const modal = document.getElementById('storyModal');
        const frame = document.getElementById('storyFrame');

        if (modal) {
            modal.classList.add('hidden');
        }
        if (frame) {
            frame.src = '';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    new PetaBudaya();
});
