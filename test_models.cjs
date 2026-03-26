const https = require('https');
const url = "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC2D9sXGAm-kwjk3u7a7MsQxurm9UmzGW8";
https.get(url, res => {
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', body));
});
