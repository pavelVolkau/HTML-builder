const fsPromis = require('fs/promises')
const path = require('path');
const { stdout } = process;

async function startApp() {
  const files = await fsPromis.readdir(path.join(__dirname, 'secret-folder'), {withFileTypes: true});

  files.forEach(async (file) => {
    if (file.isFile().toString() === 'true') {
      const filePath = path.join(__dirname, 'secret-folder', file.name)
      const fileInfo = path.parse(filePath)
      const fileStats = await fsPromis.stat(filePath)

      stdout.write(`${fileInfo.name} - ${fileInfo.ext.slice(1)} - ${fileStats.size / 1000}Kb\n`)
    };
  })
}
startApp();
