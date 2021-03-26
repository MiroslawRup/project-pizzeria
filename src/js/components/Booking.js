import {templates, select} from '../settings.js';
import AmountWidget from './AmountWidget.js';
//import {utils} from '../utils.js';

class Booking{

  constructor(element){
    const thisBooking = this;
    thisBooking.render(element);
    thisBooking.getElements();
    thisBooking.initWidgets();
  }

  render(element){
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    ///const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //thisBooking.dom.wrapper.appendChild(generatedDOM);
  }

  getElements(){
    const thisBooking = this;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.amountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
