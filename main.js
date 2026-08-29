document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     ELEMENTS
  ===================================================== */

  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll(".nav-link");
  const nav = document.getElementById("nav");
  const menuToggle = document.getElementById("menu-toggle");
  const transition = document.getElementById("page-transition");

  let currentPage =
    document.querySelector(".page.active");

  let isChangingPage = false;

  /* =====================================================
   RANDOM FRONT TEXT REVEAL
   ===================================================== */

function prepareFrontText(root) {

    if (!root) return;

    /*
       Only animate the visible foreground text.
       Images, cards and layouts are untouched.
    */

    const textElements =
        root.querySelectorAll(
            ".hero-copy h1, " +
            ".hero-copy .eyebrow, " +
            ".hero-copy .tagline, " +
            ".hero-copy .hero-actions a, " +
            ".page-hero h1, " +
            ".page-hero > p, " +
            ".creatures-heading h1, " +
            ".creatures-heading > p"
        );


    textElements.forEach(element => {

        if (
            element.dataset.frontAnimated === "true"
        ) {
            return;
        }


        const walker =
            document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode(node) {

                        if (
                            !node.nodeValue ||
                            !node.nodeValue.length
                        ) {
                            return NodeFilter.FILTER_REJECT;
                        }

                        return NodeFilter.FILTER_ACCEPT;
                    }
                }
            );


        const nodes = [];

        let node;

        while (
            (node = walker.nextNode())
        ) {
            nodes.push(node);
        }


        nodes.forEach(textNode => {

            const fragment =
                document.createDocumentFragment();


            [...textNode.nodeValue].forEach(char => {

                const span =
                    document.createElement("span");


                span.className =
                    "front-letter";


                span.textContent =
                    char;


                fragment.appendChild(span);

            });


            textNode.parentNode.replaceChild(
                fragment,
                textNode
            );

        });


        element.dataset.frontAnimated =
            "true";

    });

}


/* =====================================================
   RANDOMIZE LETTER APPEARANCE
   ===================================================== */

function revealFrontText(root) {

    if (!root) return;

    prepareFrontText(root);


    const letters = [
        ...root.querySelectorAll(
            ".front-letter"
        )
    ];


    /*
       Random order.
    */

    const shuffled =
        [...letters].sort(
            () => Math.random() - 0.5
        );


    /*
       Reset first.
    */

   letters.forEach(letter => {

    letter.classList.remove(
        "front-letter"
    );

    letter.style.removeProperty(
        "--letter-delay"
    );

});

    /*
       Add the animation back in random order.
    */

    shuffled.forEach(
        (letter, index) => {

            letter.classList.add(
                "front-letter"
            );

            letter.style.setProperty(
                "--letter-delay",
                `${index * 5 + Math.random() * 35}ms`
            );

        }
    );

}


  /* =====================================================
     PAGE NAVIGATION
  ===================================================== */

  function showPage(pageName, updateURL = true) {

    const target =
      document.querySelector(
        `.page[data-page-section="${pageName}"]`
      );

    if (!target) return;

    if (target === currentPage) {
      if (updateURL) {
        history.replaceState(
          { page: pageName },
          "",
          `#${pageName}`
        );
      }
      return;
    }

    if (isChangingPage) return;

    isChangingPage = true;


    /* Close mobile menu */

    if (nav) {
      nav.classList.remove("open");
    }


    /* Fog transition */

    if (transition) {
      transition.classList.remove("active");
      void transition.offsetWidth;
      transition.classList.add("active");
    }


    /* Fade current page slightly */

    if (currentPage) {
      currentPage.style.opacity = "0";
      currentPage.style.transform = "scale(1.01)";
      currentPage.style.filter = "blur(4px)";
      currentPage.style.transition =
        "opacity .32s ease, transform .32s ease, filter .32s ease";
    }


    setTimeout(() => {

      pages.forEach(page => {
        page.classList.remove("active", "entering");
        page.style.opacity = "";
        page.style.transform = "";
        page.style.filter = "";
        page.style.transition = "";
      });


      target.classList.add("active");

revealFrontText(target);


/* Restart entry animation */

void target.offsetWidth;

      target.classList.add("entering");

      currentPage = target;


      /* Active navigation */

      navLinks.forEach(link => {
        link.classList.toggle(
          "active",
          link.dataset.page === pageName
        );
      });


      /* Update URL without reloading */

      if (updateURL) {
        history.pushState(
          { page: pageName },
          "",
          `#${pageName}`
        );
      }


      /* Always start new view at top */

      window.scrollTo({
        top: 0,
        behavior: "auto"
      });


      setTimeout(() => {

        target.classList.remove("entering");

        if (transition) {
          transition.classList.remove("active");
        }

        isChangingPage = false;

      }, 850);

    }, 340);
  }


  /* =====================================================
     NAVIGATION CLICK
  ===================================================== */

  navLinks.forEach(link => {

    link.addEventListener("click", event => {

      const pageName =
        link.dataset.page;

      if (!pageName) return;

      event.preventDefault();

      showPage(pageName);

    });

  });


  /* =====================================================
   MOBILE MENU
===================================================== */

