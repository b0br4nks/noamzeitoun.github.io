const lines = [
  ">> Initializing connection to NZR Labs...",
  `>> Secure channel established in {EUROPE}: ${getParisTime()}`,
  "",
  "__STARTUP_LINE__",
  "",
  "Welcome to NZR Labs.",
  "",
  "",
  "From features to flaws, we see it all.",
  "We build. We review. We secure.",
  "",
  "Moving code, networks, and systems forward. Quietly.",
  "",
  "",
  ">> Contact: nzrlabs[at]proton[dot]me",
];

function getParisTime() {
  const parisDate = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Paris",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return parisDate;
}

const output = document.getElementById("output");
let lineIndex = 0;

function generateRandomHexAddress() {
  const hex = Math.floor(Math.random() * 0xFFFFFFFF)
    .toString(16)
    .padStart(8, '0');
  return `0x${hex}`;
}

function getStartupLine() {
  return `>> [0x00000000]> s nzrlabs @ ${generateRandomHexAddress()}`;
}

function showMailButton() {
  const mailBtn = document.createElement("button");
  mailBtn.textContent = "Send mail to NZR Labs";
  mailBtn.className = "mail-button";
  mailBtn.onclick = () => {
    console.log("Mail button clicked");
    window.location.href = "mailto:nzrlabs@proton.me";
  };
  output.appendChild(mailBtn);

  output.appendChild(document.createElement("br"));
}



function typeLine() {
  if (lineIndex >= lines.length) {
    showMailButton();
    return;
  }
  let line = lines[lineIndex++];

  if (line === "__STARTUP_LINE__") {
    line = getStartupLine();
  }

  if (line === "") {
    output.innerHTML += "<br/>";
    setTimeout(typeLine, 100);
    return;
  }
  let charIndex = 0;
  const span = document.createElement("span");
  output.appendChild(span);
  const interval = setInterval(() => {
    span.textContent += line[charIndex++];
    if (charIndex >= line.length) {
      clearInterval(interval);
      output.innerHTML += "<br/>";
      setTimeout(typeLine, 100);
    }
  }, 20);
}

window.onload = () => {
  typeLine();
};

function toggleTheme() {
  document.body.classList.toggle("light");
  const btn = document.querySelector('.theme-toggle');
  btn.textContent = document.body.classList.contains("light") ? "Dark mode" : "Light mode";
}

