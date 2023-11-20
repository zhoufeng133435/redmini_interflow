
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        isTab:{
            type: Boolean,
            value: false,
        },
        isVisit: {
            type: Boolean,
            value: false,
            observer: function(val) {
                if (val) {
                    this._open()
                } else {
                    this._close()
                }
            }
        },
        titleCenter:{
            type: Boolean,
            value: false,
        },
        title:{
            type:String,
            value:''
        },
        // 四周的padding
        noPadding:{
            type: Boolean,
            value: false
        },
        // 内容距离顶部的padding
        paddingTopValue:{
            type: String,
            value: '104'
        },
        minHeight: {
          type: String,
          value: "460rpx"
        },
        heigthVh:{
            type: String,
            value: 'auto'
        },
        // 是否有title下的线
        isTitleLine:{
          type: Boolean,
          value: true,
        },
        noClose:{
            type: Boolean,
            value: false,
        },
        titleSpace: {
          type: Boolean,
          value: true
        },
         typeStyle: {
            type: String,
            value:""
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        animat:{}
    },

    /**
     * 组件的方法列表
     */
    methods: {
        touchMove() {
            console.log('touchMove')
        },
        _open() {
            this.triggerEvent('Open')
            this.animation.translateY('0').step();
            this.setData({
                animat: this.animation.export()
            })
        },
        _close() {
            this.triggerEvent('Close');
            this.animation.translateY('106%').step();
            this.setData({
                animat: this.animation.export()
            })
        },
        _changeState(){
            if(this.properties.noClose) return;
            this.triggerEvent('Visit',false)
        },
        _stopTap(){
            return
        }
    },
    created(){
        let _sildUp = xhs.createAnimation({
            duration: 300,
            timingFunction: "ease"
        })
        this.animation = _sildUp;
    }
})