import {select, settings} from '../settings.js';

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

export default AmountWidget;
