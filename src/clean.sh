find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + 
rm -rf out 
rm -rf view/dist
rm library/*.m4a
rm library/*.png