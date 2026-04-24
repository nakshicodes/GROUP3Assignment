# Personal Dashboard — Assignment Notes

## Files in this project

```
dashboard/
├── index.html   ← Structure (HTML)
├── style.css    ← Appearance (CSS)
└── script.js    ← Behaviour (JavaScript)
```

No extra libraries or frameworks needed. Pure HTML, CSS, and JavaScript.

---

## How each widget works

### 1. Clock — `setInterval` + `new Date()`
- `new Date()` gives us the current date and time
- `setInterval(fn, 1000)` calls `fn` every 1000 milliseconds
- `.padStart(2, '0')` adds a leading zero so "9" becomes "09"

### 2. Weather — Fetch API + Open-Meteo
- `navigator.geolocation.getCurrentPosition()` asks the browser for the user's GPS coordinates
- We pass `latitude` and `longitude` into the Open-Meteo API URL
- `fetch(url).then(r => r.json())` makes the HTTP request and converts the response to a JS object
- **No API key required** — Open-Meteo is completely free

### 3. Random Quote — Fetch API + Quotable
- `fetch("https://api.quotable.io/random")` calls the Quotable API
- The response includes `data.content` (the quote) and `data.author`
- A fallback array is used if the API is offline

### 4. To-Do List — localStorage
- Todos are stored as a JS array of objects: `[{ text: "...", done: false }]`
- `localStorage.setItem("key", JSON.stringify(array))` — saves to browser storage
- `JSON.parse(localStorage.getItem("key"))` — loads on page refresh
- Data **persists across page refreshes** until the user clears their browser data

---

## To run this project
Just open `index.html` in any web browser. No server needed.

> **Note:** The browser will ask for location permission for the weather widget.
> Click "Allow" to see real weather data.

---

## APIs used
| API | URL | Key required? |
|-----|-----|---------------|
| Open-Meteo (weather) | https://open-meteo.com | No |
| Quotable (quotes) | https://api.quotable.io | No |
| Google Fonts | https://fonts.google.com | No |
