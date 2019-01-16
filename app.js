const request = require('request');
var compression = require('compression')
var express = require('express')
var router = express.Router();

var app = express()
var port = process.env.PORT || 8080;
// compress responses
app.use(compression())


// server-sent event stream
app.get('/index', function (req, res) {

    var response = {
  "code": 200,
  "msg": "操作成功",
  "obj": {
    "productList": [
      {
        "productCode": "10000001",
        "productName": "自营产品 1",
        "productPrice": 2500,
        "originalPrice": 5500,
        "productNum": 198,
        "productDetail": "",
        "productSpec": "",
        "productType": 1,
        "productImages": [
          "",
          ""
        ],
        "productStyle": "金色"
      },
        {
        "productCode": "10000001",
        "productName": "他营产品 2",
        "productPrice": 2500,
        "originalPrice": 5500,
        "productNum": 198,
        "productDetail": "",
        "productSpec": "",
        "productType": 2,
        "productImages": [
          "",
          ""
        ],
        "productStyle": "金色"
      },
        {
        "productCode": "10000001",
        "productName": "热销产品 3",
        "productPrice": 2500,
        "originalPrice": 5500,
        "productNum": 198,
        "productDetail": "",
        "productSpec": "",
        "productType": 3,
        "productImages": [
          "",
          ""
        ],
        "productStyle": "金色"
      },
        {
        "productCode": "10000001",
        "productName": "自营产品 2",
        "productPrice": 2500,
        "originalPrice": 5500,
        "productNum": 198,
        "productDetail": "",
        "productSpec": "",
        "productType": 2,
        "productImages": [
          "",
          ""
        ],
        "productStyle": "金色"
      }
    ],
    "advertMap": {
      "INDEX_TOP": [
        {
          "imageUrl": "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2070678725,1620419579&fm=27&gp=0.jpg",
          "linkUrl": "www.baidu.com",
          "sort": 1
        },
          {
          "imageUrl": "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1510386034216&di=4c1b3310db2e77f0c638a2443d8c6cd7&imgtype=jpg&src=http%3A%2F%2Fimg1.imgtn.bdimg.com%2Fit%2Fu%3D3206083891%2C4134437313%26fm%3D214%26gp%3D0.jpg",
          "linkUrl": "www.baidu.com",
          "sort": 1
        }
      ]
    },
    "productCategoryList": [
      {
        "categoryId": 0,
        "categoryName": "全部"
      },
      {
        "categoryId": 1,
        "categoryName": "自营"
      },
      {
        "categoryId": 2,
        "categoryName": "他营"
      },
      {
        "categoryId": 3,
        "categoryName": "热销"
      }
    ]
  }
}

      
        res.send(response);

})

app.listen(port, function() {
    console.log('Our app is running on http://localhost:' + port);
});
