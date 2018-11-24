/* eslint-disable no-console */
import { panel, RESERV_PAGES_NUMBER } from './renderData';
/** ************************************************************** */
const getUserInput = () => document.querySelector('.search-form__input').value.trim();

const API_KEY = 'AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ';

const getDataUrl = () => `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${getUserInput()}&maxResults=15`;

const getStatisticsUrl = videoIdsStr => `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=${API_KEY}&id=${videoIdsStr}`;

const getAdditionalDataUrl = () => `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${API_KEY}&q=${panel.requestStr}&pageToken=${panel.pageToken}&maxResults=15`;
/** ************************************************************** */
const makeViewsRequest = (videoIdsStr, renderPanel) => {
  fetch(getStatisticsUrl(videoIdsStr))
    .then(response => response.json())
    .then((result) => {
      result.items.forEach((item, index) => {
        panel.items[index].snippet.viewCount = item.statistics.viewCount;
      });
      renderPanel();
    })
    .catch((error) => {
      console.log(error);
      renderPanel();
    });
};

const makeDataRequest = (renderPanel, showMessage) => {
  fetch(getDataUrl())
    .then(response => response.json())
    .then((result) => {
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
    .then(() => makeViewsRequest(panel.items.map(item => item.id.videoId).join(','), renderPanel))
    .catch(error => console.log(error));
};

/** ************************************************************** */
const makeAdditionalViewsRequest = (videoIdsStr, prevItemsLength) => {
  fetch(getStatisticsUrl(videoIdsStr))
    .then(response => response.json())
    .then(result => result.items.forEach((item, index) => {
      panel.items[index + prevItemsLength].snippet.viewCount = item.statistics.viewCount;
    }))
    .catch(error => console.log(error));
};

const makeAdditionalDataRequest = () => {
  const prevItemsLength = panel.items.length;
  fetch(getAdditionalDataUrl())
    .then(response => response.json())
    .then((result) => {
      panel.pageToken = result.nextPageToken;
      result.items.forEach(item => panel.items.push(item));
      const pageCount = Math.floor(panel.items.length / panel.countPerPage);
      panel.totalPageCount = pageCount - RESERV_PAGES_NUMBER;
      return result.items;
    })
    .then(result => makeAdditionalViewsRequest(result.map(item => item.id.videoId).join(','), prevItemsLength))
    .catch(error => console.log(error));
};
/** ************************************************************** */
export { makeDataRequest, makeAdditionalDataRequest };
