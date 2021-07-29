var path = require("path")
var fs = require('fs-extra');

fs.move(
  path.resolve(__dirname, '../node_modules/restapify-dashboard/public'),
  path.resolve(__dirname, '../src/dashboard-public'),
  err => {
    if (err) return console.error(err);
  }
)