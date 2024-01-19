<template>
    <div class="buffer">
        <!-- <audio id="player"></audio>
        <div id="controller" class="controller">
            <div class="stop" @click="stop()">
                <svg viewBox="0 0 28 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" fill="#FFFFFF" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>stop</title> <desc>Created with Sketch Beta.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage"> <g id="Icon-Set-Filled" sketch:type="MSLayerGroup" transform="translate(-520.000000, -571.000000)" fill="#FFFFFF"> <path d="M546,571 L522,571 C520.896,571 520,571.896 520,573 L520,597 C520,598.104 520.896,599 522,599 L546,599 C547.104,599 548,598.104 548,597 L548,573 C548,571.896 547.104,571 546,571" id="stop" sketch:type="MSShapeGroup"> </path> </g> </g> </g></svg>
            </div>
        </div> -->
        <table>
            <tr>
                <th>Title</th>
                <th>Album</th>
                <th>Download</th>
            </tr>
            <tr class="only" v-for="song in songs">
                <div class="play">
                    <svg fill="#FFFFFF" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#FFFFFF"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>play</title> <path d="M5.92 24.096q0 1.088 0.928 1.728 0.512 0.288 1.088 0.288 0.448 0 0.896-0.224l16.16-8.064q0.48-0.256 0.8-0.736t0.288-1.088-0.288-1.056-0.8-0.736l-16.16-8.064q-0.448-0.224-0.896-0.224-0.544 0-1.088 0.288-0.928 0.608-0.928 1.728v16.16z"></path> </g></svg>
                </div>
                <td class="title-container" @click="play(`${host}/${song.item.songId}.m4a`)">
                    <img class="song-img" :src="`${host}/${song.item.songId}.png`"/>
                    <div>
                        <div class="title">  {{song.item.title}} </div>
                        <div class="artist">  {{song.item.artist}} </div>
                    </div>
                </td>
                <td class="album" @click="play(`${host}/${song.item.songId}.m4a`)">{{song.item.album}}</td>
                <td>
                    <div class="dl-container">
                        <div class="dl"><a :href="`${host}/${song.item.songId}.m4a`" :download="acceptableName(song.item)" download><svg height="25px" width="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a></div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</template>

<script>
const HOST    = import.meta.env.VITE_DEV==="true" ? `http://localhost:3000` : ""

export default{
    props: ["songs"],
    data(){
        return{
            host: HOST
        }
    },
    methods: {
        acceptableName(song) {
            const name = `${ song.title}-by-${ song.artist}`
            return name.replace(/[^a-zA-Z0-9\n"]+/g,"-")
        },
        play(song){
            document.getElementById('player').src=song
            document.getElementById('player').play()
            document.getElementById('controller').style.display = "grid"
        },
        stop(){
            document.getElementById('player').pause()
            document.getElementById('controller').style.display = "none"
        }
    }
}
</script>

<style scoped>
.buffer{
    width: 100%;
    height: max-content;
    padding: 15px;
    padding-left: 40px;
    padding-bottom: 55px;
}
table {
  padding: 0;
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}
th:last-child{
    text-align: center;
}
tr.only:hover{
    opacity: .8;
    cursor: default;
}
th:first-child{
    padding-left: 10px;
}
th {
  position: sticky;
  top: 0px;
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: left;
  border: none;
  background: var(--second-bg-color);
  box-shadow: 10px 5px 5px white;
  color: var(--second-font-color);
  font-weight: lighter;
  z-index: 3;
}
th:last-child,td:last-child{
    width: 100px;
}





.only{
    position: relative;
}
.play{
    display: none;
}
tr.only:hover .play{
    position: absolute;
    display: block;
    height: 15px;
    width: 15px;
    top: 20px;
    left: -10px;
}

td{
    padding: 3px;
}

.title-container{
   display: grid;
   grid-template-columns: 55px auto;
   align-items: center;
}
.title{
    color : var(--main-font-color);
}
.artist{
    color : var(--second-font-color);
}
.album{
    color : var(--second-font-color);
}

.controller{
    display: none;
    position: fixed;
    top: 10px;
    right: 10px;
    width: 100px;
    height: 100px;
    background-color: var(--second-bg-color);
    border-radius: 10px;
    align-items: center;
    justify-content: center;
    transition: display ease-in-out 1s;
}
.stop{
    height:20px;
    width: 20px;
}
.stop:hover{
    opacity: .8;
}
</style>