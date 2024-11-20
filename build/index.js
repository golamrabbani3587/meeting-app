const express = require('express');
const path = require('path');
const cors = require('cors')
const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, 'build')));


// hello

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, "build", '/index.html'), function(err) {
     if (err) {
      res.status(500).send(err)
     }
   })
})

console.log(`Server started at port 3000`)

app.listen(3000);
