const func = async () => {
    const port = await window.versions.ping()
    console.log(port) // which port is the local server running?
    window.location = `http://localhost:${port}`
}
  
func()