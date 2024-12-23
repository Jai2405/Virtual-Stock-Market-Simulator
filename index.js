import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import session from "express-session";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user:"postgres",//process.env.PG_USER,
  host:"localhost",// process.env.PG_HOST,
  database: "stockproject",//process.env.PG_DATABASE,
  password:"postgresjai",// process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

const apiKey1 = "QSMKW2T28FCP9LFO";
const apiKey2 = "X1DO3IR47E2LM9H7";
const apiKey3 = "0DNXSE9RSS7Q544X";
const apiKey4 = "RIDMG6522C7ACORZ";
const apiToken1 = "XivYeTRbrl8K9oKJa0TKZoGgptbrx1lvgxOI3yt6";
var url = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&interval=5min&apikey=' + apiKey4;

var open = '1. open';
var high = '2. high';
var low = '3. low';
var close = '4. close';
var volume = '5. volume';

var transactionNumber = 0;
var ownedStocks = {}
var user_id;

function getTodaysDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }


// Create a login/sign up page as your first page

app.get("/", (req, res) => {
 res.redirect("/home");
});

app.get("/home", async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index.ejs");
  } else {
    res.redirect("/login"); // Redirect unauthenticated users to the login page
  }
});


app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  console.log(email);
  console.log(password);
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      req.redirect("/login");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("success registering");
            res.redirect("/home");
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});


app.get("/login", (req, res) => {
  res.render("login.ejs"); // Render the login form
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
}));


// google login start
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);
// finish

