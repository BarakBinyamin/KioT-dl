const path = require('node:path')

module.exports = {
    packagerConfig: {
        icon: "electron/icons/mac/icon.icns",
        "name": "KioT-dl",
        extraResource: [
            path.join(process.cwd(), "electron", "icons", "mac", "icon.icns"),
            path.join(process.cwd(), "electron", "icons", "mac", "icon.png")
        ],
        ignore: [
          /library\/*.m4a/,
          /library\/*.png/
        ]
    },
    makers: [
    //   {
    //     name: '@electron-forge/maker-zip',
    //     "platforms": [
    //         "darwin"
    //     ]
    //   },
    //  {
    //   name: '@electron-forge/maker-deb',
    //   config: {
    //     options: {
    //       maintainer: 'Joe Bloggs',
    //       homepage: 'https://example.com'
    //     }
    //   },
      {
        name: '@electron-forge/maker-squirrel',
      },
      {
        name: '@electron-forge/maker-dmg',
        config: {
          icon: path.join(process.cwd(), "electron", "icons","mac", "icon.icns"),
          additionalDMGOptions :{
            "background-color" : "#36393F"
          },
          format: "ULFO"
        }
      }
    ]
};