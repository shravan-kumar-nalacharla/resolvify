const https = require('https');
const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=FAKE_KEY_THAT_IS_LONG_ENOUGH_TO_BE_VALID123";
const data = JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] });
const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
req.write(data);
req.end();
