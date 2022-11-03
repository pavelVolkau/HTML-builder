const path = require('path');
const fs = require('fs');
const { stdin, stdout } = process;

const writeStream = fs.createWriteStream(path.join(__dirname, 'text.txt'));
stdout.write('Привет! Введи текст:\n');

stdin.on('data', (chunk) => {
  if (chunk.toString().trim() === 'exit') process.exit();
  writeStream.write(chunk);
});