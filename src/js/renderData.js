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

const PanelItem = function f(struct) {
  this.title = struct.snippet.title;
  this.link = `https://www.youtube.com/watch?v=${struct.id.videoId}`;
  this.author = struct.snippet.channelTitle;
  this.date = struct.snippet.publishedAt.substring(0, 10);
  this.description = struct.snippet.description;
  this.imageUrl = struct.snippet.thumbnails.medium.url;
  this.viewCount = struct.snippet.viewCount || '';
};
/** ************************************************************** */
export {
  panel,
  PanelItem,
  MAX_SHOWABLE_PAGES,
  RESERV_PAGES_NUMBER,
  PANEL_ITEM_WIDTH,
  MIN_PANEL_ITEM_PER_PAGE,
  MAX_PANEL_ITEM_PER_PAGE,
};