app.get("/search", async (req, res) => {
    var company = req.query.symbol;
    var url1 = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + company + '&interval=1min&apikey=' + apiKey4;

    try {
        // Fetching current stock price
        //const result1 = await axios.get(url1);
        //var timeSeriesData = result1.data['Time Series (1min)'];
        //currentStockPrice = timeSeriesData[Object.keys(timeSeriesData)[0]][close];
        //console.log(currentStockPrice);
        var currentStockPrice = 279.30
        var highPrice = 294.56;
        var lowPrice = 254.00;
        var volume = 80000;


        // Fetching data for stock chart
        //var url2 = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=' + company + '&interval=1min&apikey=' + apiKey4;
        //const result2 = await axios.get(url2);
        //var timeSeriesData2 = result2.data;
        var timeSeriesData2 = {
            'Meta Data': {
              '1. Information': 'Daily Prices (open, high, low, close) and Volumes',
              '2. Symbol': 'TSLA',
              '3. Last Refreshed': '2024-11-01',
              '4. Output Size': 'Compact',
              '5. Time Zone': 'US/Eastern'
            },
            'Time Series (Daily)': {
              '2024-11-01': {
                '1. open': '252.0430',
                '2. high': '254.0000',
                '3. low': '246.6300',
                '4. close': '248.9800',
                '5. volume': '56027706'
              },
              '2024-10-31': {
                '1. open': '257.9900',
                '2. high': '259.7500',
                '3. low': '249.2500',
                '4. close': '249.8500',
                '5. volume': '66575292'
              },
              '2024-10-30': {
                '1. open': '258.0350',
                '2. high': '263.3500',
                '3. low': '255.8201',
                '4. close': '257.5500',
                '5. volume': '53993576'
              },
              '2024-10-29': {
                '1. open': '264.5100',
                '2. high': '264.9800',
                '3. low': '255.5100',
                '4. close': '259.5200',
                '5. volume': '80521751'
              },
              '2024-10-28': {
                '1. open': '270.0000',
                '2. high': '273.5360',
                '3. low': '262.2400',
                '4. close': '262.5100',
                '5. volume': '107653603'
              },
              '2024-10-25': {
                '1. open': '256.0100',
                '2. high': '269.4900',
                '3. low': '255.3200',
                '4. close': '269.1900',
                '5. volume': '161611931'
              },
              '2024-10-24': {
                '1. open': '244.6800',
                '2. high': '262.1199',
                '3. low': '242.6500',
                '4. close': '260.4800',
                '5. volume': '204491903'
              },
              '2024-10-23': {
                '1. open': '217.1250',
                '2. high': '218.7200',
                '3. low': '212.1100',
                '4. close': '213.6500',
                '5. volume': '80938892'
              },
              '2024-10-22': {
                '1. open': '217.3100',
                '2. high': '218.2200',
                '3. low': '215.2600',
                '4. close': '217.9700',
                '5. volume': '43268741'
              },
              '2024-10-21': {
                '1. open': '218.9000',
                '2. high': '220.4800',
                '3. low': '215.7260',
                '4. close': '218.8500',
                '5. volume': '47328988'
              },
              '2024-10-18': {
                '1. open': '220.7100',
                '2. high': '222.2800',
                '3. low': '219.2300',
                '4. close': '220.7000',
                '5. volume': '49611867'
              },
              '2024-10-17': {
                '1. open': '221.5900',
                '2. high': '222.0800',
                '3. low': '217.9000',
                '4. close': '220.8900',
                '5. volume': '50791784'
              },
              '2024-10-16': {
                '1. open': '221.4000',
                '2. high': '222.8199',
                '3. low': '218.9300',
                '4. close': '221.3300',
                '5. volume': '49632824'
              },
              '2024-10-15': {
                '1. open': '220.0100',
                '2. high': '224.2600',
                '3. low': '217.1200',
                '4. close': '219.5700',
                '5. volume': '62988787'
              },
              '2024-10-14': {
                '1. open': '220.1300',
                '2. high': '221.9100',
                '3. low': '213.7400',
                '4. close': '219.1600',
                '5. volume': '86291923'
              },
              '2024-10-11': {
                '1. open': '220.1300',
                '2. high': '223.3400',
                '3. low': '214.3800',
                '4. close': '217.8000',
                '5. volume': '142628874'
              },
              '2024-10-10': {
                '1. open': '241.8100',
                '2. high': '242.7899',
                '3. low': '232.3400',
                '4. close': '238.7700',
                '5. volume': '83087063'
              },
              '2024-10-09': {
                '1. open': '243.8200',
                '2. high': '247.4300',
                '3. low': '239.5100',
                '4. close': '241.0500',
                '5. volume': '66289529'
              },
              '2024-10-08': {
                '1. open': '243.5600',
                '2. high': '246.2100',
                '3. low': '240.5600',
                '4. close': '244.5000',
                '5. volume': '56303160'
              },
              '2024-10-07': {
                '1. open': '249.0000',
                '2. high': '249.8300',
                '3. low': '240.7000',
                '4. close': '240.8300',
                '5. volume': '68113270'
              },
              '2024-10-04': {
                '1. open': '246.6900',
                '2. high': '250.9600',
                '3. low': '244.5800',
                '4. close': '250.0800',
                '5. volume': '86726285'
              },
              '2024-10-03': {
                '1. open': '244.4800',
                '2. high': '249.7900',
                '3. low': '237.8100',
                '4. close': '240.6600',
                '5. volume': '80729240'
              },
              '2024-10-02': {
                '1. open': '247.5500',
                '2. high': '251.1585',
                '3. low': '241.5000',
                '4. close': '249.0200',
                '5. volume': '93983930'
              },
              '2024-10-01': {
                '1. open': '262.6700',
                '2. high': '263.9800',
                '3. low': '248.5300',
                '4. close': '258.0200',
                '5. volume': '87397613'
              },
              '2024-09-30': {
                '1. open': '259.0400',
                '2. high': '264.8600',
                '3. low': '255.7700',
                '4. close': '261.6300',
                '5. volume': '80873381'
              },
              '2024-09-27': {
                '1. open': '257.3750',
                '2. high': '260.6999',
                '3. low': '254.1200',
                '4. close': '260.4600',
                '5. volume': '70988067'
              },
              '2024-09-26': {
                '1. open': '260.6000',
                '2. high': '261.7500',
                '3. low': '251.5300',
                '4. close': '254.2200',
                '5. volume': '67142193'
              },
              '2024-09-25': {
                '1. open': '252.5400',
                '2. high': '257.0500',
                '3. low': '252.2800',
                '4. close': '257.0200',
                '5. volume': '65034318'
              },
              '2024-09-24': {
                '1. open': '254.0800',
                '2. high': '257.1900',
                '3. low': '249.0501',
                '4. close': '254.2700',
                '5. volume': '88490999'
              },
              '2024-09-23': {
                '1. open': '242.6100',
                '2. high': '250.0000',
                '3. low': '241.9200',
                '4. close': '250.0000',
                '5. volume': '86927194'
              },
              '2024-09-20': {
                '1. open': '241.5200',
                '2. high': '243.9900',
                '3. low': '235.9200',
                '4. close': '238.2500',
                '5. volume': '99879070'
              },
              '2024-09-19': {
                '1. open': '234.0000',
                '2. high': '244.2400',
                '3. low': '232.1300',
                '4. close': '243.9200',
                '5. volume': '102694576'
              },
              '2024-09-18': {
                '1. open': '230.0900',
                '2. high': '235.6800',
                '3. low': '226.8800',
                '4. close': '227.2000',
                '5. volume': '78010204'
              },
              '2024-09-17': {
                '1. open': '229.4500',
                '2. high': '234.5700',
                '3. low': '226.5533',
                '4. close': '227.8700',
                '5. volume': '66761636'
              },
              '2024-09-16': {
                '1. open': '229.3000',
                '2. high': '229.9600',
                '3. low': '223.5300',
                '4. close': '226.7800',
                '5. volume': '54322995'
              },
              '2024-09-13': {
                '1. open': '228.0000',
                '2. high': '232.6700',
                '3. low': '226.3200',
                '4. close': '230.2900',
                '5. volume': '59515114'
              },
              '2024-09-12': {
                '1. open': '224.6600',
                '2. high': '231.4500',
                '3. low': '223.8300',
                '4. close': '229.8100',
                '5. volume': '72020042'
              },
              '2024-09-11': {
                '1. open': '224.5500',
                '2. high': '228.4700',
                '3. low': '216.8003',
                '4. close': '228.1300',
                '5. volume': '83548633'
              },
              '2024-09-10': {
                '1. open': '220.0700',
                '2. high': '226.4000',
                '3. low': '218.6377',
                '4. close': '226.1700',
                '5. volume': '78891136'
              },
              '2024-09-09': {
                '1. open': '216.2000',
                '2. high': '219.8700',
                '3. low': '213.6700',
                '4. close': '216.2700',
                '5. volume': '67443518'
              },
              '2024-09-06': {
                '1. open': '232.6000',
                '2. high': '233.6000',
                '3. low': '210.5100',
                '4. close': '210.7300',
                '5. volume': '112177004'
              },
              '2024-09-05': {
                '1. open': '223.4900',
                '2. high': '235.0000',
                '3. low': '222.2500',
                '4. close': '230.1700',
                '5. volume': '119355013'
              },
              '2024-09-04': {
                '1. open': '210.5900',
                '2. high': '222.2200',
                '3. low': '210.5700',
                '4. close': '219.4100',
                '5. volume': '80217329'
              },
              '2024-09-03': {
                '1. open': '215.2600',
                '2. high': '219.9043',
                '3. low': '209.6400',
                '4. close': '210.6000',
                '5. volume': '76714222'
              },
              '2024-08-30': {
                '1. open': '208.6300',
                '2. high': '214.5701',
                '3. low': '207.0300',
                '4. close': '214.1100',
                '5. volume': '63370608'
              },
              '2024-08-29': {
                '1. open': '209.8000',
                '2. high': '214.8900',
                '3. low': '205.9700',
                '4. close': '206.2800',
                '5. volume': '62308818'
              },
              '2024-08-28': {
                '1. open': '209.7200',
                '2. high': '211.8400',
                '3. low': '202.5900',
                '4. close': '205.7500',
                '5. volume': '64116350'
              },
              '2024-08-27': {
                '1. open': '213.2500',
                '2. high': '215.6600',
                '3. low': '206.9400',
                '4. close': '209.2100',
                '5. volume': '62821390'
              },
              '2024-08-26': {
                '1. open': '218.7500',
                '2. high': '219.0900',
                '3. low': '211.0100',
                '4. close': '213.2100',
                '5. volume': '59301187'
              },
              '2024-08-23': {
                '1. open': '214.4550',
                '2. high': '221.4800',
                '3. low': '214.2100',
                '4. close': '220.3200',
                '5. volume': '81525207'
              },
              '2024-08-22': {
                '1. open': '223.8200',
                '2. high': '224.8000',
                '3. low': '210.3200',
                '4. close': '210.6600',
                '5. volume': '79514482'
              },
              '2024-08-21': {
                '1. open': '222.6700',
                '2. high': '224.6594',
                '3. low': '218.8600',
                '4. close': '223.2700',
                '5. volume': '70145964'
              },
              '2024-08-20': {
                '1. open': '224.8800',
                '2. high': '228.2200',
                '3. low': '219.5600',
                '4. close': '221.1000',
                '5. volume': '74001182'
              },
              '2024-08-19': {
                '1. open': '217.0700',
                '2. high': '222.9800',
                '3. low': '214.0900',
                '4. close': '222.7200',
                '5. volume': '76435222'
              },
              '2024-08-16': {
                '1. open': '211.1500',
                '2. high': '219.8000',
                '3. low': '210.8000',
                '4. close': '216.1200',
                '5. volume': '88765122'
              },
              '2024-08-15': {
                '1. open': '205.0200',
                '2. high': '215.8800',
                '3. low': '204.8200',
                '4. close': '214.1400',
                '5. volume': '89848530'
              },
              '2024-08-14': {
                '1. open': '207.3900',
                '2. high': '208.4400',
                '3. low': '198.7500',
                '4. close': '201.3800',
                '5. volume': '70250014'
              },
              '2024-08-13': {
                '1. open': '198.4700',
                '2. high': '208.4900',
                '3. low': '197.0600',
                '4. close': '207.8300',
                '5. volume': '76247387'
              },
              '2024-08-12': {
                '1. open': '199.0200',
                '2. high': '199.2600',
                '3. low': '194.6700',
                '4. close': '197.4900',
                '5. volume': '64044903'
              },
              '2024-08-09': {
                '1. open': '197.0500',
                '2. high': '200.8800',
                '3. low': '195.1100',
                '4. close': '200.0000',
                '5. volume': '58648274'
              },
              '2024-08-08': {
                '1. open': '195.7000',
                '2. high': '200.7000',
                '3. low': '192.0400',
                '4. close': '198.8400',
                '5. volume': '65033874'
              },
              '2024-08-07': {
                '1. open': '200.7700',
                '2. high': '203.4900',
                '3. low': '191.4800',
                '4. close': '191.7600',
                '5. volume': '71159778'
              },
              '2024-08-06': {
                '1. open': '200.7500',
                '2. high': '202.9000',
                '3. low': '192.6700',
                '4. close': '200.6400',
                '5. volume': '73783942'
              },
              '2024-08-05': {
                '1. open': '185.2200',
                '2. high': '203.8799',
                '3. low': '182.0000',
                '4. close': '198.8800',
                '5. volume': '100308836'
              },
              '2024-08-02': {
                '1. open': '214.8800',
                '2. high': '216.1300',
                '3. low': '205.7800',
                '4. close': '207.6700',
                '5. volume': '82880120'
              },
              '2024-08-01': {
                '1. open': '227.6900',
                '2. high': '231.8670',
                '3. low': '214.3328',
                '4. close': '216.8600',
                '5. volume': '83861898'
              },
              '2024-07-31': {
                '1. open': '227.9000',
                '2. high': '234.6800',
                '3. low': '226.7875',
                '4. close': '232.0700',
                '5. volume': '67497011'
              },
              '2024-07-30': {
                '1. open': '232.2500',
                '2. high': '232.4100',
                '3. low': '220.0000',
                '4. close': '222.6200',
                '5. volume': '100560334'
              },
              '2024-07-29': {
                '1. open': '224.9000',
                '2. high': '234.2700',
                '3. low': '224.7000',
                '4. close': '232.1000',
                '5. volume': '129201789'
              },
              '2024-07-26': {
                '1. open': '221.1900',
                '2. high': '222.2799',
                '3. low': '215.3300',
                '4. close': '219.8000',
                '5. volume': '94604145'
              },
              '2024-07-25': {
                '1. open': '216.8000',
                '2. high': '226.0000',
                '3. low': '216.2310',
                '4. close': '220.2500',
                '5. volume': '100636466'
              },
              '2024-07-24': {
                '1. open': '225.4200',
                '2. high': '225.9900',
                '3. low': '214.7100',
                '4. close': '215.9900',
                '5. volume': '167942939'
              },
              '2024-07-23': {
                '1. open': '253.6000',
                '2. high': '255.7594',
                '3. low': '245.6300',
                '4. close': '246.3800',
                '5. volume': '111928192'
              },
              '2024-07-22': {
                '1. open': '244.2100',
                '2. high': '253.2100',
                '3. low': '243.7500',
                '4. close': '251.5100',
                '5. volume': '101225430'
              },
              '2024-07-19': {
                '1. open': '247.7900',
                '2. high': '249.4400',
                '3. low': '236.8300',
                '4. close': '239.2000',
                '5. volume': '87403903'
              },
              '2024-07-18': {
                '1. open': '251.0900',
                '2. high': '257.1400',
                '3. low': '247.2000',
                '4. close': '249.2300',
                '5. volume': '110869037'
              },
              '2024-07-17': {
                '1. open': '252.7300',
                '2. high': '258.4700',
                '3. low': '246.1820',
                '4. close': '248.5000',
                '5. volume': '115584810'
              },
              '2024-07-16': {
                '1. open': '255.3100',
                '2. high': '258.6200',
                '3. low': '245.8001',
                '4. close': '256.5600',
                '5. volume': '126332470'
              },
              '2024-07-15': {
                '1. open': '255.9700',
                '2. high': '265.6000',
                '3. low': '251.7300',
                '4. close': '252.6400',
                '5. volume': '146912920'
              },
              '2024-07-12': {
                '1. open': '235.8000',
                '2. high': '251.8400',
                '3. low': '233.0912',
                '4. close': '248.2300',
                '5. volume': '155955773'
              },
              '2024-07-11': {
                '1. open': '263.3000',
                '2. high': '271.0000',
                '3. low': '239.6500',
                '4. close': '241.0300',
                '5. volume': '221707273'
              },
              '2024-07-10': {
                '1. open': '262.8000',
                '2. high': '267.5900',
                '3. low': '257.8600',
                '4. close': '263.2600',
                '5. volume': '128519430'
              },
              '2024-07-09': {
                '1. open': '251.0000',
                '2. high': '265.6100',
                '3. low': '250.3000',
                '4. close': '262.3300',
                '5. volume': '160742516'
              },
              '2024-07-08': {
                '1. open': '247.7100',
                '2. high': '259.4390',
                '3. low': '244.5700',
                '4. close': '252.9400',
                '5. volume': '157219580'
              },
              '2024-07-05': {
                '1. open': '249.8100',
                '2. high': '252.3700',
                '3. low': '242.4601',
                '4. close': '251.5200',
                '5. volume': '154501152'
              },
              '2024-07-03': {
                '1. open': '234.5600',
                '2. high': '248.3500',
                '3. low': '234.2500',
                '4. close': '246.3900',
                '5. volume': '166561471'
              },
              '2024-07-02': {
                '1. open': '218.8900',
                '2. high': '231.3000',
                '3. low': '218.0600',
                '4. close': '231.2600',
                '5. volume': '205047920'
              },
              '2024-07-01': {
                '1. open': '201.0200',
                '2. high': '213.2300',
                '3. low': '200.8500',
                '4. close': '209.8600',
                '5. volume': '135691395'
              },
              '2024-06-28': {
                '1. open': '199.5500',
                '2. high': '203.2000',
                '3. low': '195.2600',
                '4. close': '197.8800',
                '5. volume': '95438068'
              },
              '2024-06-27': {
                '1. open': '195.1700',
                '2. high': '198.7200',
                '3. low': '194.0500',
                '4. close': '197.4200',
                '5. volume': '72746521'
              },
              '2024-06-26': {
                '1. open': '186.5400',
                '2. high': '197.7550',
                '3. low': '186.3600',
                '4. close': '196.3700',
                '5. volume': '95737066'
              },
              '2024-06-25': {
                '1. open': '184.4000',
                '2. high': '187.9700',
                '3. low': '182.0100',
                '4. close': '187.3500',
                '5. volume': '63678265'
              },
              '2024-06-24': {
                '1. open': '184.9700',
                '2. high': '188.8000',
                '3. low': '182.5500',
                '4. close': '182.5800',
                '5. volume': '61992070'
              },
              '2024-06-21': {
                '1. open': '182.3000',
                '2. high': '183.9500',
                '3. low': '180.6900',
                '4. close': '183.0100',
                '5. volume': '63029482'
              },
              '2024-06-20': {
                '1. open': '184.6800',
                '2. high': '185.2100',
                '3. low': '179.6600',
                '4. close': '181.5700',
                '5. volume': '55893139'
              },
              '2024-06-18': {
                '1. open': '186.5600',
                '2. high': '187.2000',
                '3. low': '182.3700',
                '4. close': '184.8600',
                '5. volume': '68982265'
              },
              '2024-06-17': {
                '1. open': '177.9200',
                '2. high': '188.8100',
                '3. low': '177.0000',
                '4. close': '187.4400',
                '5. volume': '109786083'
              },
              '2024-06-14': {
                '1. open': '185.8000',
                '2. high': '186.0000',
                '3. low': '176.9200',
                '4. close': '178.0100',
                '5. volume': '82038194'
              },
              '2024-06-13': {
                '1. open': '188.3900',
                '2. high': '191.0800',
                '3. low': '181.2300',
                '4. close': '182.4700',
                '5. volume': '118984122'
              },
              '2024-06-12': {
                '1. open': '171.1200',
                '2. high': '180.5500',
                '3. low': '169.8000',
                '4. close': '177.2900',
                '5. volume': '90389446'
              }
            }
          }
        timeSeriesData2 = timeSeriesData2['Time Series (Daily)'];
        var dates = Object.keys(timeSeriesData2);
        var closePrices = dates.map(date => parseFloat(timeSeriesData2[date]["4. close"]));


        //fetching news for stock
        //var url3 = "https://api.marketaux.com/v1/news/all?symbols=" + company + "&filter_entities=true&language=en&api_token=" + apiToken1;
        //const result3 = await axios.get(url3);
        const result3 = {
            meta: { found: 81182, returned: 3, limit: 3, page: 1 },
            data: [
              {
                uuid: '5a5c3db9-d09b-46d6-b4fe-82458410afd6',
                title: "Here's How Billionaire Jeff Yass Is Investing In Crypto (Hint: It's Not Bitcoin)",
                description: 'Jeff Yass of hedge fund Susquehanna International Group owns two interesting crypto stocks.',
                keywords: 'Jeff Yass, digital currencies, MicroStrategy, digital assets, Coinbase, Cryptocurrency',
                snippet: "Cryptocurrency is an emerging asset class that's been rising in popularity during the past several years. I see a couple of valid reasons to consider investing ...",
                url: 'https://finance.yahoo.com/news/heres-billionaire-jeff-yass-investing-090000833.html',
                image_url: 'https://s.yimg.com/ny/api/res/1.2/T_OiAEyji2SyupWh0QNgMg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD04MDA-/https://media.zenfs.com/en/motleyfool.com/f8cb76fddfecc26b638073c471a592dd',
                language: 'en',
                published_at: '2024-11-02T09:00:00.000000Z',
                source: 'finance.yahoo.com',
                relevance_score: null,
                entities: [Array],
                similar: []
              },
              {
                uuid: 'b258783d-24bb-4367-b883-ef7c8784615e',
                title: 'Global space firms join rush for India’s satcom licence',
                description: "Multiple global players, including Starlink and Project Kuiper, aim to enter India's satellite communication market, seeking regulatory reforms.",
                keywords: '',
                snippet: 'At least half a dozen players, in addition to Elon Musk-backed Starlink and Jeff Bezos’ Project Kuiper, are looking to enter the Indian satellite communicatio...',
                url: 'https://www.thehindubusinessline.com/companies/global-space-firms-join-rush-for-indias-satcom-licence/article68822232.ece',
                image_url: 'https://bl-i.thgim.com/public/incoming/zbxn67/article68790709.ece/alternates/LANDSCAPE_1200/IMG_MOBILE_TOWER_2_1_2QD1TPKO.jpg',
                language: 'en',
                published_at: '2024-11-02T08:09:42.000000Z',
                source: 'thehindubusinessline.com',
                relevance_score: null,
                entities: [Array],
                similar: []
              },
              {
                uuid: 'f9f59fba-7e47-4b0c-ad72-22971df05d7d',
                title: 'India’s Satcom landscape expands as global firms seek market entry',
                description: "Multiple global players, including Starlink and Project Kuiper, aim to enter India's satellite communication market, seeking regulatory reforms.",
                keywords: 'India satellite communication market, Global companies satcom entry, Telecom Regulatory Authority of India, Spectrum charges for satellite services, Satellite broadband connectivity India, Rivada Networks, Viasat, Globalstar Emergency SOS service, Telecom competition in India, Satellite IoT connectivity',
                snippet: 'At least half a dozen players, in addition to Elon Musk-backed Starlink and Jeff Bezos’ Project Kuiper, are looking to enter the Indian satellite communicatio...',
                url: 'https://www.thehindubusinessline.com/info-tech/global-space-firms-join-rush-for-indias-satcom-licence/article68822232.ece',
                image_url: 'https://bl-i.thgim.com/public/incoming/zbxn67/article68790709.ece/alternates/LANDSCAPE_1200/IMG_MOBILE_TOWER_2_1_2QD1TPKO.jpg',
                language: 'en',
                published_at: '2024-11-02T08:09:42.000000Z',
                source: 'thehindubusinessline.com',
                relevance_score: null,
                entities: [Array],
                similar: []
              }
            ]
          }
        //console.log(result3.data);
        var news = [];
        result3.data.forEach(article => {
            news.push({
              title: article.title,
              url: article.url,
            });
          });
        

        res.render("stock.ejs", {
            name: company, 
            currentStockPrice: currentStockPrice, 
            highPrice: highPrice,
            lowPrice: lowPrice,
            volume: volume,
            dates: dates,
            closePrices: closePrices,
            news: news
        });

      } catch (error) {
        console.log(error);
        res.status(500);
      }   
});


