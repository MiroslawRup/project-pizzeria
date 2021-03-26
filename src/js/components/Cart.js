import {select, classNames, templates, settings} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

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
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.form.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.form.querySelector(select.cart.phone);
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
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
    console.log(menuProduct);
    const thisCart = this;
    const generatedHTML = templates.cartProduct(menuProduct); // generowanie Handlebars kodu HTML (ale jako string) na podstawie za pomocą szablonu zawartego w index.html
    const generatedDOM = utils.createDOMFromHTML(generatedHTML); // utworzenie elementu DOM (boxy produktów) na podstawie stringu kodu HTML (robi to funkcja utils.createDOMFromHTM przywołana z function.js)
    thisCart.dom.productList.appendChild(generatedDOM); // wstawienie kodu w ustalone miejsce kodu HTML
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update(){
    const thisCart = this;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;
    for (let cartProduct of thisCart.products){
      thisCart.totalNumber += cartProduct.amount;
      thisCart.subtotalPrice += cartProduct.price;
    }
    if (thisCart.totalNumber == 0){thisCart.deliveryFee = 0;}
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
    thisCart.dom.subTotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
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

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order;
    const payload = {};
    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subTotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumber;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.products = [];
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }
}

export default Cart;
