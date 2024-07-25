import { readdir, stat, readFile, writeFile, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const userDirectory = homedir();
const bonelabSavesDir = join(userDirectory, 'AppData', 'LocalLow', 'Stress Level Zero', 'BONELAB', 'Saves');

const rgb = (r, g, b, msg) => `\x1b[38;2;${r};${g};${b}m${msg}\x1b[0m`;
const log = (...args) => console.log(`[${rgb(88, 101, 242, 'INFO')}]`, ...args);

log('Starting...')

function scanDirectory(dirPath) {
    return new Promise((resolve, reject) => {
        readdir(dirPath, (err, files) => {
            if (err) {
                reject(`Unable to scan directory: ${err}`);
            } else {
                resolve(files);
            }
        });
    });
}

function fetchFileStats(filePath) {
    return new Promise((resolve, reject) => {
        stat(filePath, (err, stats) => {
            if (err) {
                reject(`Unable to get stats of file: ${err}`);
            } else {
                resolve(stats);
            }
        });
    });
}

function readFileContent(filePath) {
    return new Promise((resolve, reject) => {
        readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Unable to read file: ${err}`);
            } else {
                resolve(data);
            }
        });
    });
}

scanDirectory(bonelabSavesDir)
    .then(async files => {
        let latestFile = null;
        let latestTime = 0;

        for (const file of files) {
            const filePath = join(bonelabSavesDir, file);
            const stats = await fetchFileStats(filePath);

            if (stats.mtimeMs > latestTime) {
                latestTime = stats.mtimeMs;
                latestFile = filePath;
            }
        }

        if (latestFile) {
            log(`Latest Save is "${latestFile}"`);

            let content;
            try {
                content = JSON.parse(await readFileContent(latestFile));
            } catch (error) {
                console.error(`Unable to parse Save file: ${error}`);
                content = null;
            }
            return { latestFile, content }
        } else {
            throw new Error('No files found in the directory.');
        }
    })
    .then(async (file) => {
        log('Attempting to Recover...');

        let saveData = file.content;

        saveData.player_settings.favorite_avatars = [
            "fa534c5a83ee4ec6bd641fec424c4142.Avatar.Strong",
            "fa534c5a83ee4ec6bd641fec424c4142.Avatar.Fast",
            "fa534c5a83ee4ec6bd641fec424c4142.Avatar.Heavy",
            "fa534c5a83ee4ec6bd641fec424c4142.Avatar.CharFurv4GB",
            "SLZ.BONELAB.Content.Avatar.Anime",
            "fa534c5a83ee4ec6bd641fec424c4142.Avatar.CharTallv4"
        ]

        try {
            writeFileSync(file.latestFile, JSON.stringify(saveData, null, 4))

            log('Successfully Patched Save!');
        } catch (error) {
            console.error(`Unable to write to save: ${error}`);
        }
    })