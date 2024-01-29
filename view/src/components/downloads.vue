<template>
    <div>
        <table>
            <tr>
                <th>Title</th>
                <th>Album</th>
                <th>Status</th>
            </tr>
            <tr class="only" v-for="song in songs">
                <td class="title-container" >
                    <img v-if="song.progress!='Failed'" class="song-img" :src="`${song?.artwork}`"/>
                    <img v-else class="song-img" src="../assets/failedImage.png"/>
                    <div>
                        <div class="title">  {{song?.title}} </div>
                        <div class="artist">  {{song?.artist}} </div>
                    </div>
                </td>
                <td class="album">{{song?.album}}</td>
                <td>
                    <div v-if="song.progress=='Finished'" class="dl-container">
                        <div class="dl"><a :href="`${host}/${song.songId}.m4a`" :download="acceptableName(song)" download><svg height="25px" width="25px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3V16M12 16L16 11.625M12 16L8 11.625" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <path d="M15 21H9C6.17157 21 4.75736 21 3.87868 20.1213C3 19.2426 3 17.8284 3 15M21 15C21 17.8284 21 19.2426 20.1213 20.1213C19.8215 20.4211 19.4594 20.6186 19 20.7487" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg></a></div>
                    </div>
                    <div v-else class="dl-container">
                        <div class="dl">{{song?.progress}}</div>
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
        return {
            host: HOST
        }
    },
    methods: {
        acceptableName(song) {
            const name = `${ song.title}-by-${ song.artist}`
            return name.replace(/[^a-zA-Z0-9\n"]+/g,"-") + ".m4a"
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
    width: 200px;
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
</style>