/**
 * Lightbox module.
 */

(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Lightbox = factory();
  }

}(this, function () {

  //declare and initialize vars
  var $overlayEl,
    $previousButtonEl,
    $nextButtonEl,
    $closeButtonEl,
    $imageContainerEl,
    $imageEl,
    $captionEl,
    $imageActionsEl,
    $imageDownloadEl,
    $imageLinkOutEl,
    $spinnerEl,
    gallery = [],
    currentImageIndex = 0,
    navButtonWidth = 50,
    navButtonMargin = 16,
    captionHeight = 64,
    maxImageHeight = window.innerHeight - (navButtonMargin * 2) - captionHeight,
    maxImageWidth = window.innerWidth - ((navButtonWidth * 2) +
      (navButtonMargin * 4)),
    linkoutIcon = '<i class="fa fa-external-link v-text-2"></i>',
    downloadIcon = '<i class="fa fa-cloud-download v-text-2"></i>',
    isDownloadAttrSupported =
      (navigator.userAgent.toLowerCase().indexOf('chrome') > -1);

  /**
   * bind event utility (private)
   * @param {element} element DOM element to which to bind the event
   * @param {event} event event to listen for
   * @param {function} callback function to be executed on event
   */
  var _bind = function(element, event, callback) {
    element.addEventListener(event, callback, false);
  };

  /**
   * unbind event utility (private)
   * @param {element} element DOM element from which to unbind the event
   * @param {event} event event to listen for
   * @param {function} callback function to be executed on event
   */
  var _unbind = function(element, event, callback) {
    element.removeEventListener(event, callback, false);
  };

  /**
   * event handler for previous button (private)
   * @param {event} event button click event
   */
  var _previousButtonEventHandler = function(event) {
    // we don't technically need this check if we're only supporting the
    // latest version of IE, but probably good practice to include it anyway
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    showPreviousImage();
  };

  /**
   * event handler for next button (private)
   * @param {event} event button click event
   */
  var _nextButtonEventHandler = function(event) {
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    showNextImage();
  };

  /**
   * event handler for close button (private)
   * @param {event} event button click event
   */
  var _closeButtonEventHandler = function(event) {
    event.stopPropagation ? event.stopPropagation() : event.cancelBubble = true;
    closeLightbox();
  };

  /**
   * event handler for clicks on image thumbnails (private)
   * @param {number} imageIndex index of image in images array
   */
  var _thumbsEventHandler = function(imageIndex) {
    _showLightbox(imageIndex);
  };

  /**
   * bind events for thumbs that spawn the lightbox (private)
   * @param {string} selector classname of thumb container element
   */
  var _bindThumbUIEvents = function(selector) {
    var gallery = document.getElementsByClassName(selector)[0],
      thumbs = gallery.getElementsByTagName('a');

    // get our array of thumb info
    _buildGallery(thumbs);

    // bind an event handler to each thumb so it spawns the lightbox
    [].forEach.call(thumbs, function(thumb, thumbIndex) {
      _bind(thumb, 'click', function(){_thumbsEventHandler(thumbIndex)});
    });
  };

  /**
   * bind events for UI elements within the lightbox, e.g. next/previous
   * buttons and close button (private)
   */
  var _bindLightboxUIEvents = function() {
    _bind($previousButtonEl, 'click', _previousButtonEventHandler);
    _bind($nextButtonEl, 'click', _nextButtonEventHandler);
    _bind($closeButtonEl, 'click', _closeButtonEventHandler);
  };

  var keyboardEventHandler = function(event) {
    switch(event.keyCode) {
      // Esc
      case 27:
        closeLightbox();
        break;
      // Left arrow
      case 37:
        showPreviousImage();
        break;
      // Right arrow
      case 39:
        showNextImage();
        break;
    }
  };

  /**
   * build out all the UI elements for the lightbox (private)
   */
  var _buildUI = function() {
    $overlayEl = document.querySelector('id-overlay');

    // Check if the overlay already exists
    if($overlayEl) {
      $previousButtonEl = document.querySelector('id-previous-button');
      $nextButtonEl = document.querySelector('id-next-button');
      $closeButtonEl = document.querySelector('id-close-button');
      $imageContainerEl = document.querySelector('id-image-container');
      return;
    }

    // Create overlay element
    $overlayEl = document.createElement('div');

    // add classes to overlay
    $overlayEl.classList.add('id-overlay', 'ui-backdrop', 'v-bg-black-50',
      's-flex', 'u-flex', 'u-flex-alignitems-center',
      'u-flex-justifycontent-spacebetween', 'u-hidden', 'v-fade',
      'v-opacity-0', 'v-opacity-100');

    // append overlay to body
    document.getElementsByTagName('body')[0].appendChild($overlayEl);

    // create previous button, add classes, add chevron, and append to overlay
    $previousButtonEl = document.createElement('button');
    $previousButtonEl.classList.add('id-previous-button', 'ui-round-button',
      'v-bg-black-75', 'v-bordercolor-white', 'u-margin-left-1');
    $previousButtonEl.innerHTML =
      '<i class="fa fa-angle-left fa-2x v-font-white"></i>';
    $overlayEl.appendChild($previousButtonEl);

    // create loading spinner, add classes, and append to overlay
    $spinnerEl = document.createElement('span');
    $spinnerEl.classList.add('fa', 'fa-refresh', 'fa-spin', 'fa-2x',
      'v-font-lightgray');
    $overlayEl.appendChild($spinnerEl);

    // create a container for the image, caption, and close button
    // add classes and append container to overlay
    $imageContainerEl = document.createElement('div');
    $imageContainerEl.classList.add('id-image-container',
      'u-position-relative', 'v-fade', 'u-hidden', 'v-opacity-100');
    $imageContainerEl.innerHTML = '';
    $overlayEl.appendChild($imageContainerEl);

    // create image element, add classes, and append to image container
    $imageEl = new Image();
    $imageEl.classList.add('u-display-block');
    $imageContainerEl.appendChild($imageEl);

    // create caption element, add classes, and append to image container
    $captionEl = document.createElement('div');
    $captionEl.classList.add('v-bg-black', 'v-font-white', 'u-height-4',
      'u-position-relative', 's-flex', 'u-flex-alignitems-center');
    $imageContainerEl.appendChild($captionEl);

    // create actions container and actions
    $imageActionsEl = document.createElement('div');
    $imageActionsEl.classList.add('u-margin-left-auto', 'u-margin-right-1');
    $imageLinkOutEl = document.createElement('a');
    $imageLinkOutEl.classList.add('v-font-white');
    $imageLinkOutEl.setAttribute('target', '_blank');
    $imageLinkOutEl.innerHTML = linkoutIcon;

    $imageActionsEl.appendChild($imageLinkOutEl);

    // if direct download is supported, add an extra download link
    if(isDownloadAttrSupported) {
      $imageDownloadEl = document.createElement('a');
      $imageDownloadEl.classList.add('v-font-white', 'u-margin-left-1');
      $imageDownloadEl.setAttribute('download', true);
      $imageDownloadEl.innerHTML = downloadIcon;

      $imageActionsEl.appendChild($imageDownloadEl);
    }

    // create next button, add classes, add chevron, and append to overlay
    $nextButtonEl = document.createElement('button');
    $nextButtonEl.classList.add('id-next-button', 'ui-round-button',
      'v-bg-black-75', 'v-bordercolor-white', 'u-margin-right-1');
    $nextButtonEl.innerHTML =
      '<i class="fa fa-angle-right fa-2x v-font-white"></i>';
    $overlayEl.appendChild($nextButtonEl);

    // create close button, add classes, and append to image container
    $closeButtonEl = document.createElement('button');
    $closeButtonEl.classList.add('id-close-button', 'ui-round-button-small',
      'v-bg-black-75', 'v-bordercolor-white', 'v-font-white',
      'u-position-absolute', 'u-top-neg1', 'u-right-neg1');
    $closeButtonEl.innerHTML = '<i class="fa fa-times fa-1x v-font-white"></i>';
    $imageContainerEl.appendChild($closeButtonEl);

    // once all elemnts are created, bind events to them
    _bindLightboxUIEvents();
  };

  /**
   * build out all the UI elements for the lightbox (private)
   * @param {Object} imageNodes link elements containing image elements
   */
  var _buildGallery = function(imageNodes) {
    // loop through all image nodes to get at details
    [].forEach.call(imageNodes, function(imageNode) {
      var imageDetails = {},
        image;

      // verify that we're dealing with the a tag and not the img
      if(imageNode.tagName.toLowerCase() === 'a') {
        image = imageNode.children[0];
      } else {
        image = imageNode;
      }

      // store all relevant details in an object
      imageDetails.src = image.getAttribute('data-src');
      imageDetails.title = image.getAttribute('title');
      imageDetails.height = image.getAttribute('data-height');
      imageDetails.width = image.getAttribute('data-width');

      // push object to gallery array
      gallery.push(imageDetails);
    });
  };

  /**
   * show the lightbox and associate UI elements with an image (private)
   * @param {number} imageIndex index of the selected image
   */
  var _showLightbox = function(imageIndex) {
    // set currentimage index to selected image index
    currentImageIndex = imageIndex;

    // load the image based on newly set currentImageIndex
    _loadImage(currentImageIndex);

    // bind keyboard events
    _bind(document, 'keydown', keyboardEventHandler);

    // unhide the overlay
    $overlayEl.classList.remove('u-hidden');
    setTimeout(function() {
      $overlayEl.classList.remove('v-opacity-0');
    }, 10);

  };

  /**
   * load image through its details (private)
   * @param {number} currentImageIndex index of the image in the gallery array
   */
  var _loadImage = function(currentImageIndex) {

    // hide the image container for a moment so we can show the spinner
    $imageContainerEl.classList.add('v-opacity-0');
    $imageContainerEl.classList.add('u-hidden');

    // unhide the spinner
    _showSpinner();

    // store current image entry,
    // get resized dimensions for image
    var currentImage = gallery[currentImageIndex],
      resizedDimensions = _getNewImageDimensions(currentImage.height,
        currentImage.width);

    //take care of disabling the relevant buttons if we're on the first or last
    // image
    if(currentImageIndex === gallery.length - 1) {
      _disableButton($nextButtonEl);
    } else {
      _enableButton($nextButtonEl);
    }

    if(currentImageIndex === 0) {
      _disableButton($previousButtonEl);
    } else {
      _enableButton($previousButtonEl);
    }

    // remove image actions
    if ($imageActionsEl.parentNode === $captionEl) {
      $captionEl.removeChild($imageActionsEl);
    }

    // update the caption text
    $captionEl.innerHTML = '<p class="u-margin-0 u-padding-1' +
      ' u-maxwidth-75 u-truncate">' +
      currentImage.title + '</p>';

    $imageLinkOutEl.href = currentImage.src;

    if($imageDownloadEl) {
      $imageDownloadEl.href = currentImage.src;
    }

    $captionEl.appendChild($imageActionsEl);

    // size the caption wrapper to the same size as image
    $captionEl.setAttribute('style', 'width: ' + resizedDimensions.width +
      'px;');

    // when the image loads, hide the spinner and show the image container
    $imageEl.onload = function() {

      setTimeout(function() {
        _hideSpinner();
        $imageContainerEl.classList.remove('u-hidden');
        setTimeout(function() {
          $imageContainerEl.classList.remove('v-opacity-0');
        }, 50);
      }, 25);
    };

    // apply resized dimensions to image and set image source
    $imageEl.setAttribute('height', resizedDimensions.height);
    $imageEl.setAttribute('width', resizedDimensions.width);
    $imageEl.src = currentImage.src;

  };

  /**
   * show the loading spinner (private)
   */
  var _showSpinner = function() {
    $spinnerEl.classList.remove('u-hidden');
  };

  /**
   * hide the loading spinner (private)
   */
  var _hideSpinner = function() {
    $spinnerEl.classList.add('u-hidden');
  };

  /**
   * get new image dimensions based on size of viewport (private)
   * @param {number} height height of the image
   * @param {number} width width of the image
   */
  var _getNewImageDimensions = function(height, width) {

    var resizedDimensions = {
      width: width,
      height: height
    },
      imageRatio = height / width;

    //there has to be a better way to do this
    if(width >= maxImageWidth && imageRatio <= 1){
      resizedDimensions.width = maxImageWidth;
      resizedDimensions.height = resizedDimensions.width * imageRatio;

      if(resizedDimensions.height > maxImageHeight) {
        resizedDimensions.height = maxImageHeight;
        resizedDimensions.width = resizedDimensions.height / imageRatio;
      }
    } else if(height >= maxImageHeight){
      resizedDimensions.height = maxImageHeight;
      resizedDimensions.width = resizedDimensions.height / imageRatio;

      if(resizedDimensions.width > maxImageWidth) {
        resizedDimensions.width = maxImageWidth;
        resizedDimensions.height = resizedDimensions.width / imageRatio;
      }
    }

    return resizedDimensions;
  };

  /**
   * enable UI button by removing reduced opacity, changing cursor back to a
   * pointer and removing the disabled attribute (private)
   * @param {element} $buttonEl button element
   */
  var _enableButton = function($buttonEl) {
    $buttonEl.classList.remove('v-opacity-25', 'v-cursor-arrow');
    $buttonEl.removeAttribute('disabled');
  };

  /**
   * disable UI button by reducing opacity, changing cursor to the default arrow
   * and adding the disabled attribute (private)
   * @param {element} $buttonEl button element
   */
  var _disableButton = function($buttonEl) {
    $buttonEl.classList.add('v-opacity-25', 'v-cursor-arrow');
    $buttonEl.setAttribute('disabled', 'true');
  };

  /**
   * disable UI button by reducing opacity, changing cursor to the default arrow
   * and adding the disabled attribute (public)
   * @param {string} selector class name of thumb container
   */
  var init = function(selector) {
    _buildUI();
    _bindThumbUIEvents(selector);
  };

  /**
   * show the previous image in the gallery (public)
   */
  var showPreviousImage = function() {
    _loadImage(currentImageIndex-=1);
  };

  /**
   * show the next image in the gallery (public)
   */
  var showNextImage = function() {
    _loadImage(currentImageIndex+=1);
  };

  /**
   * hide lightbox (public)
   */
  var closeLightbox = function() {
    currentImageIndex = 0;

    // remove keyboard event handlers when lightbox closes for tidiness
    _unbind(document, 'keydown', keyboardEventHandler);

    // add opacity class so lightbox fades
    $overlayEl.classList.add('v-opacity-0');

    // wait until after fade to set as hidden
    setTimeout(function() {
      $overlayEl.classList.add('u-hidden');
    }, 250);

  };

  // return public methods
  return {
    init: init,
    showPreviousImage: showPreviousImage,
    showNextImage: showNextImage,
    closeLightbox: closeLightbox
  };
}));