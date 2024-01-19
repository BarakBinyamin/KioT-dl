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

// copy pasted
const executeFfmpeg = args => {
    let command = ffmpeg().output(' '); // pass "Invalid output" validation
    command._outputs[0].isFile = false; // disable adding "-y" argument
    command._outputs[0].target = "";    // bypass "Unable to find a suitable output format for ' '"
    command._global.get = () => {       // append custom arguments
        return typeof args === "string" ? args.split(' ') : args
    }
    return command
}

class youtubeDL { 

    constructor(io, queue, database){
        this.io       = io
        this.queue    = queue
        this.database = database
    }

    async report(songId, message, percent){
        let percentString = ""
        if (percent!=undefined){
            percentString = " " + String(Math.round(percent)) + " %"
        }
        const info =  `${message}${percentString}`
        this.io.emit(this.io.events.info,{
            songId  : songId,
            data    : info
        })
        this.queue.find(item=>item.songId==songId).progress = info
    }

    async reportError(songId, error){
        // Termperary fix for monitoring error
        this.io.emit(this.io.events.error,{
            songId  : songId,
            data    : error
        })
    }

    async wait(ff, songId, messageId){
        const classy = this
        await new Promise(res=>{
            ff.on('progress', (progress) => {
                classy.report(songId, messageId, progress?.percent)
            }).on('error', error=>{
                console.log(messageId,error)
                classy.reportError(songId,error)
                res()
            }).on('end', ()=>{
                res()
            })
        })
    }

    // TODO independent functions for each
    // Download song
    // Download Image 
    // Convert to m4a
    // Add Picture 
    // Add more tags
    // Report Success

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
                    }).on('error',error=>{
                        console.log(error)
                        classy.reportError(songId,error)
                        res()
                    })
            })

            // Download Image ffmpeg -i "https://images.genius.com/2a4e7fb7c56c4939051da9e59947263f.1000x1000x1.png" -vf scale=512:512 out.png
            const coverImage = ffmpeg().input(tags.artwork).outputOptions('-vf', 'scale=512:512').saveToFile(icon).on('error',(error)=>console.log(error))
            await classy.wait(coverImage, songId, MESSAGES.cover)
            // console.log(tags.artwork)

            // Convert to m4a & standardize bitrate which is useful for streaming
            const convert = ffmpeg().input(songUnformatted).outputOptions('-c:a','aac').outputOptions('-ab', '160k').saveToFile(formatted)
            await classy.wait(convert, songId, MESSAGES.convert)
            await new Promise(res=>{executeFfmpeg(`-y -i ${formatted} -i ${icon} -map 0 -map 1 -c copy -disposition:v:0 attached_pic ${songWithImage}`).on('error',(error)=>{
                console.log(error)
                classy.reportError(songId,error)
            }).on('end',()=>{
                res()
            }).run()})

            // Add meta tags
            const options = []
            const addMetadata = (type, metadata)=>{
                options.push('-metadata')
                const safeMetadata = `${type}=`+ String(metadata) //.replace(/[^a-zA-Z0-9 \n"]+/g,"")
                options.push(safeMetadata)
            }
            if (tags?.album!=undefined){addMetadata('album',tags?.album)}
            if (tags?.artist!=undefined){addMetadata('artist',tags?.artist)}
            if (tags?.title!=undefined){addMetadata('title',tags?.title)}
            if (tags?.lyrics!=undefined){addMetadata('lyrics',tags?.lyrics)}
            const addTags = ffmpeg(songWithImage).outputOptions('-codec copy').outputOptions(...options).saveToFile(songWithTags)
            await classy.wait(addTags, songId, MESSAGES.meta)
            
            // Success! Add to database
            this.database.add({
                title  : tags?.title,
                artist : tags?.artist,
                album  : tags?.album,
                lyrics : tags?.lyrics,
                songId : songId
            })

            //console.log(songWithTags)
            await classy.report(songId, MESSAGES.success)

        } catch(err){
            isError = err
            console.log(err)
            await classy.report(songId, err)
        }

        // Remove tmp files
        fs.rmSync(songUnformatted,  {force: true})
        fs.rmSync(formatted,        {force: true})
        fs.rmSync(songWithImage,    {force: true})
        
        return isError ? {status: false, error : isError} : {status: true}
    }
    
}

module.exports = youtubeDL