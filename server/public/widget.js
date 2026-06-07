/**
 * AssistFlow Widget
 * Drop-in chatbot for any website.
 * Usage: <script src="https://your-domain.com/widget.js" data-id="ASSISTANT_ID"></script>
 */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────────────────────
  const SCRIPT_TAG = document.currentScript;
  const ASSISTANT_ID = SCRIPT_TAG?.getAttribute("data-id");
  const API_BASE =
    SCRIPT_TAG?.getAttribute("data-api") ||
    "http://localhost:5000"; // replace with your prod URL at build time

  if (!ASSISTANT_ID) {
    console.warn("[AssistFlow] No data-id found on the widget script tag.");
    return;
  }

  // ── State ───────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let config = null; // fetched from /api/widget/config/:id
  let conversationHistory = []; // Gemini-format history

  // ── Theme maps ──────────────────────────────────────────────────────────────
  const THEMES = {
    light: {
      "--af-bg": "#ffffff",
      "--af-surface": "#f4f4f5",
      "--af-border": "#e4e4e7",
      "--af-text": "#18181b",
      "--af-text-muted": "#71717a",
      "--af-accent": "#4f46e5",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#4f46e5",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "#f4f4f5",
      "--af-bot-fg": "#18181b",
      "--af-shadow": "0 8px 30px rgba(0,0,0,.12)",
    },
    dark: {
      "--af-bg": "#18181b",
      "--af-surface": "#27272a",
      "--af-border": "#3f3f46",
      "--af-text": "#fafafa",
      "--af-text-muted": "#a1a1aa",
      "--af-accent": "#6366f1",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#6366f1",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "#27272a",
      "--af-bot-fg": "#fafafa",
      "--af-shadow": "0 8px 30px rgba(0,0,0,.4)",
    },
    glass: {
      "--af-bg": "rgba(255,255,255,0.75)",
      "--af-surface": "rgba(255,255,255,0.5)",
      "--af-border": "rgba(255,255,255,0.3)",
      "--af-text": "#18181b",
      "--af-text-muted": "#52525b",
      "--af-accent": "#4f46e5",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#4f46e5",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "rgba(255,255,255,0.6)",
      "--af-bot-fg": "#18181b",
      "--af-shadow": "0 8px 40px rgba(0,0,0,.15)",
    },
    neon: {
      "--af-bg": "#0a0a0a",
      "--af-surface": "#111111",
      "--af-border": "#2d1f6e",
      "--af-text": "#e879f9",
      "--af-text-muted": "#a855f7",
      "--af-accent": "#d946ef",
      "--af-accent-fg": "#000000",
      "--af-user-bubble": "#d946ef",
      "--af-user-fg": "#000000",
      "--af-bot-bubble": "#1a0a2e",
      "--af-bot-fg": "#e879f9",
      "--af-shadow": "0 0 40px rgba(217,70,239,.25)",
    },
  };

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #af-widget-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483640;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--af-accent, #4f46e5);
        color: var(--af-accent-fg, #fff);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 20px rgba(79,70,229,.4);
        transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), box-shadow 0.2s;
        outline: none;
      }
      #af-widget-fab:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(79,70,229,.5); }
      #af-widget-fab:active { transform: scale(0.95); }
      #af-widget-fab svg { width: 24px; height: 24px; transition: opacity .15s, transform .2s; }
      #af-widget-fab .af-icon-chat { position: absolute; }
      #af-widget-fab .af-icon-close { position: absolute; opacity: 0; transform: rotate(-90deg); }
      #af-widget-fab.af-open .af-icon-chat { opacity: 0; transform: rotate(90deg); }
      #af-widget-fab.af-open .af-icon-close { opacity: 1; transform: rotate(0deg); }

      #af-widget-window {
        position: fixed;
        bottom: 92px;
        right: 24px;
        z-index: 2147483639;
        width: 360px;
        height: 520px;
        max-height: calc(100vh - 120px);
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--af-bg, #fff);
        border: 1px solid var(--af-border, #e4e4e7);
        box-shadow: var(--af-shadow, 0 8px 30px rgba(0,0,0,.12));
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transform-origin: bottom right;
        transform: scale(0.92) translateY(8px);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.25s cubic-bezier(.34,1.56,.64,1), opacity 0.2s;
      }
      #af-widget-window.af-visible {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      /* Glass backdrop */
      #af-widget-window.af-glass {
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }

      /* Header */
      .af-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        background: var(--af-accent, #4f46e5);
        color: var(--af-accent-fg, #fff);
        flex-shrink: 0;
      }
      .af-header-avatar {
        width: 32px; height: 32px;
        border-radius: 50%;
        background: rgba(255,255,255,.2);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px; font-weight: 700;
        flex-shrink: 0;
      }
      .af-header-info { flex: 1; min-width: 0; }
      .af-header-name { font-size: 14px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .af-header-status { font-size: 11px; opacity: .75; display: flex; align-items: center; gap: 4px; margin-top: 1px; }
      .af-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }

      /* Messages */
      .af-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        scroll-behavior: smooth;
      }
      .af-messages::-webkit-scrollbar { width: 4px; }
      .af-messages::-webkit-scrollbar-track { background: transparent; }
      .af-messages::-webkit-scrollbar-thumb { background: var(--af-border, #e4e4e7); border-radius: 2px; }

      .af-msg {
        display: flex;
        flex-direction: column;
        max-width: 80%;
        animation: af-pop .2s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes af-pop {
        from { opacity: 0; transform: scale(.92) translateY(4px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .af-msg.af-user { align-self: flex-end; align-items: flex-end; }
      .af-msg.af-bot  { align-self: flex-start; align-items: flex-start; }

      .af-bubble {
        padding: 9px 13px;
        border-radius: 16px;
        font-size: 13.5px;
        line-height: 1.5;
        word-break: break-word;
      }
      .af-msg.af-user .af-bubble {
        background: var(--af-user-bubble, #4f46e5);
        color: var(--af-user-fg, #fff);
        border-bottom-right-radius: 4px;
      }
      .af-msg.af-bot .af-bubble {
        background: var(--af-bot-bubble, #f4f4f5);
        color: var(--af-bot-fg, #18181b);
        border-bottom-left-radius: 4px;
      }
      .af-time {
        font-size: 10px;
        color: var(--af-text-muted, #71717a);
        margin-top: 3px;
        padding: 0 2px;
      }

      /* Typing indicator */
      .af-typing {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 10px 14px;
        background: var(--af-bot-bubble, #f4f4f5);
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        width: fit-content;
      }
      .af-typing span {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--af-text-muted, #71717a);
        animation: af-bounce 1.2s infinite;
      }
      .af-typing span:nth-child(2) { animation-delay: .2s; }
      .af-typing span:nth-child(3) { animation-delay: .4s; }
      @keyframes af-bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30%            { transform: translateY(-5px); }
      }

      /* Input area */
      .af-input-wrap {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        padding: 12px 14px;
        border-top: 1px solid var(--af-border, #e4e4e7);
        background: var(--af-bg, #fff);
        flex-shrink: 0;
      }
      .af-input {
        flex: 1;
        resize: none;
        border: 1px solid var(--af-border, #e4e4e7);
        background: var(--af-surface, #f4f4f5);
        color: var(--af-text, #18181b);
        border-radius: 12px;
        padding: 9px 12px;
        font-size: 13.5px;
        font-family: inherit;
        line-height: 1.4;
        outline: none;
        max-height: 100px;
        overflow-y: auto;
        transition: border-color .15s;
      }
      .af-input::placeholder { color: var(--af-text-muted, #71717a); }
      .af-input:focus { border-color: var(--af-accent, #4f46e5); }

      .af-send-btn {
        width: 38px; height: 38px;
        border-radius: 10px;
        border: none;
        background: var(--af-accent, #4f46e5);
        color: var(--af-accent-fg, #fff);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: opacity .15s, transform .15s;
      }
      .af-send-btn:hover:not(:disabled) { opacity: .88; }
      .af-send-btn:active:not(:disabled) { transform: scale(.93); }
      .af-send-btn:disabled { opacity: .4; cursor: not-allowed; }
      .af-send-btn svg { width: 16px; height: 16px; }

      /* Error state */
      .af-error {
        font-size: 12px;
        color: #ef4444;
        text-align: center;
        padding: 6px 12px;
        background: #fef2f2;
        border-radius: 8px;
        margin: 0 16px 8px;
      }

      /* Powered by */
      .af-footer {
        text-align: center;
        font-size: 10px;
        color: var(--af-text-muted, #71717a);
        padding: 6px 0 10px;
        flex-shrink: 0;
      }
      .af-footer a { color: var(--af-accent, #4f46e5); text-decoration: none; }

      /* Mobile responsive */
      @media (max-width: 480px) {
        #af-widget-window {
          width: calc(100vw - 16px);
          right: 8px;
          bottom: 80px;
          height: calc(100vh - 100px);
          border-radius: 16px;
        }
        #af-widget-fab { right: 16px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Apply theme CSS variables ───────────────────────────────────────────────
  function applyTheme(themeName) {
    const vars = THEMES[themeName] || THEMES.light;
    const fab = document.getElementById("af-widget-fab");
    const win = document.getElementById("af-widget-window");
    if (!fab || !win) return;

    const apply = (el) => {
      Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
    };
    apply(fab);
    apply(win);

    if (themeName === "glass") win.classList.add("af-glass");
  }

  // ── Build DOM ───────────────────────────────────────────────────────────────
  function buildWidget(cfg) {
    const initials = cfg.assistantName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    // FAB button
    const fab = document.createElement("button");
    fab.id = "af-widget-fab";
    fab.setAttribute("aria-label", "Open chat");
    fab.innerHTML = `
      <svg class="af-icon-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="af-icon-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;
    fab.addEventListener("click", toggleChat);

    // Chat window
    const win = document.createElement("div");
    win.id = "af-widget-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", `${cfg.assistantName} chat`);
    win.innerHTML = `
      <div class="af-header">
        <div class="af-header-avatar">${initials}</div>
        <div class="af-header-info">
          <div class="af-header-name">${escHtml(cfg.assistantName)}</div>
          <div class="af-header-status">
            <span class="af-status-dot"></span> Online
          </div>
        </div>
      </div>
      <div class="af-messages" id="af-messages"></div>
      <div class="af-input-wrap">
        <textarea
          id="af-input"
          class="af-input"
          rows="1"
          placeholder="Type a message…"
          aria-label="Your message"
        ></textarea>
        <button id="af-send" class="af-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
      <div class="af-footer">Powered by <a href="https://assistflow.ai" target="_blank" rel="noopener">AssistFlow</a></div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    // Wire up input
    const input = document.getElementById("af-input");
    const sendBtn = document.getElementById("af-send");

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    // Auto-grow textarea
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
    });
    sendBtn.addEventListener("click", sendMessage);

    // Apply theme
    applyTheme(cfg.theme || "light");

    // Welcome message
    appendBotMessage(`Hi there! I'm ${cfg.assistantName}. How can I help you today?`);
  }

  // ── Toggle open/close ───────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    const fab = document.getElementById("af-widget-fab");
    const win = document.getElementById("af-widget-window");
    fab.classList.toggle("af-open", isOpen);
    win.classList.toggle("af-visible", isOpen);
    if (isOpen) {
      setTimeout(() => document.getElementById("af-input")?.focus(), 250);
    }
  }

  // ── Message helpers ─────────────────────────────────────────────────────────
  function escHtml(str) {
    return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function appendMessage(role, text) {
    const container = document.getElementById("af-messages");
    if (!container) return;

    const wrap = document.createElement("div");
    wrap.className = `af-msg af-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "af-bubble";
    bubble.textContent = text; // textContent = safe, no XSS

    const time = document.createElement("div");
    time.className = "af-time";
    time.textContent = formatTime();

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  }

  function appendBotMessage(text) {
    appendMessage("bot", text);
  }

  function showTyping() {
    const container = document.getElementById("af-messages");
    if (!container) return;
    const el = document.createElement("div");
    el.id = "af-typing";
    el.className = "af-msg af-bot";
    el.innerHTML = `<div class="af-typing"><span></span><span></span><span></span></div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("af-typing")?.remove();
  }

  function showError(msg) {
    const existing = document.getElementById("af-error-msg");
    if (existing) existing.remove();

    const container = document.getElementById("af-messages");
    if (!container) return;

    const el = document.createElement("div");
    el.id = "af-error-msg";
    el.className = "af-error";
    el.textContent = msg;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;

    // Auto-clear after 5s
    setTimeout(() => el.remove(), 5000);
  }

  // ── Send message ────────────────────────────────────────────────────────────
  async function sendMessage() {
    if (isLoading) return;

    const input = document.getElementById("af-input");
    const sendBtn = document.getElementById("af-send");
    const text = input.value.trim();
    if (!text) return;

    // Append user message
    appendMessage("user", text);
    input.value = "";
    input.style.height = "auto";

    // Push to history (Gemini format)
    conversationHistory.push({ role: "user", parts: [{ text }] });

    // Keep history bounded to last 20 turns (10 exchanges)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }

    isLoading = true;
    sendBtn.disabled = true;
    input.disabled = true;
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/api/widget/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID,
          message: text,
          conversationHistory: conversationHistory.slice(0, -1), // exclude the one we just added as "message"
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.error || "Something went wrong. Please try again.");
        // Remove failed message from history
        conversationHistory.pop();
      } else {
        hideTyping();
        appendBotMessage(data.reply);
        // Add assistant reply to history
        conversationHistory.push({ role: "model", parts: [{ text: data.reply }] });
      }
    } catch (err) {
      showError("Network error. Please check your connection.");
      conversationHistory.pop();
    } finally {
      hideTyping();
      isLoading = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  // ── Bootstrap ───────────────────────────────────────────────────────────────
  async function init() {
    try {
      const res = await fetch(`${API_BASE}/api/widget/config/${ASSISTANT_ID}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        console.warn("[AssistFlow]", d.error || "Failed to load assistant config.");
        return;
      }
      config = await res.json();
    } catch (e) {
      console.warn("[AssistFlow] Could not reach API:", e.message);
      return;
    }

    injectStyles();
    buildWidget(config);
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();