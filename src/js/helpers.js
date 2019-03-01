const isElementExist = element => !!document.body.querySelector(`${element}`);

const isEmptyString = str => (str.length === 0 || !str.trim());

const removeChildren = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};
/** ************************************************************** */
export { isElementExist, isEmptyString, removeChildren };
