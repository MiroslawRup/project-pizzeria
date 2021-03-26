import {settings, select, classNames} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initBooking:function(){
    const thisApp = this;
    thisApp.bookContainer = document.querySelector(select.containerOf.booking);
    thisApp.booking = new Booking(thisApp.bookContainer);
  },

  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);
    const idFromHash = window.location.hash.replace('#/','');

    let pageMatchingHash = thisApp.pages[0].id;

    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);
    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#', '');
        thisApp.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function(pageId){
    const thisApp = this;
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }
    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
    }
  },

  initCart: function(){
    const thisApp = this;
    const cartElem = document.querySelector(select.containerOf.cart); // pobranie do stałej całego obszaru (diva) koszyka
    thisApp.cart = new Cart(cartElem); // nowy obiekt Cart (ale zapisany też jako podobiekt app) z przekazaniem całego obszaru (diva) koszyka

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },

  initMenu: function() { // tworzenie instancji dla każdego produktu
    const thisApp = this;
    for(let productData in thisApp.data.products){ // nazwa produktu-  przejście pętlą po wszystkich obiektach produktów (cake, breakfast, pizza, salad).
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); // utw. instancji "Product" (każdy product osobno) - przekazanie nazwy produktu (cake, breakfast, pizza, salad) i obiektu z informacjami takiego produktu
    }
  },

  initData: function(){ // pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js)
    const thisApp = this;
    thisApp.data = {}; // pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js)
    const url = settings.db.url + '/' + settings.db.product;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        thisApp.data.products = parsedResponse;
        thisApp.initMenu();
      });
  },

  init: function(){
    const thisApp = this;
    thisApp.initPages();
    thisApp.initData(); // wywołanie initData (pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js))
    thisApp.initCart();
    thisApp.initBooking();
  },

};

app.init();  // wywołanie całej aplikacji (obiekt app)
