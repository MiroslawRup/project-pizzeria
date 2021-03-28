import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
      for (let product of activeProduct) {   // pętla po aktywnych produktach
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
    thisProduct.amountWidgetElem.addEventListener('updated', function(){ // ustawienie customowego listnera na widżet podawania ilosci produktu
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
    price *= thisProduct.amountWidget.correctValue; ////////////////////////////////
    console.log('czy tu powyżej ma być "price *= thisProduct.amountWidget.value" czy "price *= thisProduct.amountWidget.correctValue"');
    thisProduct.price = price;
    thisProduct.priceElem.innerHTML = price; // wstawienie ceny w pole TOTAL (uwzgledniajacej wybrane opcje produktu i ilość produktu)
  }

  addToCart(){
    const thisProduct = this;
    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });

    thisProduct.element.dispatchEvent(event);
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

export default Product;
