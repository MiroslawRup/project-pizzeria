import {settings, select} from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {

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
    thisApp.initData(); // wywołanie initData (pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js))
    thisApp.initCart();
  },

};

app.init();  // wywołanie całej aplikacji (obiekt app)
