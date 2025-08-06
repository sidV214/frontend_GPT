const startBtn    = document.getElementById("startBtn");
const output      = document.getElementById("output");
const voiceSelect = document.getElementById("voiceSelect");

let voices = [];
const synth = window.speechSynthesis;

// Populate voices
function loadVoices() {
  voices = synth.getVoices();
  voiceSelect.innerHTML = voices
    .map((v,i) => `<option value="${i}">${v.name} (${v.lang})</option>`)
    .join("");
}
synth.onvoiceschanged = loadVoices;

// Speak helper
function speak(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voices[voiceSelect.value] || voices[0];
  synth.speak(u);
}

// Start recognition
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!Recognition) {
  alert("SpeechRecognition not supported");
} else {
  const recog = new Recognition();
  recog.lang = "en-US";
  recog.interimResults = false;
  recog.maxAlternatives = 1;

  startBtn.addEventListener("click", () => {
    recog.start();
    output.textContent = "Listening…";
  });

  recog.onresult = e => {
    let cmd = e.results[0][0].transcript.toLowerCase().trim();
    output.textContent = `You said: “${cmd}”`;
    handleCommand(cmd);
  };
}

function handleCommand(raw) {
  // normalize British spelling & remove filler words
  let cmd = raw
    .replace(/colour/g, "color")
    .replace(/\b(the|please)\b/g, "")
    .replace(/[.,!?]/g, "")
    .trim();

  console.log("CMD:", cmd);

  // background color: change|set|make background [color] to X
  let m = cmd.match(/(?:change|set|make).+background(?:\scolor)?\s+to\s+(\w+)/);
  if (m) {
    document.body.style.background = m[1];
    speak(`Background changed to ${m[1]}`);
    return;
  }

  // reset background
  if (/reset\s+background/.test(cmd)) {
    document.body.style.background = "";
    speak("Background reset");
    return;
  }

  // text color
  m = cmd.match(/(?:change|set).+text(?:\scolor)?\s+to\s+(\w+)/);
  if (m) {
    document.body.style.color = m[1];
    speak(`Text color changed to ${m[1]}`);
    return;
  }

  // dark/light mode
  if (/(?:dark\s?mode|enable\s?dark)/.test(cmd)) {
    document.body.style.background = "#111";
    document.body.style.color = "#eee";
    speak("Dark mode enabled");
    return;
  }
  if (/(?:light\s?mode|enable\s?light)/.test(cmd)) {
    document.body.style.background = "";
    document.body.style.color = "";
    speak("Light mode enabled");
    return;
  }

  // say/speak
  m = cmd.match(/^(?:say|speak)\s+(.+)/);
  if (m) {
    speak(m[1]);
    return;
  }

  // greetings & thanks
  if (/(^|\s)hello(\s|$)/.test(cmd)) {
    speak("Hello there!");
    return;
  }
  if (/(thank you|thanks)/.test(cmd)) {
    speak("You’re welcome!");
    return;
  }

  // open website
  if (/open\s+(youtube|weather)/.test(cmd)) {
    let site = cmd.match(/open\s+(youtube|weather)/)[1];
    let url = site === "youtube"
      ? "https://youtube.com"
      : "https://weather.com";
    window.open(url, "_blank");
    speak(`Opening ${site}`);
    return;
  }

  // search
  m = cmd.match(/search\s+for\s+(.+)/);
  if (m) {
    let q = encodeURIComponent(m[1]);
    window.open(`https://google.com/search?q=${q}`, "_blank");
    speak(`Searching for ${m[1]}`);
    return;
  }

  // hide/show header
  if (/(?:hide).+header/.test(cmd)) {
    document.querySelector("h1").style.display = "none";
    speak("Header hidden");
    return;
  }
  if (/(?:show).+header/.test(cmd)) {
    document.querySelector("h1").style.display = "";
    speak("Header shown");
    return;
  }

  // fallback
  speak("Sorry, I didn't understand your command.");
}
