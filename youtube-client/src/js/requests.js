import { panel, renderPanel, showMessage, hideMessage, RESERV_PAGES_NUMBER } from './render';
import { isEmptyString } from './helpers';
/*****************************************************************/
const API_KEY = 'AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ';

const getDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${getUserInput()}&maxResults=15`;
};

const getStatisticsUrl = function (videoIdsStr) {
  return `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${API_KEY}&id=${videoIdsStr}`;
};
  
const getAdditionalDataUrl = function () {
  return `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${panel.requestStr}&pageToken=${panel.pageToken}&maxResults=15`;
};
/*****************************************************************/
const makeDataRequest = function () {
  fetch(getDataUrl())
    .then(response => response.json())
    .then(result => {
      if (result.items.length === 0) {
        showMessage('Video not found');
        return;
      }
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
      panel.totalPageCount = Math.floor(panel.items.length / panel.countPerPage) - RESERV_PAGES_NUMBER;
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
const getUserInput = function () {
  return document.querySelector('.search-form__input').value.trim();
};

const checkUserInput = function () {
  if (!isEmptyString(getUserInput())) {
    hideMessage();
    return true;
  } else {
    showMessage('Please enter your request');
    return false;
  }
};
/*****************************************************************/
export { makeDataRequest, makeAdditionalDataRequest, checkUserInput };