app.post("/buy", async (req, res) => {    
    const stockName = req.body.name;       // Stock name
    const stockPrice = parseFloat(req.body.price); // Stock price per share
    const quantity = parseInt(req.body.buyQuantity, 10); // Quantity
    const date = getTodaysDate();
    await db.query("INSERT INTO portfolios (user_id, stock, quantity, buy_price, date) VALUES ($1, $2, $3, $4, $5);", [user_id, stockName, quantity ,stockPrice, date]);
    res.render("portfolio.ejs", {ownedStocks : ownedStocks});

});

// app.post("/buy", async (req, res) => {    
//   const stockName = req.body.name;       // Stock name
//   const stockPrice = parseFloat(req.body.price); // Stock price per share
//   const quantity = parseInt(req.body.buyQuantity, 10); // Quantity
//   const date = getTodaysDate();
//   await db.query("INSERT INTO portfolios (user_id, stock, quantity, buy_price, date) VALUES ($1, $2, $3, $4);", [user_id, stockName, quantity ,stockPrice]);
//   res.render("portfolio.ejs", {ownedStocks : ownedStocks});
// });

// app.post("/sell", async (req, res) => {    
//   const stockName = req.body.name;       // Stock name
//   const stockPrice = parseFloat(req.body.price); // Stock price per share
//   const quantity = parseInt(req.body.buyQuantity, 10); // Quantity
//   const date = getTodaysDate();

