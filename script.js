function dataBase() {
  let db = localStorage.getItem('urlDatabase');
  console.log("DB", db)
  return db ? JSON.parse(db) : {};
}

function shortenUrl() {
  let inputUrl = document.getElementById('myUrl');
  let display = document.getElementById('display');

  try {
    let userUrl = new URL(inputUrl.value);
    let uniqueId = createShortUrlId();

    let dataB = dataBase();
    dataB[uniqueId] = userUrl.href;
    localStorage.setItem('urlDatabase', JSON.stringify(dataB));
    let result = formatUrl(uniqueId);
    display.innerHTML = `<a href="${userUrl}">${result}</a>`
  } catch (error) {
    throw Error(`INVALID URL: ${error}`)
  }

}
function createShortUrlId() {
  return (Date.now()).toString(36);
}


function formatUrl(unique) {
  const mywebsiteUrl = 'https://fictional-carnival-q7j4vqw6w46jcxp95-5500.app.github.dev';
  return `${mywebsiteUrl}/${unique}`;
}
