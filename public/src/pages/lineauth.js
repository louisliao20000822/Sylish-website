function Lineauth() {
  const [profile, setProfile] = React.useState();
  const [LineID, setLineID] = React.useState("");
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
  }, [LineID]);
  return (
    <div className="line__auth">
      <div className="line__auth__title">授權登入</div>
      {profile && (
        <div className="line__auth__content">
          <button className="product__add-to-cart-button" onClick={()=>{
            const id = new URLSearchParams(location.search).get('id');
            const jwtToken = window.localStorage.getItem('jwtToken');
            api.addLineAuth(jwtToken,id).then(() => setLineID(id));
            window.location.href = '/lineauth.html';
          }}>
            { profile.lineuuid!==null? '取消授權' : '授權'}
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  return (
    <React.Fragment>
      <Header cartItems={cart} />
      <Lineauth />
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.render(<App />, document.querySelector('#root'));
