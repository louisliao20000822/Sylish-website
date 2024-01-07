function Profile() {
  const [profile, setProfile] = React.useState();
  const [discount, setDiscount] = React.useState();
  const params = new URLSearchParams(location.search);
  React.useEffect(() => {
    const jwtToken = window.localStorage.getItem('jwtToken');

    if (!jwtToken) {
      window.alert('請先登入');
      fb.loadScript()
        .then(() => fb.init())
        .then(() => fb.getLoginStatus())
        .then((response) => {
          if (response.status === 'connected') {
            return Promise.resolve(response.authResponse.accessToken);
          }
          return fb.login().then((response) => {
            if (response.status === 'connected') {
              return Promise.resolve(response.authResponse.accessToken);
            }
            return Promise.reject('登入失敗');
          });
        })
        .then((accessToken) =>
          api.signin({
            provider: 'facebook',
            access_token: accessToken,
          })
        )
        .then((json) => {
          window.localStorage.setItem('jwtToken', json.data.access_token);
          return api.getProfile(json.data.access_token);
        })
        .then((json) => setProfile(json.data))
        .catch((error) => window.alert(error));
      return;
    }
    api.getProfile(jwtToken).then((json) => setProfile(json.data));
    api.getDiscount(jwtToken).then((json) => setDiscount(json.data));
  }, []);

  const handleSubmit = event =>{
    event.preventDefault();
    const formData = new FormData(event.target);
    const formProps = Object.fromEntries(formData);
    const jwtToken = window.localStorage.getItem('jwtToken');
    if(formProps.card.length!==16){
      alert("invalid card number")
      return;
    }
    api.editProfile(jwtToken,formProps).then((json) => {if(json!==null)alert("成功")});
    return;
  }
  if(!profile||!discount) return null;
  if(!params) return null;
  return (

    <div className="profile-page">
    <div className="sidenav">
        <div className="profile">
            <img src={profile.picture} alt="" width="100" height="100"/>

            <div className="name">
                {profile.name}
            </div>
            <div className="job">
                一般用戶
            </div>
        </div>

        <div className="sidenav-url">
            <div className="url">

                <a href="/profile.html" >會員資料</a>

            </div>
            <div className="url">
                <a href="?Edit">編輯資料</a>

            </div>
            <div className="url">
            <button
                onClick={() => {
                  window.location.href = '/collection.html';
                } } className="collect-btn">
                我的收藏
            </button>
            </div>
            <div className="url">
            <button
                onClick={() => {
                  fb.logout();
                  window.localStorage.removeItem('jwtToken');
                  window.location.href = '/';
                } } className="logout-btn">
                登出
            </button>
            </div>
        </div>
    </div>
    {!params.has('Edit')&&
    <div className="main">
        <h2>會員資料</h2>
        <div className="card">
            <div className="card-body">
                <i className="fa fa-pen fa-xs edit"></i>
                <table>
                    <tbody>
                        <tr>
                            <td>Name</td>
                            <td>:</td>
                            <td>{profile.name}</td>
                        </tr>
                        <tr>
                            <td>Email</td>
                            <td>:</td>
                            <td>{profile.email}</td>
                        </tr>
                        <tr>
                            <td>生日</td>
                            <td>:</td>
                            <td>{profile.birthday}</td>
                        </tr>
                        <tr>
                            <td>信用卡</td>
                            <td>:</td>
                            <td>************{profile.card}</td>
                        </tr>
                        <tr>
                            <td>地址</td>
                            <td>:</td>
                            <td>{profile.address}</td>
                        </tr>
                        <tr>
                            <td>電話</td>
                            <td>:</td>
                            <td>{profile.phone}</td>
                        </tr>
                        <tr>
                            <td>消費金額</td>
                            <td>:</td>
                            <td>{profile.spend}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    }
    {params.has('Edit')&&
    <div className="main">
        <div className="card">
            <div className="card-body">
                <h2>編輯資料</h2>
                  <form onSubmit = {handleSubmit} >
                    <label className="label-text" htmlFor="fname">卡號<input className="input-text"  type="password" inputMode="numeric" maxLength="16"  name="card"   placeholder={"************"+profile.card}/></label>


                    <label className="label-text" htmlFor="fname">生日<input className="input-text" type="text"  name="birthday" placeholder={profile.birthday}/></label>


                    <label className="label-text" htmlFor="fname">電話<input  className="input-text" type="text"  name="phone"   pattern="[0-9\/]*" placeholder={profile.phone}/></label>




                    <label className="label-text" htmlFor="fname">地址<input className="input-text" type="text"  name="address" placeholder={profile.address}/></label>



                    <input type="submit" value="確認"/>

                  </form>
            </div>
        </div>
    </div>
    }
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return (
    <React.Fragment>
      <Header cartItems={cart} />
      <Profile />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
