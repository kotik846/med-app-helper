export function renderHome() {
  const homeScreen = document.createElement("section");
  homeScreen.className = "home-screen";
  homeScreen.innerHTML = `
    <!-- Hero секция -->
    <div class="hero">
      <div class="hero-badge">🏥 Медицинский ИИ-помощник</div>
      <h1>Разберитесь в своём <span>самочувствии</span> до визита к врачу</h1>
      <p class="hero-subtitle">
        МедИИ отвечает на вопросы о симптомах простым языком, подсказывает, 
        что можно сделать прямо сейчас, и предупреждает, когда нужна срочная медицинская помощь.
      </p>
      <div class="hero-actions">
        <button class="btn-primary" onclick="window.location.hash = '/chat'">
   Задать вопрос
</button>
        <button class="btn-secondary" onclick="document.querySelector('.blog-preview').scrollIntoView({behavior: 'smooth'})">
          📚 Читать блог
        </button>
      </div>
    </div>

    <!-- Секция "Зачем нужен МедИИ" -->
    <div class="section">
      <div class="section-header">
        <h2>Зачем нужен МедИИ</h2>
        <p>Когда что-то болит, хочется быстро понять, насколько это серьёзно. 
           Поиск в интернете часто пугает или запутывает, а записаться к врачу получается не сразу.</p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <h3>⚡ Ответ за секунды</h3>
          <p>Не нужно искать по форумам и сравнивать противоречивые статьи. 
             Опишите симптомы своими словами и получите понятный ответ.</p>
        </div>
        
        <div class="feature-card">
          <h3>🚨 Когда пора к врачу</h3>
          <p>Помощник подскажет тревожные признаки, при которых нельзя ждать 
             и нужно звонить 103 или 112.</p>
        </div>
        
        <div class="feature-card">
          <h3> Данные остаются у вас</h3>
          <p>Модель работает локально на вашем компьютере. Описание самочувствия 
             никуда не отправляется и не хранится на чужих серверах.</p>
        </div>
        
        <div class="feature-card">
          <h3>📖 Полезные статьи</h3>
          <p>В блоге собраны понятные материалы о распространённых заболеваниях, 
             профилактике и первой помощи.</p>
        </div>
      </div>
    </div>

    <!-- Секция "Как это работает" -->
    <div class="section" style="background: rgba(230, 57, 70, 0.03); border-radius: 16px; margin: 40px auto; padding: 80px 24px;">
      <div class="section-header">
        <h2>Как это работает</h2>
        <p>Всего три простых шага до получения рекомендаций</p>
      </div>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Опишите самочувствие</h3>
            <p>Что болит, какие симптомы и как давно. Можно выбрать готовый пример.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Получите рекомендации</h3>
            <p>Что можно сделать сейчас и какие признаки должны насторожить.</p>
          </div>
        </div>
        
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Ответьте на вопросы</h3>
            <p>Помощник задаст уточняющие вопросы, чтобы лучше понять ситуацию.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Секция блога -->
    <div class="section blog-preview">
      <div class="section-header">
        <h2>Свежее в блоге</h2>
        <p>Полезные статьи о здоровье и медицине</p>
      </div>
      
      <div class="blog-list">
        <div class="blog-card" onclick="alert('Здесь будет статья')">
          <span class="blog-card-tag">Инфекции</span>
          <h3>ОРВИ или грипп: как отличить и когда идти к врачу</h3>
          <p>С наступлением холодов растёт число простудных заболеваний. 
             Разбираемся, чем грипп отличается от обычной ОРВИ и какие симптомы требуют врача.</p>
        </div>
        
        <div class="blog-card" onclick="alert('Здесь будет статья')">
          <span class="blog-card-tag">Профилактика</span>
          <h3>Вакцинация от гриппа: почему её делают осенью</h3>
          <p>Состав вакцины от гриппа обновляется каждый год. 
             Рассказываем, зачем прививаться ежегодно и когда это лучше сделать.</p>
        </div>
        
        <div class="blog-card" onclick="alert('Здесь будет статья')">
          <span class="blog-card-tag">Экстренные состояния</span>
          <h3>Признаки инсульта: правило УДАР</h3>
          <p>При инсульте важна каждая минута. Простое правило помогает 
             быстро распознать симптомы и вовремя вызвать скорую.</p>
        </div>
      </div>
      
      <div class="blog-all-link">
        <a href="#/blog">Все статьи →</a>
      </div>
    </div>
  `;

  return homeScreen;
}