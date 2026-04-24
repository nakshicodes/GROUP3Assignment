/* =============================================
   PERSONAL DASHBOARD — script.js
   Features: Clock, Weather (Open-Meteo API),
             Random Quote (Quotable API),
             To-Do List with localStorage
   ============================================= */


/* ============================================
   1. CLOCK
   Uses setInterval to update every second.
   new Date() gives us the current time.
   ============================================ */

function updateClock() {
  const now = new Date();

  // Get hours, minutes, seconds
  let hours   = now.getHours();
  let minutes = now.getMinutes();
  let seconds = now.getSeconds();

  // Determine AM or PM
  const ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert to 12-hour format
  hours = hours % 12;
  if (hours === 0) hours = 12;  // 0 should show as 12

  // Pad with a leading zero if needed (e.g. 9 → "09")
  hours   = String(hours).padStart(2, '0');
  minutes = String(minutes).padStart(2, '0');
  seconds = String(seconds).padStart(2, '0');

  // Display in the HTML element
  document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
  document.getElementById('ampm').textContent  = ampm;
}

// Run immediately, then repeat every 1000ms (1 second)
updateClock();
setInterval(updateClock, 1000);


/* ---- Date label in header ---- */
function updateDateLabel() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date-label').textContent = now.toLocaleDateString('en-US', options);
}
updateDateLabel();


/* ============================================
   2. WEATHER WIDGET
   Step 1: Get user's GPS location using
           navigator.geolocation (built into browsers)
   Step 2: Send lat/lon to Open-Meteo API
           (free, no API key needed!)
   Step 3: Display the results
   ============================================ */

// Map WMO weather codes to emoji icons and descriptions
// Full code list: https://open-meteo.com/en/docs#weathervariables
const weatherCodeMap = {
  0:  { icon: '☀️',  desc: 'Clear sky' },
  1:  { icon: '🌤',  desc: 'Mainly clear' },
  2:  { icon: '⛅',  desc: 'Partly cloudy' },
  3:  { icon: '☁️',  desc: 'Overcast' },
  45: { icon: '🌫',  desc: 'Foggy' },
  48: { icon: '🌫',  desc: 'Icy fog' },
  51: { icon: '🌦',  desc: 'Light drizzle' },
  53: { icon: '🌦',  desc: 'Moderate drizzle' },
  55: { icon: '🌧',  desc: 'Heavy drizzle' },
  61: { icon: '🌧',  desc: 'Light rain' },
  63: { icon: '🌧',  desc: 'Moderate rain' },
  65: { icon: '🌧',  desc: 'Heavy rain' },
  71: { icon: '🌨',  desc: 'Light snow' },
  73: { icon: '❄️',  desc: 'Moderate snow' },
  75: { icon: '❄️',  desc: 'Heavy snow' },
  80: { icon: '🌦',  desc: 'Rain showers' },
  81: { icon: '🌧',  desc: 'Heavy showers' },
  95: { icon: '⛈',  desc: 'Thunderstorm' },
  99: { icon: '⛈',  desc: 'Thunderstorm with hail' },
};