if (menuToggle && nav) {

  menuToggle.addEventListener("click", function (e) {

    e.preventDefault();
    e.stopPropagation();

    const isOpen = nav.classList.contains("open");

    if (isOpen) {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open menu");
    } else {
      nav.classList.add("open");
      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close menu");
    }

  });

}


  /* =====================================================
     BROWSER BACK / FORWARD
  ===================================================== */

  window.addEventListener("popstate", () => {

    const pageName =
      location.hash.replace("#", "") ||
      "home";

    showPage(pageName, false);

  });


  /* =====================================================
     INITIAL PAGE
  ===================================================== */

  const initialPage =
    location.hash.replace("#", "") ||
    "home";

  const initialTarget =
    document.querySelector(
      `.page[data-page-section="${initialPage}"]`
    );

  if (initialTarget) {

    pages.forEach(page =>
      page.classList.remove("active")
    );

    initialTarget.classList.add("active");

    currentPage = initialTarget;

    navLinks.forEach(link => {

      link.classList.toggle(
        "active",
        link.dataset.page === initialPage
      );

    });
    revealFrontText(initialTarget);

  }


  /* =====================================================
     ESC = GO BACK
  ===================================================== */

  document.addEventListener("keydown", event => {

    if (event.key !== "Escape") return;

    if (nav && nav.classList.contains("open")) {

      nav.classList.remove("open");

      return;

    }

    if (
      currentPage &&
      currentPage.dataset.pageSection !== "home"
    ) {

      showPage("home");

    }

  });


  /* =====================================================
     REVEAL NOTES
  ===================================================== */

  document
    .querySelectorAll(".reveal-btn")
    .forEach(button => {

      button.addEventListener("click", () => {

        const target =
          document.getElementById(
            button.dataset.target
          );

        if (!target) return;

        const isVisible =
          target.classList.toggle("show");

        const isDescription =
          button.dataset.target &&
          button.dataset.target.includes("-note") &&
          button.closest(".creature-card");

        button.textContent =
          isVisible
            ? "HIDE DESCRIPTION"
            : isDescription
              ? "DESCRIPTION"
              : "REVEAL NOTES";

      });

    });


    /* =====================================================
     INTERACTIVE ENDING TREE
  ===================================================== */

  const tree =
    document.getElementById("decision-tree");

  const resetTree =
    document.getElementById("reset-tree");

  const pathReadout =
    document.getElementById("tree-path");


  if (tree) {

    const visibleSelector =
      ".tree-branch.tree-visible, " +
      ".tree-result.tree-visible";


    /* =====================================================
       CLEAR VISIBLE TREE PANELS
    ===================================================== */

    function clearVisibleTree() {

      tree
        .querySelectorAll(visibleSelector)
        .forEach(item => {

          item.classList.remove(
            "tree-visible"
          );

        });

    }


    /* =====================================================
       UPDATE PATH READOUT
    ===================================================== */

    function setTreePath(path) {

      if (!pathReadout) return;

      pathReadout.textContent =
        path || "BEGINNING";

    }


    /* =====================================================
       SHOW TREE ELEMENT
    ===================================================== */

    function showTreeElement(id, path) {

      const element =
        document.getElementById(id);

      if (!element) return;


      clearVisibleTree();

      setTreePath(path);


      setTimeout(() => {

        element.classList.add(
          "tree-visible"
        );


        setTimeout(() => {

          element.scrollIntoView({
            behavior: "smooth",
            block: "center"
          });

        }, 160);

      }, 120);

    }


    /* =====================================================
       ENDING ROUTES
    ===================================================== */

    const routes = {

      main:
        "branch-main",

      ngplus:
        "branch-ngplus",

      leave:
        "result-leave-ending",

      "maria-ending":
        "result-maria-ending",

      "water-ending":
        "result-water-ending",

      rebirth:
        "result-rebirth-ending",

      stillness:
        "result-stillness-ending",

      bliss:
        "result-bliss-ending",

      dog:
        "result-dog-ending",

      ufo:
        "result-ufo-ending",

      "all-ngplus":
        "result-all-ngplus-ending"

    };


    /* =====================================================
       TREE BUTTONS
    ===================================================== */

    tree.addEventListener(
      "click",
      event => {

        const choice =
          event.target.closest(
            ".tree-choice"
          );


        if (
          !choice ||
          !tree.contains(choice)
        ) {
          return;
        }


        const next =
          choice.dataset.next;


        if (!next) {
          return;
        }


        /* Selected state */

        const siblings =
          choice.parentElement
            ? choice.parentElement
                .querySelectorAll(
                  ".tree-choice"
                )
            : [];


        siblings.forEach(button => {

          button.classList.remove(
            "selected"
          );

          button.style.opacity =
            ".35";

        });


        choice.classList.add(
          "selected"
        );

        choice.style.opacity =
          "1";


        /* Find target */

        const targetId =
          routes[next];


        if (!targetId) {
          return;
        }


        const path =
          choice.dataset.path ||
          next.toUpperCase();


        showTreeElement(
          targetId,
          path
        );

      }
    );


    /* =====================================================
       RESET
    ===================================================== */

    if (resetTree) {

      resetTree.addEventListener(
        "click",
        () => {

          clearVisibleTree();


          tree
            .querySelectorAll(
              ".tree-choice"
            )
            .forEach(button => {

              button.classList.remove(
                "selected"
              );

              button.style.opacity =
                "1";

            });


          setTreePath(
            "BEGINNING"
          );


          const start =
            document.getElementById(
              "node-start"
            );


          if (start) {

            start.scrollIntoView({
              behavior: "smooth",
              block: "center"
            });

          }

        }
      );

    }

  }


  /* =====================================================
     ENDING IMAGE DATA
  ===================================================== */

  const endingPhotoData = {

    "result-rebirth-ending": [

      {
        image:
          "assets/endings/rebirth/crimson-ceremony-01.jpg",
        alt:
          "Crimson Ceremony location",
        caption:
          "CRIMSON CEREMONY — GRAVEYARD"
      },

      {
        image:
          "assets/endings/rebirth/white-chrism-01.jpg",
        alt:
          "White Chrism location",
        caption:
          "WHITE CHRISM — BALDWIN MANSION"
      },

      {
        image:
          "assets/endings/rebirth/obsidian-goblet-01.jpg",
        alt:
          "Obsidian Goblet location",
        caption:
          "OBSIDIAN GOBLET — HISTORICAL SOCIETY"
      },

      {
        image:
          "assets/endings/rebirth/lost-memories-01.jpg",
        alt:
          "Lost Memories location",
        caption:
          "LOST MEMORIES — LAKEVIEW HOTEL"
      }

    ],


    "result-stillness-ending": [

      {
        image:
          "assets/endings/stillness/key-of-sorrow-01.jpg",
        alt:
          "Key of Sorrow location",
        caption:
          "KEY OF SORROW — WILTSE ROAD"
      },

      {
        image:
          "assets/endings/stillness/toluca-postcard-03.jpg",
        alt:
          "Stillness safe",
        caption:
          "RUINED HOTEL — MANAGER'S OFFICE SAFE"
      },

      {
        image:
          "assets/endings/stillness/toluca-postcard-04.jpg",
        alt:
          "Toluca Postcard",
        caption:
          "TOLUCA POSTCARD"
      },

      {
        image:
          "assets/endings/stillness/key-of-sorrow-02.jpg",
        alt:
          "Key of Sorrow route map",
        caption:
          "SOUTH VALE — KEY OF SORROW ROUTE"
      }

    ],


    "result-bliss-ending": [

      {
        image:
          "assets/endings/bliss/rusted-key-01.jpg",
        alt:
          "Rusted Key location",
        caption:
          "RUSTED KEY — PETE'S BOWL-O-RAMA"
      },

      {
        image:
          "assets/endings/bliss/small-chest-01.jpg",
        alt:
          "Small Chest location",
        caption:
          "SMALL CHEST — BROOKHAVEN GARDEN"
      },

      {
        image:
          "assets/endings/bliss/white-claudia.jpg",
        alt:
          "White Claudia",
        caption:
          "WHITE CLAUDIA"
      },

      {
        image:
          "assets/endings/bliss/room-312.jpg",
        alt:
          "Hotel Room 312",
        caption:
          "LAKEVIEW HOTEL — ROOM 312"
      }

    ],


    "result-dog-ending": [

      {
        image:
          "assets/endings/dog/broken-key-part-01-a.jpg",
        alt:
          "Pet Center location",
        caption:
          "BROKEN KEY PART #1 — PET CENTER"
      },

      {
        image:
          "assets/endings/dog/broken-key-part-02-a.jpg",
        alt:
          "Dog house location",
        caption:
          "BROKEN KEY PART #2 — DOG HOUSE"
      },

      {
        image:
          "assets/endings/dog/dog-key.jpg",
        alt:
          "Dog Key",
        caption:
          "DOG KEY — COMBINED KEY PARTS"
      },

      {
        image:
          "assets/endings/dog/observation-room.jpg",
        alt:
          "Observation Room",
        caption:
          "LAKEVIEW HOTEL — OBSERVATION ROOM"
      }

    ],


    "result-ufo-ending": [

      {
        image:
          "assets/endings/ufo/blue-gem-01.jpg",
        alt:
          "Blue Gem location",
        caption:
          "BLUE GEM — THE SILENT JEWELLERS"
      },

      {
        image:
          "assets/endings/ufo/location-01-a.jpg",
        alt:
          "UFO location one",
        caption:
          "LOCATION 1 — SAUL STREET APARTMENTS"
      },

      {
        image:
          "assets/endings/ufo/location-02-a.jpg",
        alt:
          "UFO location two",
        caption:
          "LOCATION 2 — ROSEWATER PARK"
      },

      {
        image:
          "assets/endings/ufo/location-03-a.jpg",
        alt:
          "UFO location three",
        caption:
          "LOCATION 3 — LAKEVIEW HOTEL PIER"
      },

      {
        image:
          "assets/endings/ufo/final-location-room-312.jpg",
        alt:
          "UFO final location",
        caption:
          "LOCATION 4 — ROOM 312"
      }

    ]

  };


  /* =====================================================
     EXTRA VISUAL EVIDENCE
  ===================================================== */

  const extraEndingGalleries = {

    "result-rebirth-ending": [

      [
        "assets/endings/rebirth/crimson-ceremony-03.jpg",
        "Crimson Ceremony item",
        "CRIMSON CEREMONY — ITEM"
      ],

      [
        "assets/endings/rebirth/white-chrism-03.jpg",
        "White Chrism item",
        "WHITE CHRISM — ITEM"
      ],

      [
        "assets/endings/rebirth/obsidian-goblet-03.jpg",
        "Obsidian Goblet item",
        "OBSIDIAN GOBLET — ITEM"
      ],

      [
        "assets/endings/rebirth/lost-memories-03.jpg",
        "Lost Memories item",
        "LOST MEMORIES — ITEM"
      ]

    ],


    "result-stillness-ending": [

      [
        "assets/endings/stillness/note-01-a.jpg",
        "Wood Side Apartments clue",
        "CLUE 01 — WOOD SIDE APARTMENTS"
      ],

      [
        "assets/endings/stillness/note-02-a.jpg",
        "Brookhaven Hospital clue",
        "CLUE 02 — BROOKHAVEN HOSPITAL"
      ],

      [
        "assets/endings/stillness/note-03-a.jpg",
        "Lakeview Hotel clue",
        "CLUE 03 — LAKEVIEW HOTEL"
      ],

      [
        "assets/endings/stillness/toluca-postcard-02.jpg",
        "Stillness safe",
        "SAFE — COMBINATION 314"
      ]

    ],


    "result-bliss-ending": [

      [
        "assets/endings/bliss/rusted-key-02.jpg",
        "Rusted Key safe",
        "PETE'S BOWL-O-RAMA — SAFE"
      ],

      [
        "assets/endings/bliss/cryptic-letter.jpg",
        "Cryptic Letter",
        "CRYPTIC LETTER"
      ],

      [
        "assets/endings/bliss/small-chest-02.jpg",
        "Small Chest",
        "SMALL CHEST — ITEM"
      ]

    ],


    "result-dog-ending": [

      [
        "assets/endings/dog/broken-key-part-01-b.jpg",
        "Eastern South Vale map",
        "DOG ROUTE — EASTERN SOUTH VALE"
      ],

      [
        "assets/endings/dog/broken-key-part-02-b.jpg",
        "Western South Vale map",
        "DOG ROUTE — WESTERN SOUTH VALE"
      ]

    ],


    "result-ufo-ending": [

      [
        "assets/endings/ufo/blue-gem-04.jpg",
        "Blue Gem",
        "BLUE GEM — ITEM"
      ],

      [
        "assets/endings/ufo/location-01-b.jpg",
        "Saul Street Apartments",
        "BLUE GEM — LOCATION 1"
      ],

      [
        "assets/endings/ufo/location-02-b.jpg",
        "Rosewater Park",
        "BLUE GEM — LOCATION 2"
      ],

      [
        "assets/endings/ufo/location-03-b.jpg",
        "Lakeview Hotel pier",
        "BLUE GEM — LOCATION 3"
      ]

    ]

  };


  /* =====================================================
     IMAGE BUTTON CREATOR
  ===================================================== */

  function createEndingPhotoButton(
    image,
    alt,
    caption
  ) {

    const button =
      document.createElement("button");

    button.type =
      "button";

    button.className =
      "ending-step-photo";

    button.dataset.image =
      image;

    button.dataset.caption =
      caption;

    button.setAttribute(
      "aria-label",
      `Open image: ${caption}`
    );


    const img =
      document.createElement("img");

    img.src =
      image;

    img.alt =
      alt;

    img.loading =
      "lazy";


    button.appendChild(
      img
    );


    return button;

  }


  /* =====================================================
     INJECT PHOTOS INTO ENDING STEPS
  ===================================================== */

  Object.entries(
    endingPhotoData
  ).forEach(
    ([resultId, photos]) => {

      const result =
        document.getElementById(
          resultId
        );

      if (!result) return;


      const steps =
        result.querySelector(
          ".ending-steps"
        );

      if (!steps) return;


      const stepItems =
        steps.querySelectorAll(
          ":scope > div"
        );


      stepItems.forEach(
        (step, index) => {

          const photo =
            photos[index];

          if (!photo) return;


          if (
            step.querySelector(
              ".ending-step-photo"
            )
          ) {
            return;
          }


          step.classList.add(
            "has-ending-photo"
          );


          step.insertBefore(
            createEndingPhotoButton(
              photo.image,
              photo.alt,
              photo.caption
            ),
            step.firstChild
          );

        }
      );

    }
  );


  /* =====================================================
     BUILD EXTRA VISUAL GALLERIES
  ===================================================== */

  function buildEndingGallery(
    resultId,
    items,
    title
  ) {

    const result =
      document.getElementById(
        resultId
      );

    if (!result) return;


    if (
      result.querySelector(
        ".ending-gallery"
      )
    ) {
      return;
    }


    const gallery =
      document.createElement(
        "div"
      );

    gallery.className =
      "ending-gallery";


    const heading =
      document.createElement(
        "div"
      );

    heading.className =
      "ending-gallery-head";


    const kicker =
      document.createElement(
        "span"
      );

    kicker.className =
      "ending-info-kicker";

    kicker.textContent =
      title;


    heading.appendChild(
      kicker
    );

    gallery.appendChild(
      heading
    );


    const grid =
      document.createElement(
        "div"
      );

    grid.className =
      "ending-gallery-grid";


    items.forEach(
      item => {

        const button =
          document.createElement(
            "button"
          );

        button.type =
          "button";

        button.className =
          "ending-gallery-item";

        button.dataset.image =
          item[0];

        button.dataset.caption =
          item[2];


        const image =
          document.createElement(
            "img"
          );

        image.src =
          item[0];

        image.alt =
          item[1];

        image.loading =
          "lazy";


        const caption =
          document.createElement(
            "span"
          );

        caption.className =
          "ending-gallery-caption";

        caption.textContent =
          item[2];


        button.appendChild(
          image
        );

        button.appendChild(
          caption
        );


        grid.appendChild(
          button
        );

      }
    );


    gallery.appendChild(
      grid
    );


    const steps =
      result.querySelector(
        ".ending-steps"
      );


    if (steps) {

      steps.insertAdjacentElement(
        "afterend",
        gallery
      );

    } else {

      result.appendChild(
        gallery
      );

    }

  }


  Object.entries(
    extraEndingGalleries
  ).forEach(
    ([resultId, items]) => {

      buildEndingGallery(
        resultId,
        items,
        "VISUAL EVIDENCE"
      );

    }
  );


  /* =====================================================
     ALL NINE ENDING MAPS
  ===================================================== */

  const allEndingMaps = [];

  for (
    let i = 1;
    i <= 9;
    i++
  ) {

    const number =
      String(i).padStart(
        2,
        "0"
      );


    allEndingMaps.push([
      `assets/endings/maps/map-${number}.jpg`,
      `All Endings Map ${number}`,
      `EXTRA ENDINGS MAP ${number}`
    ]);

  }


  buildEndingGallery(
    "result-all-ngplus-ending",
    allEndingMaps,
    "ALL ENDINGS MAP ARCHIVE"
  );


  /* =====================================================
     ENDING IMAGE LIGHTBOX
  ===================================================== */

  const endingImageModal =
    document.getElementById(
      "ending-image-modal"
    );

  const endingImageView =
    document.getElementById(
      "ending-image-view"
    );

  const endingImageCaption =
    document.getElementById(
      "ending-image-caption"
    );

  const endingImageClose =
    document.getElementById(
      "ending-image-close"
    );


  function openEndingImage(
    image,
    caption,
    alt
  ) {

    if (
      !endingImageModal ||
      !endingImageView
    ) {
      return;
    }


    endingImageView.src =
      image;

    endingImageView.alt =
      alt ||
      caption ||
      "Ending guide image";


    if (endingImageCaption) {

      endingImageCaption.textContent =
        caption ||
        "ENDING GUIDE IMAGE";

    }


    endingImageModal.classList.add(
      "open"
    );

    endingImageModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "ending-image-open"
    );


    if (endingImageClose) {

      endingImageClose.focus();

    }

  }


  function closeEndingImage() {

    if (!endingImageModal) {
      return;
    }


    endingImageModal.classList.remove(
      "open"
    );

    endingImageModal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "ending-image-open"
    );


    if (endingImageView) {

      endingImageView.src =
        "";

      endingImageView.alt =
        "";

    }

  }


  document.addEventListener(
    "click",
    event => {

      const imageButton =
        event.target.closest(
          ".ending-step-photo, .ending-gallery-item"
        );


      if (imageButton) {

        openEndingImage(
          imageButton.dataset.image,
          imageButton.dataset.caption,
          imageButton
            .querySelector("img")
            ?.alt || ""
        );

        return;

      }


      if (
        event.target.closest(
          "[data-close-ending-image]"
        )
      ) {

        closeEndingImage();

      }

    }
  );


  if (endingImageClose) {

    endingImageClose.addEventListener(
      "click",
      closeEndingImage
    );

  }


  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        endingImageModal &&
        endingImageModal.classList.contains("open")
      ) {

        closeEndingImage();

      }

    }
  );



  /* =====================================================
     CREATURE DOSSIER BOOK
  ===================================================== */
