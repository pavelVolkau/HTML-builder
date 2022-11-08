const fs = require('fs');
const fsPromis = require('fs/promises');
const path = require('path');

async function bundleFiles(dirPathInput, dirPathOutput, fileExt) {
  const FILE_NAME = 'bundle';
  const dirFiles = await fsPromis.readdir(dirPathInput, { withFileTypes: true });
  const bundleWriteStream = fs.createWriteStream(
    path.join(dirPathOutput, `${FILE_NAME}.${fileExt}`),
  );

  for (let file of dirFiles) {
    if (
      file.isFile() && file.name.slice(file.name.length - fileExt.length) === fileExt
    ) {
      const filePath = path.join(dirPathInput, file.name);
      const readStream = fs.createReadStream(filePath);

      await new Promise((resolve) => {
        readStream.on('data', (chunk) => bundleWriteStream.write(chunk));
        readStream.on('end', () => {
          bundleWriteStream.write('\n');
          resolve();
        });
      });
    }
  }
}
bundleFiles(
  path.join(__dirname, 'styles'),
  path.join(__dirname, 'project-dist'),
  'css',
);
