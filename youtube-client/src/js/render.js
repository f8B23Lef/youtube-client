import { makeDataRequest, makeAdditionalDataRequest, checkUserInput } from './requests';
import { isElementExist, removeChildren } from './helpers';
/*****************************************************************/
const MAX_SHOWABLE_PAGES = 5;
const RESERV_PAGES_NUMBER = 2;
const PANEL_ITEM_WIDTH = 340;
const MIN_PANEL_ITEM_PER_PAGE = 1;
const MAX_PANEL_ITEM_PER_PAGE = 4;

const panel = {
  curPage: 1,
  countPerPage: null,
  totalPageCount: 2,
  items: [],
  requestStr: '',
  pageToken: '',
  el: null,
};

const PanelItem = function (struct) {
  this.title = struct.snippet.title;
  this.link = `https://www.youtube.com/watch?v=${struct.id.videoId}`;
  this.author = struct.snippet.channelTitle;
  this.date = struct.snippet.publishedAt.substring(0, 10);
  this.description = struct.snippet.description;
  this.imageUrl = struct.snippet.thumbnails.medium.url;
  this.viewCount = struct.snippet.viewCount || '';
};
/*****************************************************************/
const renderSearchField = function () {
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
};
/*****************************************************************/
const renderPanel = function () {
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
};

const renderPanelItems = function () {
  panel.countPerPage = countItemsPerPage();
 
  const firstItemNumber = (panel.curPage - 1) * panel.countPerPage;
  const lastItemNumber = firstItemNumber + panel.countPerPage;

  for (let i = firstItemNumber; i < lastItemNumber; i++) {
    let panelItem = new PanelItem(panel.items[i]);
    panel.el.appendChild(renderItem(panelItem));
  }
};

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
};
/*****************************************************************/
const renderPagination = function () {
  preparePaginationWrapper();
  renderPaginationItems();
};

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
};

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
};
/*****************************************************************/
const goToPage = function (pageNumber) {
  if (pageNumber.target.tagName !== 'LI' || pageNumber.target.className === 'disable') {
    return;
  }

  hideMessage();

  panel.curPage = parseInt(pageNumber.target.innerText, 10);

  if (needLoadNewVideos()) {
    makeAdditionalDataRequest();
  }

  renderPanel();
};

const needLoadNewVideos = function () {
  let minVideosNeeded = RESERV_PAGES_NUMBER * panel.countPerPage;
  let actualVideosLeft = panel.items.length - panel.curPage * panel.countPerPage;
  
  return (actualVideosLeft < minVideosNeeded);
};

const selectPageNumber = function () {
  const paginationItems = [...document.querySelector('.pagination').children];
  const curLi = paginationItems.find(item => item.innerText === String(panel.curPage));
  const indexCurLi = paginationItems.indexOf(curLi);
  document.querySelector(`.pagination li:nth-child(${indexCurLi + 1})`).classList.add('active');
};

const clearPrevPageNumber = function () {
  if (isElementExist('.pagination li.active')) {
    const prevSelectedPage = document.querySelector('.pagination li.active');
    const indexPrevSelectedPage = [...document.querySelector('.pagination').children].indexOf(prevSelectedPage);
    document.querySelector(`.pagination li:nth-child(${indexPrevSelectedPage + 1})`).classList.remove('active');
  }
};

const showMessage = function (str) {
  if (isElementExist('.message')) {
    const message = document.querySelector('.message');
    message.innerText = str;
    message.hidden = false;
  } else {
    const message = `<p class="message">${str}</p>`;
    document.querySelector('.search-form__content').insertAdjacentHTML('afterEnd', message);
  }  
};

const hideMessage = function () {
  if (isElementExist('.message')) {
    document.querySelector('.message').hidden = true;
  }
};

const countItemsPerPage = function () {
  const count = Math.floor(window.innerWidth / PANEL_ITEM_WIDTH);
  return (count > 0) ? Math.min(count, MAX_PANEL_ITEM_PER_PAGE) : MIN_PANEL_ITEM_PER_PAGE;
};
/*****************************************************************/
export { panel, renderPanel, renderSearchField, countItemsPerPage, showMessage, hideMessage, RESERV_PAGES_NUMBER };
