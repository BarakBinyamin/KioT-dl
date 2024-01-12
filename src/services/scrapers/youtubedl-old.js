const youtubedl      = require('youtube-dl-exec')
const { v4: uuidv4 } = require('uuid')
const fs             = require('fs')

const BASE  = __dirname.replace(/\/[^/]*$/,"")
const TMP   = `${BASE}/tmp`

const getInfo = async (url, flags) => {
  return youtubedl(url, { dumpSingleJson: true, ...flags })
}
const fromInfo = async (infoFile, flags) => {
  return youtubedl.exec('', { f : 'bestaudio[ext=m4a]', loadInfoJson: infoFile, ...flags })
}

async function main (downloadPath, url) {
  try{
    console.log(url)
    const info          = await getInfo(url)
    const VideoInfoPath = `${TMP}${uuidv4()}`
    fs.writeFileSync(VideoInfoPath, JSON.stringify(info),{root:'.'})

    // and finally we can download the video
    const promise = fromInfo(VideoInfoPath, { output: `${downloadPath}.m4a`})
    const result = await logger(promise, `Fetching ${downloadPath}.m4a`, { estimate: 4000 })
    // await fromInfo(VideoInfoPath, { output: `${downloadPath}.m4a`})

    fs.rmSync(VideoInfoPath)
    return true
  }catch(error){
    const msg = new Error(`failed to download from youtube, may be a bad url ${url}...`)
    console.error(error)
    console.error(msg)
    return false
  }
}

module.exports.youtubedl = main

// FOR TESTING
// const { youtubedl } = require('./youtubedl')
// let response; youtubedl("cool", "https://www.youtube.com/watch?v=SebH8En9ZOY").then(res=>response=res)