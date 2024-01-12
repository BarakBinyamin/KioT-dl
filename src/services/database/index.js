const fs   = require('fs')
const Fuse = require('fuse.js')

let JsonDB;
let Config;

const SAVEonPUSH = true
const READABLE   = true
const FILEPATH   = `${__dirname}/db.json`

class db {

    constructor(){
        this.searchEngine = null
        this.store        = null
        this.running      = null
    }

    async search(searchString){
        const config = {limit : 20}
        return this.searchEngine.search(searchString,config)
    }

    // only for songs that downloaded properly
    async add(song){
        this.store.push("/data",[song],false)
        this.searchEngine.add(song)
    }

    async remove(songId){
        // remove from store if its in there
        // await db.delete("/arraytest/myarray[0]");
        // remove from fuse if it in there
        // this.searchEngine.removeAt(1)
    }

    async  init(){
        const mod  = await import ('node-json-db') 
        Config     = mod.Config
        JsonDB     = mod.JsonDB
        this.store = new JsonDB(new Config(FILEPATH, SAVEonPUSH, READABLE, '/'))
        this.store.push("/data",[],false)  // create a new file if one doesn't exist     
        const data = await this.store.getData("/data")
        const config = {keys:["title","artist","album","lyrics"]}
        this.searchEngine = new Fuse(data,config)
    }
}

module.exports = db