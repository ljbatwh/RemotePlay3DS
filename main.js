const { NTRInitRemoteplay, NTRRemoteplayReadJPEG } = require("./ntr-remote-play");
const fs = require("fs");
function getKey() {
    return new Promise((resolve, reject) => {
        process.stdin.on('keypress', (c, k) => {
            resolve(c);
        });
    });
}
async function main() {

    NTRRemoteplayReadJPEG(({ frameID, isTop, jpeg }) => {
        console.log(`Read: ${isTop} frameId ${frameID}`);
        fs.writeFile(`${frameID}-${isTop ? "Top" : "Bottom"}.jpeg`, jpeg, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    })
    await NTRInitRemoteplay("192.168.137.145");

    await getKey();
}

main().then(() => console.log('main finish')).catch(error => { console.error(error) });