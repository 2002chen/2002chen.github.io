// The separate filename forces mobile browsers to fetch the latest application code.
const latestScript = document.createElement('script');
latestScript.src = 'app.js?v=bright-quiz-1';
document.head.appendChild(latestScript);
