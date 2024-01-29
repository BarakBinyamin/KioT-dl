const axios   = require('axios')
const cheerio = require('cheerio')
const jsdom   = require("jsdom")
const {JSDOM} = jsdom

/*
* Searches genius.com for song and album information...
* Sometimes it even includes youtube & spotify links!
* There is an npm project but I like mine better https://www.npmjs.com/package/genius-lyrics
*/

async function getGeniusData(geniusLink){
    if (!geniusLink.includes('genius.com') || geniusLink==="https://genius.com/"){return {"type": "info", "info":"couldn't find genius.com link", "url": geniusLink}}
    const result    = await axios.get(geniusLink, {'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"})

    // Find the script tag with all the data in it
    const html      = result.data
    let  $          = cheerio.load(html)
    let scriptTags  = $('script')
    let infoTags    = [...scriptTags].filter(tag=>{
        let info    = tag.children[0]?.data
        return info?.includes("JSON")
    })
    let tagData     = infoTags[0].children[0].data
    let tag         =`<script>${tagData}</script>`
    // Run the script tag and grab the gloabl variable __PRELOADED_STATE__
    const dom = new JSDOM(tag, { runScripts: "dangerously", resources: "usable" });
    const info =  await new Promise((resolve) => {
        dom.window.addEventListener("load", () => {
            resolve(dom.window.__PRELOADED_STATE__)
        })
    })

    // If __PRELOADED_STATE__.currentPage is not a song page, look for albumn data
    if (info?.currentPage === "songPage"){
        return     { "type" : "song", "info": info }
    }else{
        const metaTags   =  $('meta')
        const albumnTag  = [...metaTags].filter(item=>item?.attribs?.content?.includes('chartbeat'))[0]
        const albumnInfo = JSON.parse(albumnTag.attribs.content)
        if (albumnInfo['album_appearances']){
            return { "type" : "album", "info": albumnInfo }
        } else{
            return {"type": "info", "info":"probably an artist", "url":geniusLink}
        }
    }
}

async function getReleventSongData(geniusData){
    const songPage   = geniusData.songPage
    const trackData  = songPage.trackingData
    const songRefNum = String(songPage.song)
    const songData   = geniusData.entities.songs[songRefNum]
    const url        = songData.url
    let   info       = {}
    info.lyrics      = songPage.lyricsData.body.html.replace(/[<][^>]*[>]/g,'')?.replace(/&amp;/g, "&").replace(/"/g,'\\"') //.replace(/[^A-z0-9[]'",-_\/]/g,'')
    info.title       = [...trackData].filter(item=>item.key==="Title").map(item=>item.value)[0]?.replace(/&amp;/g, "&").replace(/"/g,'\\"') //.replace(/[^A-z0-9[]'",-_\/]/g,'')
    info.artist      = [...trackData].filter(item=>item.key==="Primary Artist").map(item=>item.value)[0]?.replace(/&amp;/g, "&").replace(/"/g,'\\"') //.replace(/[^A-z0-9[]'",-_\/]/g,'')
    info.album       = [...trackData].filter(item=>item.key==="Primary Album").map(item=>item.value)[0]?.replace(/&amp;/g, "&").replace(/"/g,'\\"') //.replace(/[^A-z0-9[]'",-_\/]/g,'')
    info.artwork     = songData.customSongArtImageUrl || songData.songArtImageUrl
    info.releaseDate = songData.releaseDateForDisplay
    info.youtubelink = songData.youtubeUrl
    if (!info.youtubelink){
        info.youtubelink = await getYoutubeLink(`${info.title} by ${info.artist}`)
    }
    info.spotifyUuid = songData.spotifyUuid
    return {"type": "song", "info":info, "url" : url}
}

async function getReleventAlbumnData(geniusData){
    const album    = geniusData.album
    const url      = album.url
    let   info     = {}
    info.trackdata = geniusData['album_appearances']
    info.tracks    = geniusData['album_appearances'].map(item=>item.song.full_title)     // To get full genius data grab item.song.url
    info.album     = album.name
    info.artwork   = album['cover_art_url']
    return {"type": "album", "info":info, "url" : url}
}

async function imFeelingLucky(whatever){
    const googleURL = `https://www.google.com/search?q=${encodeURI(whatever.replace(/ /g,"+"))}`
    // const result    = await axios.get(googleURL, {
    //     'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"
    // })
    let headers = new Headers({ 'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"})
    let result  = await (await fetch(googleURL, { method  : 'GET', headers : headers })).text()

    const html      = result.data
    const linkTag   = /<a href="\/url?[^>]*>/g
    const luckyTag  = html.match(linkTag)[1]
    const linkRegex = /http[^&]*/
    const link      = luckyTag.match(linkRegex)[0]
    return link
}

// Todo
// 1. get captcha id from captcha api
// 2. submit captcha id with hidden form to get access again
async function solveCpatcha(){
    const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    try{
    const info =  await new Promise((resolve) => {
        dom.window.addEventListener("load", async () => {
            await new Promise(res=>setTimeout(res,2000))
            const reCAPTCHA = dom.window.document.querySelector('iframe[title="reCAPTCHA"]')
            console.log(reCAPTCHA)
            await new Promise(resolve => reCAPTCHA.addEventListener('load', () => resolve()))
            //dom.window.document.querySelector('iframe[title="reCAPTCHA"]').contentWindow.document.getElementById("recaptcha-anchor").click()
            resolve()
        })
    })
        console.log(dom)
     }
    catch(error){
        console.log(error)
        throw new Error("this is unpurpose") 
    }
}

async function lookup(whatever){
    const googleURL = `https://www.google.com/search?q=${encodeURI(whatever.replace(/ /g,"+"))}`
    //let headers = new Headers({ 'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"})
    //let response  = (await fetch(googleURL, { method  : 'GET', headers : headers }))
    //let html      = await response.text()
   
    const result    = await axios.get(googleURL, {
        'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0"
    })
    const html      = result.data
    // if (response.status!=200){ return "failed"// }
    console.log(html)
    const linkTag   = /https:\/\/genius.com\/[^&"]*[&"]/g
    const luckyTags = html.match(linkTag)
    console.log(luckyTags)
    console.log(luckyTags.length)
    const linkRegex = /http[^&]*/
    let links       = []
    for (let index=0; index<luckyTags.length;index++ ){
        const link  = luckyTags[index].match(linkRegex)
        if (link){
            links.push(link)
        }
    }
    return links.slice(1,-1).map(item=>item[0])
}

async function getYoutubeLink(whatever){
    // const axios   = require('axios')
    // const whatever  = `genius hey soul sister`
    // console.log(whatever)
    const googleURL = `https://youtube.com/results/results?q=${encodeURI(whatever.replace(/ /g,"+"))}`
    const result    = await axios.get(googleURL, { 'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0" })
    const links     = result.data.match(/watch\?v=[a-zA-Z0-9]{11}/g)
    const link      = links[0].replace("watch?v=","")
    // console.log("Genius Link:", link)
    return link
}

async function getGeniusSongLink(whatever){
    // const axios   = require('axios')
    // const whatever  = `genius hey soul sister`
    // console.log(whatever)
    const googleURL = `https://www.google.com/search?q=${encodeURI("genius " + whatever.replace(/ /g,"+"))}`
    const result    = await axios.get(googleURL, { 'User-Agent' : "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0" })
    const links     = result.data.match(/https:\/\/genius.com\/[^&"]*(annotated|lyrics)[&"]/g)
    const link      = links[0].replace("&","")
    // console.log(links)
    // console.log("Genius Link:", link)
    return link
}

// Communicate status through websockets at higher level
async function main(somesong){
    const text         = `${somesong}`
    const geniusLink   = await getGeniusSongLink(text)
    const promise2     =  getGeniusData(geniusLink) 
    const geniusStuff  = await promise2
    if        (geniusStuff?.type === "song"){
        const  info    = await getReleventSongData(geniusStuff.info)
        return info
    } else if (geniusStuff?.type === "album") {
        const  info    = await getReleventAlbumnData(geniusStuff.info)
        return info
    } else{
        const  error   = geniusStuff
        return error
    }
}

module.exports = main

// FOR TESTING
// if you're in the scarapers directory 
// let {genius}   = require('./genius')
// let songname = "under the sea"
// let song; genius(songname).then(res=>song=res)
// console.log(song.info.youtubelink)
