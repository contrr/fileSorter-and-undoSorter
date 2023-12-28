const fs = require('fs-extra');
const path = require('path');

const targetBaseFolder = 'path:'; //You have to change the directory

// Funktion zum Rückgängig Machen (Dateien in den ursprünglichen Zustand versetzen)
async function undoSort() {
  try {
    const dateFolders = await fs.readdir(targetBaseFolder);

    for (const dateFolder of dateFolders) {
      const dateFolderPath = path.join(targetBaseFolder, dateFolder);

      const extensionFolders = await fs.readdir(dateFolderPath);

      for (const extensionFolder of extensionFolders) {
        const extensionFolderPath = path.join(dateFolderPath, extensionFolder);

        const filesInExtensionFolder = await fs.readdir(extensionFolderPath);

        for (const file of filesInExtensionFolder) {
          const sourceFile = path.join(extensionFolderPath, file);
          const targetFile = path.join(dateFolderPath, file);
          await fs.move(sourceFile, targetFile);
        }

        // Lösche den leeren Unterordner
        await fs.rmdir(extensionFolderPath);
      }

      // Verschiebe die Dateien aus dem Datumsordner zurück in den Hauptordner
      const filesInDateFolder = await fs.readdir(dateFolderPath);

      for (const file of filesInDateFolder) {
        const sourceFile = path.join(dateFolderPath, file);
        const targetFile = path.join(targetBaseFolder, file);
        await fs.move(sourceFile, targetFile);
      }

      // Lösche den leeren Datumsordner
      await fs.rmdir(dateFolderPath);
    }

    console.log('Rückgängig Machen abgeschlossen.');
  } catch (error) {
    console.error('Fehler beim Rückgängig Machen:', error);
  }
}

// Führe die Funktion zum Rückgängig Machen aus
undoSort();
