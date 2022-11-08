const path = require('path');
const fs = require('fs');
const fsPromis = require('fs/promises');
const { Transform } = require('stream');

async function copyFiles(inputDir, outputDir){
  await fsPromis.rm(outputDir, { recursive: true, force: true });
  fsPromis.mkdir(outputDir, { recursive: true });

  const dirInfo = await fsPromis.readdir(inputDir, {withFileTypes: true});

  dirInfo.forEach((file) => {
    if (file.isFile().toString() === 'true') {
      fsPromis.copyFile(path.join(inputDir, file.name), path.join(outputDir, file.name));
    } else {
      copyFiles(path.join(inputDir, file.name), path.join(outputDir, file.name));
    }
  });
}

async function createBundle(inputDir, outputDir, fileExtension) {
  const BUNDLE_NAME = 'style';
  const dirInfo = await fsPromis.readdir(inputDir, {withFileTypes: true});
  const writeStream = fs.createWriteStream(path.join(outputDir, `${BUNDLE_NAME}.${fileExtension}`));

  for (let file of dirInfo) {
    if (
      file.isFile() && file.name.slice(file.name.length - fileExtension.length) === fileExtension)
    {
      const readStream = fs.createReadStream(path.join(inputDir, file.name));

      await new Promise((resolve) => {
        readStream.on('data', (chunk) => writeStream.write(chunk));
        readStream.on('end', () => {
          writeStream.write('\n');
          resolve();
        });
      });
    }
  }
}

async function changeTemplates(inputFile, outputDir, componentsDir) {
  const FILE_NAME = 'index.html';
  const readStream = fs.createReadStream(inputFile, 'utf8');
  const writeStream = fs.createWriteStream(path.join(outputDir, FILE_NAME));
  const componentsInfo = await fsPromis.readdir(componentsDir, {withFileTypes: true});
  const componentsData = {};

  for (let component of componentsInfo) {
    const componentExtension = component.name.slice(component.name.length - 5);

    if (component.isFile() && componentExtension === '.html') {
      componentsData[component.name] = await fsPromis.readFile(path.join(componentsDir, component.name), 'utf8');
    }
  }

  class teplatesTransformStream extends Transform {
    constructor(options) {
      options = Object.assign({}, options, {decodeStrings: false});
      super(options);
    }

    _transform(chunk, encoding, callback) {
      for (let component of componentsInfo) {
        const regExp = new RegExp(`{{${component.name.slice(0, component.name.length - 5)}}}`, 'g');

        chunk = chunk.replace(regExp, componentsData[component.name]);
      }
      this.push(chunk);
      callback();
    }
  }

  readStream.pipe(new teplatesTransformStream()).pipe(writeStream);
}

async function buildPage(inputDir, outputDir) {
  const ASSETS = 'assets';
  const ENTRY_FILE = 'template.html';
  const COMPONENTS = 'components';

  await fsPromis.rm(outputDir, { recursive: true, force: true});
  await fsPromis.mkdir(outputDir, { recursive: true});

  copyFiles(path.join(inputDir, ASSETS), path.join(outputDir, ASSETS));
  createBundle(path.join(inputDir, 'styles'), outputDir, 'css');
  changeTemplates(path.join(inputDir, ENTRY_FILE), outputDir, path.join(inputDir, COMPONENTS));
}

buildPage(__dirname, path.join(__dirname, 'project-dist'));