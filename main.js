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

  await page.evaluate(() => {
    const posts = document.querySelectorAll('._4-u2, ._4-u8');
    let postArr = [];

    for (let p = 0; p < posts.length; p++) {
      let post = posts[p];

      if (post.innerText.match(/hail/)) {
        const textElem = post.getElementsByClassName('text_exposed_root');

        if (!!textElem.length) {
          const elem = textElem[0];
          const p = elem.getElementsByTagName('p')[0].innerText.replace(/\s?.{2,}\s?/, '');
          const extendedP = elem.getElementsByClassName('text_exposed_show')[0].innerText;
          const date = post.getElementsByClassName('timestampContent');
          if (date && !!date.length && date[0].innerText.match(/\shrs/g)) {
            date[0].innerText += ' ago';
          }

          if (!postArr.find(p => p.id === elem.id)) {
            postArr.push({
              id: elem.id,
              text: p + ' ' + extendedP,
              date: (date && !!date.length) ? date[0].innerText : 'Date Not Available'
            });
          }
        }
      }
    }
  });

  await page.waitFor(3000000);

  // Close browser
  await browser.close();
})();
