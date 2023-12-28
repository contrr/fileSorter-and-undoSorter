const fs = require('fs-extra');
const path = require('path');

const sourceFolder = 'path:'; //You have to change the directory
const targetBaseFolder = 'path:'; //You have to change the directory

// Funktion zum Erstellen eines Zielordners basierend auf dem Herstellungsdatum
function createTargetFolder(creationDate) {
  const year = creationDate.getFullYear();
  const month = String(creationDate.getMonth() + 1).padStart(2, '0');
  const day = String(creationDate.getDate()).padStart(2, '0');
  return path.join(targetBaseFolder, `${year}-${month}-${day}`);
}

// Funktion zum Verschieben und Sortieren von Dateien in den Zielordner
async function moveAndSortFiles() {
  try {
    const files = await fs.readdir(sourceFolder);

    for (const file of files) {
      const filePath = path.join(sourceFolder, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        const creationDate = stat.birthtime;
        const targetFolder = createTargetFolder(creationDate);
        const targetPath = path.join(targetFolder, file);

        // Erstelle den Zielordner, falls noch nicht vorhanden
        await fs.ensureDir(targetFolder);

        // Verschiebe die Datei in den Zielordner
        await fs.move(filePath, targetPath);

        console.log(`Die Datei ${file} wurde verschoben nach ${targetPath}`);
      }
    }

    // Sortiere Dateien innerhalb der Datumsordner nach ihrer Dateiendung
    await sortFilesByExtension();

    console.log('Alle Dateien wurden verschoben und nach Dateiendung sortiert.');
  } catch (error) {
    console.error('Fehler beim Verschieben und Sortieren der Dateien:', error);
  }
}

// Funktion zum Sortieren von Dateien innerhalb der Datumsordner nach Dateiendung
async function sortFilesByExtension() {
  try {
    const dateFolders = await fs.readdir(targetBaseFolder);

    for (const dateFolder of dateFolders) {
      const dateFolderPath = path.join(targetBaseFolder, dateFolder);

      const filesInDateFolder = await fs.readdir(dateFolderPath);

      // Erstelle Unterordner für jede Dateiendung
      const extensionFolders = new Set(filesInDateFolder.map(file => path.extname(file).toLowerCase()));
      for (const extensionFolder of extensionFolders) {
        const extensionFolderPath = path.join(dateFolderPath, extensionFolder);

        // Erstelle den Ordner, falls noch nicht vorhanden
        await fs.ensureDir(extensionFolderPath);

        // Filtere Dateien nach der aktuellen Dateiendung
        const filteredFiles = filesInDateFolder.filter(file => path.extname(file).toLowerCase() === extensionFolder);

        // Sortiere Dateien nach ihrer Dateiendung und verschiebe sie in den Unterordner
        for (let i = 0; i < filteredFiles.length; i++) {
          const sourceFile = path.join(dateFolderPath, filteredFiles[i]);
          const targetFile = path.join(extensionFolderPath, filteredFiles[i]);
          await fs.move(sourceFile, targetFile);
        }
      }
    }
  } catch (error) {
    console.error('Fehler beim Sortieren der Dateien nach Dateiendung:', error);
  }
}

// Funktion zum wiederholten Ausführen des Skripts in einem Intervall
function runScript() {
  moveAndSortFiles();

  // Intervall in Millisekunden (z.B. alle 5 Minuten)
  const interval = 5 * 60 * 1000;

  setTimeout(runScript, interval);
}

// Starte das Skript
runScript();
