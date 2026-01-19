/**
 * Sekilas Kisah - RPG Style Narrative Game (Django Version)
 * In-game narrative system with map and NPC interactions
 * 
 * Menggunakan vanilla JavaScript tanpa framework
 */

class NarrativeGameEngine {
  constructor(storyId) {
    this.storyId = storyId;
    this.currentNodeIndex = 0;
    this.displayedText = '';
    this.isTyping = false;
    this.showChoices = false;
    this.gameEnded = false;
    this.selectedNPC = null;
    this.conversationStarted = false;
    this.typingTimeoutId = null;
    this.dialogEndTimeoutId = null;
    this.storyData = null;
  }

  /**
   * Initialize game from server data
   */
  async init() {
    try {
      // Get story data from server
      console.log('[NarrativeGameEngine] Fetching story data for:', this.storyId);
      const response = await fetch(`/peta/api/story/${this.storyId}/`);
      console.log('[NarrativeGameEngine] Fetch response status:', response.status);
      if (!response.ok) {
        console.error('[NarrativeGameEngine] Failed to fetch:', response.status, response.statusText);
        throw new Error(`Failed to load story (${response.status})`);
      }
      
      this.storyData = await response.json();
      console.log('[NarrativeGameEngine] Story data loaded successfully:', this.storyData);
      this.render('mapView');
    } catch (error) {
      console.error('[NarrativeGameEngine] Error initializing game:', error);
      this.showError('Gagal memuat kisah. Silakan refresh halaman.');
    }
  }

