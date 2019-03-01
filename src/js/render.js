import {
  makeDataRequest,
  makeAdditionalDataRequest,
} from './requests';

import {
  panel,
  PanelItem,
  MAX_SHOWABLE_PAGES,
  RESERV_PAGES_NUMBER,
  PANEL_ITEM_WIDTH,
  MIN_PANEL_ITEM_PER_PAGE,
  MAX_PANEL_ITEM_PER_PAGE,
} from './renderData';

import {
  isElementExist,
  isEmptyString,
  removeChildren,
} from './helpers';
/** ************************************************************** */
const showMessage = (str) => {
  if (isElementExist('.message')) {
    const message = document.querySelector('.message');
    message.innerText = str;
    message.hidden = false;
  } else {
    const message = `<p class="message">${str}</p>`;
    document.querySelector('.search-form__content').insertAdjacentHTML('afterEnd', message);
  }
};

const hideMessage = () => {
  if (isElementExist('.message')) {
    document.querySelector('.message').hidden = true;
  }
};

const preparePanelWrapper = () => {
  if (isElementExist('.main-wrapper')) {
    removeChildren(document.querySelector('.main-wrapper'));
  } else {
    const main = document.createElement('main');
    main.className = 'main-wrapper';

    document.querySelector('.search-form').insertAdjacentElement('afterEnd', main);

    panel.el = main;
  }
};

const renderItem = (panelItem) => {
  const wrapperItem = document.createElement('section');
  wrapperItem.className = 'main-wrapper__item';

  const item = `<div class="main-wrapper__item-header"> 
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

const countItemsPerPage = () => {
  const count = Math.floor(window.innerWidth / PANEL_ITEM_WIDTH);
  return (count > 0) ? Math.min(count, MAX_PANEL_ITEM_PER_PAGE) : MIN_PANEL_ITEM_PER_PAGE;
};

const renderPanelItems = () => {
  panel.countPerPage = countItemsPerPage();

  const firstItemNumber = (panel.curPage - 1) * panel.countPerPage;
  const lastItemNumber = firstItemNumber + panel.countPerPage;

  for (let i = firstItemNumber; i < lastItemNumber; i += 1) {
    const panelItem = new PanelItem(panel.items[i]);
    panel.el.appendChild(renderItem(panelItem));
  }
};

const selectPageNumber = () => {
  const paginationItems = [...document.querySelector('.pagination').children];
  const curLi = paginationItems.find(item => item.innerText === String(panel.curPage));
  const indexCurLi = paginationItems.indexOf(curLi);
  document.querySelector(`.pagination li:nth-child(${indexCurLi + 1})`).classList.add('active');
};

const clearPrevPageNumber = () => {
  if (isElementExist('.pagination li.active')) {
    const prevSelectedPage = document.querySelector('.pagination li.active');
    const indexPrevSelectedPage = [...document.querySelector('.pagination').children].indexOf(prevSelectedPage);
    document.querySelector(`.pagination li:nth-child(${indexPrevSelectedPage + 1})`).classList.remove('active');
  }
};

const renderPaginationItems = () => {
  let li = '';
  if (panel.curPage < MAX_SHOWABLE_PAGES) {
    const showablePageCount = panel.totalPageCount > panel.curPage + 1
      ? Math.min(panel.totalPageCount, MAX_SHOWABLE_PAGES)
      : panel.curPage + 1;
    for (let i = 0; i < showablePageCount; i += 1) {
      li += (`<li>${i + 1}</li>`);
    }
  } else {
    li = `<li>1</li> \
    <li class="disable">...</li> \
    <li>${panel.curPage - 1}</li> \
    <li>${panel.curPage}</li> \
    <li>${panel.curPage + 1}</li>`;
  }

  document.querySelector('.pagination').insertAdjacentHTML('afterBegin', li);

  clearPrevPageNumber();
  selectPageNumber();
};

const preparePaginationWrapper = () => {
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

const renderPagination = () => {
  preparePaginationWrapper();
  renderPaginationItems();
};

const renderPanel = () => {
  preparePanelWrapper();
  renderPanelItems();
  renderPagination();
};

const checkUserInput = () => {
  const userInput = document.querySelector('.search-form__input').value.trim();
  if (!isEmptyString(userInput)) {
    hideMessage();
    return true;
  }
  showMessage('Please enter your request');
  return false;
};

const renderSearchField = () => {
  const searchForm = '<form class="search-form">\n'
      + '<div class="search-form__content">\n'
        + '<span class="search-form__button"><i class="fas fa-search"></i></span>\n'
        + '<input class="search-form__input" type="search" placeholder="Search..."/>\n'
      + '</div>\n'
    + '</form>\n';

  document.body.insertAdjacentHTML('afterBegin', searchForm);

  document.body.querySelector('.search-form__button').addEventListener('click', () => {
    if (checkUserInput()) {
      makeDataRequest(renderPanel, showMessage);
    }
  });

  document.addEventListener('keydown', (key) => {
    if (key.code === 'Enter') {
      key.preventDefault();
      if (checkUserInput()) {
        makeDataRequest(renderPanel, showMessage);
      }
    }
  });
};
/** ************************************************************** */
const needLoadNewVideos = () => {
  const minVideosNeeded = RESERV_PAGES_NUMBER * panel.countPerPage;
  const actualVideosLeft = panel.items.length - panel.curPage * panel.countPerPage;

  return (actualVideosLeft < minVideosNeeded);
};

const goToPage = (pageNumber) => {
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
/** ************************************************************** */
export {
  panel,
  renderSearchField,
  renderPanel,
  hideMessage,
  countItemsPerPage,
};
