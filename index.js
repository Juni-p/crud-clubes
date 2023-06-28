const fs = require('fs');
const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/images');
  },
  filename: (req, file, cb) => {
    const pathImage = file.originalname;
    cb(null, pathImage);
  },
});

const upload = multer({ storage });
const exphbs = require('express-handlebars');

const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

const PORT = 8080;

app.use(express.static(`${__dirname}/uploads`));

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

app.get('/form', (req, res) => {
  res.render('form', {
    layout: 'main',
  });
});

function createTeam(newTeam) {
  teamsData.push(newTeam);
  fs.writeFileSync('./data/equipos.json', JSON.stringify(teamsData));
}

function generateRamdomId() {
  return Math.floor(Date.now() * Math.random());
}

app.post('/form', upload.single('image'), (req, res) => {
  const team = {
    id: generateRamdomId(),
    name: req.body.name,
    area: {
      name: req.body.country,
    },
    tla: req.body.tla,
    crestUrl: `/images/${req.file.filename}`,
    venue: req.body.stadium,
    address: req.body.address,
    clubColors: req.body.clubColors,
    founded: req.body.founded,
  };
  createTeam(team);
  res.render('form', {
    layout: 'main',
    data: {
      message: 'Equipo agregado con exito!',
    },
  });
});

app.get('/team/:id/edit', (req, res) => {
  const teamId = Number(req.params.id);
  res.render('formEdit', {
    layout: 'main',
    data: {
      team: teamsData.find(({ id }) => id === teamId),
    },
  });
});

app.post('/team/:id/edit', upload.single('image'), (req, res) => {
  const teamId = Number(req.params.id);

  const team = teamsData.find(({ id }) => id === teamId);

  const teamIndex = teamsData.findIndex(({ id }) => id === teamId);

  const newTeamData = req.body;

  teamsData[teamIndex] = {
    ...team, ...newTeamData,
  };

  fs.writeFileSync('./data/equipos.json', JSON.stringify(teamsData));

  res.render('formEdit', {
    layout: 'main',
    data: {
      team: teamsData.find(({ id }) => id === teamId),
      message: 'Equipo editado con exito!',
    },
  });
});

app.get('/team/:id/delete', (req, res) => {
  const teamId = Number(req.params.id);
  res.render('formDelete', {
    layout: 'main',
    data: {
      team: teamsData.find(({ id }) => id === teamId),
    },
  });
});

app.post('/team/:id/delete', (req, res) => {
  const teamId = Number(req.params.id);
  const filterNewTeams = teamsData.filter(({ id }) => id !== teamId);
  fs.writeFileSync('./data/equipos.json', JSON.stringify(filterNewTeams));
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Escuchando el puerto ${PORT}`);
});
