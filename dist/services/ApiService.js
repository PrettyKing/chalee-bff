"use strict";Object.defineProperty(exports,"__esModule",{value:true});class ApiService{getInfo(){//区别开 MPA 和 SPA
// window.localStorage.get('info');
// if(){}..
return new Promise(resolve=>{resolve({item:"\u6211\u662F\u540E\u53F0\u6570\u636E\uD83C\uDF3A",result:[1,"next"]})})}}exports.default=ApiService;