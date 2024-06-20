const puppeteer = require('puppeteer');
const express = require("express");
const app = express();
const PORT = 4000;

// Set up Puppeteer options for running in Render.com
const renderCloudConfig = {
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
};

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
app.listen(PORT, () => {
  console.log(`Server started`);
});
