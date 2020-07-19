const WXAPI = require('../../wxapi/main')
const CONFIG = require('../../config.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    indicatorDots: true,
    autoplay: true,
    interval: 3000,
    duration: 1000,
    loadingHidden: false, // loading
    userInfo: {},
    swiperCurrent: 0,
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    scrollTop: 0,
    loadingMoreHidden: true,

    hasNoCoupons: true,
    coupons: [],
    searchInput: '',

    curPage: 1,
    pageSize: 20,
    cateScrollTop: 0
  },

  tabClick: function(e) {
    let offset = e.currentTarget.offsetLeft;
    if (offset > 150) {
      offset = offset - 150
    } else {
      offset = 0;
    }
    this.setData({
      activeCategoryId: e.currentTarget.id,
      curPage: 1,
      cateScrollTop: offset
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  //事件处理函数
  swiperchange: function(e) {
    //console.log(e.detail.current)
    this.setData({
      swiperCurrent: e.detail.current
    })
  },
  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  toCategory: function(e) {
    console.log('33333333333333333333333333333333');
    console.log(e);
    app.globalData.catagory_switch_id = e.currentTarget.dataset.id;
    wx.switchTab({
      url: "/pages/category/category",
      success(res){
        let page = getCurrentPages().pop();
        if(page == undefined || page == null){
              return
        }
        page.onLoad();
  }
    })
    console.log('555555555555555')
    console.log(app.globalData.catagory_switch_id)
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
  onLoad: function(e) {
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {        
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    /**
     * 示例：
     * 调用接口封装方法
     */
    WXAPI.banners({
      type: 'index'
    }).then(function(res) {
      if (res.code == 700) {
        wx.showModal({
          title: '提示',
          content: '请在后台添加 banner 轮播图片，自定义类型填写 index',
          showCancel: false
        })
      } else {
        that.setData({
          banners: res.data
        });
      }
    }).catch(function(e) {
      wx.showToast({
        title: res.msg,
        icon: 'none'
      })
    })
    WXAPI.goodsCategory().then(function(res) {
      var categories = [{
        id: 0,
        name: "全部"
      }];
      if (res.code == 0) {
        for (var i = 0; i < res.data.length; i++) {
          categories.push(res.data[i]);
        }
      }
      that.setData({
        categories: categories,
        activeCategoryId: 0,
        curPage: 1
      });
      that.getGoodsList(0);
    })
    that.getCoupons();
    that.getNotice();
  },
  onPageScroll(e) {
    let scrollTop = this.data.scrollTop
    this.setData({
      scrollTop: e.scrollTop
    })
  },
  getGoodsList: function(categoryId, append) {
    if (categoryId == 0) {
      categoryId = "";
    }
    var that = this;
    wx.showLoading({
      "mask": true
    })
    WXAPI.goods({
      categoryId: categoryId,
      nameLike: that.data.searchInput,
      page: this.data.curPage,
      pageSize: this.data.pageSize
    }).then(function(res) {
      wx.stopPullDownRefresh();
      wx.hideLoading()
      if (res.code == 404 || res.code == 700) {
        let newData = {
          loadingMoreHidden: false
        }
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
      for (var i = 0; i < res.data.length; i++) {
        goods.push(res.data[i]);
      }
      that.setData({
        loadingMoreHidden: true,
        goods: goods,
      });
    })
  },
  getCoupons: function() {
    var that = this;
    WXAPI.coupons().then(function (res) {
      if (res.code == 0) {
        that.setData({
          hasNoCoupons: false,
          coupons: res.data
        });
      }
    })
  },
  onShareAppMessage: function() {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + CONFIG.shareProfile,
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid'),
      success: function(res) {
        // 转发成功
      },
      fail: function(res) {
        // 转发失败
      }
    }
  },
  getNotice: function() {
    var that = this;
    WXAPI.noticeList({pageSize: 5}).then(function (res) {
      if (res.code == 0) {
        that.setData({
          noticeList: res.data
        });
      }
    })
  },
  listenerSearchInput: function(e) {
    this.setData({
      searchInput: e.detail.value
    })

  },
  toSearch: function() {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId);
  },
  onReachBottom: function() {
    this.setData({
      curPage: this.data.curPage + 1
    });
    this.getGoodsList(this.data.activeCategoryId, true)
  },
  onPullDownRefresh: function() {
    this.setData({
      curPage: 1
    });
    this.getGoodsList(this.data.activeCategoryId)
  }
})