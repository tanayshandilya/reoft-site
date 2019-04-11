const floor = ( num ) => {
  return Math.floor(num * 100) / 100;
}
const cart = { products: [], results: [] };
cart.filterProducts = ( result ) => {
  let found = [];
  for (let i = 0; i < cart.products.length; i++) {
    let _product = result.find((obj) => { 
      return obj.product_code == cart.products[i].product_code;
    });
    if(typeof _product === 'object') {
      _product.product_qty = cart.products[i].qty
      found.push(_product);
    }
  }
  return found;
}
cart.calculateTaxes = () => {
  let productsTotal = 0, shippingTotal = 0, taxTotal = 0, otherTotal = 0;
  for (let i = 0; i < cart.results.length; i++) {
      productsTotal = productsTotal + parseInt(cart.results[i].product_price) * cart.products[i].qty;
      shippingTotal = shippingTotal + parseInt(cart.results[i].product_price) * ( parseInt(cart.results[i].product_shipping_cost) / 100 ) * cart.products[i].qty;
      taxTotal      = taxTotal + parseInt(cart.results[i].product_price) * ( parseInt(cart.results[i].product_tax) / 100 ) * cart.products[i].qty;
      otherTotal    = otherTotal + parseInt(cart.results[i].product_price) * ( parseInt(cart.results[i].product_other_charges) / 100 );
  }
  return {
    calcProduct: floor(productsTotal),
    calcTax: floor(taxTotal),
    calcShip: floor(shippingTotal),
    calcOther: floor(otherTotal)
  };
}

module.exports = cart;