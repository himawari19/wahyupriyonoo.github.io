(function($) {
  "use strict";
  var is_scroll = false;
  var is_resize = false;
  var myscroll, myresize;

  //Run function when document ready
  $(document).ready(function() {
    init_full_height();
    init_pageloader();
    init_menu_toggle();
    init_inner_link();
  });

  //Run function when window on scroll
  $(window).on("scroll", function() {
    init_scroll();
    is_scroll = true;
    clearTimeout(myscroll);
    myscroll = setTimeout(function() {
      is_scroll = false;
      init_update_uikit();
    }, 300);
  });

  //Run function when window on resize
  $(window).on("resize", function() {
    is_resize = true;
    clearTimeout(myresize);
    myresize = setTimeout(function() {
      is_resize = false;
      init_full_height();
      init_scroll();
    }, 300);
  });

  //============================================
  //initial functions
  //============================================

  function init_update_uikit() {
    //sometimes sticky nav oveflow
    if (!is_scroll) {
      if ($("#resume-nav-wrapper").length) {
        UIkit.update($("#resume-nav-wrapper"), "update");
      }

      if ($("#portfolio-nav-wrapper").length) {
        UIkit.update($("#portfolio-nav-wrapper"), "update");
      }
    }
  }

  function init_menu_toggle() {
    $(".yb-menu-togggle").on("click", function() {
      $("#body-app").toggleClass("yb-menu-open");
    });

    $("#btn-menu-toggle").on("click", function() {
      $("#main-menu").toggleClass("open-menu");
      return false;
    });

    $("#menucollapse .uk-navbar-nav a").on("click", function() {
      $("#main-menu").toggleClass("open-menu");
    });
  }

  function init_scroll() {
    if (!is_resize) {
      var window_height =
        $("#main-header").height() - ($("#main-menu").height() + 1);
      var current_scroll = Math.round($(window).scrollTop());
      if (current_scroll >= window_height) {
        $("#main-menu").addClass("fixed");
      } else {
        $("#main-menu").removeClass("fixed");
      }
    }
  }

  function init_full_height() {
    if (!is_resize) {
      let vh = window.innerHeight * 0.01;
      $(":root").css("--vh", vh + "px");
    }
  }

  function init_pageloader() {
    var $pageloader = $("#pageloader");
    setTimeout(function() { 
      $pageloader.addClass("uk-transition-fade");
      setTimeout(function() {
        $pageloader.addClass("page-is-loaded");
        init_check_hash_url();
      }, 400);
    }, 300);
  }

  function init_inner_link() {
    $(".yb-inner-link").on("click", function() {
      var $el = $(this).attr("href");
      var ofsset = parseInt($(this).attr("data-offset"));
      if ($($el).length) {
        ofsset = ofsset > 0 ? ofsset : 79;
        init_scroll_to($($el), 1500, ofsset);
        return false;
      }
    });
  }

  function init_check_hash_url() {
    if (window.location.hash && window.location.hash !="" && $(window.location.hash).length) {
      var speed = window.location.hash == "#home" ? 0 : 700;
      init_scroll_to($(window.location.hash), speed, 79);
    }
  }

  function init_scroll_to($el, speed, offset) {
    $("html, body").animate(
      {
        scrollTop: $el.offset().top - offset
      },
      {
        duration: speed,
        easing: "easeInOutExpo"
      }
    );
  }
})(jQuery);
