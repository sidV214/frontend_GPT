const startBtn    = document.getElementById("startBtn");
const output      = document.getElementById("output");
const voiceSelect = document.getElementById("voiceSelect");

let availableVoices = [];
let selectedVoice   = null;

// Restore saved background
const savedBg = localStorage.getItem("bgColor");
if (savedBg) document.body.style.backgroundColor = savedBg;

// Populate voice dropdown
function loadVoices() {
  availableVoices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";
  availableVoices.forEach((v, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${v.name} (${v.lang})${v.default?" — Default":""}`;
    voiceSelect.append(opt);
  });
  selectedVoice = availableVoices[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;
voiceSelect.addEventListener("change", () => {
  selectedVoice = availableVoices[+voiceSelect.value];
});

function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  if (selectedVoice) u.voice = selectedVoice;
  speechSynthesis.speak(u);
}

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  alert("Speech recognition not supported.");
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  startBtn.addEventListener("click", () => {
    recognition.start();
    output.textContent = "Listening... 🎧";
  });

  recognition.addEventListener("result", (e) => {
    let transcript = e.results[0][0].transcript.toLowerCase();
    console.log("Heard raw:", transcript);
    // Remove punctuation, extra 'the', normalize spaces
    transcript = transcript
      .replace(/[.,!?]/g, "")
      .replace(/\bthe\b/g, "")
      .replace(/\s+/g, " ")
      .trim();
    console.log("Normalized:", transcript);
    output.textContent = `You said: "${transcript}"`;

    // 1) background color/colour
    let m = transcript.match(/background\s+(?:color|colour)\s+to\s+(\w+)/);
    if (m) {
      const color = m[1];
      document.body.style.backgroundColor = color;
      localStorage.setItem("bgColor", color);
      return speak(`Background changed to ${color}`);
    }

    // 2) text color/colour
    m = transcript.match(/text\s+(?:color|colour)\s+to\s+(\w+)/);
    if (m) {
      const color = m[1];
      document.body.style.color = color;
      return speak(`Text color changed to ${color}`);
    }

    // 3) dark/light mode
    if ( transcript.includes("dark mode") || transcript.includes("enable dark mode") ) {
      document.body.style.backgroundColor = "#1e1e1e";
      document.body.style.color = "#fff";
      localStorage.setItem("bgColor", "#1e1e1e");
      return speak("Dark mode activated");
    }
    if ( transcript.includes("light mode") || transcript.includes("enable light mode") ) {
      document.body.style.backgroundColor = "#f5f5f5";
      document.body.style.color = "#222";
      localStorage.setItem("bgColor", "#f5f5f5");
      return speak("Light mode enabled");
    }

    // 4) open sites
    if ( transcript.includes("open youtube") ) {
      window.open("https://youtube.com", "_blank");
      return speak("Opening YouTube");
    }
    if ( transcript.includes("open weather") ) {
      window.open("https://weather.com", "_blank");
      return speak("Opening Weather");
    }

    // 5) search Google
    m = transcript.match(/search for\s+(.+)/);
    if (m) {
      const q = m[1].trim();
      window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_blank");
      return speak(`Searching Google for ${q}`);
    }

    // fallback
    speak("Sorry, I didn't understand that command.");
  });

  recognition.addEventListener("end", () => {
    console.log("Recognition ended.");
  });
}
