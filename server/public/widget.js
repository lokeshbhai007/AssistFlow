/**
 * AssistFlow Widget v2
 * Drop-in chatbot with text + voice support.
 * Usage: <script src="https://your-domain.com/widget.js" data-id="ASSISTANT_ID"></script>
 */
(function () {
  "use strict";

  // ── Config ──────────────────────────────────────────────────────────────────
  const SCRIPT_TAG = document.currentScript;
  const ASSISTANT_ID = SCRIPT_TAG?.getAttribute("data-id");
  const API_BASE =
    SCRIPT_TAG?.getAttribute("data-api") || "http://localhost:5000";

  if (!ASSISTANT_ID) {
    console.warn("[AssistFlow] No data-id found on the widget script tag.");
    return;
  }

  // ── State ───────────────────────────────────────────────────────────────────
  let isOpen = false;
  let isLoading = false;
  let isListening = false;
  let config = null;
  let conversationHistory = [];
  let recognition = null;

  // ── Theme maps ──────────────────────────────────────────────────────────────
  const THEMES = {
    light: {
      "--af-bg": "#f8f8fc",
      "--af-surface": "#ffffff",
      "--af-border": "#e8e8f0",
      "--af-text": "#1a1a2e",
      "--af-text-muted": "#8888aa",
      "--af-accent": "#5b5ef4",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#5b5ef4",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "#ffffff",
      "--af-bot-fg": "#1a1a2e",
      "--af-shadow": "0 20px 60px rgba(91,94,244,.18)",
      "--af-mic-bg": "#5b5ef4",
      "--af-mic-fg": "#ffffff",
    },
    dark: {
      "--af-bg": "#13131f",
      "--af-surface": "#1e1e2e",
      "--af-border": "#2e2e45",
      "--af-text": "#e8e8f8",
      "--af-text-muted": "#6666aa",
      "--af-accent": "#7c7ef7",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#7c7ef7",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "#1e1e2e",
      "--af-bot-fg": "#e8e8f8",
      "--af-shadow": "0 20px 60px rgba(0,0,0,.5)",
      "--af-mic-bg": "#7c7ef7",
      "--af-mic-fg": "#ffffff",
    },
    glass: {
      "--af-bg": "rgba(255,255,255,0.78)",
      "--af-surface": "rgba(255,255,255,0.55)",
      "--af-border": "rgba(255,255,255,0.35)",
      "--af-text": "#1a1a2e",
      "--af-text-muted": "#6666aa",
      "--af-accent": "#5b5ef4",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#5b5ef4",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "rgba(255,255,255,0.7)",
      "--af-bot-fg": "#1a1a2e",
      "--af-shadow": "0 20px 60px rgba(91,94,244,.2)",
      "--af-mic-bg": "#5b5ef4",
      "--af-mic-fg": "#ffffff",
    },
    neon: {
      "--af-bg": "#080810",
      "--af-surface": "#0f0f1e",
      "--af-border": "#2a1060",
      "--af-text": "#e879f9",
      "--af-text-muted": "#a855f7",
      "--af-accent": "#d946ef",
      "--af-accent-fg": "#ffffff",
      "--af-user-bubble": "#d946ef",
      "--af-user-fg": "#ffffff",
      "--af-bot-bubble": "#180830",
      "--af-bot-fg": "#e879f9",
      "--af-shadow": "0 0 50px rgba(217,70,239,.3)",
      "--af-mic-bg": "#d946ef",
      "--af-mic-fg": "#ffffff",
    },
  };

  // ── Inject CSS ──────────────────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      /* ── FAB ── */
      #af-fab {
        position: fixed; bottom: 24px; right: 24px;
        z-index: 2147483640;
        width: 58px; height: 58px;
        border-radius: 50%;
        background: var(--af-accent, #5b5ef4);
        color: var(--af-accent-fg, #fff);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 24px rgba(91,94,244,.45);
        transition: transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .2s;
        outline: none;
      }
      #af-fab:hover { transform: scale(1.09); box-shadow: 0 6px 30px rgba(91,94,244,.55); }
      #af-fab:active { transform: scale(0.94); }
      #af-fab svg { width: 24px; height: 24px; transition: opacity .15s, transform .2s; position: absolute; }
      #af-fab .af-ic-chat  { opacity: 1;  transform: rotate(0); }
      #af-fab .af-ic-close { opacity: 0;  transform: rotate(-90deg); }
      #af-fab.af-open .af-ic-chat  { opacity: 0; transform: rotate(90deg); }
      #af-fab.af-open .af-ic-close { opacity: 1; transform: rotate(0); }

      /* ── Window ── */
      #af-window {
        position: fixed; bottom: 96px; right: 24px;
        z-index: 2147483639;
        width: 360px;
        border-radius: 24px;
        display: flex; flex-direction: column;
        overflow: hidden;
        background: var(--af-bg, #f8f8fc);
        border: 1px solid var(--af-border, #e8e8f0);
        box-shadow: var(--af-shadow);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        transform-origin: bottom right;
        transform: scale(0.9) translateY(12px);
        opacity: 0; pointer-events: none;
        transition: transform .28s cubic-bezier(.34,1.56,.64,1), opacity .2s;
      }
      #af-window.af-visible {
        transform: scale(1) translateY(0);
        opacity: 1; pointer-events: auto;
      }
      #af-window.af-glass { backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }

      /* ── View toggle ── */
      .af-view { display: none; flex-direction: column; }
      .af-view.af-active { display: flex; }

      /* ─────────────── VOICE VIEW ─────────────── */
      #af-voice-view {
        align-items: center;
        padding: 32px 24px 28px;
        min-height: 420px;
        justify-content: space-between;
        position: relative;
      }

      /* avatar orb */
      .af-orb-wrap {
        display: flex; flex-direction: column; align-items: center;
        gap: 20px;  justify-content: center;
      }
      .af-orb {
        width: 100px; height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--af-accent, #5b5ef4) 0%, rgba(91,94,244,.4) 100%);
        display: flex; align-items: center; justify-content: center;
        position: relative;
        box-shadow: 0 0 0 0 rgba(91,94,244,.35);
        transition: box-shadow .3s;
      }
      .af-orb.af-speaking {
        animation: af-orb-pulse 1.5s ease-in-out infinite;
      }
      .af-orb.af-listening {
        animation: af-orb-listen 0.8s ease-in-out infinite alternate;
      }
      @keyframes af-orb-pulse {
        0%,100% { box-shadow: 0 0 0 0 rgba(91,94,244,.4); }
        50%      { box-shadow: 0 0 0 22px rgba(91,94,244,.0); }
      }
      @keyframes af-orb-listen {
        from { box-shadow: 0 0 0 6px rgba(91,94,244,.25); }
        to   { box-shadow: 0 0 0 18px rgba(91,94,244,.05); }
      }
      .af-orb-initial {
        font-size: 36px; font-weight: 800;
        color: var(--af-accent-fg, #fff);
        user-select: none;
      }

      .af-voice-name {
        font-size: 20px; font-weight: 700;
        color: var(--af-text, #1a1a2e);
        text-align: center;
      }
      .af-voice-tagline {
        font-size: 13px; color: var(--af-text-muted, #8888aa);
        text-align: center; margin-top: 4px; line-height: 1.4;
      }

      /* transcript box */
      .af-transcript {
        width: 100%;
        min-height: 52px;
        background: var(--af-surface, #fff);
        border: 1px solid var(--af-border, #e8e8f0);
        border-radius: 14px;
        padding: 12px 14px;
        font-size: 13px;
        line-height: 1.55;
        color: var(--af-text, #1a1a2e);
        text-align: center;
        transition: opacity .2s;
      }
      .af-transcript.af-muted { color: var(--af-text-muted, #8888aa); font-style: italic; }

      /* status label */
      .af-voice-status {
        font-size: 12px; font-weight: 600; letter-spacing: .04em;
        color: var(--af-text-muted, #8888aa);
        text-transform: uppercase;
        text-align: center;
      }

      /* mic button */
      .af-mic-btn {
        width: 64px; height: 64px;
        border-radius: 50%;
        background: var(--af-mic-bg, #5b5ef4);
        color: var(--af-mic-fg, #fff);
        border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 18px rgba(91,94,244,.4);
        transition: transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, background .2s;
        outline: none; flex-shrink: 0;
      }
      .af-mic-btn:hover { transform: scale(1.07); }
      .af-mic-btn:active { transform: scale(.92); }
      .af-mic-btn.af-listening {
        background: #ef4444;
        box-shadow: 0 4px 18px rgba(239,68,68,.4);
        animation: af-mic-pulse 1s ease-in-out infinite;
      }
      @keyframes af-mic-pulse {
        0%,100% { box-shadow: 0 4px 18px rgba(239,68,68,.4); }
        50%      { box-shadow: 0 4px 30px rgba(239,68,68,.6); }
      }
      .af-mic-btn svg { width: 26px; height: 26px; }

      /* switch-to-chat link */
      .af-switch-link {
        font-size: 12px; color: var(--af-accent, #5b5ef4);
        cursor: pointer; text-decoration: underline;
        background: none; border: none;
        font-family: inherit;
      }

      /* ─────────────── CHAT VIEW ─────────────── */
      #af-chat-view { }

      .af-header {
        display: flex; align-items: center; gap: 10px;
        padding: 14px 16px;
        background: var(--af-accent, #5b5ef4);
        color: var(--af-accent-fg, #fff);
        flex-shrink: 0;
      }
      .af-header-avatar {
        width: 34px; height: 34px; border-radius: 50%;
        background: rgba(255,255,255,.22);
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 800; flex-shrink: 0;
      }
      .af-header-info { flex: 1; min-width: 0; }
      .af-header-name { font-size: 14px; font-weight: 700; line-height: 1.2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .af-header-status { font-size: 11px; opacity: .75; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
      .af-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; display: inline-block; }
      .af-header-voice-btn {
        background: rgba(255,255,255,.2); border: none;
        color: #fff; border-radius: 8px;
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; flex-shrink: 0;
        transition: background .15s;
      }
      .af-header-voice-btn:hover { background: rgba(255,255,255,.3); }
      .af-header-voice-btn svg { width: 16px; height: 16px; }

      .af-messages {
        flex: 1; overflow-y: auto;
        padding: 16px;
        display: flex; flex-direction: column; gap: 10px;
        scroll-behavior: smooth;
        max-height: 380px;
      }
      .af-messages::-webkit-scrollbar { width: 4px; }
      .af-messages::-webkit-scrollbar-thumb { background: var(--af-border); border-radius: 2px; }

      .af-msg {
        display: flex; flex-direction: column;
        max-width: 82%;
        animation: af-pop .2s cubic-bezier(.34,1.56,.64,1) both;
      }
      @keyframes af-pop {
        from { opacity: 0; transform: scale(.9) translateY(6px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      .af-msg.af-user { align-self: flex-end; align-items: flex-end; }
      .af-msg.af-bot  { align-self: flex-start; align-items: flex-start; }

      .af-bubble {
        padding: 9px 13px; border-radius: 16px;
        font-size: 13.5px; line-height: 1.5;
        word-break: break-word;
      }
      .af-msg.af-user .af-bubble { background: var(--af-user-bubble); color: var(--af-user-fg); border-bottom-right-radius: 4px; }
      .af-msg.af-bot  .af-bubble { background: var(--af-bot-bubble); color: var(--af-bot-fg); border-bottom-left-radius: 4px; border: 1px solid var(--af-border); }

      .af-time { font-size: 10px; color: var(--af-text-muted); margin-top: 3px; padding: 0 2px; }

      /* speak icon on bot bubble */
      .af-speak-btn {
        background: none; border: none; cursor: pointer;
        color: var(--af-text-muted); padding: 0 0 0 6px;
        display: inline-flex; align-items: center;
        vertical-align: middle;
        transition: color .15s;
      }
      .af-speak-btn:hover { color: var(--af-accent); }
      .af-speak-btn svg { width: 13px; height: 13px; }

      /* typing dots */
      .af-typing {
        display: flex; align-items: center; gap: 4px;
        padding: 10px 14px;
        background: var(--af-bot-bubble); border-radius: 16px; border-bottom-left-radius: 4px;
        border: 1px solid var(--af-border);
        width: fit-content;
      }
      .af-typing span {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--af-text-muted);
        animation: af-bounce 1.2s infinite;
      }
      .af-typing span:nth-child(2) { animation-delay: .2s; }
      .af-typing span:nth-child(3) { animation-delay: .4s; }
      @keyframes af-bounce {
        0%,60%,100% { transform: translateY(0); }
        30%          { transform: translateY(-5px); }
      }

      /* input area */
      .af-input-wrap {
        display: flex; align-items: flex-end; gap: 8px;
        padding: 12px 14px;
        border-top: 1px solid var(--af-border);
        background: var(--af-bg);
        flex-shrink: 0;
      }
      .af-input {
        flex: 1; resize: none;
        border: 1px solid var(--af-border);
        background: var(--af-surface);
        color: var(--af-text);
        border-radius: 12px;
        padding: 9px 12px;
        font-size: 13.5px; font-family: inherit; line-height: 1.4;
        outline: none; max-height: 100px; overflow-y: auto;
        transition: border-color .15s;
      }
      .af-input::placeholder { color: var(--af-text-muted); }
      .af-input:focus { border-color: var(--af-accent); }

      .af-icon-btn {
        width: 38px; height: 38px; border-radius: 10px; border: none;
        background: var(--af-accent); color: var(--af-accent-fg);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
        transition: opacity .15s, transform .15s, background .2s;
      }
      .af-icon-btn:hover:not(:disabled) { opacity: .88; }
      .af-icon-btn:active:not(:disabled) { transform: scale(.92); }
      .af-icon-btn:disabled { opacity: .4; cursor: not-allowed; }
      .af-icon-btn svg { width: 16px; height: 16px; }
      .af-icon-btn.af-listening { background: #ef4444; animation: af-mic-pulse 1s ease-in-out infinite; }

      /* error */
      .af-error {
        font-size: 12px; color: #ef4444;
        text-align: center; padding: 6px 12px;
        background: #fef2f2; border-radius: 8px;
        margin: 0 16px 8px;
      }

      /* footer */
      .af-footer {
        text-align: center; font-size: 10px;
        color: var(--af-text-muted);
        padding: 6px 0 10px; flex-shrink: 0;
      }
      .af-footer a { color: var(--af-accent); text-decoration: none; }

      /* mobile */
      @media (max-width: 480px) {
        #af-window { width: calc(100vw - 16px); right: 8px; bottom: 82px; border-radius: 18px; }
        #af-fab { right: 16px; bottom: 16px; }
      }
    `;
    document.head.appendChild(style);
  }

  // ── Apply theme ─────────────────────────────────────────────────────────────
  function applyTheme(name) {
    const vars = THEMES[name] || THEMES.light;
    const fab = document.getElementById("af-fab");
    const win = document.getElementById("af-window");
    if (!fab || !win) return;
    [fab, win].forEach((el) =>
      Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v))
    );
    if (name === "glass") win.classList.add("af-glass");
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function escHtml(s) {
    return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // ── Speech Synthesis (TTS) ──────────────────────────────────────────────────
  function speak(text, onEnd) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = "en-US";
    utt.rate  = 1;
    utt.pitch = 1;
    utt.volume= 1;
    utt.onend = () => {
      setOrbState("idle");
      if (onEnd) onEnd();
    };
    setOrbState("speaking");
    window.speechSynthesis.speak(utt);
  }

  function stopSpeaking() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setOrbState("idle");
  }

  // ── Orb visual state ────────────────────────────────────────────────────────
  function setOrbState(state) {
    const orb = document.getElementById("af-orb");
    if (!orb) return;
    orb.classList.remove("af-speaking", "af-listening");
    if (state === "speaking") orb.classList.add("af-speaking");
    if (state === "listening") orb.classList.add("af-listening");
  }

  function setVoiceStatus(text) {
    const el = document.getElementById("af-voice-status");
    if (el) el.textContent = text;
  }

  function setTranscript(text, muted) {
    const el = document.getElementById("af-transcript");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("af-muted", !!muted);
  }

  // ── Speech Recognition ──────────────────────────────────────────────────────
  function initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const r = new SpeechRecognition();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;

    r.onstart = () => {
      isListening = true;
      setOrbState("listening");
      setVoiceStatus("Listening…");
      setTranscript("Speak now…", true);
      document.getElementById("af-mic-btn")?.classList.add("af-listening");
      document.getElementById("af-chat-mic")?.classList.add("af-listening");
    };

    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setTranscript(`You: ${transcript}`);
      sendVoiceMessage(transcript);
    };

    r.onerror = (e) => {
      console.warn("[AssistFlow] Speech error:", e.error);
      resetListeningState();
      if (e.error !== "no-speech") setVoiceStatus("Mic error — try again");
    };

    r.onend = () => {
      isListening = false;
      document.getElementById("af-mic-btn")?.classList.remove("af-listening");
      document.getElementById("af-chat-mic")?.classList.remove("af-listening");
    };

    return r;
  }

  function toggleListening() {
    if (!recognition) {
      recognition = initRecognition();
      if (!recognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
    }
    if (isListening) {
      recognition.stop();
      resetListeningState();
    } else {
      stopSpeaking();
      recognition.start();
    }
  }

  function resetListeningState() {
    isListening = false;
    setOrbState("idle");
    setVoiceStatus("Tap button to Speak");
    setTranscript("Ask anything about our website.", true);
    document.getElementById("af-mic-btn")?.classList.remove("af-listening");
    document.getElementById("af-chat-mic")?.classList.remove("af-listening");
  }

  // ── Send via voice (updates voice view) ────────────────────────────────────
  async function sendVoiceMessage(text) {
    if (isLoading) return;

    setVoiceStatus("Thinking…");
    setOrbState("idle");

    conversationHistory.push({ role: "user", parts: [{ text }] });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

    isLoading = true;

    try {
      const res = await fetch(`${API_BASE}/api/widget/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistantId: ASSISTANT_ID,
          message: text,
          conversationHistory: conversationHistory.slice(0, -1),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVoiceStatus(data.error || "Something went wrong.");
        conversationHistory.pop();
      } else {
        const reply = data.reply;
        conversationHistory.push({ role: "model", parts: [{ text: reply }] });

        // Also add to chat view
        appendMessage("user", text);
        appendMessage("bot", reply);

        setTranscript(reply);
        setVoiceStatus("AI Speaking…");
        speak(reply, () => setVoiceStatus("Tap button to Speak"));
      }
    } catch {
      setVoiceStatus("Network error.");
      conversationHistory.pop();
    } finally {
      isLoading = false;
    }
  }

  // ── Chat view message helpers ───────────────────────────────────────────────
  function appendMessage(role, text) {
    const container = document.getElementById("af-messages");
    if (!container) return;

    const wrap = document.createElement("div");
    wrap.className = `af-msg af-${role}`;

    const bubble = document.createElement("div");
    bubble.className = "af-bubble";

    if (role === "bot") {
      // text node + inline speak button
      bubble.appendChild(document.createTextNode(text));
      const speakBtn = document.createElement("button");
      speakBtn.className = "af-speak-btn";
      speakBtn.setAttribute("aria-label", "Read aloud");
      speakBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      speakBtn.addEventListener("click", () => speak(text));
      bubble.appendChild(speakBtn);
    } else {
      bubble.textContent = text;
    }

    const time = document.createElement("div");
    time.className = "af-time";
    time.textContent = formatTime();

    wrap.appendChild(bubble);
    wrap.appendChild(time);
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const c = document.getElementById("af-messages");
    if (!c) return;
    const el = document.createElement("div");
    el.id = "af-typing-ind";
    el.className = "af-msg af-bot";
    el.innerHTML = `<div class="af-typing"><span></span><span></span><span></span></div>`;
    c.appendChild(el);
    c.scrollTop = c.scrollHeight;
  }

  function hideTyping() {
    document.getElementById("af-typing-ind")?.remove();
  }

  function showError(msg) {
    document.getElementById("af-error-msg")?.remove();
    const c = document.getElementById("af-messages");
    if (!c) return;
    const el = document.createElement("div");
    el.id = "af-error-msg";
    el.className = "af-error";
    el.textContent = msg;
    c.appendChild(el);
    c.scrollTop = c.scrollHeight;
    setTimeout(() => el.remove(), 5000);
  }

  // ── Send via text (chat view) ───────────────────────────────────────────────
  async function sendTextMessage() {
    if (isLoading) return;

    const input = document.getElementById("af-input");
    const sendBtn = document.getElementById("af-send-btn");
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    input.value = "";
    input.style.height = "auto";

    conversationHistory.push({ role: "user", parts: [{ text }] });
    if (conversationHistory.length > 20) conversationHistory = conversationHistory.slice(-20);

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
          conversationHistory: conversationHistory.slice(0, -1),
        }),
      });

      const data = await res.json();
      hideTyping();

      if (!res.ok) {
        showError(data.error || "Something went wrong. Please try again.");
        conversationHistory.pop();
      } else {
        appendMessage("bot", data.reply);
        conversationHistory.push({ role: "model", parts: [{ text: data.reply }] });
        // auto-speak the reply
        speak(data.reply);
      }
    } catch {
      hideTyping();
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

  // ── View switching ──────────────────────────────────────────────────────────
  function showView(id) {
    ["af-voice-view", "af-chat-view"].forEach((v) => {
      document.getElementById(v)?.classList.remove("af-active");
    });
    document.getElementById(id)?.classList.add("af-active");
  }

  // ── Build DOM ───────────────────────────────────────────────────────────────
  function buildWidget(cfg) {
    const initials = cfg.assistantName
      .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

    // FAB
    const fab = document.createElement("button");
    fab.id = "af-fab";
    fab.setAttribute("aria-label", "Open chat");
    fab.innerHTML = `
      <svg class="af-ic-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <svg class="af-ic-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>`;
    fab.addEventListener("click", toggleChat);

    // Window
    const win = document.createElement("div");
    win.id = "af-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-label", `${cfg.assistantName} chat`);
    win.innerHTML = `
      <!-- ── VOICE VIEW ── -->
      <div id="af-voice-view" class="af-view af-active">
        <div class="af-orb-wrap">
          <div class="af-orb" id="af-orb">
            <span class="af-orb-initial">${escHtml(initials)}</span>
          </div>
          <div>
            <div class="af-voice-name">Hello! I'm ${escHtml(cfg.assistantName)}</div>
            <div class="af-voice-tagline">Welcome to ${escHtml(cfg.businessName || cfg.assistantName)}.<br>Always ready to answer your queries...</div>
          </div>
        </div>

        <div id="af-voice-status" class="af-voice-status">Tap button to Speak</div>

        <button id="af-mic-btn" class="af-mic-btn" aria-label="Start voice input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="2" width="6" height="12" rx="3"/>
            <path d="M19 10a7 7 0 0 1-14 0"/>
            <line x1="12" y1="19" x2="12" y2="22"/>
            <line x1="9" y1="22" x2="15" y2="22"/>
          </svg>
        </button>

        <button class="af-switch-link" id="af-to-chat">Switch to text chat</button>

        <div class="af-footer">Powered by <a href="https://assistflow.ai" target="_blank" rel="noopener">AssistFlow</a></div>
      </div>

      <!-- ── CHAT VIEW ── -->
      <div id="af-chat-view" class="af-view">
        <div class="af-header">
          <div class="af-header-avatar">${escHtml(initials)}</div>
          <div class="af-header-info">
            <div class="af-header-name">${escHtml(cfg.assistantName)}</div>
            <div class="af-header-status"><span class="af-status-dot"></span> Online</div>
          </div>
          <button class="af-header-voice-btn" id="af-to-voice" aria-label="Switch to voice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M19 10a7 7 0 0 1-14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </button>
        </div>

        <div class="af-messages" id="af-messages"></div>

        <div class="af-input-wrap">
          <textarea id="af-input" class="af-input" rows="1" placeholder="Type a message…" aria-label="Your message"></textarea>
          <button id="af-chat-mic" class="af-icon-btn" aria-label="Voice input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="2" width="6" height="12" rx="3"/>
              <path d="M19 10a7 7 0 0 1-14 0"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="9" y1="22" x2="15" y2="22"/>
            </svg>
          </button>
          <button id="af-send-btn" class="af-icon-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="af-footer">Powered by <a href="https://assistflow.ai" target="_blank" rel="noopener">AssistFlow</a></div>
      </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    applyTheme(cfg.theme || "light");

    // Wire events
    document.getElementById("af-mic-btn").addEventListener("click", toggleListening);
    document.getElementById("af-to-chat").addEventListener("click", () => {
      stopSpeaking();
      showView("af-chat-view");
    });
    document.getElementById("af-to-voice").addEventListener("click", () => showView("af-voice-view"));
    document.getElementById("af-chat-mic").addEventListener("click", toggleListening);

    const input = document.getElementById("af-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendTextMessage(); }
    });
    input.addEventListener("input", () => {
      input.style.height = "auto";
      input.style.height = Math.min(input.scrollHeight, 100) + "px";
    });
    document.getElementById("af-send-btn").addEventListener("click", sendTextMessage);

    // Welcome message in chat view
    appendMessage("bot", `Hi there! I'm ${cfg.assistantName}. How can I help you today?`);
  }

  // ── Toggle open/close ───────────────────────────────────────────────────────
  function toggleChat() {
    isOpen = !isOpen;
    document.getElementById("af-fab")?.classList.toggle("af-open", isOpen);
    document.getElementById("af-window")?.classList.toggle("af-visible", isOpen);
    if (isOpen) setTimeout(() => document.getElementById("af-input")?.focus(), 250);
    else { stopSpeaking(); if (isListening) recognition?.stop(); }
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();