const api = {
  hostname: "/api/1.0",
  getProducts(category, paging) {
    return fetch(`${this.hostname}/products/${category}?paging=${paging}`).then(
      (response) => response.json()
    );
  },
  getCampaigns() {
    return fetch(`${this.hostname}/marketing/campaigns`).then((response) =>
      response.json()
    );
  },
  searchProducts(keyword, paging) {
    return fetch(
      `${this.hostname}/products/search?keyword=${keyword}&paging=${paging}`
    ).then((response) => response.json());
  },
  getProduct(id) {
    return fetch(`${this.hostname}/products/details?id=${id}`).then(
      (response) => response.json()
    );
  },
  checkout(data, jwtToken) {
    return fetch(`${this.hostname}/order/checkout`, {
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response) => response.json());
  },
  signin(data) {
    return fetch(`${this.hostname}/user/signin`, {
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
    }).then((response) => response.json());
  },
  getProfile(jwtToken) {
    return fetch(`${this.hostname}/user/profile`, {
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
    }).then((response) => response.json());
  },

  getDiscount(jwtToken){
    return fetch(`${this.hostname}/user/discount`,{
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
    }).then((response)=>response.json())
  },
  editProfile(jwtToken,data) {

    return fetch(`${this.hostname}/user/editprofile`, {
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response) => response.json());
  },

  addComment(jwtToken,grade,content,pId){
    return fetch(`${this.hostname}/user/addComment`, {
      body: JSON.stringify({grade:grade,content:content,pId:pId}),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response) => response.json());
  },

  addLineAuth(jwtToken, lineuuid){
    return fetch(`${this.hostname}/user/lineuuid`, {
      body: JSON.stringify({lineuuid:lineuuid}),
      headers: new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response) => response.json());
  },

  commentCheck(jwtToken,pId){
    return fetch(`${this.hostname}/user/commentCheck`,{
      body:JSON.stringify({pId:pId}),
      headers:new Headers({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response)=>response.json())
  },

  getProductComments(pId){
    return fetch(`${this.hostname}/products/comments`,{
      body: JSON.stringify({pId:pId}),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
      method: 'POST',
    }).then((response) => response.json());
  },

  getCollection(jwtToken){
    return fetch(`${this.hostname}/collections`,{
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
    }).then((response)=>response.json())
  },
  addCollection(jwtToken,id) {
    return fetch(`${this.hostname}/collections`,{
      body: JSON.stringify({"product_id" : id}),
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response)=>response.json())
  },
  delCollection(jwtToken,id) {
    return fetch(`${this.hostname}/collections`,{
      body: JSON.stringify({"product_id" : id}),
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'DELETE',
    }).then((response)=>response.json())
  },
  CollectionByID(jwtToken,id) {
    return fetch(`${this.hostname}/collections/${id}`,{
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
    }).then((response)=>response.json())
  },
  addDiscount(jwtToken,data){
    return fetch(`${this.hostname}/user/adddiscount`,{
      body: JSON.stringify(data),
      headers:new Headers({
        'Content-Type': 'application/json',
         Authorization: `Bearer ${jwtToken}`,
      }),
      method: 'POST',
    }).then((response)=>response.json())
  },
  getSale() {
    return fetch(`${this.hostname}/marketing/sale`).then((response) =>
      response.json()
    );
  },
};
