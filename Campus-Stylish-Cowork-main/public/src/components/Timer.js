
const useCountdown = (targetDate) => {
  const countDownDate = new Date(targetDate).getTime();

  const [countDown, setCountDown] =  React.useState(
    countDownDate - new Date().getTime()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountDown(countDownDate - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [countDownDate]);

  return getReturnValues(countDown);
};

const CountdownTimer = ( targetDate ) => {
    const [days, hours, minutes, seconds] = useCountdown(targetDate);
  
    if (days + hours + minutes + seconds <= 0) {
      return ExpiredNotice();
    } else {
      return ShowCounter(days,hours,minutes,seconds);

      
    }
  };

const ExpiredNotice = () => {

    return (
        <div className="expired-notice">
        <span>活動已結束</span>
        <p>請期待下次的活動</p>
        </div>
    );
};

const ShowCounter = ( days, hours, minutes, seconds ) => {
    return (
      <div className="show-counter">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="countdown-link"
        >
        {DateTimeDisplay(days,'Days',!(days==0))}
        <p>:</p>
        {DateTimeDisplay(hours,'Hours',!(days==0&&hours==0))}
        <p>:</p>
        {DateTimeDisplay(minutes,'Mins',!(days==0&&hours==0&&minutes==0))}
        <p>:</p>
        {DateTimeDisplay(seconds,'Seconds',!(days==0&&hours==0&&minutes==0&&seconds==0))}
        </a>
      </div>
    );
  };

const DateTimeDisplay = (value, type, isDanger ) => {
    return (
      <div className={isDanger ? 'countdown danger' : 'countdown'}>
        <p>{value}</p>
        <span>{type}</span>
      </div>
    );
  };

  

const getReturnValues = (countDown) => {
  // calculate time left
  const days = 0;
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

function getdiscount(object){

    api.addDiscount(window.localStorage.getItem('jwtToken'),{"discountNumber" : object.discountNumber,
                                                             "substract" : object.substract,
                                                             "times" : "1",
                                                             "cate" : object.cate,
    }).then((json) => {if(json.message) alert(json.message)
                       else
                        alert("成功領取");
                      }   
  );
}

function Timer({datetime,object}) {

  
    return (
      <div>
        <h1 className="title">優惠碼限時搶!</h1>
        {CountdownTimer(datetime)}
        {datetime-1000>new Date().getTime()&&(
        <div>
        <div className="container">
            <div className="coupon-card">
                <h2>Stylish</h2>
                <h1>TWD.{object.substract}</h1>
                <div className="coupon-row">
                  <span id="cpnBtn">Code</span>
                    <span id="cpnCode">{object.discountNumber}</span>
                </div>
                <p>過期時間 : 無</p>
                <div className="circle1"></div>
                <div className="circle2"></div>
            </div>
        </div>
        <div className="button">
          <button onClick={() => getdiscount(object)} className="btn btn-one">
            <span>領取</span>
          </button>
        </div>
        </div>)
        }
      </div>
    );
  }