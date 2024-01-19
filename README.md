# KioT-dl
<p align="center">
<img src="electron/icons/mac/icon.png" style="width:100px;"/>
</p>
<p align="center">
    <!-- <span align="center"> Download</span><br> -->
    <a href="https://github.com/BarakBinyamin/KioT-dl/releases/download/beta/KioT-dl-1.0.0-x64.dmg">Mac OS</a> | <span href="">Linux</span> | <span href="">Windows</span>
</p>

<p>
 KioT-dl ( pronounced <i>kai·ow·tee dee·el</i> ), or <b>K</b>eep <b>i</b>t <b>o</b>n <b>T</b>he <b>d</b>own <b>l</b>ow, is a cross platform desktop app for scraping fully metadata'ed music from Google, Genius.com, & Youtube<br>
</p>

This project is just getting started, feel free to try it out yourself, and offer feedback for new features! 

Directory
- [Install](#install)
- [Features](#)
- [Directory](#)
- [Building](#bulding)
- [In progress](#in-progress)
- [Motivation](#motivation)
- [References](#references)

## Install 
### Mac
1. Click <a href="https://github.com/BarakBinyamin/KioT-dl/releases/download/beta/KioT-dl-1.0.0-x64.dmg">Mac OS</a> to download a .dmg, once its downloaded you can double click it and it will open up the cool mac download an app window, from there move the app (just the app) into applications
2. Since I don't have code signing privaleges you'll have to manually open the app the first time, to do this, go to applications in finder, find KioT-dl, right click on it and select open, it will prompt you with a "you downloaded this from the internet, are you sure you want to run this?", you can say yes if you feel comfortable with that
### Windows and linux
Releases coming soon...

## Bulding
This app must be built on the platform it's intended (windows, mac, linux), vm's work for windows and linux
Build dependencies: [git](), [nodejs](), 

## In Progress
- [ ] Electron forge ignore extra files
- [ ] Fix status messages on mac release
- [ ] Reorganize youtubedl modules
- [ ] New view, seperate concerns

## Motivation
There were several cool challanges while making this project
| Challange | Solution|
|:--|:--|
|**Build for Native Desktop + Cross Platform** | Electron |
| **Easier Backend Communication** | Created http REST API as a work-around to electrons thick default api |
| **Develpment vs Production** | Env variables point the window towards vites dev port to enable hot module replacement (live updates to the view) | 
|**Persistant Database With Nice Fuzzy Search** | node-json-db + Fuse.js | 


## References
- https://www.electronjs.org/docs/latest/tutorial/code-signing - code signing
- https://thenounproject.com/browse/icons/term/coyote/ - source of icon
- https://makeappicon.com/ - make icons
- https://www.electronforge.io/config/makers/dmg - how to add background image for mac dmg
- https://creatomate.com/blog/-how-to-use-ffmpeg-in-nodejs - static-ffmpeg
- https://stackoverflow.com/questions/59800915/-how-can-i-execute-a-custom-ffmpeg-string-command-with-fluent-ffmpeg - ffmpeg wrapper
- https://www.fusejs.io/api/options.html#threshold - fuse search engine 
- https://www.svgrepo.com/svg/528951/download-minimalistic?edit=true - jtml svg's