const creatureData = [

  {
    name: "LYING FIGURE",

    image:
      "assets/images/creatures/lying-figure.jpg",

    classification:
      "CLASS / UNKNOWN",

    quote:
      '"A thing trapped within itself."',

    // DETAILED DESCRIPTION — KEEP THIS LONG
    intro:
      "A disturbing manifestation encountered throughout the streets, alleys and enclosed spaces of Silent Hill. Its body appears tightly bound beneath a distorted, flesh-like covering, leaving it with an unnatural and restrained humanoid shape. The creature moves in a low, awkward manner before suddenly becoming aggressive, turning what initially appears to be a helpless figure into a dangerous and unpredictable threat.",

    // SHORTER SUPPORTING INFORMATION
    physical:
      "Its body is sealed within a rigid, skin-like covering, restricting movement and creating a distorted humanoid silhouette.",

    abilities:
      "Can crawl and lunge quickly, and can release a corrosive substance from its body.",

    behavior:
      "Stays low to the ground, often remaining still before suddenly attacking through the fog.",

    symbolism:
      "Represents sickness, confinement and suffering trapped beneath an outwardly human form.",

    story:
      "One of the first creatures James encounters, establishing the connection between Silent Hill's monsters and psychological imagery.",

    combat:
      "Keep your distance. Ranged attacks are safer; watch for sudden lunges and corrosive attacks.",

    caseFile:
      "001"
  },


  {
    name: "MANNEQUIN",

    image:
      "assets/images/creatures/mannequin.jpg",

    classification:
      "CLASS / MANIFESTATION",

    quote:
      '"Something human remains beneath the shape."',

    // DETAILED DESCRIPTION
    intro:
      "A grotesque manifestation built from distorted human forms and commonly encountered in the darker sections of Silent Hill. At first glance it can resemble an ordinary object or piece of furniture, allowing it to remain hidden among the environment. Its sudden movement transforms that familiar shape into an immediate and unsettling threat.",

    // SHORTER INFORMATION
    physical:
      "Formed from distorted human legs joined into an unnatural two-bodied shape.",

    abilities:
      "Relies on sudden close-range attacks and concealment.",

    behavior:
      "Remains motionless among objects and darkness until James approaches.",

    symbolism:
      "Suggests objectification, hidden desire and the distortion of the human form.",

    story:
      "A recurring manifestation that turns familiar human shapes into sources of fear.",

    combat:
      "Check dark corners and suspicious objects. Keep space once it becomes active.",

    caseFile:
      "002"
  },


  {
    name: "BUBBLE HEAD NURSE",

    image:
      "assets/images/creatures/bubble-head-nurse.jpg",

    classification:
      "CLASS / MANIFESTATION",

    quote:
      '"The hospital is not empty."',

    // DETAILED DESCRIPTION
    intro:
      "A disturbing humanoid manifestation most strongly associated with Brookhaven Hospital. Its recognizable nurse-like appearance combines an ordinary symbol of medical care with grotesque physical distortion, creating an image that feels familiar and threatening at the same time. Their presence transforms the hospital into a place where ideas of treatment, sickness and fear become inseparable.",

    // SHORTER INFORMATION
    physical:
      "Resembles a nurse with a grotesquely distorted head and obscured identity.",

    abilities:
      "Uses close-range attacks and becomes dangerous in confined spaces.",

    behavior:
      "Wanders hospital corridors and reacts to James when approached.",

    symbolism:
      "Connects medical imagery with illness, fear and memories surrounding Mary.",

    story:
      "A defining manifestation of Brookhaven Hospital and its themes of sickness.",

    combat:
      "Avoid being surrounded. Maintain distance and watch attack patterns.",

    caseFile:
      "003"
  },


  {
    name: "FLESH LIPS",

    image:
      "assets/images/creatures/flesh-lips.jpg",

    classification:
      "CLASS / HOSTILE",

    quote:
      '"The ceiling is never truly empty."',

    // DETAILED DESCRIPTION
    intro:
      "A grotesque manifestation composed of distorted flesh and exaggerated human features. Unlike creatures that remain grounded, Flesh Lips uses the ceiling and surrounding architecture as part of the encounter, creating an oppressive sense that danger can come from above as easily as from the ground. Its appearance turns a familiar enclosed space into a hostile environment.",

    // SHORTER INFORMATION
    physical:
      "A grotesque mass of flesh dominated by large, distorted lip-like forms.",

    abilities:
      "Attacks from above and uses the ceiling to approach James.",

    behavior:
      "Relies on surprise and confined spaces to make attacks harder to anticipate.",

    symbolism:
      "Distorts familiar human anatomy into something threatening and unnatural.",

    story:
      "Appears during a surreal encounter where the environment itself becomes part of the horror.",

    combat:
      "Keep moving and watch above you. Avoid remaining directly underneath it.",

    caseFile:
      "004"
  },


  {
    name: "ABSTRACT DADDY",

    image:
      "assets/images/creatures/abstract-daddy.jpg",

    classification:
      "CLASS / MANIFESTATION",

    quote:
      '"A shape born from remembered violence."',

    // DETAILED DESCRIPTION
    intro:
      "A disturbing manifestation tied closely to Angela and the traumatic memories surrounding her past. Unlike the more recognizable creatures of Silent Hill, Abstract Daddy appears as a distorted structure that deliberately obscures the human form. The creature feels less like an animal and more like a physical representation of an experience that has become impossible to escape.",

    // SHORTER INFORMATION
    physical:
      "A massive distorted structure that obscures the human form beneath it.",

    abilities:
      "Uses its size and confined surroundings to trap and overwhelm its target.",

    behavior:
      "Aggressively pressures its target and controls the available space.",

    symbolism:
      "Represents Angela's trauma, abuse and the overwhelming nature of painful memories.",

    story:
      "Appears in Angela's storyline as one of the clearest manifestations of psychological trauma.",

    combat:
      "Stay mobile, avoid corners and prevent the creature from controlling your position.",

    caseFile:
      "005"
  },


  {
    name: "PYRAMID HEAD",

    image:
      "assets/images/creatures/pyramid-head.jpg",

    classification:
      "CLASS / EXECUTIONER",

    quote:
      '"The Executioner has come for James."',

    // DETAILED DESCRIPTION
    intro:
      "A towering executioner-like figure that appears throughout James's journey as one of the most recognizable and threatening manifestations in Silent Hill. Unlike many of the creatures James encounters, Pyramid Head does not simply wander the town as an ordinary enemy. His repeated appearances create the impression that he is specifically connected to James and the punishment he believes he deserves.",

    // SHORTER INFORMATION
    physical:
      "A towering figure wearing a blood-stained apron and a massive metal pyramid helmet.",

    abilities:
      "Possesses immense strength and wields enormous weapons with devastating force.",

    behavior:
      "Slowly and deliberately pursues James rather than behaving like an ordinary wandering creature.",

    symbolism:
      "Represents punishment, guilt and James's subconscious desire for judgment.",

    story:
      "A central manifestation of James's psychological journey and his confrontation with guilt.",

    combat:
      "Prioritize survival and distance. His enormous reach makes reckless close combat dangerous.",

    caseFile:
      "006"
  }

];


  /* =====================================================
     CREATURE ELEMENTS
  ===================================================== */

  const creatureModal =
    document.getElementById(
      "creature-modal"
    );

  const creatureBook =
    document.getElementById(
      "creature-book"
    );

  const creatureImage =
    document.getElementById(
      "creature-dossier-image"
    );

  const creaturePrev =
    document.getElementById(
      "creature-book-prev"
    );

  const creatureNext =
    document.getElementById(
      "creature-book-next"
    );

  const creatureClose =
    document.getElementById(
      "creature-book-close"
    );

  const creatureBackdrop =
    document.getElementById(
      "creature-modal-backdrop"
    );

  const creatureCounter =
    document.getElementById(
      "creature-book-counter"
    );

  const creatureCurrentNumber =
    document.getElementById(
      "creature-current-number"
    );

  const creatureItems =
    document.querySelectorAll(
      ".creature-item"
    );


  let currentCreature = 0;

  let creatureTurning = false;


  /* =====================================================
     CREATURE COUNTER
  ===================================================== */

  function updateCreatureNumber(index) {

    const n =
      String(index + 1)
        .padStart(2, "0");

    const total =
      String(creatureData.length)
        .padStart(2, "0");


    if (creatureCounter) {

      creatureCounter.textContent =
        `${n} / ${total}`;

    }


    if (creatureCurrentNumber) {

      creatureCurrentNumber.textContent =
        n;

    }

  }


  /* =====================================================
     LOAD CREATURE DOSSIER
  ===================================================== */

  function loadCreatureDossier(
    index,
    animate = false
  ) {

    const creature =
      creatureData[index];

    if (!creature) return;

    const infoGrid =
  document.querySelector(".book-info-grid");

if (infoGrid) {

  infoGrid.classList.remove(
    "cards-enter"
  );

  void infoGrid.offsetWidth;

  infoGrid.classList.add(
    "cards-enter"
  );

}


    /* ---------------------------------------------
       TEXT ELEMENTS
    --------------------------------------------- */

    const name =
      document.getElementById(
        "dossier-name"
      );

    const classification =
      document.getElementById(
        "dossier-classification"
      );

    const quote =
      document.getElementById(
        "dossier-quote"
      );

    const intro =
      document.getElementById(
        "dossier-intro"
      );

    const physical =
      document.getElementById(
        "dossier-physical"
      );

    const abilities =
      document.getElementById(
        "dossier-abilities"
      );

    const behavior =
      document.getElementById(
        "dossier-behavior"
      );

    const symbolism =
      document.getElementById(
        "dossier-symbolism"
      );

    const story =
      document.getElementById(
        "dossier-story"
      );

    const combat =
      document.getElementById(
        "dossier-combat"
      );

    const specimen =
      document.getElementById(
        "dossier-specimen"
      );

    const caseFile =
      document.getElementById(
        "dossier-case"
      );


    /* ---------------------------------------------
       IMAGE
    --------------------------------------------- */

    if (creatureImage) {

      if (animate) {

        creatureImage.classList.add(
          "image-changing"
        );


        setTimeout(() => {

          creatureImage.src =
            creature.image;

          creatureImage.alt =
            creature.name;

          creatureImage.classList.remove(
            "image-changing"
          );

        }, 180);

      }

      else {

        creatureImage.src =
          creature.image;

        creatureImage.alt =
          creature.name;

      }

    }


    /* ---------------------------------------------
       TEXT
    --------------------------------------------- */

    if (name)
      name.textContent =
        creature.name;


    if (classification)
      classification.textContent =
        creature.classification;


    if (quote)
      quote.textContent =
        creature.quote;


    if (intro)
      intro.textContent =
        creature.intro;


    if (physical)
      physical.textContent =
        creature.physical;


    if (abilities)
      abilities.textContent =
        creature.abilities;


    if (behavior)
      behavior.textContent =
        creature.behavior;


    if (symbolism)
      symbolism.textContent =
        creature.symbolism;


    if (story)
      story.textContent =
        creature.story;


    if (combat)
      combat.textContent =
        creature.combat;


    if (specimen)
      specimen.textContent =
        String(index + 1)
          .padStart(2, "0");


    if (caseFile)
      caseFile.textContent =
        creature.caseFile;


    /* ---------------------------------------------
       COUNTER
    --------------------------------------------- */

    updateCreatureNumber(index);


    /* ---------------------------------------------
       ARROWS
    --------------------------------------------- */

    if (creaturePrev) {

      creaturePrev.disabled =
        index === 0;

    }


    if (creatureNext) {

      creatureNext.disabled =
        index ===
        creatureData.length - 1;

    }

  }


  /* =====================================================
     OPEN BOOK
  ===================================================== */

  function openCreatureBook(index = 0) {

    if (!creatureModal) return;


    currentCreature =
      Math.max(
        0,
        Math.min(
          index,
          creatureData.length - 1
        )
      );


    loadCreatureDossier(
      currentCreature
    );


    creatureModal.classList.add(
      "open"
    );


    creatureModal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "creature-book-open"
    );

  }


  /* =====================================================
     CLOSE BOOK
  ===================================================== */

  function closeCreatureBook() {

    if (!creatureModal) return;


    creatureModal.classList.remove(
      "open"
    );


    creatureModal.setAttribute(
      "aria-hidden",
      "true"
    );


    document.body.classList.remove(
      "creature-book-open"
    );

  }


  /* =====================================================
     TURN BOOK PAGE
  ===================================================== */

  function turnCreaturePage(
    direction
  ) {

    if (
      !creatureModal ||
      !creatureModal.classList.contains("open") ||
      creatureTurning
    ) {
      return;
    }


    const nextIndex =
      currentCreature + direction;


    if (
      nextIndex < 0 ||
      nextIndex >= creatureData.length
    ) {
      return;
    }


    creatureTurning = true;


    if (creatureBook) {

      creatureBook.classList.remove(
        "page-next",
        "page-prev"
      );


      void creatureBook.offsetWidth;


      creatureBook.classList.add(
        direction > 0
          ? "page-next"
          : "page-prev"
      );

    }


    setTimeout(() => {

      currentCreature =
        nextIndex;


      loadCreatureDossier(
        currentCreature,
        true
      );

    }, 350);


    setTimeout(() => {

      if (creatureBook) {

        creatureBook.classList.remove(
          "page-next",
          "page-prev"
        );

      }


      creatureTurning =
        false;

    }, 760);

  }


  /* =====================================================
     CREATURE LIST CLICK
  ===================================================== */

  creatureItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        openCreatureBook(
          Number(
            item.dataset.creature || 0
          )
        );

      }
    );

  });


  /* =====================================================
     BOOK CONTROLS
  ===================================================== */

  if (creatureNext) {

    creatureNext.addEventListener(
      "click",
      () => {

        turnCreaturePage(1);

      }
    );

  }


  if (creaturePrev) {

    creaturePrev.addEventListener(
      "click",
      () => {

        turnCreaturePage(-1);

      }
    );

  }


  if (creatureClose) {

    creatureClose.addEventListener(
      "click",
      closeCreatureBook
    );

  }


  if (creatureBackdrop) {

    creatureBackdrop.addEventListener(
      "click",
      closeCreatureBook
    );

  }


  /* =====================================================
     CREATURE KEYBOARD CONTROLS
  ===================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        creatureModal &&
        creatureModal.classList.contains("open")
      ) {


        /* ESC */

        if (event.key === "Escape") {

          event.preventDefault();

          event.stopImmediatePropagation();

          closeCreatureBook();

          return;

        }


        /* NEXT */

        if (event.key === "ArrowRight") {

          event.preventDefault();

          turnCreaturePage(1);

          return;

        }


        /* PREVIOUS */

        if (event.key === "ArrowLeft") {

          event.preventDefault();

          turnCreaturePage(-1);

          return;

        }

      }

    },
    true
  );


  /* =====================================================
     AUTOMATIC BOOK OPENING
  ===================================================== */

  const originalShowPage =
    showPage;


  showPage =
    function (
      pageName,
      updateURL = true
    ) {

      originalShowPage(
        pageName,
        updateURL
      );


      if (
        pageName ===
        "creatures"
      ) {

        setTimeout(() => {

          if (
            currentPage &&
            currentPage.dataset.pageSection ===
              "creatures"
          ) {

            openCreatureBook(0);

          }

        }, 430);

      }

    };


  /* =====================================================
     OPEN BOOK ON DIRECT HASH
  ===================================================== */

  if (
    location.hash.replace("#", "") ===
    "creatures"
  ) {

    setTimeout(() => {

      openCreatureBook(0);

    }, 520);

  }


  /* =====================================================
     SOUND MENU
  ===================================================== */

  const soundContainer =
    document.getElementById(
      "sound-container"
    );

  const soundToggle =
    document.getElementById(
      "sound-toggle"
    );


  if (
    soundToggle &&
    soundContainer
  ) {

    soundToggle.addEventListener(
      "click",
      () => {

        const open =
          soundContainer.classList.toggle(
            "open"
          );


        soundToggle.setAttribute(
          "aria-expanded",
          String(open)
        );

      }
    );

  }


  /* =====================================================
     PERSISTENT AUDIO
  ===================================================== */

  const audio =
    document.getElementById(
      "background-audio"
    );

  const playButton =
    document.getElementById(
      "play-track"
    );

  const prevButton =
    document.getElementById(
      "prev-track"
    );

  const nextButton =
    document.getElementById(
      "next-track"
    );

  const trackName =
    document.getElementById(
      "track-name"
    );

  const trackButtons =
    document.querySelectorAll(
      ".track-button"
    );


  /* =====================================================
     TRACKS
  ===================================================== */

  const tracks = [

    {
      name: "TRACK 01 — MAIN",
      src: "assets/audio/main.mp3"
    },

    {
      name: "TRACK 02 — PROMISE",
      src: "assets/audio/Promise.mp3"
    },

    {
      name: "TRACK 03 — THEME OF LAURA II",
      src: "assets/audio/Theme Of Laura II.mp3"
    }

  ];


  let currentTrack =
    Number(
      localStorage.getItem(
        "sh2-track"
      )
    ) || 0;


  let shouldResume =
    localStorage.getItem(
      "sh2-playing"
    ) === "true";


  /* =====================================================
     LOAD TRACK
  ===================================================== */

  function loadTrack(
    index,
    autoplay = false
  ) {

    currentTrack =
      (index + tracks.length) %
      tracks.length;


    const track =
      tracks[currentTrack];


    if (
      !audio ||
      !track
    ) {
      return;
    }


    audio.src =
      track.src;


    if (trackName) {

      trackName.textContent =
        track.name;

    }


    trackButtons.forEach(
      (button, i) => {

        button.classList.toggle(
          "active",
          i === currentTrack
        );

      }
    );


    localStorage.setItem(
      "sh2-track",
      String(currentTrack)
    );


    if (autoplay) {

      audio.play()
        .then(() => {

          shouldResume = true;


          localStorage.setItem(
            "sh2-playing",
            "true"
          );


          if (playButton) {

            playButton.textContent =
              "PAUSE";

          }

        })

        .catch(() => {

          shouldResume = false;

        });

    }

  }


  /* =====================================================
     TOGGLE AUDIO
  ===================================================== */

  function toggleAudio() {

    if (!audio) return;


    if (audio.paused) {

      audio.play()
        .then(() => {

          shouldResume = true;


          localStorage.setItem(
            "sh2-playing",
            "true"
          );


          if (playButton) {

            playButton.textContent =
              "PAUSE";

          }

        })
        .catch(() => {});


    }


    else {

      audio.pause();


      shouldResume = false;


      localStorage.setItem(
        "sh2-playing",
        "false"
      );


      if (playButton) {

        playButton.textContent =
          "PLAY";

      }

    }

  }


  /* =====================================================
     AUDIO EVENTS
  ===================================================== */

  if (audio) {

    loadTrack(
      currentTrack,
      false
    );


    audio.addEventListener(
      "play",
      () => {

        if (playButton) {

          playButton.textContent =
            "PAUSE";

        }


        localStorage.setItem(
          "sh2-playing",
          "true"
        );

      }
    );


    audio.addEventListener(
      "pause",
      () => {

        if (playButton) {

          playButton.textContent =
            "PLAY";

        }

      }
    );


    audio.addEventListener(
      "ended",
      () => {

        loadTrack(
          currentTrack + 1,
          true
        );

      }
    );


    /* ---------------------------------------------
       TRY TO RESUME AUDIO
    --------------------------------------------- */

    if (shouldResume) {

      audio.play()
        .then(() => {

          if (playButton) {

            playButton.textContent =
              "PAUSE";

          }

        })
        .catch(() => {


          const startAudio =
            () => {

              if (audio.paused) {

                audio.play()
                  .then(() => {

                    if (playButton) {

                      playButton.textContent =
                        "PAUSE";

                    }


                    localStorage.setItem(
                      "sh2-playing",
                      "true"
                    );

                  })
                  .catch(() => {});

              }


              document.removeEventListener(
                "click",
                startAudio
              );

            };


          document.addEventListener(
            "click",
            startAudio,
            {
              once: true
            }
          );

        });

    }

  }


  /* =====================================================
     PLAY BUTTON
  ===================================================== */

  if (playButton) {

    playButton.addEventListener(
      "click",
      toggleAudio
    );

  }


  /* =====================================================
     PREVIOUS TRACK
  ===================================================== */

  if (prevButton) {

    prevButton.addEventListener(
      "click",
      () => {

        loadTrack(
          currentTrack - 1,
          true
        );

      }
    );

  }


  /* =====================================================
     NEXT TRACK
  ===================================================== */

  if (nextButton) {

    nextButton.addEventListener(
      "click",
      () => {

        loadTrack(
          currentTrack + 1,
          true
        );

      }
    );

  }


  /* =====================================================
     TRACK SELECT BUTTONS
  ===================================================== */

  trackButtons.forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          loadTrack(
            Number(
              button.dataset.track
            ),
            true
          );

        }
      );

    }
  );
    /* =====================================================
     WORLD MAP ARCHIVE
  ===================================================== */

  const worldMapModal =
    document.getElementById("world-map-modal");

  const worldMapImage =
    document.getElementById("world-map-image");

  const worldMapTitle =
    document.getElementById("world-map-title");

  const worldMapAreaLabel =
    document.getElementById("world-map-area-label");

  const worldMapCounter =
    document.getElementById("world-map-counter");

  const worldMapLocation =
    document.getElementById("world-map-location");

  const worldMapPrev =
    document.getElementById("world-map-prev");

  const worldMapNext =
    document.getElementById("world-map-next");

  const worldMapClose =
    document.getElementById("world-map-close");

  const worldMapBackdrop =
    document.getElementById("world-map-backdrop");

  const worldMapCards =
    document.querySelectorAll(".world-map-card");


  /* -----------------------------------------------------
     MAP DATA
  ----------------------------------------------------- */

  const worldMapData = {

    "south-vale": {

      label: "AREA / SOUTH VALE",

      location: "SOUTH VALE",

      maps: [

        {
          title: "SOUTH VALE — MAIN MAP",
          image: "assets/images/maps/south-vale.jpg"
        },

        {
          title: "SOUTH VALE — EAST AREA",
          image: "assets/images/maps/south-vale-east.jpg"
        },

        {
          title: "SOUTH VALE — WEST AREA",
          image: "assets/images/maps/south-vale-west.jpg"
        }

      ]

    },


    "wood-side": {

      label: "AREA / APARTMENTS",

      location: "WOOD SIDE APARTMENTS",

      maps: [

        {
          title: "WOOD SIDE APARTMENTS — 1F",
          image: "assets/images/maps/wood-side-1f.jpg"
        },

        {
          title: "WOOD SIDE APARTMENTS — 2F",
          image: "assets/images/maps/wood-side-2f.jpg"
        },

        {
          title: "WOOD SIDE APARTMENTS — 3F",
          image: "assets/images/maps/wood-side-3f.jpg"
        }

      ]

    },


    "blue-creek": {

      label: "AREA / APARTMENTS",

      location: "BLUE CREEK APARTMENTS",

      maps: [

        {
          title: "BLUE CREEK APARTMENTS — 1F",
          image: "assets/images/maps/blue-creek-1f.jpg"
        },

        {
          title: "BLUE CREEK APARTMENTS — 2F",
          image: "assets/images/maps/blue-creek-2f.jpg"
        },

        {
          title: "BLUE CREEK APARTMENTS — 3F",
          image: "assets/images/maps/blue-creek-3f.jpg"
        }

      ]

    },


    "brookhaven": {

      label: "AREA / HOSPITAL",

      location: "BROOKHAVEN HOSPITAL",

      maps: [

        {
          title: "BROOKHAVEN HOSPITAL — 1F",
          image: "assets/images/maps/brookhaven-1f.jpg"
        },

        {
          title: "BROOKHAVEN HOSPITAL — 2F",
          image: "assets/images/maps/brookhaven-2f.jpg"
        },

        {
          title: "BROOKHAVEN HOSPITAL — 3F",
          image: "assets/images/maps/brookhaven-3f.jpg"
        }

      ]

    },


    "toluca-prison": {

      label: "AREA / PRISON",

      location: "TOLUCA PRISON",

      maps: [

        {
          title: "TOLUCA PRISON — 1F MAIN SECTION",
          image:
            "assets/images/maps/toluca-prison-1f-main.jpg"
        },

        {
          title: "TOLUCA PRISON — 1F ADMINISTRATIVE",
          image:
            "assets/images/maps/toluca-prison-1f-administrative.jpg"
        },

        {
          title: "TOLUCA PRISON — 1F DEATH ROW",
          image:
            "assets/images/maps/toluca-prison-1f-death-row.jpg"
        },

        {
          title: "TOLUCA PRISON — 2F",
          image:
            "assets/images/maps/toluca-prison-2f.jpg"
        },

        {
          title: "TOLUCA PRISON — 3F",
          image:
            "assets/images/maps/toluca-prison-3f.jpg"
        },

        {
          title: "TOLUCA PRISON — BASEMENT",
          image:
            "assets/images/maps/toluca-prison-basement.jpg"
        }

      ]

    },


    "lakeview-hotel": {

      label: "AREA / HOTEL",

      location: "LAKEVIEW HOTEL",

      maps: [

        {
          title: "LAKEVIEW HOTEL — 1F",
          image:
            "assets/images/maps/lakeview-hotel-1f.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — 2F",
          image:
            "assets/images/maps/lakeview-hotel-2f.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — 3F",
          image:
            "assets/images/maps/lakeview-hotel-3f.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — BASEMENT",
          image:
            "assets/images/maps/lakeview-hotel-basement.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — EMPLOYEE SECTION 1F",
          image:
            "assets/images/maps/lakeview-hotel-employee-1f.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — EMPLOYEE BASEMENT",
          image:
            "assets/images/maps/lakeview-hotel-employee-basement.jpg"
        },

        {
          title: "LAKEVIEW HOTEL — GARDEN",
          image:
            "assets/images/maps/lakeview-hotel-garden.jpg"
        }

      ]

    }

  };


  /* -----------------------------------------------------
     STATE
  ----------------------------------------------------- */

  let currentMapArea = null;

  let currentMapIndex = 0;

  let mapChanging = false;


  /* -----------------------------------------------------
     UPDATE MAP
  ----------------------------------------------------- */

  function updateWorldMap(
    index,
    direction = 0
  ) {

    const area =
      worldMapData[currentMapArea];

    if (!area) return;

    const map =
      area.maps[index];

    if (!map) return;

    if (mapChanging) return;


    const applyMap = () => {

      if (worldMapImage) {

        worldMapImage.src =
          map.image;

        worldMapImage.alt =
          map.title;

      }


      if (worldMapTitle) {

        worldMapTitle.textContent =
          map.title;

      }


      if (worldMapAreaLabel) {

        worldMapAreaLabel.textContent =
          area.label;

      }


      if (worldMapLocation) {

        worldMapLocation.textContent =
          area.location;

      }


      if (worldMapCounter) {

        const current =
          String(index + 1)
            .padStart(2, "0");

        const total =
          String(area.maps.length)
            .padStart(2, "0");

        worldMapCounter.textContent =
          `${current} / ${total}`;

      }

    };


    /* First display */

    if (!direction) {

      applyMap();

      return;

    }


    /* Smooth map transition */

    mapChanging = true;


    if (worldMapImage) {

      worldMapImage.classList.remove(
        "map-enter-up",
        "map-enter-down"
      );

      worldMapImage.classList.add(
        direction > 0
          ? "map-leaving-down"
          : "map-leaving-up"
      );

    }


    setTimeout(() => {

      currentMapIndex =
        index;


      if (worldMapImage) {

        worldMapImage.classList.remove(
          "map-leaving-down",
          "map-leaving-up"
        );

        worldMapImage.classList.add(
          direction > 0
            ? "map-enter-up"
            : "map-enter-down"
        );

      }


      applyMap();


    }, 220);


    setTimeout(() => {

      if (worldMapImage) {

        worldMapImage.classList.remove(
          "map-enter-up",
          "map-enter-down"
        );

      }

      mapChanging = false;

    }, 650);

  }


  /* -----------------------------------------------------
     OPEN MAP
  ----------------------------------------------------- */

  function openWorldMap(areaName) {

    const area =
      worldMapData[areaName];

    if (!area) return;


    currentMapArea =
      areaName;

    currentMapIndex =
      0;


    updateWorldMap(
      0,
      0
    );


    worldMapModal.classList.add(
      "open"
    );


    worldMapModal.setAttribute(
      "aria-hidden",
      "false"
    );


    document.body.classList.add(
      "world-map-open"
    );


    updateWorldMapButtons();

  }


  /* -----------------------------------------------------
     CLOSE MAP
  ----------------------------------------------------- */

  function closeWorldMap() {

    worldMapModal.classList.remove(
      "open"
    );

    worldMapModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.classList.remove(
      "world-map-open"
    );

  }


  /* -----------------------------------------------------
     ENABLE / DISABLE ARROWS
  ----------------------------------------------------- */

  function updateWorldMapButtons() {

    const area =
      worldMapData[currentMapArea];

    if (!area) return;


    if (worldMapPrev) {

      worldMapPrev.disabled =
        currentMapIndex === 0;

    }


    if (worldMapNext) {

      worldMapNext.disabled =
        currentMapIndex ===
        area.maps.length - 1;

    }

  }


  /* -----------------------------------------------------
     MOVE MAP
  ----------------------------------------------------- */

  function moveWorldMap(direction) {

    if (
      !worldMapModal.classList.contains(
        "open"
      )
    ) {
      return;
    }


    const area =
      worldMapData[currentMapArea];

    if (!area) return;


    const nextIndex =
      currentMapIndex + direction;


    if (
      nextIndex < 0 ||
      nextIndex >= area.maps.length
    ) {
      return;
    }


    updateWorldMap(
      nextIndex,
      direction
    );


    setTimeout(() => {

      updateWorldMapButtons();

    }, 230);

  }


  /* -----------------------------------------------------
     CARD CLICK
  ----------------------------------------------------- */

  worldMapCards.forEach(card => {

    card.addEventListener(
      "click",
      () => {

        openWorldMap(
          card.dataset.mapArea
        );

      }
    );

  });


  /* -----------------------------------------------------
     ARROW BUTTONS
  ----------------------------------------------------- */

  if (worldMapPrev) {

    worldMapPrev.addEventListener(
      "click",
      () => {

        moveWorldMap(-1);

      }
    );

  }


  if (worldMapNext) {

    worldMapNext.addEventListener(
      "click",
      () => {

        moveWorldMap(1);

      }
    );

  }


  /* -----------------------------------------------------
     CLOSE
  ----------------------------------------------------- */

  if (worldMapClose) {

    worldMapClose.addEventListener(
      "click",
      closeWorldMap
    );

  }


  if (worldMapBackdrop) {

    worldMapBackdrop.addEventListener(
      "click",
      closeWorldMap
    );

  }


