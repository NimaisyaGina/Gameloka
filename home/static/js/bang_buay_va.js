/**
 * Bang Buay Chatbot - 8-Bit Betawi Learning Chatbot Widget
 * Self-contained vanilla JS widget mounted on #bang-buay-va-container
 */
(function () {
    'use strict';

    function getCsrfToken() {
        const meta = document.querySelector('meta[name="csrf-token"]');
        if (meta && meta.content && meta.content !== 'NOTPROVIDED') {
            return meta.content;
        }
        const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
        return match ? decodeURIComponent(match[1]) : '';
    }

    function formatSimpleMarkdown(text) {
        const escaped = String(text || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return escaped.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#F8C662;">$1</strong>');
    }

    function initBangBuayWidget() {
        const container = document.getElementById('bang-buay-va-container');
        if (!container) return;

        const isAuth = container.dataset.authenticated === 'true';
        const buayaImg = container.dataset.buayaImg || '/static/images/buaya.png';
        const loginUrl = container.dataset.loginUrl || '/auth/login/';

        let isOpen = false;
        let isLoading = false;
        const messages = [
            {
                role: 'bot',
                content:
                    "Assalamualaikum, Abang/None! Kenalin, Ane **Bang Buay Chatbot** 🐊💬\n\n" +
                    "Nyok ngobrol biar makin jago bahasa & budaya Betawi. Ente bisa tanya arti kosakata, minta pantun, atau bahas **Hikayat Marakarma**!"
            }
        ];

        const wrapper = document.createElement('div');
        wrapper.className = 'bang-buay-widget';
        container.appendChild(wrapper);

        function render() {
            if (!isOpen) {
                wrapper.innerHTML = `
                    <button type="button" class="bang-buay-launcher" id="bb-open-btn" aria-label="Buka Bang Buay Chatbot">
                        <img src="${buayaImg}" alt="Bang Buay Chatbot" class="bang-buay-launcher-avatar pixel-img">
                        <span class="bang-buay-launcher-text">BANG BUAY CHATBOT</span>
                        <span class="pixel-badge pixel-badge-green" style="font-size:0.62rem;padding:2px 6px;">${isAuth ? 'ON' : '🔒'}</span>
                    </button>
                `;
                document.getElementById('bb-open-btn')?.addEventListener('click', () => {
                    isOpen = true;
                    render();
                });
                return;
            }

            if (!isAuth) {
                const nextParam = encodeURIComponent(window.location.pathname + window.location.search);
                wrapper.innerHTML = `
                    <div class="bang-buay-window" style="height:auto;max-height:420px;">
                        <div class="bang-buay-header">
                            <div style="display:flex;align-items:center;gap:10px;">
                                <img src="${buayaImg}" alt="Bang Buay Chatbot" style="width:36px;height:36px;background:#213722;border:2px solid #F8C662;padding:2px;object-fit:contain;" class="pixel-img">
                                <div>
                                    <div class="font-hud" style="color:#F8C662;font-size:0.84rem;">BANG BUAY CHATBOT</div>
                                    <div style="color:#C7C0DE;font-size:0.72rem;">Chatbot Bahasa &amp; Budaya Betawi</div>
                                </div>
                            </div>
                            <button type="button" id="bb-close-btn" class="pixel-btn pixel-btn-sm pixel-btn-ghost" aria-label="Tutup">✕</button>
                        </div>
                        <div style="padding:22px;text-align:center;background:#1B1729;">
                            <div style="font-size:2.2rem;margin-bottom:10px;">🔒</div>
                            <div class="font-hud" style="color:#F8C662;font-size:0.9rem;margin-bottom:8px;">SIGN IN DIPERLUKAN</div>
                            <p style="color:#C7C0DE;font-size:0.88rem;line-height:1.5;margin-bottom:18px;">
                                Masuk dulu ke akun Gameloka untuk mengobrol dengan Bang Buay Chatbot!
                            </p>
                            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                                <a href="${loginUrl}?next=${nextParam}" class="pixel-btn pixel-btn-gold pixel-btn-sm">🔑 Sign In Sekarang</a>
                            </div>
                        </div>
                    </div>
                `;
                document.getElementById('bb-close-btn')?.addEventListener('click', () => {
                    isOpen = false;
                    render();
                });
                return;
            }

            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

            wrapper.innerHTML = `
                <div class="bang-buay-window" role="dialog" aria-label="Bang Buay Chatbot">
                    <div class="bang-buay-header">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <img src="${buayaImg}" alt="Bang Buay Chatbot" style="width:36px;height:36px;background:#213722;border:2px solid #F8C662;padding:2px;object-fit:contain;" class="pixel-img">
                            <div>
                                <div class="font-hud" style="color:#F8C662;font-size:0.84rem;">BANG BUAY CHATBOT</div>
                                <div style="color:#C7C0DE;font-size:0.72rem;">Chatbot Bahasa &amp; Budaya Betawi</div>
                            </div>
                        </div>
                        <div style="display:flex;gap:6px;">
                            <button type="button" id="bb-clear-btn" class="pixel-btn pixel-btn-sm pixel-btn-violet" title="Reset Chat">↺</button>
                            <button type="button" id="bb-close-btn" class="pixel-btn pixel-btn-sm pixel-btn-ghost" title="Tutup">✕</button>
                        </div>
                    </div>

                    <div class="bang-buay-messages" id="bb-messages">
                        ${messages.map((m) => `
                            <div class="bang-buay-msg ${m.role}">${formatSimpleMarkdown(m.content)}</div>
                        `).join('')}
                        ${isLoading ? `<div class="bang-buay-msg bot" style="color:#F8C662;">⏳ Bang Buay lagi ngetik...</div>` : ''}
                    </div>

                    <div class="bang-buay-chips">
                        <button type="button" class="bang-buay-chip" data-prompt="Buatin pantun Betawi dong">🎤 Pantun</button>
                        <button type="button" class="bang-buay-chip" data-prompt="Arti kata ogah dan meni apa?">📖 Kamus</button>
                        <button type="button" class="bang-buay-chip" data-prompt="Ceritain Hikayat Marakarma">📜 Marakarma</button>
                        <button type="button" class="bang-buay-chip" data-prompt="Jelasin Setu Babakan">🗺️ Budaya</button>
                        <button type="button" class="bang-buay-chip" data-prompt="Kasih latihan kuis Betawi">🎯 Latihan</button>
                    </div>

                    <form class="bang-buay-form" id="bb-form">
                        ${SpeechRec ? `<button type="button" id="bb-mic-btn" class="pixel-btn pixel-btn-sm pixel-btn-violet" title="Input Suara">🎤</button>` : ''}
                        <input type="text" id="bb-input" class="pixel-input" placeholder="Chat dengan Bang Buay Chatbot..." style="padding:8px 10px;font-size:0.86rem;" ${isLoading ? 'disabled' : ''}>
                        <button type="submit" class="pixel-btn pixel-btn-sm pixel-btn-gold" ${isLoading ? 'disabled' : ''}>KIRIM</button>
                    </form>
                </div>
            `;

            const msgBox = document.getElementById('bb-messages');
            if (msgBox) {
                msgBox.scrollTop = msgBox.scrollHeight;
            }

            document.getElementById('bb-close-btn')?.addEventListener('click', () => {
                isOpen = false;
                render();
            });

            document.getElementById('bb-clear-btn')?.addEventListener('click', () => {
                messages.splice(1);
                render();
            });

            wrapper.querySelectorAll('.bang-buay-chip').forEach((chip) => {
                chip.addEventListener('click', () => {
                    sendPrompt(chip.getAttribute('data-prompt') || '');
                });
            });

            const form = document.getElementById('bb-form');
            form?.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = document.getElementById('bb-input');
                if (input && input.value.trim()) {
                    sendPrompt(input.value.trim());
                }
            });

            const micBtn = document.getElementById('bb-mic-btn');
            if (micBtn && SpeechRec) {
                micBtn.addEventListener('click', () => {
                    const recognition = new SpeechRec();
                    recognition.lang = 'id-ID';
                    recognition.interimResults = false;
                    micBtn.textContent = '🔴';
                    recognition.onresult = (evt) => {
                        const transcript = evt.results[0][0].transcript;
                        const input = document.getElementById('bb-input');
                        if (input) {
                            input.value = transcript;
                            input.focus();
                        }
                    };
                    recognition.onend = () => {
                        micBtn.textContent = '🎤';
                    };
                    recognition.onerror = () => {
                        micBtn.textContent = '🎤';
                    };
                    recognition.start();
                });
            }
        }

        async function sendPrompt(promptText) {
            if (!promptText || isLoading) return;
            messages.push({ role: 'user', content: promptText });
            isLoading = true;
            render();

            try {
                const resp = await fetch('/api/ai/chat/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken()
                    },
                    body: JSON.stringify({ message: promptText })
                });
                const data = await resp.json();
                if (resp.ok && data.status === 'success') {
                    messages.push({ role: 'bot', content: data.reply });
                } else {
                    messages.push({
                        role: 'bot',
                        content: data.message || 'Maaf, Bang Buay Chatbot lagi kendala sebentar. Coba lagi ya!'
                    });
                }
            } catch (err) {
                messages.push({
                    role: 'bot',
                    content: 'Koneksi ke Bang Buay Chatbot terputus sebentar. Coba lagi ya!'
                });
            } finally {
                isLoading = false;
                render();
                const input = document.getElementById('bb-input');
                input?.focus();
            }
        }

        window.openBangBuayChat = function () {
            isOpen = true;
            render();
        };

        render();
    }

    document.addEventListener('DOMContentLoaded', initBangBuayWidget);
})();
