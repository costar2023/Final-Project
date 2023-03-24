/* global screenReaderText */
/**
 * Theme functions file.
 *
 * Contains handlers for navigation and widget area.
 */

( function( $ ) {
	var body, masthead, menuToggle, siteNavigation, socialNavigation, siteHeaderMenu, resizeTimer;

	function initMainNavigation( container ) {

		// Add dropdown toggle that displays child menu items.
		var dropdownToggle = $( '<button />', {
			'class': 'dropdown-toggle',
			'aria-expanded': false
		} ).append( $( '<span />', {
			'class': 'screen-reader-text',
			text: screenReaderText.expand
		} ) );

		container.find( '.menu-item-has-children > a' ).after( dropdownToggle );

		// Toggle buttons and submenu items with active children menu items.
		container.find( '.current-menu-ancestor > button' ).addClass( 'toggled-on' );
		container.find( '.current-menu-ancestor > .sub-menu' ).addClass( 'toggled-on' );

		// Add menu items with submenus to aria-haspopup="true".
		container.find( '.menu-item-has-children' ).attr( 'aria-haspopup', 'true' );

		container.find( '.dropdown-toggle' ).click( function( e ) {
			var _this            = $( this ),
				screenReaderSpan = _this.find( '.screen-reader-text' );

			e.preventDefault();
			_this.toggleClass( 'toggled-on' );
			_this.next( '.children, .sub-menu' ).toggleClass( 'toggled-on' );

			// jscs:disable
			_this.attr( 'aria-expanded', _this.attr( 'aria-expanded' ) === 'false' ? 'true' : 'false' );
			// jscs:enable
			screenReaderSpan.text( screenReaderSpan.text() === screenReaderText.expand ? screenReaderText.collapse : screenReaderText.expand );
		} );
	}
	initMainNavigation( $( '.main-navigation' ) );

	masthead         = $( '#masthead' );
	menuToggle       = masthead.find( '#menu-toggle' );
	siteHeaderMenu   = masthead.find( '#site-header-menu' );
	siteNavigation   = masthead.find( '#site-navigation' );
	socialNavigation = masthead.find( '#social-navigation' );

	// Enable menuToggle.
	( function() {

		// Return early if menuToggle is missing.
		if ( ! menuToggle.length ) {
			return;
		}

		// Add an initial values for the attribute.
		menuToggle.add( siteNavigation ).add( socialNavigation ).attr( 'aria-expanded', 'false' );

		menuToggle.on( 'click.twentysixteen', function() {
			$( this ).add( siteHeaderMenu ).toggleClass( 'toggled-on' );

			// jscs:disable
			$( this ).add( siteNavigation ).add( socialNavigation ).attr( 'aria-expanded', $( this ).add( siteNavigation ).add( socialNavigation ).attr( 'aria-expanded' ) === 'false' ? 'true' : 'false' );
			// jscs:enable
		} );
	} )();

	// Fix sub-menus for touch devices and better focus for hidden submenu items for accessibility.
	( function() {
		if ( ! siteNavigation.length || ! siteNavigation.children().length ) {
			return;
		}

		// Toggle `focus` class to allow submenu access on tablets.
		function toggleFocusClassTouchScreen() {
			if ( window.innerWidth >= 910 ) {
				$( document.body ).on( 'touchstart.twentysixteen', function( e ) {
					if ( ! $( e.target ).closest( '.main-navigation li' ).length ) {
						$( '.main-navigation li' ).removeClass( 'focus' );
					}
				} );
				siteNavigation.find( '.menu-item-has-children > a' ).on( 'touchstart.twentysixteen', function( e ) {
					var el = $( this ).parent( 'li' );

					if ( ! el.hasClass( 'focus' ) ) {
						e.preventDefault();
						el.toggleClass( 'focus' );
						el.siblings( '.focus' ).removeClass( 'focus' );
					}
				} );
			} else {
				siteNavigation.find( '.menu-item-has-children > a' ).unbind( 'touchstart.twentysixteen' );
			}
		}

		if ( 'ontouchstart' in window ) {
			$( window ).on( 'resize.twentysixteen', toggleFocusClassTouchScreen );
			toggleFocusClassTouchScreen();
		}

		siteNavigation.find( 'a' ).on( 'focus.twentysixteen blur.twentysixteen', function() {
			$( this ).parents( '.menu-item' ).toggleClass( 'focus' );
		} );
	} )();

	// Add the default ARIA attributes for the menu toggle and the navigations.
	function onResizeARIA() {
		if ( window.innerWidth < 910 ) {
			if ( menuToggle.hasClass( 'toggled-on' ) ) {
				menuToggle.attr( 'aria-expanded', 'true' );
			} else {
				menuToggle.attr( 'aria-expanded', 'false' );
			}

			if ( siteHeaderMenu.hasClass( 'toggled-on' ) ) {
				siteNavigation.attr( 'aria-expanded', 'true' );
				socialNavigation.attr( 'aria-expanded', 'true' );
			} else {
				siteNavigation.attr( 'aria-expanded', 'false' );
				socialNavigation.attr( 'aria-expanded', 'false' );
			}

			menuToggle.attr( 'aria-controls', 'site-navigation social-navigation' );
		} else {
			menuToggle.removeAttr( 'aria-expanded' );
			siteNavigation.removeAttr( 'aria-expanded' );
			socialNavigation.removeAttr( 'aria-expanded' );
			menuToggle.removeAttr( 'aria-controls' );
		}
	}

	// Add 'below-entry-meta' class to elements.
	function belowEntryMetaClass( param ) {
		if ( body.hasClass( 'page' ) || body.hasClass( 'search' ) || body.hasClass( 'single-attachment' ) || body.hasClass( 'error404' ) ) {
			return;
		}

		$( '.entry-content' ).find( param ).each( function() {
			var element              = $( this ),
				elementPos           = element.offset(),
				elementPosTop        = elementPos.top,
				entryFooter          = element.closest( 'article' ).find( '.entry-footer' ),
				entryFooterPos       = entryFooter.offset(),
				entryFooterPosBottom = entryFooterPos.top + ( entryFooter.height() + 28 ),
				caption              = element.closest( 'figure' ),
				newImg;

			// Add 'below-entry-meta' to elements below the entry meta.
			if ( elementPosTop > entryFooterPosBottom ) {

				// Check if full-size images and captions are larger than or equal to 840px.
				if ( 'img.size-full' === param ) {

					// Create an image to find native image width of resized images (i.e. max-width: 100%).
					newImg = new Image();
					newImg.src = element.attr( 'src' );

					$( newImg ).on( 'load.twentysixteen', function() {
						if ( newImg.width >= 840  ) {
							element.addClass( 'below-entry-meta' );

							if ( caption.hasClass( 'wp-caption' ) ) {
								caption.addClass( 'below-entry-meta' );
								caption.removeAttr( 'style' );
							}
						}
					} );
				} else {
					element.addClass( 'below-entry-meta' );
				}
			} else {
				element.removeClass( 'below-entry-meta' );
				caption.removeClass( 'below-entry-meta' );
			}
		} );
	}

	$( document ).ready( function() {
		body = $( document.body );

		$( window )
			.on( 'load.twentysixteen', onResizeARIA )
			.on( 'resize.twentysixteen', function() {
				clearTimeout( resizeTimer );
				resizeTimer = setTimeout( function() {
					belowEntryMetaClass( 'img.size-full' );
					belowEntryMetaClass( 'blockquote.alignleft, blockquote.alignright' );
				}, 300 );
				onResizeARIA();
			} );

		belowEntryMetaClass( 'img.size-full' );
		belowEntryMetaClass( 'blockquote.alignleft, blockquote.alignright' );
	} );



  //////////////////////////////////
  // HIDE HEADER THINGS ON SCROLL //
  //////////////////////////////////
  /*
  // Hide Header on scroll down
  var didScroll;
  var lastScrollTop = 0;
  var delta = 5;
  var navbarHeight = $('#header').outerHeight();

  $(window).scroll(function(event){
      didScroll = true;
  });

  setInterval(function() {
      if (didScroll) {
          hasScrolled();
          didScroll = false;
      }
  }, 250);

  function hasScrolled() {
      var st = $(this).scrollTop();
      var pt = core_getElementSpecsViaSelector('#page','top');

      // Make sure they scroll more than delta
      if(Math.abs(lastScrollTop - st) <= delta)
          return;

      // If they scrolled down and are past the navbar, add class .nav-up.
      // This is necessary so you never see what is "behind" the navbar.
      if (st > lastScrollTop && st > navbarHeight){
          // Scroll Down
          $('#header').removeClass('page-scrolled-down').addClass('page-scrolled-up');
      } else {
          // Scroll Up
          if(st + $(window).height() < $(document).height()) {
              $('#header').removeClass('page-scrolled-up').addClass('page-scrolled-down');
          }
      }

      if( pt < 0 ){
         $('#header').addClass('mobile-faux-header-bg');
      }else{
          $('#header').removeClass('mobile-faux-header-bg');
      }

      lastScrollTop = st;
  }
  */

} )( jQuery );


