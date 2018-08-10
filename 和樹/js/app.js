// This is a JavaScript file
//mobile backendのAPIキーを設定
var ncmb = new NCMB("0d28b775c8dadd330b8d348c14bea6772314593808a7d9c5311b0b783cc28421","6e219e088cfa7cbf1a5f4368d7d4131a70c2c88812c428f32d59a12aae5186af");

//mobile backendへの会員登録を行うメソッド
function register(){
    var firstName = document.getElementById('firstName').value;
    var lastName = document.getElementById('lastName').value;
    var old = document.getElementById('old').value;
    var elements = document.getElementsByName('radio');
    var mailAddress = document.getElementById('mailAddress').value;
    var phoneNumber = document.getElementById('phoneNumber').value;
    var password = document.getElementById('password').value;

    //クラス名を指定して新規クラスを作成
    var user = new ncmb.User();

    //radio
    for ( var a="", i=elements.length; i--; ) {
      if ( elements[i].checked ) {
        var checked = elements[i].value ;
        break ;
      }
    }

    user.set("firstName", firstName)
    .set("lastName", lastName)
    .set("old", old)
    .set("sex", checked)
    .set("userName", mailAddress)
    .set("phoneNumber", phoneNumber)
    .set("password",password)
    .save()
    .then(function (obj) {
    // 保存処理成功
        var user = new ncmb.User({userName:mailAddress, password:password});
        ncmb.User.login(user);
        location.href = 'top.html';
    }).catch(function (err) {
        // 保存処理失敗
        alert("保存できませんでした:"+err);
    });
}

function updateTxt(){
  var currentUser = ncmb.User.getCurrentUser(); //カレントユーザーのインスタンス生成・定義
  //テキストに更新入力された値を取得する 
  var firstName = document.getElementById('firstName').value;
  var lastName = document.getElementById('lastName').value;
  var old = document.getElementById('old').value;
  var mailAddress = document.getElementById('mailAddress').value;
  var phoneNumber = document.getElementById('phoneNumber').value;
  //変数currentUserにフィールド名を対応させて値をセットする
  currentUser
  .set('firstName', firstName)
  .set('lastName', lastName)
  .set('old', old)
  .set('userName', mailAddress)
  .set('phoneNumber', phoneNumber)
  .update() //更新メソッド実行
  .then(function (obj) {
    // 保存処理成功
        var user = new ncmb.User({userName:currentUser.get("userName"), password:currentUser.get("password")});
        ncmb.User.login(user);
    }).catch(function (err) {
        // 保存処理失敗
        alert("更新できませんでした:"+err);
    });
}

//mobile backendに登録されてる場合ログインできる
function login(){
  //テキストボックスからユーザー名とパスワードを取得
  var userName = document.getElementById('mailAddress').value;
  var password = document.getElementById('password').value;

  //クラス名を指定して新規クラスを作成
    var user = ncmb.User();

  // ユーザー名とパスワードでログイン
  var user = new ncmb.User({userName:userName, password:password});
  ncmb.User.login(user)
    .then(function(data){
      // ログイン後処理
      location.href = 'top.html';
    })
    .catch(function(err){
      // エラー処理
      alert('入力に誤りがあります');
    });
}
//位置情報取得に成功した場合のコールバック
var onSuccess = function(position){
    var current = new CurrentPoint();
    current.distance = CurrentPoint.distance;   //検索範囲の半径を保持する    
    current.geopoint = position.coords;         //位置情報を保存する
    search(current);
};

//位置情報取得に失敗した場合のコールバック
var onError = function(error){
    console.log("現在位置を取得できませんでした");
};

//位置情報取得時に設定するオプション
var option = {
    timeout: 60000   //タイムアウト値(ミリ秒)
};

//現在地を取得する
var users = Array();
function find(){
    CurrentPoint.distance = 1 ; //検索距離を1kmに設定
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
    var currentUser = ncmb.User.getCurrentUser();
    var usertest;
    var Go = ncmb.DataStore("Go");
    Go.equalTo("flg",true)
    .equalTo("helpUserId",currentUser.get("objectId"))
    .fetchAll()
    .then(function(results){
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        //console.log(object.get("pleaseUser"));
        users[i] = object.get("pleaseUser");
        usertest = object.get("pleaseUser");
      }
    })
    .catch(function(err){
      console.log(err);
    });
}

