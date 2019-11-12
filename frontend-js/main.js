import Search from './modules/search'

import Chat from './modules/chat'

// excute if the class exists in the page template

if(document.querySelector("#chat-wrapper")) {
    new Chat()
}

if (document.querySelector(".header-search-icon")) {
    new Search()
}