const fsPromis = require('fs/promises');
const path = require('path');

async function copyFiles(dirPath, dirNewPath) {
  const dirFiles = await fsPromis.readdir(dirPath, {withFileTypes: true});

  dirFiles.forEach((file) => {
    const filePath = path.join(dirPath, file.name);
    const fileNewPath = path.join(dirNewPath, file.name);
    if (file.isFile().toString() === 'true') {
      fsPromis.copyFile(filePath, fileNewPath);
    } else {
      fsPromis.mkdir(fileNewPath, {recursive: true});
      copyFiles(filePath, fileNewPath);
    }
  });
}

async function copyDir(root, dirName) {
  const dirPath = path.join(root, dirName);
  const dirNewPath = path.join(root, `${dirName}-copy`);

  await fsPromis.rm(dirNewPath, {force: true, recursive: true});
  fsPromis.mkdir(dirNewPath, {recursive: true});

  copyFiles(dirPath, dirNewPath);
}
copyDir(__dirname, 'files');