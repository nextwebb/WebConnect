import Search from './modules/search'

import Chat from './modules/chat'

import RegistrationForm from './modules/registration-form'

// excute if the class exists in the page template

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}

if (document.querySelector(".header-search-icon")) {
    new Search()
}

if (document.querySelector("#registration-form")) {
    new RegistrationForm()
}

