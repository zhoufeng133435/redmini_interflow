import { addFavorite, checkFavorite, getArticleBaseInfo, checkLogin, getRelatedProduct } from '../../api/api.js';
import { getInvitePath } from '../../utils/getPageRoute.js';
import { formatDate } from '../../utils/util.js';
import { host } from '../../api/config.js';
const app = getApp();
Page({
  data: {
    linkList: [],
    // 带货商品数组
    isTap: false,
    articleId: '',
    articleDetail: {},
    hasRelated: false,
    relatedDia: false,
    productList: [],
    hotelList: [],
    diaShow: false,
    coverImg: '',
    nodes: '',
    showSuccessDialog: false,
    showLinkList: true
  },

  onLoad(options) {
    if (options.articleId) {
      this.setData({
        articleId: options.articleId
      });
    } else if (options.scene) {
      try {
        let _arr = options.scene.split('_');

        let articleId = _arr[1];
        this.setData({
          articleId
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      xhs.showToast({
        title: '缺少必要参数',
        icon: 'none'
      });
    }

    this.getTapNumber();
    this.getArticleDetail();
  },

  onListClose() {
    this.setData({
      showLinkList: false
    });
  },

  onDialogClose() {
    this.setData({
      showSuccessDialog: false
    });
  },

  backToHome() {
    xhs.switchTab({
      url: '/pages/home/home'
    });
  },

  diaClose() {
    this.setData({
      diaShow: false
    });
  },

  shareDia() {
    this.setData({
      diaShow: true
    });
  },

  openDia() {
    let {
      productList,
      hotelList,
      articleId
    } = this.data;

    if (productList.length > 0 || hotelList.length > 0) {
      this.setData({
        relatedDia: true
      });
    } else {
      xhs.showLoading({
        title: '正在加载中'
      });
      getRelatedProduct(articleId).then(result => {
        xhs.hideLoading();
        let {
          data,
          sc
        } = result.data;

        if (sc == 0) {
          let _set = {
            relatedDia: true
          };
          if (data.merchantList) _set.hotelList = data.merchantList;
          if (data.productList) _set.productList = data.productList;
          this.setData(_set);
        }
      }).catch((e) => console.log(e))
    }
  },

  closeDia() {
    this.setData({
      relatedDia: false
    });
  },

  navToHotel(e) {
    xhs.navigateTo({
      url: '/pages/index/index?noBar=true&hotelId=' + e.currentTarget.dataset.id
    });
  },

  navToProduct(e) {
    xhs.navigateTo({
      url: '/pages/productDetail/productDetail?productId=' + e.currentTarget.dataset.id
    });
  },

  getTapNumber() {
    checkFavorite(this.data.articleId).then(result => {
      let {
        data,
        sc
      } = result.data;

      if (sc == 0) {
        for (let i in data) {
          if (data[i].favtype == 5 && data[i].status == 1) {
            this.setData({
              isTap: true
            });
          }
        }
      }
    });
  },

  sendTapMsg() {
    let url = '/pages/articleDetail/articleDetail?articleId=' + this.data.articleId;
    checkLogin().then(result => {
      let {
        data,
        sc
      } = result.data;

      if (sc == 0) {
        addFavorite(this.data.articleId, 5).then(respone => {
          let {
            data,
            sc
          } = respone.data;

          if (sc == 0) {
            let isTap = false;

            for (let i in data) {
              if (data[i].favtype == 5 && data[i].status == 1) {
                isTap = true;
              }
            }

            if (isTap) {
              let praiseNum = Number(this.data.articleDetail.praiseNum) + 1;
              this.setData({
                'articleDetail.praiseNum': praiseNum,
                isTap
              });
            } else {
              let praiseNum = Number(this.data.articleDetail.praiseNum) - 1;
              this.setData({
                'articleDetail.praiseNum': praiseNum,
                isTap
              });
            }
          } else {
            xhs.showToast({
              title: sc
            });
          }
        });
      } else if (sc == -1) {
        xhs.navigateTo({
          url: '/pages/login/login?nextUrl=' + encodeURIComponent(url)
        });
      } else {
        xhs.showToast({
          title: sc
        });
      }
    });
  },

  getArticleDetail() {
    getArticleBaseInfo(this.data.articleId).then(result => {
      let {
        data,
        sc
      } = result.data;
      let that = this;

      if (sc == 0) {
        let show = data.readNum;

        if (data.readNum >= 1000 && data.readNum < 100000) {
          let _show = data.readNum / 1000;

          show = _show.toFixed(1) + 'k';
        } else if (data.readNum >= 100000) {
          show = 10 + 'W+';
        }

        let coverImg = host + '/html/hotelimg' + data.listImg.split(/.com|.cn/)[1];
        data.show = show;
        data.showDate = formatDate(new Date(Number(data.publishTime)));
        this.setData({
          articleDetail: data,
          hasRelated: data.hasRelated,
          coverImg,
          nodes: this.replaceImg(data.htmlDesc)
        });
      }
    });
  },

  onShareAppMessage() {
    let imageUrl = this.data.articleDetail.listImg + '?imageView2/1/w/500/h/400/format/jpg';
    let title = this.data.articleDetail.title;
    let path = getInvitePath();
    return {
      title,
      imageUrl,
      path
    };
  },

  async onTapBuy() {
    xhs.showLoading({
      title: '正在加载中'
    });
    const res = await getRelatedProduct(this.data.articleId);
    xhs.hideLoading();
    const {
      data: {
        data: {
          linkList
        },
        sc
      }
    } = res;
    if (sc !== "0") return;

    if (linkList.length === 1) {
      this.handleClickLink(linkList[0]);
    } else {
      this.setData({
        linkList,
        showLinkList: true
      });
    }
  },

  handleTapListBuy(e) {
    const index = e.target.dataset.index;
    const link = this.data.linkList[index];
    this.handleClickLink(link);
  },

   async handleClickLink(link) {
    if (link.platform === 'fz') {
      await xhs.setClipboardData({
        data: link.h5Url,
      })
      xhs.hideLoading();
      xhs.hideToast();
      this.setData({
        showLinkList: false,
        showSuccessDialog: true
      });
    } else {
      xhs.navigateToMiniProgram({
        appId: link.appId,
        path: link.liteUrl
      });
    }
  },

  replaceImg (text) {
    if (!text) return
    const reg =  /\<img/gi
    return text.replace(reg, '<img style="max-width:100% !important;height:auto !important;"')
  }
});