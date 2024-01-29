find . -name 'node_modules' -type d -prune -exec rm -rf '{}' + 
rm -rf out 
rm -rf view/dist
rm services/library/*.m4a
rm services/library/*.png
rm services/database/db.json
# rm $(find services/scrapers/tmp/ | sed "s/README.md//")