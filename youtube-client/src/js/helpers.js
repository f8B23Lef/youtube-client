const isElementExist = function (element) {
  return !!document.body.querySelector(`${element}`);
};

const isEmptyString = function (str) {
  return (str.length === 0 || !str.trim());
};

const removeChildren = function (element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};
/*****************************************************************/
export { isElementExist, isEmptyString, removeChildren };
