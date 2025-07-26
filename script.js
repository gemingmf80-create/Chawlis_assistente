document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const loginPage = document.getElementById("login-page");
  const assistantPage = document.getElementById("assistant-page");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const micBtn = document.getElementById("mic-btn");
  const chatBox = document.getElementById("chat-box");

  let recognition;

  window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (window.SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = async function (e) {
      const voiceText = e.results[0][0].transcript;
      userInput.value = voiceText;
      await sendMessage();
    };
  } else {
    micBtn.disabled = true;
    micBtn.innerText = "🎤 Mic नहीं चल रहा";
  }

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const email = emailInput.value;
    if (email && email.includes("@")) {
      loginPage.style.display = "none";
      assistantPage.style.display = "block";
      setTimeout(() => {
        speak("Hello, I am Charlie, your AI assistant. How can I help you?");
      }, 2000);
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  micBtn.addEventListener("click", () => {
    if (recognition) recognition.start();
  });

  async function sendMessage() {
    const msg = userInput.value.trim();
    if (!msg) return;
    appendMessage("आप", msg);
    userInput.value = "";

    const reply = await getReplyFromOpenAI(msg);
    appendMessage("Charlie", reply);
    speak(reply);
  }

  function appendMessage(sender, text) {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(p);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    function loadVoice() {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name.includes("Google UK") || v.name.includes("Google US"));
      if (voice) {
        utterance.voice = voice;
        speechSynthesis.speak(utterance);
      } else {
        setTimeout(loadVoice, 100);
      }
    }

    loadVoice();
  }

  async function getReplyFromOpenAI(prompt) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_OPENAI_API_KEY"
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "माफ कीजिए, मैं समझ नहीं पाया।";
    } catch (error) {
      console.error("Error:", error);
      return "माफ कीजिए, कुछ गड़बड़ हो गई।";
    }
  }
});