/* -----------------------------------------------------
   WORLD AREA ORDER
----------------------------------------------------- */

const worldAreaOrder = [
  "south-vale",
  "wood-side",
  "blue-creek",
  "brookhaven",
  "toluca-prison",
  "lakeview-hotel"
];


/* -----------------------------------------------------
   MOVE BETWEEN AREAS
----------------------------------------------------- */

function moveWorldArea(direction) {

  if (
    !worldMapModal ||
    !worldMapModal.classList.contains("open")
  ) {
    return;
  }


  const currentAreaIndex =
    worldAreaOrder.indexOf(currentMapArea);


  if (currentAreaIndex === -1) {
    return;
  }


  const nextAreaIndex =
    currentAreaIndex + direction;


  /* Stop at first / last area */

  if (
    nextAreaIndex < 0 ||
    nextAreaIndex >= worldAreaOrder.length
  ) {
    return;
  }


  const nextArea =
    worldAreaOrder[nextAreaIndex];


  /*
     Open the next area's first map.
     This resets the map index to 0.
  */

  openWorldMap(nextArea);

}


/* -----------------------------------------------------
   KEYBOARD CONTROLS — MAPS ONLY
----------------------------------------------------- */

document.addEventListener(
  "keydown",
  event => {

    /*
       Do absolutely nothing unless
       the map popup is currently open.
    */

    if (
      !worldMapModal ||
      !worldMapModal.classList.contains("open")
    ) {
      return;
    }


    /* ================================================
       UP
       Previous map in current area
    ================================================ */

    if (event.key === "ArrowUp") {

      event.preventDefault();

      event.stopPropagation();

      moveWorldMap(-1);

      return;
    }


    /* ================================================
       DOWN
       Next map in current area
    ================================================ */

    if (event.key === "ArrowDown") {

      event.preventDefault();

      event.stopPropagation();

      moveWorldMap(1);

      return;
    }


    /* ================================================
       LEFT
       Previous area
    ================================================ */

    if (event.key === "ArrowLeft") {

      event.preventDefault();

      event.stopPropagation();

      moveWorldArea(-1);

      return;
    }


    /* ================================================
       RIGHT
       Next area
    ================================================ */

    if (event.key === "ArrowRight") {

      event.preventDefault();

      event.stopPropagation();

      moveWorldArea(1);

      return;
    }


    /* ================================================
       ESC
       Close map
    ================================================ */

    if (event.key === "Escape") {

      event.preventDefault();

      event.stopPropagation();

      closeWorldMap();

    }

  },
  true
);


});