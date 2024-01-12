const { v4: uuidv4 } = require('uuid')
const { youtubedl }  = require('./youtubedl')
const { program }    = require('commander')
const { genius }     = require('./genius')
const { dlimg }      = require('../multimedia/dlimg.js')
const { meta }       = require('../multimedia/meta')
const sound          = require('sound-play')
const fs             = require('fs')

const BASE  = __dirname.replace(/\/[^/]*$/,"")
const TMP   = `${BASE}/tmp` // top level path for youtubedl
const STORE = `${BASE}/songs`
let playing = false

// program
//   .requiredOption('-n, --name <char>', 'Song name to look up');
// program.parse()
// const options = program.opts()

//  command line stuff
async function main(options){
    let songname = options.name
    let song = await genius(songname)
    if (song.type == "info"){
        console.log(`${song.info}`)
    }
    else if (song.info.youtubelink){
       console.log(`Found ${song.info.title} by ${song.info.artist}, downloading...`)
       const id = uuidv4()
       const res  = await youtubedl(`${TMP}/${id}`, song.info.youtubelink)
       const res2 = await dlimg(song.info.artwork,`${TMP}/${id}`)
       song.info.artworkpath = `${TMP}/${id}.jpg`
       const res3 = await meta(`${TMP}/${id}.m4a`, song.info )
       fs.renameSync(`${TMP}/${id}.m4a`,`${STORE}/`+`${song.info.title} by ${song.info.artist}`.replace(/ /g,"-").replace(/[^0-9a-zA-Z]/g,"-")+'.m4a')
       fs.rmSync(`${TMP}/${id}.jpg`)

       if (!playing){
          playing=true
          sound.play(`${STORE}/`+`${song.info.title} by ${song.info.artist}`.replace(/ /g,"-").replace(/[^0-9a-zA-Z]/g,"-")+'.m4a')
       }
    }else{
        console.log(`No youtbe link...`)
    }
}

module.exports.dl  = main
module.exports.playing = playing