/* ------------ SHARE JAVASCRIPT ---------- */
// DECLARED VARIABLES
var menu = 0; // 0 = MENU IS CLOSED
var winWidth = $(window).width();  // WINDOW WIDTH
var winHeight = $(window).height(); // WINDOW HEIGHT
var temp;
var menuPosNum;
var menuTop;
var topLinkNum;
var topLinkTop;

$(document).ready(function() { // will be executed immediately
	winWidth = $(window).width();  // WINDOW WIDTH


	Fancybox.bind('.fancyBox');

	Fancybox.bind('.propVideo', {
		fitToView: false,
		width: '70%',
		height: '70%',
		autoSize: false,
		closeClick: false,
		openEffect: 'none',
		closeEffect: 'none',
		'transitionIn': 'elastic', // this option is for v1.3.4
		'transitionOut': 'elastic', // this option is for v1.3.4
		'fitToView' : true
	});

	Fancybox.bind('.faImages');
	menuPosNum = $("#menu").offset().top;

	if(winWidth >= 320 ) {
		menuPosNum = 40;
	}

	if(winWidth >= 768 ) {
		Fancybox.bind('.faImages', {
			maxWidth: 700,
			maxHeight: 600,
			fitToView: false,
			width: '70%',
			height: '70%',
			autoSize: false,
			closeClick: false,
			openEffect: 'none',
			closeEffect: 'none',
			'transitionIn': 'elastic', // this option is for v1.3.4
			'transitionOut': 'elastic', // this option is for v1.3.4
			'fitToView' : true
		});
	}
});