//現在地を保持するクラスを作成
function CurrentPoint(){
    geopoint=null;  //端末の位置情報を保持する
    distance=0;     //位置情報検索に利用するための検索距離を指定する
}

//mobile backendから位置情報を検索するメソッド
function search(current){
    //位置情報を検索するクラスのNCMB.Objectを作成する
    var SpotClass = NCMB.Object.extend("TimeLine");

    //NCMB.Queryを作成
    var query = new NCMB.Query(SpotClass);
    //位置情報をもとに検索する条件を設定
    var geoPoint = new NCMB.GeoPoint(current.geopoint.latitude,current.geopoint.longitude);
    query.withinKilometers("geo", geoPoint, current.distance);

    //mobile backend上のデータ検索を実行する
    query.find({
      
        success: function(points) {
          var nowpoint = new google.maps.LatLng(current.geopoint.latitude,current.geopoint.longitude);
            //Google mapの設定
          var mapOptions = {
                //中心地設定
                center: new google.maps.LatLng(current.geopoint.latitude,current.geopoint.longitude),
                //ズーム設定
                zoom: 17,
                //地図のタイプを指定
                mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          //idがmap_canvasのところにGoogle mapを表示
          var map = new google.maps.Map(document.getElementById("map_canvas"),
              mapOptions);
          //カレントユーザー取得
          var currentUser = ncmb.User.getCurrentUser();
          //goDB接続
         
          for (var i = 0; i < points.length; i++){
              var point = points[i];
              //console.log(point.length);

              //位置情報オブジェクトを作成            
              var location = point.get("geo");
              var myLatlng = new google.maps.LatLng(location.latitude,location.longitude);

              //店舗名、位置情報、Google mapオブジェクトを指定してマーカー作成メソッドを呼び出し
              for(var j=0 ; j < users.length;j++){
                //console.log(j);
                console.log(users[j]);  
                if(users[j]==point.get("user_id")){
                  markToMap(point.get("firstName") + point.get("lastName"), myLatlng, map);
                  var distance = google.maps.geometry.spherical.computeDistanceBetween(nowpoint, myLatlng);
                }
                //alert("nowpointから" + point.get('name') + "までの距離は" + Math.round(distance) + "mです。");
              }
          }
          markToMap(currentUser.get("firstName")+currentUser.get("lastName"), new google.maps.LatLng(current.geopoint.latitude,current.geopoint.longitude), map);
          
        },
        error: function(error) {
            // 検索に失敗した場合の処理
            console.log(error.message);
        }
    });
}

//スポットを登録する
function saveSpot(){
    //位置情報が取得できたときの処理
    alert('asfdg');
    var onSuccess = function (location){
        var currentUser = ncmb.User.getCurrentUser();
        //記事内容を取得
        var title = $("#name").val();
        
        //位置情報オブジェクトを作成
        var geoPoint = new NCMB.GeoPoint(location.coords.latitude, location.coords.longitude);
        
        //Spotクラスのインスタンスを作成★
        var SpotClass = NCMB.Object.extend("Spot");
        var spot = new SpotClass();

        //値を設定★
        spot.set("name",title);
        spot.set("geo",geoPoint);
        spot.set("user_id", currentUser.get("objectId"));

        //保存を実行★
        spot.save()
        .then(function (obj) {
        // 保存処理成功
            alert("保存しました");
        }).catch(function (err) {
            // 保存処理失敗
            alert("保存できませんでした:"+err);
        });
        //前のページに戻る
        //myNavigator.popPage();
    }
    
    //位置情報取得に失敗した場合の処理
    var onError = function(error){
        console.log("error:" + error.message);
    }
    
    var option = {
        timeout: 60000   //タイムアウト値(ミリ秒)
    };
    
    //位置情報を取得
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
}
function markToMap(name, position, map){
    var marker = new google.maps.Marker({
        position: position,
        title:name
    });
    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function() {
        var infowindow = new google.maps.InfoWindow({
            content:marker.title
        });
        infowindow.open(map,marker);
    });
}
/* テキストエリアの初期設定. */
 
// [1] height:30pxで指定
$("#sos").height(30);
// [2] lineHeight:20pxで指定<ユーザ定義>(※line-heightと間違えないように)
$("#sos").css("lineHeight","20px");
 
/**
 * 高さ自動調節イベントの定義.
 * autoheightという名称のイベントを追加します。
 * @param evt
 */
