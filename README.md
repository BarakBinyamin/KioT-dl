# KioT-dl
<p align="center">
<img src="electron/icons/icon.png" style="width:100px;"/>
</p>

<p align="center">
    <!-- <span align="center"> Download</span><br> -->
    <a href="https://github.com/BarakBinyamin/KioT-dl/releases/download/beta-v0.1.0/KioT-dl-MacOS.Setup.dmg">Mac OS</a> | <span href="">Linux</span> | <a href="https://github.com/BarakBinyamin/KioT-dl/releases/download/beta-v0.1.0/KioT-dl-Windows.Setup.exe">Windows</a>
</p>

<p>
 KioT-dl ( pronounced <i>kai·ow·tee dee·el</i> ), or <b>K</b>eep <b>i</b>t <b>o</b>n <b>T</b>he <b>d</b>own <b>l</b>ow, is a cross platform desktop app for scraping fully metadata'ed music from Google, Genius.com, & Youtube<br>
</p>

This project is just getting started, feel free to try it out yourself, and offer feedback for new features! 

<img src="electron/icons/demo.gif"/>

Directory
- [Install](#install)
- [Features](#features)
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

## Features
- Easy song search & download tool
- Rest API to programatically control the app, hop on to websockets to get live updates on download progress
- Play songs from the app

## Directory
# Project Directory
| Name                                   | Purpose                                           | 
| :--                                    | :--                                               |
|[electron](electron)                    | Electron setup and config stuff                   |
|[services](services)                    | Services served through rest api, also hosts view |
|[view](view)                            | Where the view is developed                       |
|[app.html](app.html)                    | Starting point of the app                         |
|[app.js](app.js)                        | Starting point of the app                         |
|[clean.sh](clean.sh)                    | Script to remove all generated files              |
|[package.json](package.json)            | Top level depedency management file               |

## Bulding
You can build the app yourself too! It must be built on the platform it's intended (windows, mac, linux), vm's work for windows and linux
Build dependencies: [git](https://git-scm.com/downloads), [nodejs](https://nodejs.org/en), [vscode](https://code.visualstudio.com/download)

### Extra stuff for linux 
Currently build works, but ffmpeg-static/fluent is struggling during runtime, something to do with native package paths
```bash
# install nvm & node @ the version that will work with fluent-ffmpeg
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 18.19.0
source ~/.bashrc
```
```bash
# install dependencies
sudo apt install dpkg fakeroot
```

## Developing New Features
```bash
# /view - launch view with live updates
npm run dev
```
```bash
# /     - launch app with dev tools open, no live updates for the api though
npm run prep; npm run dev
```
Note : Some features like downloads are prevented during dev mode due to cross origin rules, (api at port 3000, view at port 5173)


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
- https://www.electronforge.io/guides/create-and-add-icons - add icons 
- https://www.electronforge.io/config/makers/dmg - how to add background image for mac dmg
- https://creatomate.com/blog/-how-to-use-ffmpeg-in-nodejs - static-ffmpeg
- https://stackoverflow.com/questions/59800915/-how-can-i-execute-a-custom-ffmpeg-string-command-with-fluent-ffmpeg - ffmpeg wrapper
- https://www.fusejs.io/api/options.html#threshold - fuse search engine 
- https://www.svgrepo.com/svg/528951/download-minimalistic?edit=true - jtml svg's