//   var ownedStocks = []
//   const result3 = db.query("SELECT stocks FROM portfolios WHERE user_id = $1;", [user_id]);
//   result3.rows.forEach(stock => {
//     ownedStocks.push(stock.stock);
//   });

//   try {
//     const result = await db.query("SELECT * FROM portfolios WHERE user_id = $1 AND stock = $2 AND buy_price = $3", [user_id, stockName, stockPrice]);
//     if (result.rows.length > 0) {
//       if (result.rows[0].quantity < quantity) {
//         res.render("portfolio.ejs", {error: "Error retirving data. Make sure you have enough quantity of " + stockName + " stock"});
//       } else {
//         const new_quantity = result.rows.length - quantity;
//         await db.query("UPDATE portfolios SET quantity = $1", [new_quantity]);
//         ownedStocks = []
//         const result4 = db.query("SELECT stocks FROM portfolios WHERE user_id = $1;", [user_id]);
//         if (result3.rows && result3.rows.length > 0) {
//           result3.rows.forEach(stock => {
//               ownedStocks.push(stock.stock);
//           });
//       } else {
//           console.log("No stocks found for user_id:", user_id);
//       }
//         res.render("portfolio.ejs", {ownedStocks : ownedStocks});
//       }
//     } else {
//       res.render("portfolio.ejs", {error: "Error retirving data. Make sure you have enough quantity of " + stockName + " stock", ownedStocks: ownedStocks});
//     }
//   } catch (error) {
//     res.render("portfolio.ejs", {error: "Error retirving data. Make sure you have enough quantity of " + stockName + " stock", ownedStocks: ownedStocks});
//   }
// });

