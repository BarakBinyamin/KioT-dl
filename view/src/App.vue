<template>
  <div class="app">
    <div class="main">
      <div class="view">
        <div class="search-container">
          <input id="searchbar" @input="handleSearch" v-on:keyup.enter="add" v-model="searchbar" class="searchbar" type="text" autocomplete="off"/>
        </div>
        <div class="content">
          <div class="tabs">
            <div class="tab" @click="tab=0" :class="{'selected' : tab==0}">Library</div>
            <div class="tab" @click="tab=1" :class="{'selected' : tab==1}">Downloads</div>
          </div>
          <div class="results-container">
            <library   v-show="tab==0" :songs="library"  ></library>
            <downloads v-show="tab==1" :songs="downloads" :socketio="socketio"></downloads>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client"
import { v4 as uuidv4 } from 'uuid'

import library from "./components/library.vue"
import downloads from "./components/downloads.vue"

import api     from "./assets/api.js"

const HOST    = import.meta.env.VITE_DEV==="true" ? `http://localhost:3000` : ""
const WS      = import.meta.env.VITE_DEV==="true" ? `ws://localhost:3000` : ""

const events    = {                                      
                    "reload"    : "reload",
                    "info"      : "info",
                    "error"     : "error"
                  }

export default{
  components : {library,downloads},
  data(){
    return{
      searchbar : "",
      lastLetter: Date.now(),
      socketio  : "",
      upnext    : null,
      clear     : false,
      downloads     : [],
      library   : [],
      host      : HOST,
      tab       : 0,
    }
  },
  async beforeMount(){
    // Attach to all io events
    console.log("Attempting to attach to events over websockets...")
    this.socketio        = io(WS)
    this.socketio.events = events
    this.socketio.on(this.socketio.events.info, async (info)=>{
      if (info?.songId){
         const song = this.downloads.find(song=>(song.songId == info?.songId))
         if (song){
          song.progress=info?.data
         }
         if (song?.progress == "Finished"){
          const results = await api.searchLibrary(this.searchbar)
          this.library = results
         }
      }
      console.log(info)
    })
    this.socketio.on("error", (msg) => {
      console.log(msg)
    })
    this.socketio.on("disconnect", (reason) => {
      this.$toast.open({
        message: 'Lost connection to server!',
        type: 'error',
        position: 'top-right',
        duration: 0
      })
      this.socketio.on("connect", (reason) => {
        this.$toast.open({
          message: 'Reconnecting connecting to server...',
          type: 'success',
          position: 'top-right',
          duration: 0
        })
        setTimeout(()=>window.location.reload(),1500)
      })
    })
  },
  async mounted(){
    //if (import.meta.env.VITE_DEV){
      console.log("Dev mode activated, hot module reload is all set")
      this.downloads   = await api.getQueue()
      this.library     = await api.searchLibrary(" ")
      console.log(this.downloads)
      document.getElementById("searchbar").focus()
    //}
  },
  created : function(){
    // Sizing
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    window.addEventListener('resize', () => {
      let vh = window.innerHeight * 0.01;
      let vw = window.innerWidth * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--vw', `${vh}px`);
    })
  },
  methods:{
    // Throttle searches
    async handleSearch(){
      const libraryTabChosen = this.tab === 0
      if (libraryTabChosen){
        const results = await api.searchLibrary(this.searchbar)
        this.library = results
      }else{
      // Causing too many requests, more likely to get blocked by google
      //   this.lastLetter = Date.now()
      //     setTimeout(async ()=>{
      //       if ( (Date.now() - this.lastLetter)>1000 &&  !this.clear){
      //         this.upnext =  {artist: "...", "title": "..."}
      //         const res = await api.lookup(this.searchbar)
      //         if (res.type === "song" && !this.downloads.find(song=>song.title==res.info.title)){
      //           this.upnext = res.info
      //           console.log("here",res.info)
      //         }else{
      //           this.upnext =  null
      //           console.log("here2",res)
      //         }
      //         // console.log(this.searchbar)
      //       }else[
      //         this.clear = false
      //       ]
      //     },1000)
      // }
      }
    },
    async add(){
      const songId = uuidv4()
      const title  = this.searchbar
      this.upnext    =  null
      this.clear     = true
      this.searchbar = ""
      this.downloads.unshift({songId:songId, title: title, progress: "downloading..."})
      const res = await api.getsong(title, songId)
      if (res.type === "song"){
        console.log(res.songId)
        const song = this.downloads.find(item=>item.songId==res.info.songId)
        const keys = Object.keys(res.info)
        for (let index=0;index<keys.length;index++){
          const key = keys[index]
          song[key]=res.info[key]
        }
      }else{
        const song = this.downloads.find(item=>item.songId==res.songId)
        song["progress"]= "Failed"
        console.log("Failed")
      }
    },
    acceptableName(song) {
      const name = `${ song.title}-by-${ song.artist}`
      return name.replace(/[^a-zA-Z0-9\n"]+/g,"-")
    }

  }
}
</script>

<style>
* {
  box-sizing: border-box;
}
:root{
  --main-font-family : "Helvetica Neue", helvetica, arial, "Hiragino Kaku Gothic ProN", Meiryo, "MS Gothic";
  --main-font-weight : normal;
  --main-font-size   : 15px;
  --main-bg-color    : #000000;
  --second-bg-color  : #121212;
  --third-bg-color   : #212121;
  --main-font-color  : #FFFFFF;
  --second-font-color: #7C7C7C;
}
/* Single page no scroll app */
/* https://stackoverflow.com/questions/5102820/scrolling-of-whole-page-instead-of-inner-div-only */
html, body,#app{ height: 100%; } 
html,body, #app{
  margin    : 0px;
  top       : 0px;
  background: var(--main-bg-color);
  color     : var(--main-font-color);
  font-family: var(--main-font-family);
  font-weight: var(--main-font-weight);
  font-size  : var(--main-font-size);
  overflow  : hidden;
  min-height: 100vh; /* Fallback for browsers that do not support Custom Properties */
  min-height: calc(var(--vh, 1vh) * 100);
  max-width : 100%;
  transition: background-color .3s ease-in-out;
  scroll-behavior: smooth;
}
.topbar{
  background: var(--second-bg-color);
}
.bottombar{
  background: var(--second-bg-color);
}
.app{
  display: grid;
  grid-template-rows: auto;
  width: 100%;
  height: 100%;
}
.main{
  display: grid;
  grid-template-columns: auto;
}
.sidebar{
  margin: 20px;
  width: calc(100% - 40px);
  overflow: scroll;
  background: var(--second-bg-color);
}
.view{
  display: grid;
  margin: 20px;
  width: calc(100% - 40px);
  height: calc(100% - 40px);
  grid-template-rows: 100px auto;
  border-radius: 10px;
  background-color: var(--second-bg-color);
}
.search-container{
  padding-top: 15px;
  padding-right: 15px;
  padding-left: 15px;
  display: grid;
  width: 100%;
}
.searchbar{
  padding: 10px;
  height: 50px;
  border-radius: 5px;
  border: none;
  font-size: 18px;
  background: var(--third-bg-color);
  color: var(--main-font-color);
  font-weight: lighter;
}
.searchbar:focus{
  text-decoration: none;
  outline: none;
}

.content{
  min-height: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.results-container{
  position: relative;
  margin:0;
  display: grid;
  margin: 0;
  width: 100%;
  min-height: 100%;
  height: 100%;
  grid-template-rows: 20px auto;
  overflow: scroll;
  border-top: 1px solid rgba(128, 128, 128, .5);
  justify-items: center;
}
.results{
  display: grid;
  min-width: 100%;
  height: min-content;
  max-height: 100%;
  /* background: blue; */
  justify-self: center;
  grid-template-rows: 60px;
  justify-items: center;
  /* for the scroll bar right */
  margin-left: 8px;
  padding-top: 5px;
  padding-bottom: 5px;
  grid-gap: 2px;
}
.song{
  width: 100%;
  padding: 5px;
  display: grid;
  grid-template-columns: 50px auto 100px;
  background-color: var(--third-bg-color);
  height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 10px;;
}
.song-img{
  width: 45px;
  height: 45px;
  border-radius: 10px;
  align-self : center;
  justify-self: center;
}
.song-text{
  display: grid;
  grid-template-rows: auto auto;
  align-content: center;
  padding: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: rgb(118, 112, 112);
}
.song-dl-info{
  width: 100%;
  display: grid;
  align-content: center;
}
.dl-container{
  display: grid;
  align-items: center;
  justify-content: center;
  justify-items: center;
  align-content: center;
  padding: 0px;
}
.dl{
  width: 100%;
}
.dl:hover{
  opacity: .8;
}
.upnext{
  filter : grayscale(20%);
}
::-webkit-scrollbar {
  -webkit-appearance: none;
  width: 7px;
  height: 4px;
}
::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: grey;
  box-shadow: 0 0 1px rgba(255, 255, 255, .5);
}
::-webkit-scrollbar-thumb:horizontal{
    height: 1px;
    width: 1px;
    border-radius: 4px;

}

.tabs{
  width: 100%;
  height: 50px;
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  justify-items: center;
  justify-content: center;
  grid-gap: 10px;
}
.tab{
  width     : 125px;
  padding   : 10px;
  background: var(--third-bg-color);
  border-radius: 10px;
  text-align: center;
  opacity   :.8;
}
.tab:hover{
  cursor : pointer;
  opacity: 1;
}
.selected{
  opacity: 1;
}
</style>
