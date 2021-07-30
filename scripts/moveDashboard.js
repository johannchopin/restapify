var path = require("path")
var fs = require('fs-extra');

const destPath = path.resolve(__dirname, '../src/dashboard-public')

if (fs.existsSync(destPath)) fs.rmdirSync(destPath,  { recursive: true })

fs.move(
  path.resolve(__dirname, '../node_modules/restapify-dashboard/public'),
  destPath,
  err => {
    if (err) return console.error(err);
  }
)