
/* Coded by Sven */

var app = new Vue({
    el: '#app',
    data: {
        menus: [{
                'menu': 'Bug Knight',
                'url': '/'
            },
            {
                'menu': 'Give Away',
                'url': '/'
            },
            {
                'menu': 'Count Message',
                'url': '/'
            },
            {
                'menu': 'Live Stream Game',
                'url': '/'
            },
            {
                'menu': 'About Me',
                'url': '/about-me'
            },
        ],
        socials: [{
                'target': 'Facebook',
                'url': 'https://www.facebook.com/sven307'
            },
            {
                'target': 'Github',
                'url': 'https://github.com/Juniorsz'
            },
        ],
        response: [],
        input: {
            postID: '',
            token: '',
            min_number: 1,
            max_number: 999
        },
        status: {
            noti: '',
            number: 0,
            show: false,
            auto: false,
            in:false
        },
        clipBoard:[]
    },
    methods: {
        request() {
            this.status.show = false;
            this.status.in = false;
            var self = this;
            if (!this.input.postID.trim() || !this.input.token.trim()) 
            {
                this.status.show = true;
                this.status.noti = 'Không được để trống !';
            } 
            else if (this.input.min_number >= this.input.max_number)
            {
                this.status.show = true;
                this.status.noti = 'Số Min không được lớn hơn số Max !';
            } 
            else 
            {
                this.status.show = true;
                this.status.noti = this.status.auto == true ? 'Đang xử lý dữ liệu ( Tự động tìm 3s )<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>' : 'Đang xử lý dữ liệu <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                this.response = [];
                number = Math.floor((Math.random() * this.input.max_number) + 1);
                axios.get('https://graph.facebook.com/' + this.input.postID + '/comments?fields=message,from,id,created_time,message_tags&limit=500000&access_token=' + this.input.token)
                .then((res) => {
                    this.status.number = number;
                    res.data.data.forEach((infor) => {
                        if (infor.message.includes(number)) {
                            this.status.show = true;
                            this.status.in = true;
                            this.status.noti = 'Quét thành công <i class="fas fa-check-circle"></i>';
                            infor.message = infor.message.replace(number, "<font color='red'>" + number + "</font>");
                            this.response.push({
                                'name': infor.from.name,
                                'uid': infor.from.id,
                                'msg': infor.message,
                                'msg_id':infor.id,
                                'created_time':infor.created_time
                            });
                        }
                    });
                    if(this.status.in == false)
                    {
                        this.status.noti = 'Không tìm thấy bình luận nào trùng với số may mắn <i class="fas fa-check-circle"></i>';
                        if(this.status.auto == true)
                        {
                            setTimeout(function(){
                                console.log('Đang tạo lượt tìm mới...');
                                self.request();
                            },3000);
                        }
                    }
                    console.log(this.response);
                })
                .catch((e) => {
                    console.log(e);
                    swal('THÔNG BÁO','Đã có lỗi xảy ra xin vui lòng thử lại !','error');
                    this.status.show = false;
                });
            }
        },
        checkReact(uid)
        {
            axios.get('https://graph.facebook.com/'+this.input.postID+'/reactions?limit=0&summary=true&access_token='+this.input.token)
            .then((react) => {
                this.status.noti = 'Đang quét dữ liệu tương tác <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                axios.get('https://graph.facebook.com/' + this.input.postID + '/reactions?limit=' + react.data.summary.total_count + '&summary=true&access_token=' + this.input.token)
                .then((check) => {
                    var status = false;
                    if(check.data.data == '')
                    {
                        this.status.noti = 'Bạn không đủ quyền để truy cập vào mục reaction !';
                        swal('THÔNG BÁO','Bạn không đủ quyền để truy cập vào mục reaction !','error');
                    }
                    else
                    {
                        check.data.data.forEach((checked) => {
                            if(uid == checked.id)
                            {
                                swal('THÔNG BÁO',checked.name + ' đã ' + checked.type + ' bài viết này !','success');
                                this.status.noti = checked.name + ' đã ' + checked.type + ' bài viết này <i class="fas fa-check-circle"></i>';
                                status = true;
                            }
                        });
                        if(status == false)
                        {
                            swal('THÔNG BÁO','Người này chưa react bài viết này','error');
                            this.status.noti = 'Người này chưa react bài viết này';
                        }
                    }
                })
                .catch((er) => {
                    console.log(er);
                    this.status.show = false;
                    swal('THÔNG BÁO','Đã có lỗi xảy ra xin vui lòng thử lại !','error');
                })
            })
            .catch((e) => {
                console.log(e);
                this.status.show = false;
                swal('THÔNG BÁO','Đã có lỗi xảy ra xin vui lòng thử lại !','error');
            })
        },
        checkShare(uid)
        {
            this.status.noti = 'Đang quét dữ liệu lượt chia sẻ bài viết <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
            axios.get('https://graph.facebook.com/'+this.input.postID+'/sharedposts?fields=from&limit=50000&access_token='+this.input.token)
            .then((share) => {
                var check = false;
                if(share.data.data == '')
                {
                    this.status.noti = 'Bạn không đủ quyền để truy cập vào mục chia sẻ';
                    swal('THÔNG BÁO','Bạn không đủ quyền để truy cập vào mục chia sẻ !','error');
                }
                else
                {
                    share.data.data.forEach((shared) => {
                        if(uid == shared.from.id)
                        {
                            swal('THÔNG BÁO',shared.from.name +' đã chia sẻ bài viết này bài viết này !','success');
                            this.status.noti = shared.from.name + ' đã chia sẻ bài viết này <i class="fas fa-check-circle"></i><p><a target="_blank" href="https://facebook.com/'+ shared.id +'">Xem bài viết</a></p>';
                            check = true;
                        }
                    });
                    if(check == false)
                    {
                        swal('THÔNG BÁO','Người này chưa chia sẻ bài viết này bài viết này !','error');
                        this.status.noti = 'Người này chưa chia sẻ bài viết này';
                    }
                }
            })
            .catch((e) => {
                console.log(e);
                this.status.show = false;
                this.status.noti = 'Đã có lỗi xảy ra xin vui lòng thử lại !';
                swal('THÔNG BÁO','Đã có lỗi xảy ra xin vui lòng thử lại !','error');
            })
        },
        copyToclipboard(dataObject)
        {
            if(this.clipBoard.push(dataObject))
            {
                swal('THÔNG BÁO','Copy vào bộ nhớ đệm thành công !','success');
            }
            else
            {
                swal('THÔNG BÁO','Đã có lỗi xảy ra xin vui lòng thử lại','error');
            }
            console.log(this.clipBoard);
        }
    }
})