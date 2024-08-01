const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const port = 3019;

const app = express();

app.use(express.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/ESPORT_MNGDB', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB SUCCESSFULLY');
});

// Player Schema
const UserSchema = new mongoose.Schema({
    Username: { type: String, required: true },
    Email: { type: String, required: true, unique: true },
    PlayerID: { type: Number, required: true, unique: true },
    Age: { type: Number, required: true },
    State: { type: String, required: true },
    Password: { type: String, required: true }
});

const Players = mongoose.model("Players", UserSchema);

// BGMI Schema
const BGMIData = new mongoose.Schema({
    BGMI_Team_name: { type: String, required: true },
    Player_ID: { type: Number, required: true, unique: true },
    BGMI_Team_ID: { type: Number, required: true, unique: true },
});

const BGMIteam = mongoose.model("BGMIteam", BGMIData);

// CSGO Schema
const CSGOData = new mongoose.Schema({
    CSGO_Team_name: { type: String, required: true },
    Player_ID: { type: Number, required: true, unique: true },
    CSGO_Team_ID: { type: Number, required: true, unique: true },
});

const CSGOteam = mongoose.model("CSGOteam", CSGOData);

// Results Schema
const RESData = new mongoose.Schema({
    Trnt_ID: { type: Number, required: true, unique: true },
    BG_wnr_ID: { type: Number, required: true },
    CS_wnr_ID: { type: Number, required: true },
});

const Results = mongoose.model("Results", RESData);

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'Esports')));

// Frontend connection
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Esports', 'form.html'));
});

// Player Registration Backend
app.post('/post', async (req, res) => {
    const { Username, Email, PlayerID, Age, State, Password } = req.body;
    const player = new Players({
        Username,
        Email,
        PlayerID,
        Age,
        State,
        Password
    });

    try {
        await player.save();
        console.log(player);
        res.send('<script>alert("Player registered successfully"); window.location.href = "/";</script>');
    } catch (error) {
        if (error.code === 11000) {
            console.log('Email or PlayerID already exists');
            res.send('<script>alert("Email or PlayerID already registered Cannot LOGIN"); window.location.href = "/";</script>');
        } else {
            console.error('Error creating player:', error);
            res.send('<script>alert("Error registering player"); window.location.href = "/";</script>');
        }
    }
});

// BGMI registration backend
app.get('/bgmi_post', (req, res) => {
    res.sendFile(path.join(__dirname, 'Esports', 'bgmi_regist.html'));
});

app.post('/bgmi_post', async (req, res) => {
    const { BGMI_Team_name, Player_ID, BGMI_Team_ID } = req.body;

    try {
        const player = await Players.findOne({ PlayerID: Player_ID });

        if (!player) {
            console.log('Player not registered');
            return res.send('<script>alert("Player not registered"); window.location.href = "/bgmi_regist.html";</script>');
        }

        const BGMI = new BGMIteam({
            BGMI_Team_name,
            Player_ID,
            BGMI_Team_ID,
        });

        await BGMI.save();
        console.log(BGMI);
        res.send('<script>alert("Team registered successfully"); window.location.href = "/index.html";</script>');
    } catch (error) {
        if (error.code === 11000) {
            console.log('Player_ID or BGMI_Team_ID already exists');
            res.send('<script>alert("Player_ID or BGMI_Team_ID already registered Cannot LOGIN"); window.location.href = "/bgmi_regist.html";</script>');
        } else {
            console.error('Error creating team:', error);
            res.send('<script>alert("Error registering team"); window.location.href = "/bgmi_regist.html";</script>');
        }
    }
});

// CSGO Registration Backend
app.get('/csgo_post', (req, res) => {
    res.sendFile(path.join(__dirname, 'Esports', 'csgo_regist.html'));
});

app.post('/csgo_post', async (req, res) => {
    const { CSGO_Team_name, Player_ID, CSGO_Team_ID } = req.body;

    try {
        const player = await Players.findOne({ PlayerID: Player_ID });

        if (!player) {
            console.log('Player not registered');
            return res.send('<script>alert("Player not registered"); window.location.href = "/csgo_regist.html";</script>');
        }

        const CSGO = new CSGOteam({
            CSGO_Team_name,
            Player_ID,
            CSGO_Team_ID,
        });

        await CSGO.save();
        console.log(CSGO);
        res.send('<script>alert("Team registered successfully"); window.location.href = "/index.html";</script>');
    } catch (error) {
        if (error.code === 11000) {
            console.log('Player_ID or CSGO_Team_ID already exists');
            res.send('<script>alert("Player_ID or CSGO_Team_ID already registered Cannot LOGIN"); window.location.href = "/csgo_regist.html";</script>');
        } else {
            console.error('Error creating team:', error);
            res.send('<script>alert("Error registering team"); window.location.href = "/csgo_regist.html";</script>');
        }
    }
});

// Results Registration Backend
app.get('/Create_results', (req, res) => {
    res.sendFile(path.join(__dirname, 'Esports', 'Create_results.html'));
});

app.post('/Create_results', async (req, res) => {
    const { Trnt_ID, bgmi_wnr, csgo_wnr } = req.body;
    console.log('Form Data:', req.body);  // Log form data

    try {
        const bgmiTeam = await BGMIteam.findOne({ BGMI_Team_ID: bgmi_wnr });
        const csgoTeam = await CSGOteam.findOne({ CSGO_Team_ID: csgo_wnr });

        if (!bgmiTeam || !csgoTeam) {
            console.log('One or more team IDs do not exist');
            return res.send('<script>alert("One or more team IDs do not exist"); window.location.href = "/Create_results.html";</script>');
        }

        const results = new Results({
            Trnt_ID,
            BG_wnr_ID: bgmi_wnr,
            CS_wnr_ID: csgo_wnr
        });

        await results.save();
        console.log(results);
        res.send('<script>alert("Results registered successfully"); window.location.href = "/index.html";</script>');
    } catch (error) {
        if (error.code === 11000) {
            console.log('Tournament ID or winner team ID already exists');
            res.send('<script>alert("Tournament ID or winner team ID already registered"); window.location.href = "/Create_results.html";</script>');
        } else {
            console.error('Error creating results:', error);
            res.send('<script>alert("Error registering results"); window.location.href = "/Create_results.html";</script>');
        }
    }o
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
