window.onload = function () {
  renderSearchField();
  // renderPanel();
  setEventListeners();
};

const setEventListeners = function () {
  document.querySelector('.search-form__button').addEventListener('click', makeVideoIdsRequest);
  document.addEventListener('keydown', onKeyDown);
  // document.querySelector('.pagination').addEventListener('click', goToPage);
}

const onKeyDown = function (key) {
  if (key.code == 'Enter') {
    key.preventDefault();
    makeVideoIdsRequest();
  }
};

const goToPage = function (pageNumber) {
  console.log('goToPage()');
  console.log('pageNumber = ', pageNumber.target);

  if (pageNumber.target.tagName !== 'LI' || pageNumber.target.className === 'disable') {
    return;
  }

  const prevSelectedPage = document.querySelector('.pagination li.active');
  const indexPrevSelectedPage = [...document.querySelector('.pagination').children].indexOf(prevSelectedPage);

  clearSelectionPagination(indexPrevSelectedPage);

  pageNumber.target.classList.add('active');

  panel.curPage = pageNumber.target.innerText - 1;
  
  // renderPanelItems();
  renderPanel();
};

const clearSelectionPagination = function (n) {
  console.log('clearSelectionPagination()');
  document.querySelector(`.pagination li:nth-child(${n + 1})`).classList.remove('active');
};

const panel = {
  countPages: 15,
  curPage: 0,
  countPerPage: 4,
  items: null
};

const panelItem = {
  title: null,
  link: null,
  author: null,
  date: null,
  description: null,
  imageUrl: null,
  viewCount: null
};

function makeVideoIdsRequest() {
  //&maxResults=15
  //&pageToken=CAIQAA (nextPageToken or prevPageToken)
  var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&q=${getUserInput()}&maxResults=15`;
  console.log('url = ', url);
  fetch(url).then(function(response) {
    if (response.ok) {
      const videoIds = [];
      response.json()
        .then(function(result) {
          console.log(result);
          result.items.forEach(item => {
            videoIds.push(getVideoId(item));
          });
        })
        .then(function() {
          makeDataRequest(formVideoIdsStr(videoIds));
        });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  }, function(error) {
    console.log('error: ', error);
  });
};

function makeDataRequest(videoIdsStr) {
  var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&id=${videoIdsStr}`;
  fetch(url).then(function(response) {
    if (response.ok) {
      response.json()
        .then(function(result) {
          //проверка пришли ли данные
          panel.items = result.items;
          renderPanel();
          // renderPanelItems();
          renderPagination();
        });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  }, function(error) {
    console.log(error);
  });
};

const getVideoId = function (item) {
  return item.id.videoId;
}

const formVideoIdsStr = function (videoId) {
  return videoId.join(',');
}

const getUserInput = function () {
  return document.querySelector('.search-form__input').value/* || 'cat'*/;
}

const parseResult = function (result) {
  panelItem.title = result.snippet.title;
  panelItem.link = `https://www.youtube.com/watch?v=${result.id}`;
  panelItem.author = result.snippet.channelTitle;
  const date = result.snippet.publishedAt.split('-');
  panelItem.date = `${date[0]}-${date[1]}-${date[2].substring(0, 2)}`;
  panelItem.description =  result.snippet.description;
  panelItem.imageUrl = result.snippet.thumbnails.medium.url;
  panelItem.viewCount = result.statistics.viewCount;
};
/*****************************************************************/
const isElementExist = function (element) {
  return !!document.body.querySelector(`${element}`);
}

const removeChildren= function (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
/*****************************************************************/
const renderSearchField = function () {
  console.log('renderSearchField()');

  const form = document.createElement('form');
  form.className = 'search-form';

  const span = document.createElement('span');
  span.className = 'search-form__button';

  const i = document.createElement('i');
  i.className = 'fas fa-search';

  span.appendChild(i);

  const input = document.createElement('input');
  input.className = 'search-form__input';
  input.setAttribute('type', 'search');
  input.setAttribute('placeholder', 'Search...');

  form.appendChild(span);
  form.appendChild(input);

  document.body.insertAdjacentElement('afterBegin', form);
}

const renderPanel = function () {
  console.log('renderPanel()');

  if (isElementExist('.main-wrapper')) {
    console.log('main-wrapper exist');
    removeChildren(document.querySelector('.main-wrapper'));
  } else {
    console.log('main-wrapper does not exist');

    const main = document.createElement('main');
    main.className = 'main-wrapper';
  
    document.querySelector('.search-form').insertAdjacentElement('afterEnd', main);
  }

  renderPanelItems();
};

const renderPanelItems = function () {
  console.log('renderPanelItems()');
 
  const firstItemNumber = panel.curPage * panel.countPerPage;
  const lastItemNumber = firstItemNumber + panel.countPerPage;

  console.log(firstItemNumber, lastItemNumber);

  for (let i = firstItemNumber; i < lastItemNumber; i++) {
    console.log('item: ', panel.items[i]);
    parseResult(panel.items[i]);
    document.querySelector('.main-wrapper').appendChild(renderItem());
  }
}

const renderItem = function () {
  const wrapperItem = document.createElement('section');
  wrapperItem.className = 'main-wrapper__item';
  
  const item =
      `<div class="main-wrapper__item-header"> 
        <img src="${panelItem.imageUrl}" alt="image" width="320" height="180"/>
        <a href="${panelItem.link}" target="_blank">${panelItem.title}</a>
      </div>

      <div class="main-wrapper__item-information"> 
        <ul class="main-wrapper__item-list">
          <li>
            <i class="fas fa-user-circle"></i>
            <span>${panelItem.author}</span>
          </li>
          <li>
            <i class="fas fa-calendar-alt"></i>
            <span>${panelItem.date}</span>
          </li>
          <li>
            <i class="fas fa-eye"></i>
            <span>${panelItem.viewCount}</span>
          </li>
        </ul>
      </div>

      <div class="main-wrapper__item-description"> 
        ${panelItem.description}
      </div> `;

  wrapperItem.insertAdjacentHTML('afterBegin', item); 

  return wrapperItem;
}

const renderPagination = function () {
  console.log('renderPagination()');

  if (isElementExist('nav')) {
    console.log('nav exist');
    removeChildren(document.querySelector('.pagination'));
  } else {
    console.log('nav does not exist');
    const nav = document.createElement('nav');

    const ul = 
      '<ul class="pagination"> \
        <!-- <li class="prev">&#171;</li> --> \
        <li class="active">1</li> \
        <li>2</li> \
        <li>3</li> \
        <li class="disable">...</li> \
        <!-- <li class="next">&#187;</li> --> \
      </ul>';
  
      nav.insertAdjacentHTML('afterBegin', ul);
  
      document.querySelector('.main-wrapper').insertAdjacentElement('afterEnd', nav);
      
      document.querySelector('.pagination').addEventListener('click', goToPage);
  }

}

