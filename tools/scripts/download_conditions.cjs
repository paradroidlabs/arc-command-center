const fs = require('fs');
const https = require('https');
const path = require('path');

const conditions = [
  {"name":"Beachcombing","url":"https://arcraiders.wiki/w/images/thumb/f/f2/Icon_Beachcombing.png/70px-Icon_Beachcombing.png.webp"},
  {"name":"Bird City","url":"https://arcraiders.wiki/w/images/thumb/e/e4/Icon_BirdCity.png/70px-Icon_BirdCity.png.webp"},
  {"name":"Lush Blooms","url":"https://arcraiders.wiki/w/images/thumb/5/54/Icon_Nature.png/65px-Icon_Nature.png.webp"},
  {"name":"Prospecting Probes","url":"https://arcraiders.wiki/w/images/thumb/2/21/Icon_ProspectingProbes.png/70px-Icon_ProspectingProbes.png.webp"},
  {"name":"Husk Graveyard","url":"https://arcraiders.wiki/w/images/thumb/a/a2/Icon_HuskGraveyard.png/70px-Icon_HuskGraveyard.png.webp"},
  {"name":"Uncovered Caches","url":"https://arcraiders.wiki/w/images/thumb/8/8d/Icon_UncoveredCaches.png/70px-Icon_UncoveredCaches.png.webp"},
  {"name":"Launch Tower Loot","url":"https://arcraiders.wiki/w/images/thumb/2/2a/Icon_LaunchTowerLoot.png/70px-Icon_LaunchTowerLoot.png.webp"},
  {"name":"Harvester","url":"https://arcraiders.wiki/w/images/thumb/5/56/Icon_ARC_Harvester.png/70px-Icon_ARC_Harvester.png.webp"},
  {"name":"Matriarch","url":"https://arcraiders.wiki/w/images/thumb/2/26/Icon_ARC_Matriarch.png/80px-Icon_ARC_Matriarch.png.webp"},
  {"name":"Night Raid","url":"https://arcraiders.wiki/w/images/thumb/b/b5/Icon_NightRaid.png/70px-Icon_NightRaid.png.webp"},
  {"name":"Electromagnetic Storm","url":"https://arcraiders.wiki/w/images/thumb/2/20/Icon_ElectromagneticStorm.png/80px-Icon_ElectromagneticStorm.png.webp"},
  {"name":"Hidden Bunker","url":"https://arcraiders.wiki/w/images/thumb/7/79/Icon_HiddenBunker.png/70px-Icon_HiddenBunker.png.webp"},
  {"name":"Locked Gate","url":"https://arcraiders.wiki/w/images/thumb/b/b0/Icon_LockedGate.png/70px-Icon_LockedGate.png.webp"},
  {"name":"Cold Snap","url":"https://arcraiders.wiki/w/images/thumb/6/60/Icon_ColdSnap.png/70px-Icon_ColdSnap.png.webp"},
  {"name":"Hurricane","url":"https://arcraiders.wiki/w/images/thumb/c/c0/Icon_Hurricane.png/70px-Icon_Hurricane.png.webp"},
  {"name":"Close Scrutiny","url":"https://arcraiders.wiki/w/images/thumb/8/83/Icon_CloseScrutiny.gif/70px-Icon_CloseScrutiny.gif.webp"}
];

const targetDir = path.join(__dirname, 'public', 'images', 'conditions');
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
        });
    });
}

async function run() {
    for (const cond of conditions) {
        // use the clean name for filename e.g. Night Raid -> night_raid
        const cleanName = cond.name.toLowerCase().replace(/ /g, '_');
        const ext = cond.url.includes('.gif') ? '.gif.webp' : '.png.webp';
        const dest = path.join(targetDir, `icon_${cleanName}${ext}`);
        console.log(`Downloading ${cond.name}...`);
        await downloadFile(cond.url, dest);
    }
    console.log("Done downloading all condition icons.");
}

run();
