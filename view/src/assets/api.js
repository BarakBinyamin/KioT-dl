const HOST    = import.meta.env.VITE_DEV==="true" ? `http://localhost:3000` : ""
const WS      = import.meta.env.VITE_DEV==="true" ? `ws://localhost:3000` : ""
const GENIUS  = HOST +  "/genius"
const ADD     = HOST +  "/dl"
const QUEUE   = HOST +  "/queue"
const SEARCH  = HOST +  "/search"

class api {
    static async lookup(searchContent){
        const response = await fetch(GENIUS + "?" + new URLSearchParams({songname: searchContent}))
        const result   = await response.json()
        return result
    }
    static async getsong(searchContent, songId){
        const response = await fetch(ADD + "?" + new URLSearchParams({songname: searchContent, songId: songId}))
        const result    = await response.json()
        return result
    }
    static async getQueue(){
        const response = await fetch(QUEUE)
        const queue    = await response.json()
        return queue
    }
    static async searchLibrary(searchContent){
        const value = searchContent.length>0 ? searchContent : " "
        const response = await fetch(SEARCH + "?" + new URLSearchParams({songname: value}))
        const results  = await response.json()
        return results
    }
}

export default api;