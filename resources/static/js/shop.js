const CART = {
    KEY: 'reoft:eShSd68lT75Lorm4epeU9hoCxB8656VpQHMBwmbA',
    contents: [],
    init(){
        let _contents = Cookies.get(CART.KEY);
        if(_contents){
            CART.contents = JSON.parse(_contents);
            if (CART.contents.length>0) { 
                document.getElementById('cart-value').innerHTML = CART.contents.length; 
            } else { document.getElementById('cart-value').innerHTML = ''; }
        }else{
            CART.contents = [];
            CART.sync();
        }
    },
    async sync(){
        let _cart = JSON.stringify(CART.contents);
        CART.updateCartBadge(CART.contents.length);
        await Cookies.set(CART.KEY, _cart, {path : '/'});
    },
    find(product_code){
        let match = CART.contents.filter(item=>{
            if(item.product_code == product_code)
                return true;
        });
        if(match && match[0])
            return match[0];
    },
    add(product_code, product_qty){
        product_qty = parseInt(product_qty);
        if(CART.find(product_code)){
            CART.increase(product_code, product_qty);
        }else{
            let arr = PRODUCTS.filter(product=>{
                if(product.product_code == product_code){
                    return true;
                }
            });
            if(arr && arr[0]){
                let obj = {
                    product_code: arr[0].product_code,
                    qty: product_qty,
                    product_price : arr[0].product_price
                };
                CART.contents.push(obj);
                if ( window.location.pathname.split('/')[1] === 'product' ) {
                    document.getElementById('add-to-cart').classList.add('disabled');
                    document.getElementById('add-to-cart').setAttribute('disabled','');
                    document.getElementById('add-to-cart').innerHTML = 'ADDED <i class="icon icon-check3"></i>';
                    setTimeout(function(){
                        document.getElementById('add-to-cart').classList.remove('disabled');
                        document.getElementById('add-to-cart').removeAttribute('disabled');
                        document.getElementById('add-to-cart').innerHTML = 'ADD TO CART';
                    },1700);
                }
                if ( window.location.pathname.split('/')[1] == 'shop' ) {
                    console.log('#add-to-cart:'+product_code);
                    let btn = document.getElementById('add-to-cart:'+product_code);
                    btn.innerHTML = 'ADDED <i class="icon icon-check3"></i>';
                    setTimeout(function(){
                        document.getElementById('add-to-cart:'+product_code).innerHTML = 'ADD TO CART';
                    }, 1200);
                }
                CART.sync();
            }else{
                console.error('Invalid Product');
            }
        }
    },
    increase(product_code, qty=1){
        CART.contents = CART.contents.map(item=>{
            if(item.product_code === product_code)
                item.qty = parseInt(item.qty) + qty;
                document.getElementById('total:'+product_code).innerHTML = '₹ '+(item.qty * parseInt(item.product_price));
                CART.totalCostRefresh();
            return item;
        });
        CART.sync()
    },
    reduce(product_code, qty=1){
        CART.contents = CART.contents.map(item=>{
            if(item.product_code === product_code)
                item.qty = parseInt(item.qty) - qty;
                document.getElementById('total:'+product_code).innerHTML = '₹ '+(item.qty * parseInt(item.product_price));
                CART.totalCostRefresh();
            return item;
        });
        CART.contents.forEach(async item=>{
            if(item.product_code === product_code && item.qty === 0)
                await CART.remove(product_code);
        });
        CART.sync();
    },
    remove(product_code){
        CART.contents = CART.contents.filter(item=>{
            if(item.product_code !== product_code)
                return true;
        });
        let element = document.getElementById('product:'+product_code);
        element.remove();
        CART.totalCostRefresh();
        if ( CART.contents.length == 0 ) {
            let emptyTable = document.getElementsByClassName('container-cart');
            emptyTable[0].innerHTML = '<h3 class="text-center mb-4">'+
                '<a href="/shop"<i style="font-size: 6vw" class="icon icon-add_shopping_cart"></i></a>'+
                '</h3><div role="alert" class="alert alert-danger text-center">Your cart is empty at this moment.</div>';
        }
        CART.sync()
    },
    empty(){
        CART.contents = [];
        CART.sync()
    },
    sort(field='title'){
        let sorted = CART.contents.sort( (a, b)=>{
            if(a[field] > b[field]){
                return 1;
            }else if(a[field] < a[field]){
                return -1;
            }else{
                return 0;
            }
        });
        return sorted;
    },
    logContents(prefix){
        console.log(prefix, CART.contents)
    },
    renderCart() {
        if ( CART.contents.length > 0 ) {
            for ( let i = 0; i < CART.contents.length; i++ ) {
                document.getElementById('qty:'+CART.contents[i].product_code).value = CART.contents[i].qty;
                document.getElementById('total:'+CART.contents[i].product_code).innerHTML = '₹ '+parseInt(CART.contents[i].product_price) * CART.contents[i].qty;
            }
        }
    },
    updateCartBadge(count){
        if ( count > 0 ) { 
            document.getElementById('cart-value').innerHTML = count; 
        } else { 
            document.getElementById('cart-value').innerHTML = ''; 
        }
    },
    totalCostRefresh() {
        $.post('/api/pull/taxes',{CART_contents:JSON.stringify(CART.contents)},function(resp){
            if ( resp.status === 'success' ) {
                document.getElementById('calc:product').innerHTML = '₹ '+resp.data.calcProduct;
                document.getElementById('calc:gst').innerHTML = '₹ '+resp.data.calcTax;
                document.getElementById('calc:shipping').innerHTML = '₹ '+resp.data.calcShip;
                document.getElementById('calc:other').innerHTML = '₹ '+resp.data.calcOther;
                document.getElementById('calc:total').innerHTML = '₹ '+ (resp.data.calcOther+resp.data.calcProduct+resp.data.calcTax+resp.data.calcShip);
            }
        });
    }
};

