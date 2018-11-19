// window.onload = function () {
//   renderSearchField();
// };

const MAX_SHOWABLE_PAGES = 5;
const RESERV_PAGES_NUMBER = 2;

const panel = {
  curPage: 1,
  countPerPage: 4,
  totalPageCount: 2,
  items: [],
  requestStr: '',
  pageToken: '',
  el: null
};

const PanelItem = function (struct) {
  this.title = struct.snippet.title;
  this.link = struct.id.videoId ? `https://www.youtube.com/watch?v=${struct.id.videoId}` : `https://www.youtube.com/channel/${struct.snippet.channelId}`;
  this.author = struct.snippet.channelTitle;
  this.date = struct.snippet.publishedAt.substring(0, 10);
  this.description = struct.snippet.description;
  this.imageUrl = struct.snippet.thumbnails.medium.url;
  this.viewCount = struct.snippet.viewCount || '';
}
/*****************************************************************/
const getDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&q=${getUserInput()}&maxResults=15`;
}
const getStatisticsUrl = function (videoIdsStr) {
  return `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&id=${videoIdsStr}`;
}

const getAdditionalDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&q=${panel.requestStr}&pageToken=${panel.pageToken}&maxResults=15`;
}
/*****************************************************************/
const renderSearchField = function () {
  console.log('renderSearchField()');
  const searchForm = 
    '<form class="search-form"> \
      <div class="search-form__content"> \
        <span class="search-form__button"><i class="fas fa-search"></i></span> \
        <input class="search-form__input" type="search" placeholder="Search..."/> \
      </div> \
    </form>';

  document.body.insertAdjacentHTML('afterBegin', searchForm);

  document.body.querySelector('.search-form__button').addEventListener('click', function() {
    if (checkUserInput()) {
      makeDataRequest();
    } 
  });

  document.addEventListener('keydown', function(key) {
    if (key.code == 'Enter' && checkUserInput()) {
      key.preventDefault();
      makeDataRequest();
    }
  });
}
/*****************************************************************/
const getUserInput = function () {
  return document.querySelector('.search-form__input').value.trim();
}

const checkUserInput = function () {
  if (!isEmptyString(getUserInput())) {
    hideMessage();
    return true;
  } else {
    showMessage();
    return false;
  }
}

const isEmptyString = function (str) {
  return (str.length === 0 || !str.trim());
}
/*****************************************************************/
const showMessage = function () {
  if (isElementExist('.message')) {
    document.querySelector('.message').hidden = false;
  } else {
    const message = '<p class="message">Please enter your request</p>';
    //бордер красный сделать
    document.querySelector('.search-form__content').insertAdjacentHTML('afterEnd', message);
  }  
}

const hideMessage = function () {
  if (isElementExist('.message')) {
    document.querySelector('.message').hidden = true;
    //бордер серый сделать
  }
}
/*****************************************************************/
const makeDataRequest = function () {
  fetch(getDataUrl())
    .then(response => response.json())
    .then(result => {
      // console.log(result);
      panel.requestStr = getUserInput();
      panel.pageToken = result.nextPageToken;
      panel.curPage = 1;
      panel.items = result.items;
    })
    .then(() => makeViewsRequest(panel.items.map(item => item.id.videoId).join(',')))
    .catch(error => console.log('error: ', error));
};

const makeViewsRequest = function (videoIdsStr) {
  fetch(getStatisticsUrl(videoIdsStr))
    .then(response => response.json())
    .then(result => {
      result.items.forEach((item, index) => panel.items[index].snippet.viewCount = item.statistics.viewCount);
      console.log('new items: ', panel.items);
      renderPanel();
    })
    .catch(error => {
      console.log(error);
      renderPanel();
    });
};
/*****************************************************************/
const makeAdditionalDataRequest = function () {
  const prevItemsLength = panel.items.length;
  fetch(getAdditionalDataUrl())
    .then(response => response.json())
    .then(result => {
      panel.pageToken = result.nextPageToken;
      result.items.forEach(item => panel.items.push(item));
      panel.totalPageCount = Math.floor(panel.items.length / panel.countPerPage - RESERV_PAGES_NUMBER);
      return result.items;
    })
    .then(result => makeAdditionalViewsRequest(result.map(item => item.id.videoId).join(','), prevItemsLength))
    .catch(error => console.log('error: ', error));
};