  /**
   * Render different game views
   */
  render(view) {
    const container = document.getElementById('gameContainer');
    if (!container) {
      console.error('Container #gameContainer not found');
      return;
    }

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

  /**
   * Render map view with NPCs
   */
  renderMapView() {
    const mapHTML = `
      <div class="game-wrapper" style="background: ${this.storyData.background || 'linear-gradient(135deg, #27AE60 0%, #2980B9 100%)'};
           min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="game-content" style="max-width: 1200px; width: 100%; position: relative;">
          <!-- Back Button - Top Left (Fixed Position) -->
          <button class="btn-back" style="position: fixed; left: 30px; top: 100px; padding: 12px 24px; 
                 background: linear-gradient(135deg, #27AE60 0%, #2980B9 100%); 
                 color: white; border: none; border-radius: 50px; cursor: pointer;
                 font-weight: 700; display: flex; align-items: center; gap: 8px;
                 box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                 transition: all 0.3s ease;
                 font-size: 1rem;
                 z-index: 1000;">
            ← Kembali
          </button>

          <!-- Header -->
          <div class="game-header" style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; font-size: 2.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin: 0;">
              ${this.storyData.title}
            </h1>
          </div>

          <!-- Game Map -->
          <div class="game-map" style="background: white; border-radius: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
               overflow: hidden; margin-bottom: 30px;">
            <div class="map-container" style="position: relative; width: 100%; height: 600px;
                 background: linear-gradient(to br, #f0f9ff, #e0f2fe); display: flex; align-items: center; justify-content: center;">
              
              <!-- Map Background Decorations -->
              <div class="map-decorations" style="position: absolute; inset: 0; opacity: 0.1; pointer-events: none;">
                <div style="position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, #27AE60, transparent);
                     left: 10%; top: 20%; border-radius: 50%;"></div>
              </div>

              <!-- NPCs Container -->
              <div class="npcs-container" style="position: absolute; inset: 0;">
                ${this.storyData.npcs.map(npc => `
                  <button class="npc-btn" data-npc-id="${npc.id}" 
                          style="position: absolute; left: ${npc.x}px; top: ${npc.y}px; 
                                 transform: translate(-50%, -50%); cursor: pointer; 
                                 background: none; border: none; padding: 0;">
                    <div class="npc-wrapper" style="text-align: center;">
                      <!-- Pulse effect -->
                      <div style="position: absolute; width: 80px; height: 80px; 
                                 background: rgba(255,255,255,0.3); border-radius: 50%;
                                 left: 50%; top: 50%; transform: translate(-50%, -50%);
                                 animation: pulse 2s ease-in-out infinite;"></div>
                      
                      <!-- NPC Avatar -->
                      <div style="position: relative; width: 80px; height: 80px; 
                                 background: white; border-radius: 50%;
                                 display: flex; align-items: center; justify-content: center;
                                 font-size: 3rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                                 transition: all 0.3s ease; z-index: 10;">
                        ${npc.emoji}
                      </div>
                      
                      <!-- NPC Name (tooltip) -->
                      <div style="position: absolute; bottom: -40px; left: 50%; transform: translateX(-50%);
                                 background: white; padding: 8px 12px; border-radius: 8px;
                                 white-space: nowrap; font-weight: bold; color: #333;
                                 box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-size: 0.9rem;
                                 opacity: 0; transition: opacity 0.2s; pointer-events: none;">
                        ${npc.name}
                      </div>
                    </div>
                  </button>
                `).join('')}
              </div>

              <!-- Instructions -->
              <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%);
                         background: rgba(255,255,255,0.95); padding: 15px 25px; border-radius: 50px;
                         box-shadow: 0 2px 8px rgba(0,0,0,0.1); font-weight: bold; color: #c33;">
                👤 Klik NPC untuk memulai percakapan
              </div>
            </div>
          </div>

          <!-- Story Info -->
          <div style="background: rgba(255,255,255,0.95); border-radius: 15px; padding: 20px; text-align: center;">
            <p style="color: #666; font-size: 1rem; margin: 0;">
              Klik salah satu karakter untuk memulai kisah interaktif
            </p>
          </div>
        </div>
      </div>

      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        
        .npc-btn:hover .npc-wrapper > div:last-child {
          filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.6));
          transform: scale(1.15);
        }
        
        .npc-btn:hover .npc-wrapper > div:last-child + div {
          opacity: 1;
        }
      </style>
    `;

    document.getElementById('gameContainer').innerHTML = mapHTML;
    this.attachMapEventListeners();
  }

  /**
   * Render dialog view during conversation
   */
  renderDialogView() {
    const currentNode = this.storyData.dialogues[this.currentNodeIndex];
    const currentNPC = this.storyData.npcs.find(n => n.id === currentNode.speaker);

    const dialogHTML = `
      <div class="dialog-wrapper" style="background: ${this.storyData.background || 'linear-gradient(135deg, #27AE60 0%, #2980B9 100%)'};
           min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        
        <!-- Back Button - Fixed Position -->
        <button class="btn-back" style="position: fixed; left: 30px; top: 100px; padding: 12px 24px; 
               background: linear-gradient(135deg, #27AE60 0%, #2980B9 100%); 
               color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 700;
               display: flex; align-items: center; gap: 8px;
               box-shadow: 0 4px 12px rgba(0,0,0,0.25);
               transition: all 0.3s ease;
               font-size: 1rem;
               z-index: 1000;">
          ← Kembali
        </button>

        <div class="dialog-content" style="max-width: 1000px; width: 100%;">
          <!-- Header -->
          <div class="dialog-header" style="display: flex; justify-content: space-between; align-items: center; 
               margin-bottom: 30px; flex-wrap: wrap; gap: 10px;">
            <h1 style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.3); margin: 0; font-size: 1.5rem;">
              ${this.storyData.title}
            </h1>
            <div style="width: 120px; text-align: right; color: white; font-weight: bold;
                       text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${this.currentNodeIndex + 1} / ${this.storyData.dialogues.length}
            </div>
          </div>

          <!-- Dialog Box -->
          <div class="dialog-box" style="background: white; border-radius: 20px; 
               box-shadow: 0 10px 40px rgba(0,0,0,0.2); overflow: hidden; margin-bottom: 30px;">
            
            <!-- Speaker Info -->
            <div style="padding: 25px 30px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
                       border-bottom: 2px solid #ddd; display: flex; align-items: center; gap: 15px;">
              <div style="font-size: 3rem;">${currentNPC?.emoji || '👤'}</div>
              <div>
                <h3 style="margin: 0; color: #333; font-size: 1.3rem;">${currentNPC?.name || 'Unknown'}</h3>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem;">sedang berbicara...</p>
              </div>
            </div>

            <!-- Dialog Text -->
            <div style="padding: 30px; min-height: 120px; display: flex; align-items: center;">
              <div class="dialog-text" style="font-size: 1.1rem; line-height: 1.6; color: #333;
                   white-space: pre-wrap; word-wrap: break-word;">
                ${this.displayedText}<span class="typing-cursor" style="${this.isTyping ? '' : 'display: none;'}">▮</span>
              </div>
            </div>

            <!-- Choices -->
            <div class="choices-container" style="${!this.showChoices || !currentNode.choices ? 'display: none;' : ''}
                 padding: 0 30px 30px 30px;">
              <p style="margin: 0 0 15px 0; color: #666; font-weight: bold; font-size: 0.95rem;">
                Pilih Jawaban:
              </p>
              <div style="display: grid; gap: 12px;">
                ${currentNode.choices?.map((choice, idx) => `
                  <button class="choice-btn" data-next="${choice.next}" style="
                         padding: 15px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb);
                         color: white; border: none; border-radius: 10px; cursor: pointer;
                         font-size: 1rem; font-weight: bold; text-align: left;
                         transition: all 0.3s; display: flex; align-items: center; gap: 10px;">
                    ➜ ${choice.text}
                  </button>
                `).join('') || ''}
              </div>
            </div>

            <!-- Continue Hint -->
            <div class="continue-hint" style="${this.isTyping || this.showChoices || this.gameEnded ? 'display: none;' : ''}
                 padding: 0 30px 30px 30px;">
              <p style="text-align: center; color: #999; font-size: 0.9rem; margin: 0;
                       animation: bounce 1.5s ease-in-out infinite;">
                ⏭️ Melanjutkan dalam beberapa detik...
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.7; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        
        .typing-cursor {
          animation: blink 1s infinite;
        }
        
        .choice-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
          transform: translateX(8px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        
        .choice-btn:focus {
          outline: 3px solid #fbbf24;
          outline-offset: 2px;
        }
      </style>
    `;

    document.getElementById('gameContainer').innerHTML = dialogHTML;
    this.attachDialogEventListeners();
    
    // Start typing effect if not already typing
    if (!this.isTyping && this.conversationStarted) {
      this.startTyping();
    }
  }

