function Product(props) {
  const [product, setProduct] = React.useState();
  const [selectedColorCode, setSelectedColorCode] = React.useState();
  const [selectedSize, setSelectedSize] = React.useState();
  const [quantity, setQuantity] = React.useState(1);
  const [ratingVal, setRatingVal] = React.useState(0);
  const [comments,setComments] = React.useState([]);
  const [commentGrade,setCommentGrade]=React.useState([[],[],[],[],[],[],[],[],[],[],[]])
  const [heartSrc, setHeart] = React.useState(collectionExist());

  React.useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    api.getProduct(id).then((json) => {
      setSelectedColorCode(json.data.colors[0].code);
      setProduct(json.data);
    api.getProductComments(id)
    .then((json)=>{
      setComments(json.result)
      var grades=[]
      for(var i=0; i<json.result.length;i++){
        var grade=[]
        for(var j=0;j<json.result[i].grade;j++){
          grade.push(j)
        }
        grades.push(grade)
      }
      setCommentGrade(grades)
    })
      const jwtToken=window.localStorage.getItem('jwtToken');
      if(!jwtToken){
        document.querySelector('.addCommentBtn').style.display='none';
      }else{
        api.commentCheck(jwtToken,id).then((json) => {
          // console.log(json.result)
          if(json.result === 0){
            document.querySelector('#addCommentBtn').style.display='none';
          }
        })
      }
    });
  }, []);

  if (!product) return (<div className="none">查無此商品</div>);

  function getStock(colorCode, size) {
    return product.variants.find(
      (variant) => variant.color_code === colorCode && variant.size === size
    ).stock;
  }

  function collectionExist(){
    api.CollectionByID(window.localStorage.getItem('jwtToken'),new URLSearchParams(location.search).get('id')).then((json) => {
      if(json.data.length!== 0){
        setHeart("red")
      }
      else{
        setHeart("empty")
      }})
  }
  function renderProductColorSelector() {
    return (
      <div className="product__color-selector">
        {product.colors.map((color) => (
          <div
            key={color.code}
            className={`product__color${color.code === selectedColorCode
              ? ' product__color--selected'
              : ''
              }`}
            style={{ backgroundColor: `#${color.code}` }}
            onClick={() => {
              setSelectedColorCode(color.code);
              setSelectedSize();
              setQuantity(1);
            }}
          />
        ))}
      </div>
    );
  }

  function renderProductSizeSelector() {
    return (
      <div className="product__size-selector">
        {product.sizes.map((size) => {
          const stock = getStock(selectedColorCode, size);
          return (
            <div
              key={size}
              className={`product__size${size === selectedSize ? ' product__size--selected' : ''
                }${stock === 0 ? ' product__size--disabled' : ''}`}
              onClick={() => {
                if (stock === 0) return;
                setSelectedSize(size);
                if (stock < quantity) setQuantity(1);
              }}
            >
              {size}
            </div>
          );
        })}
      </div>
    );
  }

  function renderProductQuantitySelector() {
    return (
      <div className="product__quantity-selector">
        <div
          className="product__quantity-minus"
          onClick={() => {
            if (!selectedSize) return;
            if (quantity === 1) return;
            setQuantity(quantity - 1);
          }}
        />
        <div className="product__quantity-value">{quantity}</div>
        <div
          className="product__quantity-add"
          onClick={() => {
            if (!selectedSize) return;
            const stock = getStock(selectedColorCode, selectedSize);
            if (quantity === stock) return;
            setQuantity(quantity + 1);
          }}
        />
      </div>
    );
  }

  function addToCart() {
    if (!selectedSize) {
      window.alert('請選擇尺寸');
      return;
    }
    const newCartItems = [
      ...props.cartItems,
      {
        color: product.colors.find((color) => color.code === selectedColorCode),
        id: product.id,
        image: product.main_image,
        name: product.title,
        price: product.price,
        qty: quantity,
        size: selectedSize,
        stock: getStock(selectedColorCode, selectedSize),
      },
    ];
    window.localStorage.setItem('cart', JSON.stringify(newCartItems));
    props.setCartItems(newCartItems);
    window.alert('已加入購物車');
  }
  function aboutComment() {
    return (
        <div className="form">
          <div className="zi_box_1">
            <div className="rating" id="rating">
              <i className="fa fa-star-o fa-2x" aria-hidden="true"></i>
              <i className="fa fa-star-o fa-2x" aria-hidden="true"></i>
              <i className="fa fa-star-o fa-2x" aria-hidden="true"></i>
              <i className="fa fa-star-o fa-2x" aria-hidden="true"></i>
              <i className="fa fa-star-o fa-2x" aria-hidden="true"></i>
              </div>
            </div>
            <font id="rating-value"></font>

          <div className="form__field">
          <div className="zi_box_2">
            {/* <div className="form__field-name" id='content'>評論</div> */}
            <textarea className="form__field-input" />
            </div>
          </div>
          <button className="submitCommentBtn" id="submitCommentBtn" onClick={submit}>新增</button>
        </div>
    )
  }
  function commentBlock() {
    document.querySelector('#infoModal').showModal();
    const stars = document.querySelector(".rating").children;
    let ratingValue
    let index
    for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener("mouseover", function () {
        for (let j = 0; j < stars.length; j++) {
          stars[j].classList.remove("fa-star")
          stars[j].classList.add("fa-star-o")
        }
        for (let j = 0; j <= i; j++) {
          stars[j].classList.remove("fa-star-o")
          stars[j].classList.add("fa-star")
        }
      })
      stars[i].addEventListener("click", function () {
        ratingValue = i + 1
        index = i
        document.getElementById("rating-value").innerText = "分數 : " + ratingValue;
        setRatingVal(ratingValue);
      })
      stars[i].addEventListener("mouseout", function () {
        for (let j = 0; j < stars.length; j++) {
          stars[j].classList.remove("fa-star")
          stars[j].classList.add("fa-star-o")
        }
        for (let j = 0; j <= index; j++) {
          stars[j].classList.remove("fa-star-o")
          stars[j].classList.add("fa-star")
        }
      })
    }
  }
  function close() {
    document.querySelector('#infoModal').close();
  }
  function submit() {
    const jwtToken = window.localStorage.getItem('jwtToken')
    var grade = ratingVal;
    var content = document.querySelector('.form__field-input').value;
    if (!content || grade === 0) {
      alert('請填寫完整評論')
    } else {
      // console.log(grade)
      // console.log(content)
      api.addComment(jwtToken, grade, content, product.id)
      close()
      window.location.reload()
    }

  }
  function getProductComment(){
    console.log(comments)
    if(comments.length===0){return '尚無評論'}
  }

  function heart(){

    return(
      <span className="my-heart"><button  onClick={()=>
        { if(heartSrc === "red"){

            setHeart("empty");
            api.delCollection(window.localStorage.getItem('jwtToken'),product.id).then((json) => {
              alert("已刪除收藏")}
            );
          }
          else{
            setHeart("red");
            api.addCollection(window.localStorage.getItem('jwtToken'),product.id).then((json) => {
              alert("已新增到收藏")}
            );
          }
        }
      } className="heart-btn">
      <img  className="heart-img" src = { heartSrc === "red" ? "../../images/heart-fill.svg" : "../../images/heart.svg" }/></button></span>)
  }

  return (
    <div className="product" >
      <img src={product.main_image} className="product__main-image" />
      <div className="product__detail">
        <div className="product__title">{product.title}</div>
        <div className="product__id">{product.id}</div>
        <div className="product__price">TWD.{product.price}{heart()}</div>
        <div className="product__variant">
          <div className="product__color-title">顏色｜</div>
          {renderProductColorSelector()}
        </div>
        <div className="product__variant">
          <div className="product__size-title">尺寸｜</div>
          {renderProductSizeSelector()}
        </div>
        <div className="product__variant">
          <div className="product__quantity-title">數量｜</div>
          {renderProductQuantitySelector()}
        </div>
        <button className="product__add-to-cart-button" onClick={addToCart}>
          {selectedSize ? '加入購物車' : '請選擇尺寸'}
        </button>
        <div className="product__note">{product.note}</div>
        <div className="product__texture">{product.texture}</div>
        <div className="product__description">{product.description}</div>
        <div className="product__place">素材產地 / {product.place}</div>
        <div className="product__place">加工產地 / {product.place}</div>
      </div>
      <div className="product__story">
        <div className="product__story-title">細部說明</div>
        <div className="product__story-content">{product.story}</div>
      </div>
      <div className="product__images">
        {product.images.map((image, index) => (
          <img src={image} className="product__image" key={index} />
        ))}
      </div>
      <button className="addCommentBtn" id="addCommentBtn" onClick={commentBlock}>新增評論</button>

      <div className="commentArea">
      {getProductComment()}
        {comments.map((comment,index)=>(
          <div className="comment">
            <img className="commentPic" src={comment.picture} style={{width:'10%',heigth:'20%'}}></img>
            <div>
              <div className="commentId">編號 : {comment.cId}</div>
              <div className="commentgrade">
                {commentGrade[index].map((x)=>(<i className="fa fa-star small" aria-hidden="true"></i>))}
                評分 : {comment.grade}
              </div>
              <div className="commentUserId">使用者id : {comment.userId}</div>
              <div className="commentContent">評論 : {comment.text}</div>
            </div>
          </div>
        ))}

      </div>
      <dialog id="infoModal">
        <input type='button' id="close" onClick={close} value='X' />
        {aboutComment()}
      </dialog>
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = React.useState(cart);
  return (
    <React.Fragment>
      <Header cartItems={cartItems} />
      <Product cartItems={cartItems} setCartItems={setCartItems} />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
