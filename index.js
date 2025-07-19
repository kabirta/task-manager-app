const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

app.get('/', (req, res) => {
    fs.readdir(filesDir, (err, files) => {
        if (err) {
            return res.status(500).render('error', { message: 'Failed to load tasks.', status: 500 });
        }
        res.render("index", { files });
    });
});

app.post('/create-task', (req, res) => {
    const { title, details } = req.body;

    if (!title || !details) {
        return res.status(400).render('error', { message: 'Title and details are required.', status: 400 });
    }

    const filename = `${title.replace(/\s+/g, '').toLowerCase()}.txt`;
    const filePath = path.join(filesDir, filename);

    fs.writeFile(filePath, details, (err) => {
        if (err) {
            return res.status(500).render('error', { message: 'Failed to create task.', status: 500 });
        }
        res.redirect('/');
    });
});

app.get('/read/:filename', (req, res) => {
  fs.readFile(path.join(filesDir, req.params.filename), 'utf8', (e, d) => res.render('show', { title: req.params.filename, details: d }));
});

app.get('/edit/:filename', (req, res) => {
  fs.readFile(path.join(filesDir, req.params.filename), 'utf8', (e, d) =>
    res.render('edit', { filename: req.params.filename, details: d }));
});
app.post('/edit/:filename', (req, res) => {
  const oldPath = path.join(filesDir, req.params.filename);
  const { newTitle, details } = req.body;
  const newFilename = `${newTitle.trim().replace(/\s+/g, '-').toLowerCase()}.txt`;
  const newPath = path.join(filesDir, newFilename);

  fs.writeFile(newPath, details, (err) => {
    if (err) return res.status(500).send("Error saving file");
    if (newFilename !== req.params.filename) fs.unlink(oldPath, () => res.redirect('/'));
    else res.redirect('/');
  });
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
