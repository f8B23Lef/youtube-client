import { panel, renderSearchField, renderPanel, hideMessage, countItemsPerPage } from './js/render';
import { isElementExist } from './js/helpers';
/*****************************************************************/
window.onload = function () {

  window.addEventListener('resize', function() {
    hideMessage();
    if (isElementExist('.main-wrapper')) {
      const countPerPageTmp = countItemsPerPage();
      if (panel.countPerPage !== countPerPageTmp) {
        const leftItemIndex = (panel.curPage - 1) * panel.countPerPage;
        panel.countPerPage = countPerPageTmp;
        panel.curPage = Math.floor((leftItemIndex / panel.countPerPage) + 1);
        renderPanel();
      }
    } else {
      return;
    }
  });

  renderSearchField();
}
