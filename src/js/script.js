/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      thisProduct.initAccordion();
    }

    renderInMenu(){
      const thisProduct = this;
      const generatedHTML = templates.menuProduct(thisProduct.data); /* generate HTML based on template */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); /* create element using utils.createElementFromHTML */
      const menuContainer = document.querySelector(select.containerOf.menu); /* find menu container */
      menuContainer.appendChild(thisProduct.element); /* add element to menu */
    }

    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem =  thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      thisProduct.accordionTrigger.addEventListener('click', function(event) { /* START: add event listener to clickable trigger on event click */
        event.preventDefault(); /* prevent default action for event */
        const activeArticles = document.querySelectorAll('article.active'); /* find active product (product that has active class) */
        for (let activeArticle of activeArticles) {   /* if there is active product and it's not thisProduct.element, remove class active from it */
          if (activeArticle !== thisProduct.element) {
            activeArticle.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        thisProduct.element.classList.toggle(classNames.menuProduct.imageVisible); /* toggle active class on thisProduct.element */
      });
    }

    initOrderForm(){
      const thisProduct = this;
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form); // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      let price = thisProduct.data.price; // set price to default price
      for(let paramId in thisProduct.data.params) { // for every category (param)...
        const param = thisProduct.data.params[paramId]; // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        for(let optionId in param.options) { // for every option in this category
          const option = param.options[optionId]; // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const imgClass = '.' + paramId + '-' + optionId;
          const optionImage = thisProduct.imageWrapper.querySelector(imgClass);
          if(formData[paramId].includes(optionId)){
            if(!option.default){
              price += option.price;
            }
            if(optionImage){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          }else{
            if(option.default){
              price -= option.price;
            }
            if(optionImage){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
      }
      price *= thisProduct.amountWidget.value; // multiply price by amount
      thisProduct.priceElem.innerHTML = price; // update calculated price in the HTML
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;
      thisWidget.element = element; // tego nie powinno być wg kodilli
      thisWidget.getElements();
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
    }

    getElements(){  //tu wg kodilli powinno być 'getElements(element){'
      const thisWidget = this;  // po tej linii wg kodilli powinno być 'thisWidget.element = element;'
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      if(thisWidget.value !== newValue && !isNaN(newValue)){
        if(newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
          thisWidget.value = newValue;
        }
      }
      thisWidget.input.value = thisWidget.value;
      thisWidget.anounce();
    }

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(--thisWidget.input.value);
      });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(++thisWidget.input.value);
      });
    }

    anounce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  const app = {
    initMenu: function() {
      const thisApp = this;
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;
      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
