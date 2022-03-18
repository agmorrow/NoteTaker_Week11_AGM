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
app.use(express.urlencoded({
  extended: true
}));

app.use(express.static('public'));

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/notes.html'))
);

const readFromFile = util.promisify(fs.readFile);

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.log(err) : console.log(`\nData written to ${destination}`)
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
// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
  console.info(`${req.method} request received for notes`);
  readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
});

const checkBodyForText = (req, res, next) => {
  if (req.body.text.length === 0) {
    return res.status(401).json({
      error: 'You must pass text to create a note'
    });
  } else {
    next();
  }
};
// POST Route for submitting notes
app.post('/api/notes', checkBodyForText, (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const {
    title,
    text
  } = req.body;

  if (req.body) {
    const notes = {
      title,
      text,
      id: uniqid(),
    };

    readAndAppend(notes, './db/db.json');
    res.json(`Note added successfully`);
  } else {
    res.error('Error in adding note');
  }
});


app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () => console.log(`Server started on port: ${PORT} 🚀`));