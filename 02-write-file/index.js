const path = require('path');
const fs = require('fs');
const { stdin, stdout } = process;

const writeStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));
stdout.write('Привет! Введи текст:\n');

function farewellOut() {
  stdout.write('Удачи в учебе!');
  process.exit();
}

stdin.on('data', (chunk) => {
  if (chunk.toString().trim() === 'exit') farewellOut();
  writeStream.write(chunk);
});
process.on('SIGINT', farewellOut);