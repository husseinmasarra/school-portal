const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const urlModule = require('url');

const targetDir = 'C:\\Users\\Hussein\\.gradle\\wrapper\\dists\\gradle-8.14.3-all\\ekfifczy39xxeqqqzobqh30ld';
const targetFile = path.join(targetDir, 'gradle-8.14.3-all.zip');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(urlStr) {
  console.log(`Requesting URL: ${urlStr}`);
  const parsedUrl = urlModule.parse(urlStr);
  const options = {
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    port: parsedUrl.port,
    path: parsedUrl.path,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    agent: new https.Agent({ rejectUnauthorized: false })
  };

  const client = parsedUrl.protocol === 'https:' ? https : http;

  client.get(options, (response) => {
    if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
      const redirectUrl = response.headers.location;
      console.log(`Following redirect to: ${redirectUrl}`);
      downloadFile(redirectUrl);
      return;
    }

    if (response.statusCode !== 200) {
      console.error(`Failed to download: Status Code ${response.statusCode}`);
      return;
    }

    const file = fs.createWriteStream(targetFile);
    const totalBytes = parseInt(response.headers['content-length'], 10) || 0;
    let downloadedBytes = 0;

    response.pipe(file);

    response.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      if (totalBytes > 0) {
        const percent = Math.round((downloadedBytes / totalBytes) * 100);
        process.stdout.write(`Downloading: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(totalBytes / 1024 / 1024).toFixed(2)} MB)\r`);
      } else {
        process.stdout.write(`Downloading: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB\r`);
      }
    });

    file.on('finish', () => {
      file.close();
      console.log('\nGradle download completed successfully!');
    });
  }).on('error', (err) => {
    console.error('Download error:', err.message);
  });
}

downloadFile('https://services.gradle.org/distributions/gradle-8.14.3-all.zip');
