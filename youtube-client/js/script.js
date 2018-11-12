function makeRequest(searchStr = "Funny cats") {
  var url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=cat&key=AIzaSyCsfImNexVdmlnxQKZHsELAd4_45JuTbQQ";
  fetch(url).then(function(response) {
    if (response.ok) {
      response.json()
      .then(function(result) {
        result.items.forEach(item => {
          console.log(item);
          parseResult(item);
        });
      });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  }, function(error) {
    console.log(error);
  });
  
    // var request = new XMLHttpRequest();
    // request.open('GET', url, true);
    // request.onreadystatechange = function() {
    //   // if (this.readyState == 4 && this.status == 200) {
    //     console.log(this.readyState);
    //     console.log(this.status);
    //     console.log(request.responseText);
    //     console.log(this);
    //   // }
    // };
    // request.send();
  };

const parseResult = function (result) {
  const title = result.snippet.title;
  console.log('title: ', title);
  const link = `https://www.youtube.com/watch?v=${result.id.videoId}`;
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
  console.log('view: ');
};

const onKeyDown = function (key) {
  if (key.code == 'Enter') {
    key.preventDefault();
    makeRequest();
  }
};

window.onload = function () {
  document.querySelector('.search-form__button').addEventListener('click', makeRequest);
  document.addEventListener('keydown', onKeyDown);
};