import {select, settings} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{

  constructor(element){
    console.log('1', element, settings.amountWidget.defaultValue);
    super(element, settings.amountWidget.defaultValue);
    console.log('4');
    const thisWidget = this;
    console.log('5.0');
    thisWidget.getElements(element);
    console.log('6.0');
    thisWidget.initActions();
    thisWidget.renderValue(); /////////////////////
    console.log('7');
  }

  getElements(){
    const thisWidget = this;
    console.log('5.1');
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    console.log('5.2');
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    console.log('5.3');
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    console.log('5.4');
  }

  isValid(value){
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin
      && value <= settings.amountWidget.defaultMax;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;
    console.log('6.1');
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value = thisWidget.input.value;
    });
    console.log('6.2');
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    console.log('6.3');
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
    console.log('6.4');
  }

}

export default AmountWidget;
