// Fichier fourni — vous n'avez pas à modifier ce fichier

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "llama3.2:3b";

const conversationHistory = [];

const chatForm         = document.getElementById("chat-form");
const userInput        = document.getElementById("user-input");
const chatMessages     = document.getElementById("chat-messages");
const loadingIndicator = document.getElementById("loading-indicator");

function addMessage(text, role) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  messageDiv.classList.add(
    role === "user" ? "user-message" : "assistant-message"
  );

  const p = document.createElement("p");
  p.textContent = text;
  messageDiv.appendChild(p);
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendToOllama(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  loadingIndicator.style.display = "block";

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationHistory,
        stream: false,
      }),
    });

    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    const data = await response.json();
    const assistantMessage = data.message.content;

    conversationHistory.push({ role: "assistant", content: assistantMessage });
    return assistantMessage;

  } catch (error) {
    console.error("Erreur Ollama :", error);
    return "Impossible de contacter l'IA. Vérifiez qu'Ollama est bien lancé.";
  } finally {
    loadingIndicator.style.display = "none";
  }
}

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, "user");
  userInput.value = "";
  userInput.disabled = true;

  const response = await sendToOllama(message);
  addMessage(response, "assistant");

  userInput.disabled = false;
  userInput.focus();
});