$("#sos").on("autoheight", function(evt) {
  // 対象セレクタをセット
  var target = evt.target;
 
  // CASE1: スクロールする高さが対象セレクタの高さよりも大きい場合
  // ※スクロール表示される場合
  if (target.scrollHeight > target.offsetHeight) {
    // スクロールする高さをheightに指定
    $(target).height(target.scrollHeight);
  }
  // CASE2: スクロールする高さが対象セレクタの高さよりも小さい場合
  else {
    // lineHeight値を数値で取得      
    var lineHeight = Number($(target).css("lineHeight").split("px")[0]);
    
    while (true) {
      // lineHeightずつheightを小さくする
      $(target).height($(target).height() - lineHeight);
      // スクロールする高さが対象セレクタの高さより大きくなるまで繰り返す
      if (target.scrollHeight > target.offsetHeight) {
        $(target).height(target.scrollHeight);
        break;
      }
    }
  }
});
// DOM読み込み時に実行
$(document).ready(function() {
  // autoheightをトリガする
  $("#sos").trigger('autoheight');
});

function sosTxt(){
    alert('adsv');
    var currentUser = ncmb.User.getCurrentUser();
    var user_id = currentUser.get("objectId"); //currentUser.objectIdを取得
    var firstName = currentUser.get("firstName");
    var lastName = currentUser.get("lastName");
    var timeline = ncmb.DataStore("TimeLine");
    var time = new timeline();
    var txt = document.getElementById("sos").value;
    
    //位置情報が取得できたときの処理
    var onSuccess = function (location){
      alert('adsv11');
        var currentUser = ncmb.User.getCurrentUser();
        //記事内容を取得
        var title = $("#name").val();
        
        //位置情報オブジェクトを作成
        var geoPoint = new NCMB.GeoPoint(location.coords.latitude, location.coords.longitude);
        
        //Spotクラスのインスタンスを作成★
        var SpotClass = NCMB.Object.extend("Spot");
        var spot = new SpotClass();
        alert('adsv22');
        time.set("user_id", user_id)
        .set("firstName", firstName)
        .set("lastName", lastName)
        .set("memo", txt)
        .set("geo", geoPoint)
        .save()
        .then(function(gameScore){
        // 保存後の処理
          alert('保存成功');
        })
        .catch(function(err){
        // エラー処理
          alert('保存失敗' + err)
        });
    }

    //位置情報取得に失敗した場合の処理
    var onError = function(error){
        console.log("error:" + error.message);
    }
    
    var option = {
        timeout: 60000   //タイムアウト値(ミリ秒)
    };
    
    //位置情報を取得
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);    
}
function sosGo(ele){
  console.log(ele.id);
  var currentUser = ncmb.User.getCurrentUser();
  var go = ncmb.DataStore("Go");
  go = new go();
  var timeline = ncmb.DataStore("TimeLine");
  var PleaseUserId;

  timeline.equalTo("objectId",ele.id)
    .fetchAll()
    .then(function(results){
      for (var i = 0; i < results.length; i++) {
        var object = results[i];
        console.log(object.get("user_id"));
        PleaseUserId = object.get("user_id");
      }
      console.log(PleaseUserId);
      go.set('TimeLineObjectId', ele.id)
      .set('pleaseUser',PleaseUserId )
      .set('helpUserId', currentUser.get('objectId'))
      .set('helpUserName', currentUser.get('firstName') + " " +currentUser.get('lastName'))
      .set('flg', false)
      .save()
      .then(function(Object){
      // 保存後の処理
        alert('保存成功');
      })
      .catch(function(err){
      // エラー処理
        alert('保存失敗' + err);
      });

    })
    .catch(function(err){
      console.log(err);
    });
  
}

function sosEnt(ele){
  var go = ncmb.DataStore("Go");
  var currentUser = ncmb.User.getCurrentUser();

  go.equalTo("objectId", ele.id)
    .fetch()
    .then(function(results) {
        results.set("flg", true);
        return results.update()
        .then(function(Object){
        // 保存後の処理
          alert('保存成功');
        })
        .catch(function(err){
        // エラー処理
          alert('保存失敗' + err);
        });
    });
}
function sosDel(ele){
  var TimeLine = ncmb.DataStore("TimeLine");
  var item = new TimeLine();
  item.set("objectId", ele.id); // objectIdを指定
  item.delete()
  .then(function(result){
    alert('成功');
    fn.load('page9.html');
  })
  .catch(function(err){
    alert('失敗' + err);
  });
}