  /**
   * Render ending view with moral message
   */
  renderEndingView() {
    const endingHTML = `
      <div class="ending-wrapper" style="background: ${this.storyData.background || 'linear-gradient(135deg, #27AE60 0%, #2980B9 100%)'};
           min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px;">
        <div class="ending-content" style="background: white; border-radius: 20px; 
             box-shadow: 0 10px 40px rgba(0,0,0,0.2); max-width: 600px; padding: 40px; text-align: center;">
          
          <div style="font-size: 4rem; margin-bottom: 20px;">✨</div>
          
          <h2 style="font-size: 2rem; color: #333; margin: 0 0 30px 0;">
            Kisah Selesai!
          </h2>

          <!-- Moral Message -->
          <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px;
                     border-radius: 8px; margin-bottom: 30px; text-align: left;">
            <p style="margin: 0 0 10px 0; color: #333; font-weight: bold; font-size: 1.1rem;">
              💡 Pesan Moral
            </p>
            <p style="margin: 0; color: #666; line-height: 1.6; font-size: 1rem;">
              ${this.storyData.moralMessage}
            </p>
          </div>

          <!-- Buttons -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
            <button class="btn-restart" style="padding: 15px 20px; background: linear-gradient(135deg, #3b82f6, #2563eb);
                   color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold;
                   font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px;
                   transition: all 0.3s;">
              🔄 Ulangi Kisah
            </button>
            <button class="btn-back" style="padding: 15px 20px; background: linear-gradient(135deg, #10b981, #059669);
                   color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: bold;
                   font-size: 1rem; display: flex; align-items: center; justify-content: center; gap: 8px;
                   transition: all 0.3s;">
              🏠 Kembali ke Peta
            </button>
          </div>
        </div>
      </div>

      <style>
        .btn-restart:hover, .btn-back:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      </style>
    `;

    document.getElementById('gameContainer').innerHTML = endingHTML;
    this.attachEndingEventListeners();
  }

