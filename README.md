# Quiz Player Application Manual

## English

### Overview
The Quiz Player application is a React Native mobile app designed for interactive quiz games. Players connect to a central server using their seat number and answer questions in real-time. The app supports multiple question types and provides an intuitive interface for quiz participation.

### Key Features
- **Multi-language Support**: English and Ukrainian interface
- **Real-time Connection**: WebSocket-based communication with quiz server
- **Multiple Question Types**: Single choice, multiple choice, text input, and numeric input
- **Custom Keyboards**: Built-in QWERTY keyboard for text input with locale support
- **Admin Panel**: Hidden configuration interface for setup
- **Connection Status**: Real-time display of server connection status
- **Touch-optimized UI**: Designed for tablets and mobile devices

### Game Flow
1. **Initial Setup**: Configure seat number and server IP in admin panel
2. **Connection**: App automatically connects to the quiz server
3. **Waiting**: Display waiting screen until quiz begins
4. **Question Phase**: 
   - View question and optional image
   - Select answer or input text/numbers
   - Submit response within time limit
5. **Results**: See if answer was correct (if enabled by server)
6. **Next Question**: Automatic progression to next question

### Question Types and User Interaction

#### Single Choice Questions
- **Display**: Question text with multiple answer buttons
- **Interaction**: Tap desired answer button
- **Submission**: Tap "Submit Answer" button to confirm

#### Multiple Choice Questions  
- **Display**: Question text with checkboxes for multiple options
- **Interaction**: Tap multiple checkboxes to select answers
- **Submission**: Tap "Submit Answer" button to confirm selection

#### Text Input Questions
- **Display**: Question with custom text input field and keyboard
- **Interaction**: 
  - Type using custom QWERTY keyboard (always visible)
  - Keyboard adapts to selected language (English/Ukrainian)
  - Letters appear in uppercase on keyboard but input as lowercase
  - Ukrainian keyboard: Long-press on 'І' to see and select 'Ї' (iPhone-like behavior)
  - Backspace: Single tap deletes one character, hold for 2 seconds clears all text
- **Submission**: Tap "Submit Answer" button

#### Numeric Input Questions
- **Display**: Question with numeric input field and number pad
- **Interaction**:
  - Use custom number keyboard (0-9, decimal point, +/-)
  - Enter numeric values only
- **Submission**: Tap "Submit Answer" button

### Additional Actions
- **Pass**: Skip current question (if allowed by server)
- **Buyout**: Purchase answer for points (in buyout rounds)

### Admin Panel Access
- **Method**: Tap "WebSocket" text in connection status 4 times within 2 seconds
- **Password**: Default password is "12345678"
- **Settings Available**:
  - Seat Number: Your position identifier in the quiz
  - Server IP: Quiz server address (IP or localhost)
  - Language: Interface language (English/Ukrainian)
  - Connection Status: View WebSocket connection state

### Connection Status
Located at bottom of screen, shows:
- **Green dot**: Connected to server
- **Red dot**: Disconnected or error
- **Orange dot**: Attempting to connect
- **Error details**: Displayed when connection fails

### Tips for Players
- Ensure stable internet connection
- Keep app in foreground during quiz
- Test connection before quiz starts
- Familiarize yourself with custom keyboards
- For text input: Use backspace hold feature to quickly clear text

---

## Українська

### Огляд
Додаток Quiz Player - це мобільний додаток React Native, призначений для інтерактивних вікторин. Гравці підключаються до центрального сервера, використовуючи номер свого місця, і відповідають на запитання в реальному часі. Додаток підтримує різні типи запитань і надає інтуїтивний інтерфейс для участі у вікторині.

### Ключові Функції
- **Багатомовна Підтримка**: Англійський та український інтерфейс
- **З'єднання в Реальному Часі**: Комунікація з сервером вікторини через WebSocket
- **Різні Типи Запитань**: Одиночний вибір, текстовий і числовий ввід
- **Власні Клавіатури**: Вбудована QWERTY клавіатура для текстового вводу з підтримкою локалізації
- **Панель Адміністратора**: Прихований інтерфейс конфігурації
- **Статус З'єднання**: Відображення стану підключення до сервера в реальному часі
- **UI Оптимізований для Дотику**: Розроблений для планшетів і мобільних пристроїв

### Хід Гри
1. **Початкове Налаштування**: Налаштуйте номер місця та IP сервера в панелі адміністратора
2. **Підключення**: Додаток автоматично підключається до сервера вікторини
3. **Очікування**: Відображається екран очікування до початку вікторини
4. **Фаза Запитання**: 
   - Перегляд зображення запитання 
   - Вибір відповіді або введення тексту/чисел
   - Надсилання відповіді в межах часового ліміту
5. **Результати**: Перегляд правильності відповіді (якщо увімкнено сервером)
6. **Наступне Запитання**: Автоматичний перехід до наступного запитання

### Типи Запитань та Взаємодія Користувача

#### Запитання з Одиночним Вибором
- **Відображення**: Текст запитання з кнопками варіантів відповідей
- **Взаємодія**: Натисніть бажану кнопку відповіді
- **Надсилання**: Натисніть кнопку "Надіслати Відповідь" для підтвердження

#### Текстові Запитання
- **Відображення**: Запитання з полем для введення тексту та клавіатурою
- **Взаємодія**: 
  - Друкуйте, використовуючи власну QWERTY клавіатуру (завжди видима)
  - Клавіатура адаптується до обраної мови (англійська/українська)
  - Літери вводяться великими
  - Українська клавіатура: Утримуйте 'І' для введення 'Ї' (поведінка схожа на iPhone)
  - Backspace: Одне натискання видаляє один символ, утримування 2 секунди очищає весь текст
- **Надсилання**: Натисніть кнопку "Надіслати Відповідь"

#### Числові Запитання
- **Відображення**: Запитання з полем для числового вводу та цифровою клавіатурою
- **Взаємодія**:
  - Використовуйте власну цифрову клавіатуру (0-9, десяткова кома, +/-)
  - Вводьте лише числові значення
- **Надсилання**: Натисніть кнопку "Надіслати Відповідь"

### Додаткові Дії
- **Пропуск**: Пропустити поточне запитання (якщо дозволено сервером)
- **Викуп**: Купити відповідь за очки (у раундах викупу)

### Доступ до Панелі Адміністратора
- **Метод**: Натисніть текст "WebSocket" у статусі з'єднання 4 рази протягом 2 секунд
- **Пароль**: Стандартний пароль "12345678"
- **Доступні Налаштування**:
  - Номер Місця: Ваш ідентифікатор позиції у вікторині
  - IP Сервера: Адреса сервера вікторини (IP або localhost)
  - Мова: Мова інтерфейсу (англійська/українська)
  - Статус З'єднання: Перегляд стану WebSocket підключення

### Статус З'єднання
Розташований внизу екрана, показує:
- **Зелена точка**: Підключено до сервера
- **Червона точка**: Відключено або помилка
- **Помаранчева точка**: Спроба підключення
- **Деталі помилки**: Відображаються при невдалому підключенні

### Поради для Гравців
- Забезпечте стабільне інтернет-з'єднання
- Тримайте додаток на передньому плані під час вікторини
- Перевірте з'єднання перед початком вікторини
- Ознайомтеся з власними клавіатурами
- Для текстового вводу: Використовуйте функцію утримування backspace для швидкого очищення тексту
