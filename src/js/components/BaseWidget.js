class BaseWidget{

  constructor(wrapperElement, initialValue){
    console.log('2');
    const thisWidget = this;
    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
    console.log('3');
  }

  get value(){
    const thisWidget = this;
    console.log('8.0');
    return thisWidget.correctValue;

  }

  set value(value){
    console.log('a');
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);
    if (newValue !== thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  setValue(value){
    console.log('b');
    const thisWidget = this;
    thisWidget.value = value;
  }

  parseValue(value){
    console.log('c');
    return parseInt(value);
  }

  isValid(value){
    console.log('e');
    return !isNaN(value);
  }

  renderValue(){
    console.log('f');
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }

  announce(){
    console.log('g');
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }

}

export default BaseWidget;
