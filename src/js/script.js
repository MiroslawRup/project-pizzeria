/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product',
    },

    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },

    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },

    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },

    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },

    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },

    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },

    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },

    cart: {
      defaultDeliveryFee: 20,
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product { // utw. instancji "Product" (każdy product osobno) - przekazanie nazwy produktu (cake, breakfast, pizza, salad) i obiektu z informacjami takiego produktu

    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id; // przypisanie nazwy jako id produktu (cake, breakfast, pizza, salad)
      thisProduct.data = data; // utworzenie obiektu z informacjami takiego produktu (cake, breakfast, pizza, salad)
      thisProduct.renderInMenu(); // wygenerowanie boxów z Produktami w index.html
      thisProduct.getElements(); // pobieranie określonych miejsc z HTML
      thisProduct.initAccordion();
      thisProduct.initOrderForm(); // aktywacja listnerów do określenia zamówienia na podstawie wyborów użytkownika
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
    }

    renderInMenu(){  // wygenerowanie boxów z Produktami w index.html
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); // generowanie Handlebars kodu HTML (ale jako string) na podstawie za pomocą szablonu zawartego w index.html
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); // utworzenie elementu DOM (boxy produktów) na podstawie stringu kodu HTML (robi to funkcja utils.createDOMFromHTM przywołana z function.js)
      const menuContainer = document.querySelector(select.containerOf.menu); // ustalenie miejsca w index.html na wstawienie wygenerowanego kodu HTML
      menuContainer.appendChild(thisProduct.element); // wstawienie kodu w ustalone miejsce kodu HTML
    }

    getElements(){ // pobieranie określonych miejsc z HTML
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // nagłówek boxów produktów (z nazwą i ceną podstawową) - kliknięty rozwija dany produkt
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form); // box z elementami wyboru opcji, ilości i przyciskiem dod. do koszyka
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs); // zbiór wszystkich inputów opcji produktu
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton); // przycisk dodawania do koszyka (ADD TO CART)
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem); // obszar z ceną sumaryczną danego produktu (TOTAL)
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // obszar obrazka produktu
      thisProduct.amountWidgetElem =  thisProduct.element.querySelector(select.menuProduct.amountWidget); // obszar zmiany ilości produktu wraz z przyciskami +/- (SELECT QUANTITY)
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event) { // listener na nagłówki produktu
        event.preventDefault();
        const activeProduct = document.querySelectorAll(select.all.menuProductsActive); // znalezienie wszystkich produktów z klasą aktywną
        for (let product  of activeProduct) {   // pętla po aktywnych produktach
          if (activeProduct !== thisProduct.element) { // gdy istnieją aktywne produkty który nie jest klikniętym produktem
            product.classList.remove(classNames.menuProduct.wrapperActive); // schowaj je poprzez usuniecie klasy active
          }
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); // przełączaj klasę active klikniętego produktu
      });
    }

    initOrderForm(){ // aktywacja listerów do określenia zamówienia na podstawie wyborów użytkownika
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){ // nadanie listnera na całym formularzu wyboru opcji (klikniecie entera w textboxie pwodowałoby wysłanie formualrza i przeładowanie strony)
        event.preventDefault();
        thisProduct.processOrder();
      });
      for (let input of thisProduct.formInputs){ // przejscie w pętli po wszystkich inputach opcji produktu
        input.addEventListener('change', function(){ // dodanie listnera do każdego inputu
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){ // dodanie listenera na przycisku ADD TO CART
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem); // utw. instancji "AmountWidget" (i przekazanie jej do podobiektu Product'u) - przekazanie elementu html - obszaru widżeta podawania ilosci produktu
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){ // ustawienie customowego listnera na widżet podawania ilosci produktu
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // tworzy obiekt (zawierający tablice z opcjami ZAZNACZONYCH opcji produktu) na podstawie (dzięki specjalnej funkcji utils.serializeFormToObject z function.js)
      let price = thisProduct.data.price; // tworzy zmienną przechowującą wyjściową domyślną cenę produktu na podstawie
      for (let paramId in thisProduct.data.params) { // nagłówek opcji produktu - pętla po wszytkich NAGŁÓWKACH OPCJI wyboru dla danego produktu
        const param = thisProduct.data.params[paramId]; // utworzenie obiektu z danych wewnątrz danego nagłówka
        for (let optionId in param.options) { // nazwa opcji produktu - pętla po OPCJACH znajdujacych się pod danym nagłówkiem opcji
          const option = param.options[optionId]; // utworzenie obiektu z danymi wewnątrz danej opcji
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); // obrazek danej opcji wyboru (o klasie img)
          if (formData[paramId].includes(optionId)){ //sprawdza (w pętli) czy dana opcja produktu jest zaznaczona (czy nazwę opcji zawiera się w tablicy z opcjami danego nagłówka)
            if (!option.default){ // czy dana opcja nie jest domyślna
              price += option.price; //zwiększam wyjściową cenę o cenę tej opcji
            }
            if (optionImage){ // czy był przewidziany obrazek dla tej opcji (nie każdy product go ma)
              optionImage.classList.add(classNames.menuProduct.imageVisible); // dodawana jest klasa active do obrazka (img) powodująca wyświetlenie go
            }
          } else { // gdy dana opcja produktu nie jest zaznaczona
            if (option.default){ // czy dana opcja jest domyślna
              price -= option.price;// zmniejszam wyjściową cenę o cenę tej opcji
            }
            if (optionImage){ // czy był przewidziany obrazek dla tej opcji (nie każdy product go ma)
              optionImage.classList.remove(classNames.menuProduct.imageVisible); // usuwana jest klasa active z obrazka (img) - obrazek nie wyświela się
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value; // przemnożenie ceny produktu przez ilość zamawianych produktów (w klasie amountWidget)
      thisProduct.price = price;
      thisProduct.priceElem.innerHTML = price; // wstawienie ceny w pole TOTAL (uwzgledniajacej wybrane opcje produktu i ilość produktu)
    }

    addToCart(){
      const thisProduct = this;
      app.cart.add(thisProduct.prepareCartProduct()); //   wywołanie metody z przekazaniem obiektu produkt
    }

    prepareCartProduct() { // utworzenie obiektu zawierajacego dane potrzebne w koszyku
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.price,
        params: thisProduct.prepareCartProductParams(),
      };
      return productSummary;
    }

    prepareCartProductParams() { // tworzenie obiekt z zaznaczonmymi opcjami produktu
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // tworzy obiekt (zawierający tablice z opcjami ZAZNACZONYCH opcji produktu) na podstawie (dzięki specjalnej funkcji utils.serializeFormToObject z function.js)
      const params = {}; // pusty obiekt do napełnienia
      for (let paramId in thisProduct.data.params) { // nagłówek opcji produktu - pętla po wszytkich NAGŁÓWKACH OPCJI wyboru dla danego produktu
        const param = thisProduct.data.params[paramId]; // utworzenie obiektu z danych wewnątrz danego nagłówka
        params[paramId] = {
          label: param.label,
          options: {},
        };
        for (let optionId in param.options) { // nazwa opcji produktu - pętla po OPCJACH znajdujacych się pod danym nagłówkiem opcji
          const option = param.options[optionId]; // utworzenie obiektu z danymi wewnątrz danej opcji
          if (formData[paramId].includes(optionId)){ // sprawdza (w pętli) czy dana opcja produktu jest zaznaczona (czy nazwę opcji zawiera się w tablicy z opcjami danego nagłówka)
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }

  class AmountWidget{ // utw. instancji "AmountWidget" - przekazanie elementu html - obszaru widżeta podawania ilosci produktu

    constructor(element){
      const thisWidget = this;
      thisWidget.element = element; // przekazanie obszaru widżeta podawania ilosci produktu
      thisWidget.getElements(); // wyodrębnienie przecisków +/- i inputu
      thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue); //
      thisWidget.initActions(); // ustawienie listenerów na input do il. prod. i przyciski +/-
    }

    getElements(){ // wyodrębnienie przecisków +/- i inputu
      const thisWidget = this;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input); // input do ilosci produktu
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease); // przycisk -
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease); // przycisk +
    }

    setValue(value){ // obsługa pola na ilość produktu - przekazanie domyślnej ilosci produktu w polu input
      const thisWidget = this;
      const newValue = parseInt(value); // wymuszenie formatu liczby na ilości produktów (zabezpieczenie przed podaniem przez usera tekstu)
      if (thisWidget.value !== newValue && !isNaN(newValue)){ // czy dotychczasowa wartość il. prod. thisWidget.value (tworzona poniżej) jest inna niż nowa wartość (na początku jest to domyślna wartość) oraz czy nowa wartość jest liczbą
        if (newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){ // czy nowa wartość il. prod. jest >= ustalonej min i <= ust. max.
          thisWidget.value = newValue; // wówczas zmienia wartość dotychczasową na nową wartość (przechowywaną w zmiennej)
        }
      }
      thisWidget.input.value = thisWidget.value; // wstawienie w inpucie w html wartości nowej (o ile przeszła pomyslnie powyższe if) lub wartość poprzednią przechowywaną w tej zmiennej
      thisWidget.announce(); // tworzenie customowego eventu na widżecie zmiany il. produktu
    }

    initActions(){ // ustawienie listenerów na input do il. prod. i przyciski +/-
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(event){ // listener na inpucie ilości produktu
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value); // obsługa pola na ilość produktu - przekazanie nowej wartości wstawionej przez usera
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){ // listener na przycisku -
        event.preventDefault();
        thisWidget.setValue(--thisWidget.input.value); // obsługa pola na ilość produktu - przekazanie nowej wartości zmniejszonej o 1
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){ // listener na przycisku +
        event.preventDefault();
        thisWidget.setValue(++thisWidget.input.value); // obsługa pola na ilość produktu - przekazanie nowej wartości zwiększonej o 1
      });
    }

    announce(){ // tworzenie customowego eventu na widżecie zmiany il. produktu
      const thisWidget = this;
      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event); // nakładanie eventu o nazwie updated na element widżeta zmiany il produktu
    }
  }

  class Cart{

    constructor(element){ // z przekazaniem całego obszaru (diva) koszyka
      const thisCart = this;
      thisCart.products = []; // pusta tablica Cart.products
      thisCart.getElements(element); // z przekazaniem całego obszaru (diva) koszyka
      thisCart.initActions();
    }

    getElements(element){ // z przekazaniem całego obszaru (diva) koszyka
      const thisCart = this;
      thisCart.dom = {}; // pusty podobiekt Cart.dom
      thisCart.dom.wrapper = element; // przekazanie całego obszaru (diva) koszyka do podobiektu
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);  // wyodrębnienie elementu html do rozwijania koszyka przez klikniecie (nagłówek)
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subTotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(event){ // listener na nagłówku koszyka
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); // włącznie klasy active rozwijącej koszyk
      });
      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function(){
        console.log('wlazłem');
        thisCart.remove(event.detail.cartProduct);

      });
    }

    add(menuProduct){
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct); // generowanie Handlebars kodu HTML (ale jako string) na podstawie za pomocą szablonu zawartego w index.html
      const generatedDOM = utils.createDOMFromHTML(generatedHTML); // utworzenie elementu DOM (boxy produktów) na podstawie stringu kodu HTML (robi to funkcja utils.createDOMFromHTM przywołana z function.js)
      thisCart.dom.productList.appendChild(generatedDOM); // wstawienie kodu w ustalone miejsce kodu HTML
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update(){
      const thisCart = this;
      let deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;
      let subtotalPrice = 0;
      thisCart.totalPrice = 0;
      for (let cartProduct of thisCart.products){
        totalNumber += cartProduct.amount;
        subtotalPrice += cartProduct.price;
      }
      if (totalNumber == 0){deliveryFee = 0;}
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subTotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      for (let totalPricePlace of thisCart.dom.totalPrice) {
        totalPricePlace.innerHTML = thisCart.totalPrice;
      }
    }

    remove(cartProductToRemove){
      const thisCart = this;
      cartProductToRemove.dom.wrapper.remove();
      const indexOfRemove = thisCart.products.indexOf(cartProductToRemove);
      thisCart.products.splice(indexOfRemove, 1);
      thisCart.update();
    }
  }

  class CartProduct{

    constructor(menuProduct, element){
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }

    getElements(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }

    initAmountWidget(){
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget); // utw. instancji "AmountWidget" (i przekazanie jej do podobiektu Product'u) - przekazanie elementu html - obszaru widżeta podawania ilosci produktu
      thisCartProduct.dom.amountWidget.addEventListener('updated', function(event){ // ustawienie customowego listnera na widżet podawania ilosci produktu
        event.preventDefault();
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

    remove(){
      const thisCartProduct = this;
      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
      console.log(thisCartProduct);
    }

    initActions(){
      const thisCartProduct = this;
      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
      });
    }
  }

  const app = {
    initCart: function(){
      const thisApp = this;
      const cartElem = document.querySelector(select.containerOf.cart); // pobranie do stałej całego obszaru (diva) koszyka
      thisApp.cart = new Cart(cartElem); // nowy obiekt Cart (ale zapisany też jako podobiekt app) z przekazaniem całego obszaru (diva) koszyka
    },
    initMenu: function() { // tworzenie instancji dla każdego produktu
      const thisApp = this;
      for(let productData in thisApp.data.products){ // nazwa produktu-  przejście pętlą po wszystkich obiektach produktów (cake, breakfast, pizza, salad).
        new Product(productData, thisApp.data.products[productData]); // utw. instancji "Product" (każdy product osobno) - przekazanie nazwy produktu (cake, breakfast, pizza, salad) i obiektu z informacjami takiego produktu
      }
    },
    initData: function(){ // pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js)
      const thisApp = this;
      thisApp.data = dataSource; // pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js)
    },
    init: function(){
      const thisApp = this;
      thisApp.initData(); // wywołanie initData (pobranie obiektu z danymi wszystkich produktów (z ob. dataSource z plk. data.js))
      thisApp.initMenu(); // wywołanie initMenu (tworzenie instancji dla każdego odrębnego produktu (cake, breakfast, pizza, salad))
      thisApp.initCart();
    },
  };

  app.init();  // wywołanie całej aplikacji (obiekt app)
}