$(window).load(function () { //Run a function when the page is fully loaded

	//centerLogo();
	menuTag();
	menuScrolling();
});

$( window ).resize(function() {
	winWidth = $(window).width();

	/* if(winWidth < 768) {
		if(menu == 1) {
			$("#menu").show();
		} else {
			$("#menu").hide();
		}
	} */

	if(winWidth >= 768 ) {
		menuPosNum = 40;

      Fancybox.bind('.fancyBox2', {
				maxHeight: 600,
				fitToView: false,
				width: '70%',
				height: '70%',
				autoSize: false,
				closeClick: false,
				openEffect: 'none',
				closeEffect: 'none',
				'transitionIn': 'elastic', // this option is for v1.3.4
				'transitionOut': 'elastic', // this option is for v1.3.4
				'fitToView' : true
			});
	}


	menuScrolling();
});


$( window ).scroll( function(){ // FOR WINDOW IF SCROLLING
	winScroll =  $(window).scrollTop();
	menuScrolling();

});



function coming() {
	alert("This feature will be coming soon.");
}


function showMenu() {
	if(menu == 0) {
		$("#menu").clearQueue().stop().slideDown( function(){
		});
		$('body').addClass('mobileMenuIsVisible');
		menu = 1;
	} else {
		$("#menu").clearQueue().stop().slideUp( function(){
		});
		$('body').removeClass('mobileMenuIsVisible');
		menu = 0;
	}
}



