// window.onload = function () {
//   renderSearchField();
// };

const API_KEY = 'AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ';
const MAX_SHOWABLE_PAGES = 5;
const RESERV_PAGES_NUMBER = 2;
const PANEL_ITEM_WIDTH = 340;
const MIN_PANEL_ITEM_PER_PAGE = 1;
const MAX_PANEL_ITEM_PER_PAGE = 4;

const panel = {
  curPage: 1,
  countPerPage: null,//4
  totalPageCount: 2,
  items: [],
  requestStr: '',
  pageToken: '',
  el: null,
  // mouseupCount: 0
};

const PanelItem = function (struct) {
  this.title = struct.snippet.title;
  // this.link = struct.id.videoId ? `https://www.youtube.com/watch?v=${struct.id.videoId}` : `https://www.youtube.com/channel/${struct.snippet.channelId}`;
  this.link = `https://www.youtube.com/watch?v=${struct.id.videoId}`;
  this.author = struct.snippet.channelTitle;
  this.date = struct.snippet.publishedAt.substring(0, 10);
  this.description = struct.snippet.description;
  this.imageUrl = struct.snippet.thumbnails.medium.url;
  this.viewCount = struct.snippet.viewCount || '';
}
/*****************************************************************/
const getDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${getUserInput()}&maxResults=15`;
}
const getStatisticsUrl = function (videoIdsStr) {
  return `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${API_KEY}&id=${videoIdsStr}`;
}

const getAdditionalDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${panel.requestStr}&pageToken=${panel.pageToken}&maxResults=15`;
}
/*****************************************************************/
const onPageLoad = function () {

  window.addEventListener('resize', function() {
    if (isElementExist('.main-wrapper')) {
      const countPerPageTmp = countItemsPerPage();
      if (panel.countPerPage !== countPerPageTmp) {
        const leftItemIndex = (panel.curPage - 1) * panel.countPerPage;
        console.log('leftItemIndex: ', leftItemIndex);
        panel.countPerPage = countPerPageTmp;
        console.log('countPerPage: ', panel.countPerPage);
        panel.curPage = Math.floor((leftItemIndex / panel.countPerPage) + 1);
        console.log('curPage: ', panel.curPage);
        renderPanel();
      }
    } else {
      return;
    }
  });

  renderSearchField();
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
    if (key.code === 'Enter') {
      key.preventDefault();
      if (checkUserInput()) {
        makeDataRequest();
      }
    } 
  });
}
/*****************************************************************/
const countItemsPerPage = function () {
  const count = Math.floor(window.innerWidth / PANEL_ITEM_WIDTH);
  return (count > 0) ? Math.min(count, MAX_PANEL_ITEM_PER_PAGE) : MIN_PANEL_ITEM_PER_PAGE;
}

const getUserInput = function () {
  return document.querySelector('.search-form__input').value.trim();
}

const checkUserInput = function () {
  if (!isEmptyString(getUserInput())) {
    hideMessage();
    return true;
  } else {
    showMessage('Please enter your request');
    return false;
  }
}

const isEmptyString = function (str) {
  return (str.length === 0 || !str.trim());
}
/*****************************************************************/
const showMessage = function (str) {
  if (isElementExist('.message')) {
    document.querySelector('.message').innerText = str;
    document.querySelector('.message').hidden = false;
  } else {
    const message = `<p class="message">${str}</p>`;
    document.querySelector('.search-form__content').insertAdjacentHTML('afterEnd', message);
  }  
}

const hideMessage = function () {
  if (isElementExist('.message')) {
    document.querySelector('.message').hidden = true;
  }
}
/*****************************************************************/
const makeDataRequest = function () {
  fetch(getDataUrl())
    .then(response => response.json())
    .then(result => {
      panel.requestStr = getUserInput();
      panel.pageToken = result.nextPageToken;
      panel.curPage = 1;
      panel.totalPageCount = 2;
      panel.items = result.items;
    })
    .then(() => makeViewsRequest(panel.items.map(item => item.id.videoId).join(',')))
    .catch(error => console.log(error));
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
    .catch(error => console.log(error));
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
  // if (isElementExist('.main-wrapper')) {
  //   removeChildren(document.querySelector('.main-wrapper'));
  // } else {
  //   const main = document.createElement('main');
  //   main.className = 'main-wrapper';
  
  //   document.querySelector('.search-form').insertAdjacentElement('afterEnd', main);

  if (isElementExist('.main-wrapper')) {
    removeChildren(document.querySelector('.main-wrapper'));
  } else {
    // const slides = document.createElement('div');
    // slides.className = 'slides';

    const main = document.createElement('main');
    main.className = 'main-wrapper';

    // slides.appendChild(main);
  
    // document.querySelector('.search-form').insertAdjacentElement('afterEnd', slides);
    document.querySelector('.search-form').insertAdjacentElement('afterEnd', main);

    /** AAAAAAAAAAAAAAAAAAAAAAAAAAAAA*/

    // slides.addEventListener('mouseup', function(e) {
    //   console.log('---mouseup---', e.target);
    //   if (e.target.className === 'slides' || e.target.className === 'main-wrapper' || e.target.className === 'main-wrapper__item') {
    //     console.log('---y---');
    //     // const el = document.querySelector('.main-wrapper');
    //     // el.classList.add('move');
    //     // renderPanel();
    //     panel.curPage += 1;
    //     // clearPrevPageNumber();
    //     // selectPageNumber();

    //     renderPanelItems();

    //     const element = document.querySelector('.main-wrapper');
    //     element.classList.add('move');

    //     setTimeout(function() {     
    //       console.log('---Timeout---');
    //       // element.classList.remove("move");
    //       // element.classList.add('move2');
    //       // element.classList.remove("move");
    //       let i = 0;
    //       while (i < panel.countPerPage) {
    //         element.removeChild(element.firstChild);
    //         i++;
    //       }
    //       // element.classList.remove("move");
    //     }, 800);

    //   }
    // });

    // main.addEventListener('mousedown', function() {
    //   console.log('---mouse down---');
    //   return false;
    // });

    // let processing = false;
    // main.addEventListener('mouseup', function() {
    //   panel.mouseupCount++;
    //   // console.log('panel.mouseupCount = ', panel.mouseupCount);
    //   if (processing) {
    //     return;
    //   } else {
    //     processing = true;
    //     // console.log('processing = ', processing);
    //     anim
    //       processing = false;
    //       page += mouseupCount
    //       mouseupCount = 0;
    //   }
    //   // panel.mouseupCount++;
    //   // setTimeout(function() {     
    //   //   console.log('---mouse up---', panel.mouseupCount);
    //   //   panel.mouseupCount = 0;
    //   // }, 1500);
    // });

    panel.el = main;
  }
}

const renderPanelItems = function () {
  console.log('renderPanelItems()');

  // const countPerPageTmp = Math.floor(window.innerWidth / 340);
  // panel.countPerPage = countPerPageTmp;
  panel.countPerPage = countItemsPerPage();
 
  const firstItemNumber = (panel.curPage - 1) * panel.countPerPage;
  const lastItemNumber = firstItemNumber + panel.countPerPage;

  console.log(firstItemNumber, lastItemNumber);
  console.log(panel.items);
  for (let i = firstItemNumber; i < lastItemNumber; i++) {
    // if (!panel.items[i]) {
    //   showMessage('aaaaaaaaaa');
    //   removeChildren(document.querySelector('body'));
    //   return;
    // }
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
