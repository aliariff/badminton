require('dotenv').config();
const puppeteer = require('puppeteer');
const scheduleID = process.env.SCHEDULE_ID;

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://buchung.hsz.rwth-aachen.de/angebote/Wintersemester_18_19/_Badminton_Spielbetrieb.html');
  try {
    await page.click(`#K${scheduleID} + .bs_btn_buchen`);
  } catch (e) {
    console.log('Not open yet');
    await browser.close();
    return;
  }
  await page.screenshot({
    fullPage: true,
    path: 'example.png'
  });
  const pages = await browser.pages();
  const bookingPage = pages[2];
  if (!bookingPage) {
    await browser.close();
  }

  console.log('Choosing schedule');
  await bookingPage.waitFor('#bs_form_main');
  await bookingPage.click("input[type='radio']");
  await bookingPage.click("input[value='weiter zur Buchung']");

  console.log('Logging in');
  await bookingPage.waitFor('#bs_pw_anmlink');
  await bookingPage.click("#bs_pw_anmlink");
  const email = await bookingPage.$("input[name='pw_email']");
  const password = await bookingPage.$("input[type='password']");
  await email.type(process.env.EMAIL);
  await password.type(process.env.PASSWORD);
  await bookingPage.click("#bs_pw_anm input[value='weiter zur Buchung']");

  console.log('Accepting terms & conditions');
  await bookingPage.waitFor('#bs_foot');
  await bookingPage.click("#bs_foot input[name='tnbed']");
  await bookingPage.click("#bs_foot input[value='weiter zur Buchung']");

  console.log('Confirm the booking');
  await bookingPage.waitFor('#bs_foot');
  // await bookingPage.click("#bs_foot input[value='verbindlich buchen']");

  await bookingPage.pdf({
    path: 'bookingPage.pdf',
    format: 'A4'
  });
  await bookingPage.screenshot({
    fullPage: true,
    path: 'bookingPage.png'
  });

  await browser.close();
})();
