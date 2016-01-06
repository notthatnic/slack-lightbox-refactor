/**
 * Page specific js for challenge.html.
 */

// Because even the most recent versions of IE don't support adding multiple
// classes to an element's classList at once, I have to use this polyfill
(function () {
  /*global DOMTokenList */
  var dummy  = document.createElement('div'),
    dtp    = DOMTokenList.prototype,
    add    = dtp.add,
    rem    = dtp.remove;

  dummy.classList.add('class1', 'class2');

  // Older versions of the HTMLElement.classList spec didn't allow multiple
  // arguments, easy to test for
  if (!dummy.classList.contains('class2')) {
    dtp.add    = function () {
      Array.prototype.forEach.call(arguments, add.bind(this));
    };
    dtp.remove = function () {
      Array.prototype.forEach.call(arguments, rem.bind(this));
    };
  }
})();

// declare vars and target elements
var xhr = new XMLHttpRequest(),
  thumbWrapper = document.getElementsByClassName('id-thumbs-wrapper')[0],
  thumbSpinner = document.getElementsByClassName('id-thumbs-spinner')[0],
  thumbError = document.getElementsByClassName('id-thumbs-error')[0];

/**
 * callback for XMLHttpRequest transfer completion
 * @param {event} event event to listen for
 */
var transferComplete = function(event) {
  var galleryData;
  if (this.status == 200) {

    // parse response data into JSON
    galleryData = JSON.parse(this.response);

    // hide the spinner class
    thumbSpinner.classList.add('u-hidden');

    // create thumbs
    Thumbs.paintThumbs(parseImgData(galleryData), thumbWrapper, true,
      startLightbox);
  }
};


/**
 * callback for XMLHttpRequest transfer failure
 * @param {event} event event to listen for
 */
var transferFailed = function(event) {

  // display basic error message
  thumbError.innerHTML = 'Image data could not be loaded';
};

/**
 * turn api response data into more manageable object
 * @param {object} galleryObj json response data object
 */
var parseImgData = function(galleryObj) {
  var trimmedGalleryArr = [],
    imageItems = galleryObj.data.items,
    element = {};

  // pull out just the data we care about
  imageItems.forEach(function(item){
    element = {};
    element.src = item.link;
    element.title = item.title;
    element.height = item.height;
    element.width = item.width;

    // DEMO CODE - because we're just using dummy data here, I'm going to
    // chuck out everything but jpgs
    var extension = element['src'].substring(
      element['src'].lastIndexOf('.') + 1).toLowerCase();

    //if it's not a .jpg, don't add it to the return array
    if(extension === 'jpg') {
      trimmedGalleryArr.push(element);
    }
  });

  return trimmedGalleryArr;
};

/**
 * initialize lightbox
 */
var startLightbox = function() {
  Lightbox.init('id-thumbs-wrapper');
};


// get data from Imgur api
xhr.open('GET', 'https://api.imgur.com/3/gallery/t/Aww/top/day/0');
xhr.setRequestHeader('Authorization', 'Client-ID 09d4b221f16a712');
// IE doesn't seem to respect the setting of a responsetype of JSON, so I'm
// setting this to text and will just parse into JSON once the data is returned
xhr.responseType = 'text';
xhr.addEventListener('load', transferComplete);
xhr.addEventListener('error', transferFailed);

xhr.send();