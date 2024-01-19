<template>
  <div class="app">
    <div class="main">
      <div class="view">
        <div class="search-container">
          <input @input="handleSearch" v-on:keyup.enter="add" v-model="searchbar" class="searchbar" type="text"/>
        </div>
        <div class="results-container">
          <div></div>
          <div class="results">
            <div class="song upnext" v-if="upnext">
              <img class="song-img" :src="upnext.artwork"/>
              <div class="song-text">
                <div>{{ upnext.title }}</div>
                <div>{{ upnext.artist }}</div>
              </div>
              <div class="song-dl-info">...</div>
            </div>
            <div class="song" v-for="song in songs">
              <img class="song-img" :src="song.artwork"/>
              <div class="song-text">
                <div>{{ song.title }}</div>
                <div>{{ song.artist }}</div>
              </div>
              <div v-if="!song?.progress?.includes('Finished')" class="song-dl-info">{{ song?.progress ? song?.progress : '...' }}</div>
              <div v-else class="dl"><a :href="`${host}/${song.songId}.m4a`" :download="acceptableName(song)" download><svg height="25px" width="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a></div>
            </div>
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
import api     from "./assets/api.js"

const HOST    = import.meta.env.VITE_DEV==="true" ? `http://localhost:3000` : ""
const WS      = import.meta.env.VITE_DEV==="true" ? `ws://localhost:3000` : ""

const events    = {                                      
                    "reload"    : "reload",
                    "info"      : "info",
                    "error"     : "error"
                  }

export default{
  components : {library},
  data(){
    return{
      searchbar : "",
      lastLetter: Date.now(),
      socketio  : "",
      upnext    : null,
      clear     : false,
      songs     : [],
      host      : HOST
    }
  },
  async beforeMount(){
    // Attach to all io events
    console.log("Attempting to attach to events over websockets...")
    this.socketio        = io(WS)
    this.socketio.events = events
    this.socketio.on(this.socketio.events.info, (info)=>{
      if (info?.songId){
         const song = this.songs.find(song=>(song.songId == info?.songId))
         if (song){
          song.progress=info?.data
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
      this.songs = await api.getQueue()
      console.log(this.songs)
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

      this.lastLetter = Date.now()

      setTimeout(async ()=>{
        if ( (Date.now() - this.lastLetter)>1000 &&  !this.clear){
          this.upnext =  {artist: "...", "title": "..."}
          const res = await api.getQueue(this.searchbar)
          if (res.type === "song" && !this.songs.find(song=>song.title==res.info.title)){
            this.upnext = res.info
            console.log(res.info)
          }else{
            this.upnext =  null
            console.log(res)
          }
          // console.log(this.searchbar)
        }else[
          this.clear = false
        ]
      },1000)

    },
    async add(){
      const songId = uuidv4()
      this.songs.unshift({songId:songId, title: this.searchbar})
      const res = await api.getsong(this.searchbar, songId)
      this.upnext    =  null
      this.clear     = true
      this.searchbar = ""
      if (res.type === "song"){
        console.log(res.songId)
        const song = this.songs.find(item=>item.songId==res.info.songId)
        const keys = Object.keys(res.info)
        for (let index=0;index<keys.length;index++){
          const key = keys[index]
          song[key]=res.info[key]
        }
      }else{
        console.log("not a song")
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
  height: 100%;
  width: 100%;
  overflow: hidden;
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
  height: 100%;
  grid-template-rows: 100px auto;
  border-radius: 10px;
  background-color: var(--second-bg-color);
  overflow: hidden;
}
.search-container{
  padding: 20px;
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
.results-container{
  margin:0;
  display: grid;
  width: 100%;
  height: 100px;
  grid-template-rows: 20px auto;
  overflow: scroll;
  border-top: 1px solid rgba(128, 128, 128, .5);
}
.results{
  display: grid;
  min-width: 300px;
  max-width: 50%;
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
.dl{
  display: grid;
  align-content: center;
  justify-content: right;
  padding-right: 10px;
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
</style>
