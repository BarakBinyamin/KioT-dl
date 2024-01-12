const fs             = require('fs')
const ytdl           = require('ytdl-core')
const ffmpegStatic   = require('ffmpeg-static')
const ffmpeg         = require('fluent-ffmpeg'); ffmpeg.setFfmpegPath(ffmpegStatic)
const progress       = require('progress-stream')


const TMPDIR = __dirname +  "/tmp/"

const MESSAGES = {
   "dl"      : "Downloading...",  
   "cover"   : "Downloading Cover Art...", 
   "convert" : "Converting to m4a...", 
   "meta"    : "Adding Meta info...",
   "failed"  : "Failed",
   "success" : "Finished"
} 

const executeFfmpeg = args => {
    let command = ffmpeg().output(' '); // pass "Invalid output" validation
    command._outputs[0].isFile = false; // disable adding "-y" argument
    command._outputs[0].target = "";    // bypass "Unable to find a suitable output format for ' '"
    command._global.get = () => {       // append custom arguments
        return typeof args === "string" ? args.split(' ') : args;
    };
    return command;
}

class youtubeDL { 

    constructor(io,queue){
        this.io    = io
        this.queue = queue
    }

    async report(songId, message, percent){
        const info =  `${message} ${ percent ? String(Math.round(percent))+" %" : ""}`
        this.io.emit(this.io.events.info,{
            songId  : songId,
            data    : info
        })
        this.queue.find(item=>item.songId==songId).progress = info
    }

    async wait(ff, songId, messageId){
        const classy = this
        await new Promise(res=>{
            ff.on('progress', (progress) => {
                if (progress.percent) {
                    classy.report(songId, messageId, progress.percent)
                }
            }).on('error', error=>console.log(messageId,error)).on('end', ()=>{
                res()
            })
        })
    }

    async get(songId, link, tags, library){
        const classy          = this
        const tmpId           = songId
        //const icon            = tmpId  + '.png' 
        const icon            = library + `/${tmpId}.png`
        const songUnformatted = TMPDIR + tmpId
        const formatted       = songUnformatted + '-tmp1.m4a'
        const songWithImage   = songUnformatted + '-tmp2.m4a'
        //const songWithTags    = library + '/' + `${tags.title}-BY-${tags.artist}`.replace(/[^a-zA-Z0-9]+/g,"-") + '.m4a'
        const songWithTags    = library + '/' + songId + '.m4a'

        let isError = false
        
        try {
            // Download song
            let info       = await ytdl.getInfo(link)
            const metadata = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })

            await new Promise (async (res)=>{
                var reporter = progress({length: metadata.contentLength, time: 100 })
                reporter.on('progress', function(progress) {classy.report(songId, MESSAGES.dl, progress.percent)})
                ytdl.downloadFromInfo(info,{ quality: 'highestaudio' }).pipe(reporter).pipe(
                        fs.createWriteStream(songUnformatted)
                    ).on('finish',(err)=>{
                        res()
                    }).on('error',error=> console.log(error))
            })

            // Download Image ffmpeg -i "https://images.genius.com/2a4e7fb7c56c4939051da9e59947263f.1000x1000x1.png" -vf scale=512:512 out.png
            const coverImage = ffmpeg().input(tags.artwork).outputOptions('-vf', 'scale=512:512').saveToFile(icon).on('error',(error)=>console.log(error))
            await classy.wait(coverImage, songId, MESSAGES.cover)
            // console.log(tags.artwork)

            // Convert
            const convert = ffmpeg().input(songUnformatted).outputOptions('-ab', '160k').saveToFile(formatted)
            await classy.wait(convert, songId, MESSAGES.convert)
            await new Promise(res=>{executeFfmpeg(`-y -i ${formatted} -i ${icon} -map 0 -map 1 -c copy -disposition:v:0 attached_pic ${songWithTags}`).on('error',(error)=>console.log('line 91 yotube dl',error)).on('end',()=>{
                res()
            }).run()})

            // console.log("tags.album", tags.album)
            // console.log("tags.artist", tags.artist)
            // console.log("tags.title", tags.title)
            // console.log("tags.lyrics",tags.lyrics)
            // const album  = String(tags?.album).replace(/[^a-zA-Z0-9 \n"]+/g,"")
            // const artist = String(tags?.artist).replace(/[^a-zA-Z0-9 \n"]+/g,"")
            // const title  = String(tags?.title).replace(/[^a-zA-Z0-9 \n"]+/g,"")
            // const lyrics = String(tags?.lyrics).replace(/[^a-zA-Z0-9 \n"]+/g,"")

            // const options = ['-metadata', `album=${album}`,'-metadata', `artist=${artist}`, '-metadata', `title=${title}`, '-metadata', `lyrics=${lyrics}`]
            // const addTags = ffmpeg(songWithImage).outputOptions('-codec copy').outputOptions(options).saveToFile(songWithTags)
            // await classy.wait(addTags, songId, MESSAGES.meta)
            
            // Success!
            //console.log(songWithTags)
            classy.report(songId, MESSAGES.success)

        } catch(err){
            isError = err
            console.log(err)
            classy.report(songId)
        }

        // Remove tmp files
        fs.rmSync(songUnformatted,  {force: true})
        fs.rmSync(formatted,        {force: true})
        fs.rmSync(songWithImage,    {force: true})
        
        return isError ? {status: false, error : isError} : {status: true}
    }
    
}

module.exports = youtubeDL