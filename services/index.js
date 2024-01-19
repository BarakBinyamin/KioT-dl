const express    = require('express')
const app        = express()
const http       = require('http')                                    // Http server that can be extended
const httpServer = http.createServer(app)                             // Serve API with http server
const { Server } = require("socket.io")                               // Crete nice websockets server
const io         = new Server(httpServer,{cors:                       // Extend http server with websockets
    {origins: ["http://localhost:5173"], methods: ["GET", "POST"]}})  // Allow dev server to access to websockets too
io.events        = {"info":"info"}                                    // Define events for ws
const genius     = require(`./scrapers/genius`)
const youtubeDL  = require(`./scrapers/youtubedl.js`)
const cors       = require('cors')
const { v4: uuidv4 } = require('uuid')
const fs             = require('fs')
const DB             = require('./database/index.js')

const queue = []

async function main(config) {
    const viewPath  = config.dist
    const port      = config.port
    const library   = config.library
    const database  = new DB(); await database.init()
    const youtubedl = new youtubeDL(io, queue, database)

    app.use(express.json()) 
    app.use(express.urlencoded({ extended: true }))
    app.use(cors()) 
    app.use(express.static(viewPath))
    app.get('/genius', async function (req, res) {
        const songname = req.query.songname 
        const result   = await genius(songname)
        res.send(result)
    })
    app.get('/dl', async function (req, res) {
        const songname = req.query.songname 
        const result   = await genius(songname)
        if (result.type=="song" && req.query.songId!=undefined){
            result.songId      = req.query.songId
            result.info.songId = result.songId 
            youtubedl.get(result.songId,result.info.youtubelink,result.info,library)
            queue.unshift(result.info)
            res.send(result)
        } else{
            res.send(result)
        }
    })
    app.get('/search', async function (req, res) {
        const songname = (req.query?.songname != undefined || req.query?.songname?.length<1) ? req.query?.songname : " "
        const results  = await database.search(songname)
        res.send(results)
    })
    app.get('/queue',(req,res)=>{
        res.send(queue)
    })
    app.get("/*.m4a",(req,res)=>{
        try {
            if (fs.lstatSync(library+req.path).isFile()){
                res.sendFile(library+req.path)
            }
        }catch{
            res.send("nope.")
        }
    })
    app.get("/*.png",(req,res)=>{
        try {
            if (fs.lstatSync(library+req.path).isFile()){
                res.sendFile(library+req.path)
            }
        }catch{
            res.send("nope.")
        }
    })
    app.get("/*",(req,res)=>{
        res.send("nope .")
    })
    // Websockets
    io.on('connection', (socket) => {   
        var address = socket?.handshake?.address
        // console.log(`Client connected ${address}...`)
        
        // handle client events
        //socket.on(io.events.start, (data)=>handleTestRequest(io,data))        // Start a test replace with REST CALL
        //socket.on(io.events.end,   (data)=>handleTestRequest(socket,data,database))  // End a test

        socket.conn.on("close", (reason) => {
            //console.log(`Client ${address} disconnected, Reason: ${reason}`)
        })
    })
    httpServer.listen(port)
}

module.exports = main