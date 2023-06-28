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

function getTeams() {
  return JSON.parse(fs.readFileSync('./data/equipos.json'));
}

function saveTeamsData(teams) {
  fs.writeFileSync('./data/equipos.json', JSON.stringify(teams));
}

function createTeam(newTeam) {
  const teams = getTeams();
  teams.push(newTeam);
  saveTeamsData(teams);
}

function generateRandomId() {
  return Math.floor(Date.now() * Math.random());
}

app.get('/', (req, res) => {
  const teams = getTeams();
  const teamsLength = teams.length;
  res.render('home', {
    layout: 'main',
    data: {
      teams,
      teamsLength,
    },
  });
});

app.get('/form', (req, res) => {
  res.render('form', {
    layout: 'main',
  });
});

app.post('/form', upload.single('image'), (req, res) => {
  const team = {
    id: generateRandomId(),
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

app.get('/team/:id/view', (req, res) => {
  const teamId = Number(req.params.id);
  const teams = getTeams();

  const team = teams.find(({ id }) => id === teamId);

  res.render('team', {
    layout: 'main',
    data: {
      team,
    },
  });
});

app.get('/team/:id/edit', (req, res) => {
  const teamId = Number(req.params.id);
  const teams = getTeams();

  const team = teams.find(({ id }) => id === teamId);

  res.render('formEdit', {
    layout: 'main',
    data: {
      team,
    },
  });
});

app.post('/team/:id/edit', upload.single('image'), (req, res) => {
  const teamId = Number(req.params.id);
  const teams = getTeams();

  const team = teams.find(({ id }) => id === teamId);
  const teamIndex = teams.findIndex(({ id }) => id === teamId);

  const newTeamData = req.body;

  if (req.file) {
    const teamImage = `/images/${req.file.filename}`;
    team.crestUrl = teamImage;
  }

  teams[teamIndex] = {
    ...team, ...newTeamData,
  };

  saveTeamsData(teams);

  const updateTeam = teams.find(({ id }) => id === teamId);

  res.render('formEdit', {
    layout: 'main',
    data: {
      team: updateTeam,
      message: 'Equipo editado con exito!',
    },
  });
});

app.get('/team/:id/delete', (req, res) => {
  const teamId = Number(req.params.id);
  const teams = getTeams();

  const team = teams.find(({ id }) => id === teamId);

  res.render('formDelete', {
    layout: 'main',
    data: {
      team,
    },
  });
});

app.post('/team/:id/delete', (req, res) => {
  const teamId = Number(req.params.id);
  const teams = getTeams();

  const filteredTeams = teams.filter(({ id }) => id !== teamId);

  saveTeamsData(filteredTeams);

  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Escuchando el puerto ${PORT}`);
});
