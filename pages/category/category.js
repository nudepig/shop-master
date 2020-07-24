// pages/category/category.js

const WXAPI = require('../../wxapi/main')
var app = getApp()

Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false , // loading
    userInfo: {},
    swiperCurrent: 0,  
    selectCurrent:0,
    categories: [],
    activeCategoryId: 0,
    activeSmallId: 0,
    goods:[],
    scrollTop:0,
    loadingMoreHidden:true,

    hasNoCoupons:true,
    coupons: [],
    searchInput: '',

    curPage:1,
    pageSize:20
  },

  cateClick: function (e) {
    this.setData({
      activeSmallId: e.currentTarget.id,
      curPage: 1
    });
    this.getGoodsList(this.data.activeSmallId);
  },


  tabClick: function (e) {
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function(e) {
       this.setData({  
        swiperCurrent: e.detail.current  
    })  
  },
  toDetailsTap:function(e){
    wx.navigateTo({
      url:"/pages/goods-details/index?id="+e.currentTarget.dataset.id
    })
  },
  tapBanner: function(e) {
    if (e.currentTarget.dataset.id != 0) {
      wx.navigateTo({
        url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
      })
    }
  },
  bindTypeTap: function(e) {
     this.setData({  
        selectCurrent: e.index  
    })  
  },
  onLoad: function () {

    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    WXAPI.goodsCategory().then(function(res) {
        var catagory_switch_id = 37
        if (app.globalData.catagory_switch_id) {
          catagory_switch_id = app.globalData.catagory_switch_id;
        }
        var categories = [{id:catagory_switch_id, name:""}];
        if (res.code == 0) {
          for (var i = 0; i < res.data.length; i++) {
            categories.push(res.data[i]);
          }
        }
        that.setData({
          categories:categories,
          activeCategoryId:catagory_switch_id,
          curPage: 1
        });
        that.getGoodsList(catagory_switch_id);
      })
  },

  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
   },
  getGoodsList: function (categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    let data = {
        categoryId: categoryId,
        nameLike: that.data.searchInput,
        page: that.data.curPage,
        pageSize: that.data.pageSize
    };
    wx.showLoading({
      "mask":true
    })
    WXAPI.goods(data).then(function(res) {
        wx.hideLoading()        
        if (res.code == 404 || res.code == 700){
          let newData = { loadingMoreHidden: false }
          if (!append) {
            newData.goods = []
          }
          that.setData(newData);
          return
        }
        let goods = [];
        if (append) {
          goods = that.data.goods
        }        
        for(var i=0;i<res.data.length;i++){
          goods.push(res.data[i]);
        }
        that.setData({
          loadingMoreHidden: true,
          goods:goods,

        });
      })
  },
  listenerSearchInput: function (e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch : function (){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  onPullDownRefresh: function(){
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
  },
  onReachBottom: function () {
    this.setData({
      curPage: this.data.curPage+1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
})