  /**
   * Event listeners for map view
   */
  attachMapEventListeners() {
    // NPC buttons
    document.querySelectorAll('.npc-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const npcId = btn.dataset.npcId;
        const npc = this.storyData.npcs.find(n => n.id === npcId);
        this.selectedNPC = npc;
        this.conversationStarted = true;
        this.currentNodeIndex = 0;
        this.displayedText = '';
        this.isTyping = false;
        this.showChoices = false;
        this.gameEnded = false;
        this.render('dialogView');
      });
    });

    // Back button to map view
    document.querySelector('.btn-back')?.addEventListener('click', () => {
      window.location.href = '/peta/';
    });
  }

  /**
   * Event listeners for dialog view
   */
  attachDialogEventListeners() {
    // Choice buttons
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextIndex = parseInt(btn.dataset.next);
        this.currentNodeIndex = nextIndex;
        this.displayedText = '';
        this.isTyping = false;
        this.showChoices = false;
        this.render('dialogView');
      });
    });

    // Back button - navigate to peta (Kembali ke Peta)
    document.querySelector('.btn-back')?.addEventListener('click', () => {
      window.location.href = '/peta/';
    });
  }

  /**
   * Event listeners for ending view
   */
  attachEndingEventListeners() {
    // Restart button
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

    // Back button
    document.querySelector('.btn-back')?.addEventListener('click', () => {
      window.history.back();
    });
  }

  /**
   * Start typing effect
   */
  startTyping() {
    const currentNode = this.storyData.dialogues[this.currentNodeIndex];
    if (!currentNode) return;

    this.isTyping = true;
    this.displayedText = '';
    const fullText = currentNode.text;
    let currentIndex = 0;

    const typeCharacter = () => {
      if (currentIndex <= fullText.length) {
        this.displayedText = fullText.slice(0, currentIndex);
        
        // Check for pause indicator "…"
        let delay = 50;
        if (fullText[currentIndex] === '…') {
          delay = 1000; // 1 second pause
        }

        currentIndex++;
        this.typingTimeoutId = setTimeout(typeCharacter, delay);
        this.updateDialog();
      } else {
        this.isTyping = false;
        this.typingTimeoutId = null;
        
        if (currentNode.choices && currentNode.choices.length > 0) {
          this.showChoices = true;
        } else {
          // Auto advance after 2 seconds
          this.dialogEndTimeoutId = setTimeout(() => {
            if (this.currentNodeIndex < this.storyData.dialogues.length - 1) {
              if (currentNode.next !== undefined) {
                this.currentNodeIndex = currentNode.next;
                this.displayedText = '';
                this.isTyping = false;
                this.showChoices = false;
                this.render('dialogView');
              }
            } else {
              this.gameEnded = true;
              this.render('endingView');
            }
          }, 2000);
        }
        
        this.updateDialog();
      }
    };

    typeCharacter();
  }

  /**
   * Update dialog display during typing
   */
  updateDialog() {
    const textElement = document.querySelector('.dialog-text');
    if (textElement) {
      const isStillTyping = this.isTyping;
      textElement.innerHTML = `${this.displayedText}<span class="typing-cursor" style="${isStillTyping ? '' : 'display: none;'}">▮</span>`;
    }

    // Show/hide choices
    const choicesContainer = document.querySelector('.choices-container');
    const continueHint = document.querySelector('.continue-hint');
    if (choicesContainer) {
      choicesContainer.style.display = this.showChoices ? 'block' : 'none';
    }
    if (continueHint) {
      continueHint.style.display = !this.isTyping && !this.showChoices && !this.gameEnded ? 'block' : 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const container = document.getElementById('gameContainer');
    container.innerHTML = `
      <div style="background: #fee; color: #c33; padding: 20px; border-radius: 8px; font-family: monospace;">
        <h3>⚠️ Error</h3>
        <p>${message}</p>
        <button onclick="window.history.back()" style="padding: 10px 20px; background: #c33; color: white; 
               border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          Kembali
        </button>
      </div>
    `;
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  const storyId = window.CURRENT_STORY_ID || 'pitung';
  const game = new NarrativeGameEngine(storyId);
  game.init();
  window.game = game; // For debugging
});