let PRODUCTS = [];

const updadeProductList = ( apiResponse ) => {
    PRODUCTS = apiResponse;
}

const SEARCH = {
    productSearch( toSearch ) {
        var results = [];
        toSearch = SEARCH.trimString(toSearch); // trim it
        for(var i=0; i<PRODUCTS.length; i++) {
            if(PRODUCTS[i]['product_name'].startsWith(toSearch)) {
                if(!SEARCH.itemExists(results, PRODUCTS[i])) results.push(PRODUCTS[i]);
            }
        }
        return results;
    },
    trimString(s) {
        var l=0, r=s.length -1;
        while(l < s.length && s[l] == ' ') l++;
        while(r > l && s[r] == ' ') r-=1;
        return s.substring(l, r+1);
    },
    compareObjects(o1, o2) {
        var k = '';
        for(k in o1) if(o1[k] != o2[k]) return false;
        for(k in o2) if(o1[k] != o2[k]) return false;
        return true;
    },
    itemExists(haystack, needle) {
        for(var i=0; i<haystack.length; i++) if(SEARCH.compareObjects(haystack[i], needle)) return true;
        return false;
    },
    titleCase(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
        }
        return splitStr.join(' '); 
     }
};

document.addEventListener('DOMContentLoaded', ()=>{
    //when the page is ready
    $.post('/api/pull/products',{}, function (response) { 
        if(response.status === 'success'){
            updadeProductList(response.data); 
        }else{
            alert('Pull API for products could not be loaded. Search product functionality may not work');
        }
    });
    CART.init();
    if ( window.location.pathname == '/cart' ) { CART.renderCart(); }
    if ( window.location.pathname == '/shop' ) { 
        $('#searchTerm').on('propertychange input',function(){
            if ( $('#searchTerm').val() !== '' ) {
                let results = SEARCH.productSearch(SEARCH.titleCase($('#searchTerm').val()));
                if ( results.length > 0 ) {
                    $('#searchResultList').html('');
                    $('#searchResults').fadeIn();
                    for( let i = 0; i < results.length; i++ ){
                        $('#searchResultList')
                        .append(`<li class="treeview search-single-result">
                                    <a href="/product/${results[i].product_slug}">
                                        <i style="margin:4px 8px" class="icon icon-shopping-basket"></i> <span>${results[i].product_name}</span>
                                    </a>
                                </li>`);
                    }
                }
            }
        });
        $('#productSearch').on('submit',function(e){
            e.preventDefault(); e.stopPropagation();
            if ( $('#searchTerm').val() !== '' ) {
                let results = SEARCH.productSearch(SEARCH.titleCase($('#searchTerm').val()));
                if ( results.length > 0 ) {
                    $('#searchResultList').html('');
                    $('#searchResults').fadeIn();
                    for( let i = 0; i < results.length; i++ ){
                        $('#searchResultList')
                        .append(`<li class="treeview search-single-result">
                                    <a href="/product/${results[i].product_slug}">
                                        <i style="margin:4px 8px" class="icon icon-shopping-basket"></i> <span>${results[i].product_name}</span>
                                    </a>
                                </li>`);
                    }
                }
            }
        });
        $('#searchTerm').on('focusout',function(){
            $('#searchResults').fadeOut();
        });
    }
});