const makeAdditionalViewsRequest = function (videoIdsStr, prevItemsLength) {
  fetch(getStatisticsUrl(videoIdsStr))
    .then(response => response.json())
    .then(result => result.items.forEach((item, index) => panel.items[index + prevItemsLength].snippet.viewCount = item.statistics.viewCount))
    .catch(error => console.log(error));
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
const renderPanel = function () {
  console.log('renderPanel()');
  preparePanelWrapper();
  renderPanelItems();
  renderPagination();
};

const preparePanelWrapper = function() {
  if (isElementExist('.main-wrapper')) {
    removeChildren(document.querySelector('.main-wrapper'));
  } else {
    const main = document.createElement('main');
    main.className = 'main-wrapper';
  
    document.querySelector('.search-form').insertAdjacentElement('afterEnd', main);

    panel.el = main;
  }
}

const renderPanelItems = function () {
  console.log('renderPanelItems()');
 
  const firstItemNumber = (panel.curPage - 1) * panel.countPerPage;
  const lastItemNumber = firstItemNumber + panel.countPerPage;

  console.log(firstItemNumber, lastItemNumber);
  console.log(panel.items);
  for (let i = firstItemNumber; i < lastItemNumber; i++) {
    console.log('item: ', i, panel.items[i], panel.items[i].snippet.viewCount);
    let panelItem = new PanelItem(panel.items[i]);
    panel.el.appendChild(renderItem(panelItem));
  }
}

const renderItem = function (panelItem) {
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
  preparePaginationWrapper();
  renderPaginationItems();
}

const preparePaginationWrapper = function () {
  if (isElementExist('.pagination')) {
    removeChildren(document.querySelector('.pagination'));
  } else {
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    ul.className = 'pagination';
    ul.addEventListener('click', goToPage);
    nav.appendChild(ul);
    document.querySelector('.main-wrapper').insertAdjacentElement('afterEnd', nav);
  }
}

const renderPaginationItems = function () {
  let li = '';
  if (panel.curPage < MAX_SHOWABLE_PAGES) {
    const showablePageCount = panel.totalPageCount > panel.curPage + 1 ? Math.min(panel.totalPageCount, MAX_SHOWABLE_PAGES) : panel.curPage + 1;
    for (let i = 0; i < showablePageCount; i++) {
      li += (`<li>${i + 1}</li>`);
    }
  } else {
    li = 
    `<li>1</li> \
    <li class="disable">...</li> \
    <li>${panel.curPage - 1}</li> \
    <li>${panel.curPage}</li> \
    <li>${panel.curPage + 1}</li>`;
  }

  document.querySelector('.pagination').insertAdjacentHTML('afterBegin', li);

  clearPrevPageNumber();
  selectPageNumber();
}

const countPaginationItems = function () {

}
/*****************************************************************/
const goToPage = function (pageNumber) {
  console.log('goToPage()');
  console.log('pageNumber = ', pageNumber.target);

  if (pageNumber.target.tagName !== 'LI' || pageNumber.target.className === 'disable') {
    return;
  }

  panel.curPage = parseInt(pageNumber.target.innerText, 10);

  if (needLoadNewVideos()) {
    makeAdditionalDataRequest();
    console.log('add: ', panel.items);
  }

  renderPanel();
};
/*****************************************************************/
const needLoadNewVideos = function () {
  let minVideosNeeded = RESERV_PAGES_NUMBER * panel.countPerPage;
  let actualVideosLeft = panel.items.length - panel.curPage * panel.countPerPage;

  return (actualVideosLeft < minVideosNeeded);
}

const selectPageNumber = function () {
  const curLi = [...document.querySelector('.pagination').children].find(item => item.innerText === String(panel.curPage));
  const indexCurLi = [...document.querySelector('.pagination').children].indexOf(curLi);
  document.querySelector(`.pagination li:nth-child(${indexCurLi + 1})`).classList.add('active');
}

const clearPrevPageNumber = function () {
  const prevSelectedPage = document.querySelector('.pagination li.active');
  if (prevSelectedPage) {
    const indexPrevSelectedPage = [...document.querySelector('.pagination').children].indexOf(prevSelectedPage);
    document.querySelector(`.pagination li:nth-child(${indexPrevSelectedPage + 1})`).classList.remove('active');
  }
};
