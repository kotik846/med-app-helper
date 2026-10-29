import { requestMedicalResponse } from "../../services/ai.js";

const quickPrompts = [
  ["Головная боль", "Болит голова уже два дня, пульсирует в висках"],
  ["🤒 Температура", "Температура 38.5 и кашель второй день"],
  ["🗣️ Боль в горле", "Болит горло, больно глотать, покраснение"],
  ["🤢 Боль в животе", "Болит живот и тошнит после еды"],
  ["🩹 Травма", "Порезал палец ножом, кровь не останавливается"],
];

export function renderChat() {
  const chatScreen = document.createElement("section");
  chatScreen.className = "chat-screen";
  chatScreen.innerHTML = `
    <div class="chat">
      <div class="chat-header">Чат с помощником</div>
      <div class="messages" aria-live="polite">
        <div class="ai-message">Здравствуйте! 👋 Я — МедИИ, ваш медицинский помощник. Опишите вашу жалобу: что болит, какие симптомы, как давно это длится. Я дам рекомендации и подскажу, когда нужно к врачу.<div class="quick-buttons"></div></div>
      </div>
      <div class="notice">⚠️ Информация носит справочный характер и не заменяет консультацию врача.</div>
      <form class="input-area">
        <input class="message-input" type="text" placeholder="Напишите, что вас беспокоит..." />
        <button class="send-button" type="submit">Отправить</button>
      </form>
    </div>
  `;

  const messages = chatScreen.querySelector(".messages");
  const input = chatScreen.querySelector(".message-input");
  const form = chatScreen.querySelector(".input-area");
  const quickButtons = chatScreen.querySelector(".quick-buttons");
  const chatHistory = [];

  quickPrompts.forEach(([label, prompt]) => {
    const button = document.createElement("button");
    button.className = "quick-button";
    button.type = "button";
    button.textContent = label;
    button.addEventListener("click", () => {
      input.value = prompt;
      sendMessage();
    });
    quickButtons.appendChild(button);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage();
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text || input.disabled) return;

    appendMessage("user-message", text);
    input.value = "";
    input.disabled = true;
    const typing = appendMessage("typing", "МедИИ готовит подробный ответ...");

    try {
      const aiText = await requestMedicalResponse(text, chatHistory, (partialText) => {
        typing.className = "ai-message";
        typing.textContent = cleanResponse(partialText);
      });
      typing.remove();
      appendMessage("ai-message", cleanResponse(aiText));
      chatHistory.push({ role: "user", content: text });
      chatHistory.push({ role: "assistant", content: aiText });
    } catch (error) {
      typing.remove();
      appendMessage(
        "error-message",
        `❌ Ошибка: ${error.message}\n\nПроверьте:\n1. Docker Desktop запущен\n2. Проект запущен командой npm run dev`,
      );
    } finally {
      input.disabled = false;
      input.focus();
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function appendMessage(className, text) {
    const message = document.createElement("div");
    message.className = className;
    message.textContent = text;
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function cleanResponse(text) {
    return text
      .replace(/\*+/g, "")
      .replace(/^[#_]+\s*/gm, "")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
  }

  return chatScreen;
}
