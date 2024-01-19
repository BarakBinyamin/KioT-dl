const path = require('node:path')

module.exports = {
    packagerConfig: {
        icon: "electron/icons/icon",
        "name": "KioT-dl",
        extraResource: [
            path.join(process.cwd(), "electron", "icons", "icon.icns"),
            path.join(process.cwd(), "electron", "icons", "icon.png"),
            path.join(process.cwd(), "electron", "icons", "icon.ico")
        ],
        ignore: [
          /library\/*.m4a/,
          /library\/*.png/
        ]
    },
    makers: [
    //  {
    //   name: '@electron-forge/maker-deb',
    //   "config": {
    //       options: {
    //         maintainer: 'Barak Binyamin',
    //         icon: path.join(process.cwd(), "electron", "icons", "icon.png")
    //       }
    //     }
    //   },
      {
        name: '@electron-forge/maker-squirrel',
        "config": {
          "name": "KioT-dl",
          "authors": "Barak Binyamin",
          "setupIcon":  path.join(process.cwd(), "electron", "icons", "icon.ico")
        }
      },
      {
        name: '@electron-forge/maker-dmg',
        config: {
          icon: path.join(process.cwd(), "electron", "icons", "icon.icns"),
          additionalDMGOptions :{
            "background-color" : "#36393F"
          },
          format: "ULFO"
        }
      }
    ]
};