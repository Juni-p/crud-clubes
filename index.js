const fs = require('fs');
const express = require('express');
const exphbs = require('express-handlebars');

const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const PORT = 8080;

const teamsData = JSON.parse(fs.readFileSync('./data/equipos.json'));
const teamsLenght = teamsData.length;

app.get('/', (req, res) => {
  res.render('home', {
    layout: 'main',
    data: {
      teamsData,
      teamsLenght,
    },
  });
});

app.get('/team/:id/view', (req, res) => {
  const teamId = Number(req.params.id);
  res.render('team', {
    layout: 'main',
    data: {
      team: teamsData.find(({ id }) => id === teamId),
    },
  });
});

app.listen(PORT, () => {
  console.log(`Escuchando el puerto ${PORT}`);
});
