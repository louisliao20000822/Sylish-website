function Favourite(props) {
  const [products, setProduct] = React.useState();
  const [collect_id,setCollect] = React.useState();
  React.useEffect(() => {
    api.getCollection(window.localStorage.getItem('jwtToken')).then((json) => {
      setProduct(json.data);
      console.log(json.data);
    });



  }, []);

  // React.useEffect(() => {

  //     collect_id.map((product) => {
  //       console.log(product);
  //       api.getProduct(product.id).then((json) => {

  //         setProduct([...product, json.data]);
  //         console.log(json.data);
  //       });})

  // }, []);

  function renderProductColorSelector(product) {
    console.log(product);
    return (
      <div className="product__color-selector">
        {product.colors.map((color) => (
          <div
            key={color.code}
            className={`product__color`}
            style={{ backgroundColor: `#${color.code}` }}
          />
        ))}
      </div>
    );
  }

  function renderProductSizeSelector(product) {
    return (
      <div className="product__size-selector">
        {product.sizes.map((size) => {
          return (
            <div
              key={size}
              className={`product__size`}
            >
              {size}
            </div>
          );
        })}
      </div>
    );
  }

  if (!products) return null;

    return(
      <div>
        <div class="wrapper">
        {products.map((product)=>
          <div class="outer">
            <div class="content animated fadeInLeft">
              <span class="bg animated fadeInDown">AVAILABLE</span>
              <h1>{product.title}</h1>
              <h2>TWD.{product.price}</h2>
              <h3>{product.id}</h3>
              {/* <div className="product__variant">
                <div className="product__color-title">顏色｜</div>
                {renderProductColorSelector(product)}
              </div>
              <div className="product__variant">
                <div className="product__size-title">尺寸｜</div>
                {renderProductSizeSelector(product)}
              </div> */}

              <div class="button">
                <a class="cart-btn" href={`./product.html?id=${product.id}`}><i class="cart-icon ion-bag">馬上購買</i></a>
              </div>
              <button className="del-btn" onClick={()=> {api.delCollection(window.localStorage.getItem('jwtToken'),product.id).then((json) => {alert("已刪除收藏");window.location.reload();})}}>
              <img src={"../../images/cart-remove.png"}/></button>


            </div>

            <img src={`/assets/${product.id}/${product.main_image}`} width="300px" class="animated fadeInRight"/>
          </div>)}
        </div>
      </div>
      )


}

function App() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return (
      <React.Fragment>
        <Header cartItems={cart} />
        <Favourite />
        <Footer />
      </React.Fragment>
    );
  }

  ReactDOM.render(<App />, document.querySelector('#root'));