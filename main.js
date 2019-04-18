const puppeteer = require('puppeteer');

// Function to scroll the page down
const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        if(totalHeight >= scrollHeight + 2000){
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}

// Main function
(async () => {
  const url = 'https://www.facebook.com/EvanAndrewsFox4/?__tn__=kC-R0.g&eid=ARDN79fN6w_zHXDjRJN3ftaXudlINLvUepQKOIDCol0dhnGsVRIbrAx9b3LXnIGa7R9y--p8BYckwR1C&hc_ref=ARR_dZ_Mwr_j9sVcAzxhwFFkJ3Qo26aEH_VZV8GrnV4UbSdvysIx_b656O0RkA6HhS8';

  // Open browser
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    devtools: true
  });
  const page = await browser.newPage();
  await page.goto(url);

  // Scan page for stupid FB banner and delete dashet
  await page.evaluate(() => {
    const elements = document.querySelectorAll('._5hn6');
    for (let i = 0; i < elements.length; i++) {
      const e = elements[i];
      e.remove();
    }
  });

  // Scroll down to the last few days of posts
  await autoScroll(page);

  let yPosArr = await page.evaluate((arr) => {
    const posts = document.querySelectorAll('._4-u2, ._4-u8');

    for (let p = 0; p < posts.length; p++) {
      let post = posts[p];

      if (post.innerText.match(/hail/)) {
        const rect = post.getBoundingClientRect();
        yPosArr.push(rect.top);
      }
    }
  }, []);

  console.log({ yPosArr });

  await page.waitFor(3000000);

  // Close browser
  await browser.close();
})();


// window.scrollBy(0, rect.top - 50);
