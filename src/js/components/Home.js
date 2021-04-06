import {templates, select} from '../settings.js';

class Home{

  constructor(element){
    const thisHome = this;
    thisHome.render(element);
    thisHome.getElements();
  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.home();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  getElements(){
    const thisHome = this;
    thisHome.dom.orderNav = thisHome.dom.wrapper.querySelector(select.home.orderNav);
    thisHome.dom.bookNav = thisHome.dom.wrapper.querySelector(select.home.bookNav);
  }

}

export default Home;