app.post("/sell", async (req, res) => {    
  const stockName = req.body.name;       // Stock name
  const stockPrice = parseFloat(req.body.price); // Stock price per share
  const quantity = parseInt(req.body.buyQuantity, 10); // Quantity
  const date = getTodaysDate();

  let ownedStocks = [];

  try {
    // Fetch the user's owned stocks
    const result3 = await db.query("SELECT stock FROM portfolios WHERE user_id = $1;", [user_id]);
    console.log("SANITY ", user_id);
    if (result3.rows && result3.rows.length > 0) {
      result3.rows.forEach(stock => {
        ownedStocks.push(stock.stock);
      });
      console.log(ownedStocks);
    } else {
      console.log("No stocks found for user_id:", user_id);
    }

    // Check if the user owns the specific stock with the specified price
    const result = await db.query(
      "SELECT * FROM portfolios WHERE user_id = $1 AND stock = $2 AND buy_price = $3",
      [user_id, stockName, stockPrice]
    );

    if (result.rows.length > 0) {
      const stockData = result.rows[0];
      if (stockData.quantity < quantity) {
        // User doesn't have enough quantity to sell
        return res.render("portfolio.ejs", {
          error: `You do not have enough quantity of ${stockName} stock.`,
          ownedStocks: ownedStocks
        });
      } else {
        // Update the stock quantity
        const newQuantity = stockData.quantity - quantity;

        if (newQuantity > 0) {
          // Update the quantity in the database
          await db.query(
            "UPDATE portfolios SET quantity = $1 WHERE user_id = $2 AND stock = $3 AND buy_price = $4",
            [newQuantity, user_id, stockName, stockPrice]
          );
        } else {
          // If quantity becomes zero, delete the stock from the portfolio
          await db.query(
            "DELETE FROM portfolios WHERE user_id = $1 AND stock = $2 AND buy_price = $3",
            [user_id, stockName, stockPrice]
          );
        }

        // Refresh the owned stocks after updating
        ownedStocks = [];
        const result4 = await db.query("SELECT stock FROM portfolios WHERE user_id = $1;", [user_id]);
        if (result4.rows && result4.rows.length > 0) {
          result4.rows.forEach(stock => {
            ownedStocks.push(stock.stock);
          });
        }

        // Render the updated portfolio
        return res.render("portfolio.ejs", { ownedStocks: ownedStocks });
      }
    } else {
      // Stock not found in the user's portfolio
      return res.render("portfolio.ejs", {
        error: `The stock ${stockName} at the specified price was not found in your portfolio.`,
        ownedStocks: ownedStocks
      });
    }
  } catch (error) {
    console.error("Error processing sell request:", error);
    res.render("portfolio.ejs", {
      error: "An error occurred while processing your request. Please try again.",
      ownedStocks: ownedStocks
    });
  }
});


app.get("/portfolio", async (req, res) => {    
    
    res.render("portfolio.ejs");
});


passport.use(
  "local",
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, async (err, valid) => {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err);
          } else {
            if (valid) {
              console.log("correct password");
              const userdata = await db.query("SELECT userid FROM users WHERE email = $1 ", [username]);
              if (userdata.rows.length > 0) {
                user_id = userdata.rows[0].userid;
                console.log(user_id);
              } else {
                console.log(" no user_id");
              }
              return cb(null, user);
            } else {
              console.log("Incorrect password");
              return cb(null, false);
            }
          }
        });
      } else {
        console.log("user not found");
        return cb("User not found");
      }
    } catch (err) {
      console.log(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return cb(null, newUser.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);


passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
