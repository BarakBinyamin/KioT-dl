const DB = require('./index.js')
const db = new DB()

async function main(){
    await db.init()
    const songs = [{
        title  : "way cool",
        artist : "shakira",
        songId : "12345-123"
    },{
        title  : "way duel",
        artist : "fire and smoke",
        songId : "0p-123p123123-123132"
    }
    ]
    await db.add(songs[0]); await db.add(songs[1]);
    const result = await db.search("way d")
    console.log(result)
}

main()
