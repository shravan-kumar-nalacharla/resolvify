const https = require('https');
https.get('https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyC2D9sXGAm-kwjk3u7a7MsQxurm9UmzGW8', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
     try {
       const parsed = JSON.parse(data);
       console.log(parsed.models.map(m => m.name).join('\n'));
     } catch (e) {
       console.log(data);
     }
  });
});
