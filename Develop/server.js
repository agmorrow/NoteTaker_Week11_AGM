// Require dependencies for the application
const express = require('express');
const path = require("path");
const fs = require('fs');
const util = require('util');

const uniqid = require('uniqid');

const PORT = process.env.PORT || 3001;

const app = express();

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

app.get('*', (req, res) => 
res.sendFile(path.join(__dirname, '/public/index.html'))
);

const readFromFile = util.promisify(fs.readFile);


const writeToFile = (destination, content) =>
fs.writeFile(destination, JSON.stringify(content, null, 4), (err) => 
err ? console.log(err) : console.log(`\nData written to ${destication}`)
);

const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

app.post('/api/notes', (req,res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text} = req.body;

  if (req.body) {
    const newNote = {
      title,
      text, 
      note_id: uniqid(),
    };

    readAndAppend(newNote, './db/db.json');
    res.json(`Note added successfully`);
  } else {
    res.error('Error in adding note');
  }
});

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));