function getWeather() {
  // Check if the browser supports geolocation
  if (!navigator.geolocation) {
    document.getElementById('weather-desc').textContent = 'Geolocation not supported.';
    return;
  }

  document.getElementById('weather-desc').textContent = 'Detecting your location...';

  // Ask the browser for the user's coordinates
  navigator.geolocation.getCurrentPosition(
    // SUCCESS callback — we have lat/lon
    function(position) {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      // Build the Open-Meteo API URL with the parameters we want
      // Docs: https://open-meteo.com/en/docs
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${lat}` +
        `&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&temperature_unit=celsius` +
        `&wind_speed_unit=kmh`;

      // Fetch the weather data
      fetch(url)
        .then(function(response) {
          // Convert the raw response to a JS object
          return response.json();
        })
        .then(function(data) {
          // Extract the values we need from the response
          const current  = data.current;
          const temp     = Math.round(current.temperature_2m);
          const feelsLike= Math.round(current.apparent_temperature);
          const humidity = current.relative_humidity_2m;
          const windSpeed= Math.round(current.wind_speed_10m);
          const code     = current.weather_code;

          // Look up the icon and description for this weather code
          const weather  = weatherCodeMap[code] || { icon: '🌡', desc: 'Unknown' };

          // Update the HTML
          document.getElementById('weather-icon').textContent  = weather.icon;
          document.getElementById('weather-temp').textContent  = `${temp}°C`;
          document.getElementById('weather-desc').textContent  = weather.desc;
          document.getElementById('wind-speed').textContent    = `${windSpeed} km/h`;
          document.getElementById('humidity').textContent      = `${humidity}%`;
          document.getElementById('feels-like').textContent    = `${feelsLike}°C`;
        })
        .catch(function(error) {
          // Something went wrong with the API call
          console.error('Weather fetch error:', error);
          document.getElementById('weather-desc').textContent = 'Could not load weather.';
        });
    },
    // ERROR callback — user denied location or it failed
    function(error) {
      console.warn('Geolocation error:', error.message);
      document.getElementById('weather-desc').textContent = 'Location access denied.';
      document.getElementById('weather-icon').textContent = '🚫';
    }
  );
}

// Load weather when the page loads
getWeather();


/* ============================================
   3. RANDOM QUOTE
   Uses the Quotable API (free, no key needed)
   Endpoint: https://api.quotable.io/random
   Returns: { content: "...", author: "..." }
   ============================================ */

function fetchQuote() {
  document.getElementById('quote-text').textContent   = 'Loading...';
  document.getElementById('quote-author').textContent = '—';

  fetch('https://api.quotable.io/random')
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      // data.content = the quote text
      // data.author  = who said it
      document.getElementById('quote-text').textContent   = `"${data.content}"`;
      document.getElementById('quote-author').textContent = `— ${data.author}`;
    })
    .catch(function(error) {
      console.error('Quote fetch error:', error);
      // Fallback quotes if API is down
      const fallback = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
        { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
      ];
      const pick = fallback[Math.floor(Math.random() * fallback.length)];
      document.getElementById('quote-text').textContent   = `"${pick.text}"`;
      document.getElementById('quote-author').textContent = `— ${pick.author}`;
    });
}

// Load a quote on page load
fetchQuote();

// "New quote" button
document.getElementById('refresh-quote').addEventListener('click', fetchQuote);


/* ============================================
   4. TO-DO LIST WITH LOCALSTORAGE
   localStorage saves data as strings.
   We convert our array ↔ JSON string when saving/loading.

   localStorage.setItem(key, value) — SAVE
   localStorage.getItem(key)        — LOAD
   ============================================ */

// Load todos from localStorage (or start with empty array)
// JSON.parse converts the stored string back to a JS array
let todos = JSON.parse(localStorage.getItem('dashboard-todos')) || [];

// Save the current todos array to localStorage
function saveTodos() {
  // JSON.stringify converts the JS array into a string for storage
  localStorage.setItem('dashboard-todos', JSON.stringify(todos));
}

// Render (display) the todos in the list
function renderTodos() {
  const list      = document.getElementById('todo-list');
  const emptyMsg  = document.getElementById('todo-empty');
  const countEl   = document.getElementById('todo-count');

  // Clear the current list before re-rendering
  list.innerHTML = '';

  // Show/hide the empty message
  if (todos.length === 0) {
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
  }

  // Build a list item (<li>) for each todo
  todos.forEach(function(todo, index) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'todo-check';
    checkbox.checked   = todo.done;
    checkbox.addEventListener('change', function() {
      toggleTodo(index);
    });

    // Text label
    const textSpan = document.createElement('span');
    textSpan.className   = 'todo-text';
    textSpan.textContent = todo.text;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className   = 'todo-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title       = 'Delete task';
    deleteBtn.addEventListener('click', function() {
      deleteTodo(index);
    });

    // Assemble the list item
    li.appendChild(checkbox);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  // Update the count label
  const done  = todos.filter(function(t) { return t.done; }).length;
  const total = todos.length;
  countEl.textContent = `${done}/${total} done`;
}

// Add a new todo
function addTodo() {
  const input = document.getElementById('todo-input');
  const text  = input.value.trim();

  if (text === '') return;  // Don't add empty tasks

  // Push a new todo object to our array
  todos.push({ text: text, done: false });

  // Save to localStorage and re-render
  saveTodos();
  renderTodos();

  // Clear the input field
  input.value = '';
  input.focus();
}

// Toggle a todo between done / not done
function toggleTodo(index) {
  todos[index].done = !todos[index].done;
  saveTodos();
  renderTodos();
}

// Delete a todo by index
function deleteTodo(index) {
  todos.splice(index, 1);  // Remove 1 item at the given index
  saveTodos();
  renderTodos();
}

// Clear all completed todos
function clearDone() {
  todos = todos.filter(function(t) { return !t.done; });
  saveTodos();
  renderTodos();
}

// Event listeners for the to-do controls
document.getElementById('add-btn').addEventListener('click', addTodo);
document.getElementById('clear-done').addEventListener('click', clearDone);

// Allow pressing Enter to add a task
document.getElementById('todo-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// Render todos on page load (loads saved data from localStorage)
renderTodos();
