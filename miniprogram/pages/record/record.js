// pages/record/record.js
const app = getApp()
import store from "../../utils/store.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    likedList:[],
    imageURL: ["https://img3.doubanio.com/view/photo/albumcover/public/p1563537010.jpg",      "https://qpic.y.qq.com/music_cover/jCPNL5FMs23Uk4XAo5aTmTouKW7kaU5km2nPBkIPXdiawtBBO4vqCPg/300?n=1",
    "https://qpic.y.qq.com/music_cover/G3Ul1DUJzK1PpbH6r4GKq1KEF2kosMx6mVYI03yHjWAWq2Ribic3eSww/300?n=1",
    "https://qpic.y.qq.com/music_cover/CXricxSibts8cC0Pl3TdOV0Gr0wG59zIndejB7VoUpIYYY7QPp4h99bw/300?n=1",
    "cloud://cloud-demo-l5rvx.636c-cloud-demo-l5rvx-1300498757/my-image3424.496308442722.jpg"],
    liked:0,
    show:false,
    myTeams:[],
    currentTeamName:"",
    defaultTeamName:"",
    unchoose:true,
    defaultTeam:"默认",
    currentMembers:[],
    likeNum:1,
    userMomentsTest:[{name:"hhhhh",moment:"kkkkkkk",stars:22},{name:"uuuu",moment:"ooooooo",stars:19}],
    userMoments:[],
    photoPath:"",
    change:true,
    openid:"",
    userInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this
    console.log(app.globalData)
    this.setData({
      userInfo: app.globalData.userInfo,
      openid: app.globalData.openid
    })
    if (store.dataFromWriteRecord!==undefined){
      wx.cloud.downloadFile({
        fileID:store.dataFromWriteRecord.photoId
      }).then(res => {
        // get temp file path 
        //console.log(res.tempFilePath)
        return res.tempFilePath
      }).then(path => {
        return  [...this.data.imageURL, path]
      }).then(list=>{
        that.setData({
          imageURL:list 
        })
      })
    }
    const db = wx.cloud.database()
    db.collection('member').where({
      _openid:that.data.openid
    }).get().then(res => {
      // res.data 包含该记录的数据
      console.log(res.data[0].teams)
      return res.data[0].teams
    }).then(t=>{
      //console.log(t.map(a => a.id))  
      return t.map(a => a.name)
    }).then(l => {
      that.setData({
        myTeams: l,
        currentTeamName:l[0],//默认团队为该成员的index0团队 
      })
      return l[0]
    }).then(name=>{
        db.collection("team").where({
          name: name,
        }).get().then(res => {
          console.log('member',res.data[0])
          return res.data[0].member
        }).then(t => {
          console.log("id",t)
          return t.map(a => a.id)
        }).then(l => {
          console.log('l',l)
          that.setData({
            currentMembers: l
          })
          console.log("that.data",that.data)
          console.log('length',l.length)
          that.setData({
            userMoments:[]
          })
          for(let i=0;i<l.length;i++){
            console.log('l[i]',l[i])
            wx.cloud.callFunction({
              name: "get_dongtai",
              data: {
                //id: idList[i]
                id: l[i]
              },
              success: function (res) {
                console.log('update', res.result.data.update)
                //that.data.userMoments.push(res.result.data.update)
                
                that.setData({
                  userMoments: that.data.userMoments.concat(res.result.data.update),
                })
              },
              fail: console.error
            })
          }
          console.log('userMoments',that.data.userMoments)
        })
      }
    )
    const len = 40
    this.setData({
      likedList: Array.from({ length: len }, () => '#C9C9C9')
    })

 
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },
  addRecord(){
    wx.navigateTo({
      url: '../record_write/record_write',
      success: function(res){
        // success
      },
      fail: function() {
        // fail
      },
      complete: function() {
        // complete
      }
    })

  },
  addToLike(e){

    console.log(e.target.dataset.stars)
    if (e.target.dataset.flag ==="#C9C9C9") {
      e.target.dataset.stars++
      let param = {}
      let string = "likedList[" + e.target.dataset.index + "]"
      param[string] = "red"
      this.setData(param)
      let param_2 = {}
      let string_2 = "userMoments["+e.target.dataset.index+"].stars"
      param_2[string_2] = e.target.dataset.stars++
      this.setData(param_2)

    }
    else {
      e.target.dataset.stars--
      let param_ = {}
      let string_ = "likedList[" + e.target.dataset.index + "]"
      param_[string_] = "#C9C9C9"
      this.setData(param_)
      let param_3 = {}
      let string_3 = "userMoments[" + e.target.dataset.index + "].stars"
      param_3[string_3] = e.target.dataset.stars--
      this.setData(param_3)

    }

  }
  ,
  enterTeam(e){
    const that = this
    const db = wx.cloud.database()
    this.setData({
      currentTeamName: e.target.dataset.team,
      change:that.data.change
    })
    db.collection("team").where({
      name: this.data.currentTeamName,
    }).get().then(res => {
      return res.data[0].member
    }).then(t => {
      console.log('t.id',t)
      return t.map(a => a.id)
    }).then(l => {
      console.log("currentmember",l)
      that.setData({
        currentMembers: l
      })
      console.log("that.data", that.data)
      console.log('length', l.length)
      that.setData({
        userMoments: []
      })
      for (let i = 0; i < l.length; i++) {
        console.log('l[i]', l[i])
        wx.cloud.callFunction({
          name: "get_dongtai",
          data: {
            //id: idList[i]
            id: l[i]
          },
          success: function (res) {
            console.log('update', res.result.data.update)
            //that.data.userMoments.push(res.result.data.update)

            that.setData({
              userMoments: that.data.userMoments.concat(res.result.data.update),
            })
          },
          fail: console.error
        })
      }
      console.log('userMoments', that.data.userMoments)
    })
  }
})