icon="mac/icon.png"
name="icon"

ffmpeg -i $icon -vf scale=256:256 ${name}.ico
ffmpeg -i $icon -vf scale=512x512 ${name}.png
# Mac OS only, makes icon.icns
# sips -z 16 16 some.png --out icon_16x16.png