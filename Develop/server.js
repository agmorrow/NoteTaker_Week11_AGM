const express = require('express');

const { notes, uuid } = require('./db/db.json');

const PORT = process.env.PORT || 3001;

const app = express();
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(function(req, res, next) {
  req.notes = "Notes";
  console.log('im happening');
  next();
});

const checkBodyForText = (req, res, next) => {
  if (req.body.text.length === 0) {
    return res.status(404).json({ error: 'You must pass text to create a todo'});
  } else {
    next();
  }
};

app.get('/api/notes', (req, res) => {
  console.log(req.method, 'Notes are awesome!');
  res.json(notes);
});


app.post('/api/notes', checkBodyForText, (req, res) => {
  console.log(req.body);
  const newNote = {
      text: req.body.text,
      id: uuid(),
  };
  notes.push(newNote);
  res.json(newNote);
});

app.listen(PORT, () => console.log(`Server started on port: ${PORT}`));