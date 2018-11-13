function makeVideoIdsRequest() {
  var url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&q=${getUserInput()}`;
  console.log('url = ', url);
  fetch(url).then(function(response) {
    if (response.ok) {
      const videoIds = [];
      response.json()
        .then(function(result) {
          result.items.forEach(item => {
            videoIds.push(getVideoId(item));
          });
        })
        .then(function() {
          makeDataRequest(formVideoIdsStr(videoIds));
        });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  }, function(error) {
    console.log(error);
  });
};

function makeDataRequest(videoIdsStr) {
  var url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ&id=${videoIdsStr}`;
  fetch(url).then(function(response) {
    if (response.ok) {
      response.json()
        .then(function(result) {
          result.items.forEach(item => {
            // console.log(item);
            parseResult(item);
          });
        });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  }, function(error) {
    console.log(error);
  });
};

const getVideoId = function (item) {
  const id = item.id.videoId;
  return id;
}

const formVideoIdsStr = function (videoId) {
  const videoIdsStr = videoId.join(',');
  return videoIdsStr;
}

const getUserInput = function () {
  const searchStr = document.querySelector('.search-form__input').value;
  console.log('searchStr = ', searchStr);
  return searchStr;
}

const parseResult = function (result) {
  const title = result.snippet.title;
  console.log('title: ', title);
  const link = `https://www.youtube.com/watch?v=${result.id}`;
  console.log('link: ', link);
  const author = result.snippet.channelTitle;
  console.log('author: ', author);
  const date = new Date(result.snippet.publishedAt);
  const formatDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  console.log('date: ', formatDate);
  const description =  result.snippet.description;
  console.log('description: ', description);
  const imageUrl = result.snippet.thumbnails.medium.url;
  console.log('imageURL: ', imageUrl);
  const viewCount = result.statistics.viewCount;
  console.log('viewCount: ', viewCount);
};

const onKeyDown = function (key) {
  if (key.code == 'Enter') {
    key.preventDefault();
    makeVideoIdsRequest();
  }
};

window.onload = function () {
  document.querySelector('.search-form__button').addEventListener('click', makeVideoIdsRequest);
  document.addEventListener('keydown', onKeyDown);
};