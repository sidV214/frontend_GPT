const startBtn = document.getElementById("startBtn");
const output = document.getElementById("output");
const voiceSelect = document.getElementById("voiceSelect");

let availableVoices = [];
let selectedVoice = null;

const savedBg = localStorage.getItem("bgColor");
if (savedBg) {
  document.body.style.backgroundColor = savedBg;
}

// Load voices
function loadVoices() {
  availableVoices = speechSynthesis.getVoices();

  voiceSelect.innerHTML = '';
  availableVoices.forEach((voice, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})${voice.default ? " — Default" : ""}`;
    voiceSelect.appendChild(option);
  });

  selectedVoice = availableVoices[0];
}
window.speechSynthesis.onvoiceschanged = loadVoices;

voiceSelect.addEventListener("change", () => {
  const selectedIndex = parseInt(voiceSelect.value);
  selectedVoice = availableVoices[selectedIndex];
});

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  speechSynthesis.speak(utterance);
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
    let transcript = e.results[0][0].transcript.toLowerCase().trim();
    output.textContent = `You said: "${transcript}"`;

    // DEBUG: Log full transcript
    console.log("Heard:", transcript);

    // Normalize for punctuation, extra spaces
    transcript = transcript.replace(/[.,!?]/g, '').replace(/\s+/g, ' ').trim();

    // Match exact or approximate commands
    if (transcript.includes("background to")) {
      const color = transcript.split("background to")[1].trim();
      document.body.style.backgroundColor = color;
      localStorage.setItem("bgColor", color);
      speak(`Background changed to ${color}`);
    }

    else if (transcript.includes("text color to")) {
      const color = transcript.split("text color to")[1].trim();
      document.body.style.color = color;
      speak(`Text color changed to ${color}`);
    }

    else if (transcript.includes("dark mode") || transcript.includes("enable dark mode")) {
      document.body.style.backgroundColor = "#1e1e1e";
      document.body.style.color = "#ffffff";
      localStorage.setItem("bgColor", "#1e1e1e");
      speak("Dark mode activated");
    }

    else if (transcript.includes("light mode") || transcript.includes("enable light mode")) {
      document.body.style.backgroundColor = "#f5f5f5";
      document.body.style.color = "#222";
      localStorage.setItem("bgColor", "#f5f5f5");
      speak("Light mode enabled");
    }

    else if (transcript.includes("open youtube")) {
      window.open("https://youtube.com", "_blank");
      speak("Opening YouTube");
    }

    else if (transcript.includes("open weather")) {
      window.open("https://weather.com", "_blank");
      speak("Opening Weather");
    }

    else if (transcript.includes("search for")) {
      const query = transcript.split("search for")[1].trim();
      window.open(`https://www.google.com/search?q=${query}`, "_blank");
      speak(`Searching Google for ${query}`);
    }

    else {
      speak("Sorry, I didn't understand that command.");
    }
  });

  recognition.addEventListener("end", () => {
    console.log("Recognition ended.");
  });
}