/*
*
***************************************************************************
------------------------ FIX THE MENU AT TO THE TOP -----------------------
***************************************************************************
*/
function menuScrolling() {
	winWidth = $(window).width();
	winHeight = $(window).height();
	winScroll =  $(window).scrollTop();

	if( $('.Logo-image').length > 0 ){
		defaultImageURL = $('.Logo-image').attr('data-img-default');
		stickyImageURL  = ($('.Logo-image').attr('data-img-sticky') != '')? $('.Logo-image').attr('data-img-sticky') : defaultImageURL;
	}

	if(winWidth >= 320) {

		//console.log('winHeight: '+winHeight+', menupos: '+menuPosNum);

		//console.log(menuPosNum);
		if(winScroll >= menuPosNum) {
			$("#header, #menu").addClass("onTop");
			if( $('.Logo-image').length > 0 ){
				$('.Logo-image').attr('src', stickyImageURL);
			}

			menuTop = 1;
		} else {
			$("#header, #menu").removeClass("onTop");
			if( $('.Logo-image').length > 0 ){
				$('.Logo-image').attr('src', defaultImageURL);
			}
			menuTop = 0;
		}
	} else if(winWidth < 680) {
		$("#header, #menu").removeClass("onTop");
		$('.Logo-image').attr('src', defaultImageURL);
		menuTop = 0;
	}


	// if Gallery page where we do not show/ allow a hero
	if( $('body').hasClass('single') ){
		$("#header, #menu").addClass("onTop");
		if( $('.Logo-image').length > 0 ){
			$('.Logo-image').attr('src', stickyImageURL);
		}
		menuTop = 1;
	}

}


function centerLogo() {
	winWidth = $(window).width();
	if($(".Logo-image").length) {
		if(winWidth >= 768) {
			var logoHeight = $(".Logo-image").eq(0).height();
			console.log(logoHeight);
			logoTop = (100 - logoHeight) / 2;
			logoTop = parseInt(logoTop);
			logoTop = logoTop + 'px';
			$(".Logo-image").css('top',logoTop);
		} else {
			var logoHeight = $(".Logo-image").eq(0).height();
			console.log(logoHeight);
			logoTop = (85 - logoHeight) / 2;
			logoTop = parseInt(logoTop);
			logoTop = logoTop + 'px';
			$(".Logo-image").css('top', logoTop);
		}
	}

}

function menuTag() {

	$("#menu ul li a").each(function(index) {
		var title = $(this).attr('title');
		if(title) {
			var links = $(this).attr('href');
			//console.log(title + ' ' + title.search("#"));
			if(title.search("#")) {
				links = links + '#' + title;
			} else {
				links = links + title;
			}
			$(this).attr('href',links);
		}
	});
}

var fontSize = 0;

var variables = '#page div, #page h1, #page a, #page li, #page ul, #getinTouch div, #getinTouch h1, #getinTouch a, #getinTouch li, #getinTouch ul, #footer div, #footer, #footer h1, #footer li, #footer ul, #page input, #page label';

function increaseFont() {
	if(fontSize < 4) {
		$( variables ).each(function( index ) {
			if($(this).css('font-size') != '') {
				var boxFont = $(this).css('font-size');
				console.log(boxFont);
				boxFont = parseInt(boxFont) + 2;
				boxFont = boxFont + 'px';
				$(this).css('font-size', boxFont);
				//console.log(boxFont);
			}
		});

		fontSize = fontSize + 2;
		//console.log(fontSize);
	}
}

function decreaseFont() {
	if(fontSize > 0) {
		$( variables ).each(function( index ) {
			if($(this).css('font-size') != '' && $(this).css('font-size') != null) {
				var boxFont2 = '';
				boxFont2 = $(this).css('font-size');
				boxFont2 = parseInt(boxFont2) - 2;
				boxFont2 = boxFont2 + 'px';
				$(this).css('font-size', boxFont2);
			}
			if(fontSize <= 0) {
				$(this).css('font-size', '');
			}
		});
		fontSize = fontSize - 2;
		//console.log(fontSize);
	}
}