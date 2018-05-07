先上图：
![4.gif](http://upload-images.jianshu.io/upload_images/3658035-6ab1596a9d1936fd.gif?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

html5新增的 input 类型 file，支持访问本地文件。这里直接使用create-react-app写了一个简易的上传预览组件，代码很少，支持预览文本、图片、视频并上传至服务器。

```
import React, { PureComponent } from 'react'

export default class UploadFile extends PureComponent {
    state = {
        name: '',
        path: '',
        preview: null,
        data: null
    }

    changeName = (e) => {
        this.setState({ name: e.target.value })
    }

    //选择文件
    changePath = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        let src,preview,type=file.type;

        // 匹配类型为image/开头的字符串
        if (/^image\/\S+$/.test(type)) {
            src = URL.createObjectURL(file)
            preview = <img src={src} alt='' />
        }
        // 匹配类型为video/开头的字符串
        else if (/^video\/\S+$/.test(type)) {
            src = URL.createObjectURL(file)
            preview = <video src={src} autoPlay loop controls />
        }
        // 匹配类型为text/开头的字符串
        else if (/^text\/\S+$/.test(type)) {
            const self = this;
            const reader = new FileReader();
            reader.readAsText(file);
            //注：onload是异步函数，此处需独立处理
            reader.onload = function (e) {
                preview = <textarea value={this.result} readOnly></textarea>
                self.setState({ path: file.name, data: file, preview: preview })
            }
            return;
        } 

        this.setState({ path: file.name, data: file, preview: preview })
    }

    // 上传文件
    upload = () => {
        
        const data = this.state.data;
        if (!data) {
            console.log('未选择文件');
            return;
        }

        //此处的url应该是服务端提供的上传文件api 
        const url = 'http://localhost:3000/api/upload';
        const form = new FormData();

        //此处的file字段由上传的api决定，可以是其它值
        form.append('file', data);

        fetch(url, {
            method: 'POST',
            body: form
        }).then(res => {
            console.log(res)
        })
    }

    //关闭模态框
    cancel = () => {
        this.props.closeOverlay();
    }

    render() {
        const { name, path, preview } = this.state;
        return (
            <div>
                <h4>上传文件</h4>
                <div className='row'>
                    <label>文件名称</label>
                    <input type='text' placeholder='请输入文件名' value={name} onChange={this.changeName} />
                </div>
                <div className='row'>
                    <label>文件路径</label>
                    <div className='row-input'>
                        <span>{path ? path : '请选择文件路径'}</span>
                        <input type='file' accept='video/*,image/*,text/plain' onChange={this.changePath} />
                    </div>
                </div>
                <div className='media'>
                    {preview}
                </div>
                <button className='primary upload' onClick={this.upload}>上传</button>
                <button className='primary cancel' onClick={this.cancel}>取消</button>
            </div>
        )
    }
}
```

**后续更新:** 添加上传进度条显示功能

state属性里添加progress字段
```
state={
    ...
    progress:0,
}
```
在jsx里添加进度条的UI
```
<div className='progressWrap'>
    <div className='progress' style={{ width: `${this.state.progress}%` }} />
    <span className='progress-text' style={{left:`${this.state.progress}%`}}>{this.state.progress}%</span>
</div>
```
修改upload方法，使用ajax来代替fetch，因为fetch暂不支持progress events事件。注意，需要在componentWillUnmount事件中移除监听函数
```
upload = () => {
    const data = this.state.data;
    if (!data) {
        console.log('未选择文件');
        return;
    }
    const url = 'http://localhost:3000/api/upload';  // 此处的url应该是服务端提供的上传文件api 
    const form = new FormData();

    form.append('file', data);  // 此处的file字段由上传的api决定，可以是其它值

    // fetch方式暂不支持progress events事件

    /*  fetch(url, {
        method: 'POST',
        body: form
    }).then(res => {
        console.log(res)
    }) */

    // 改为使用ajax实现上传并添加显示进度条功能

    const xhr = new XMLHttpRequest();
    this.xhr = xhr
    xhr.upload.addEventListener('progress', this.uploadProgress, false);  // 第三个参数为useCapture?，是否使用事件捕获/冒泡

    // xhr.addEventListener('load',uploadComplete,false);
    // xhr.addEventListener('error',uploadFail,false);
    // xhr.addEventListener('abort',uploadCancel,false)

    xhr.open('POST', url, true);  // 第三个参数为async?，异步/同步
    xhr.send(form);
} 

uploadProgress = (e) => {
    if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        this.setState({ progress: progress })
    }
}

componentWillUnmount() {
    this.xhr.upload.removeEventListener('progress', this.uploadProgress, false)
}
```
修改changePath方法，当改变选择的文件时，progress重置0
```
//在两个setState函数里添加 progress:0
```
注：上面的代码只能正确显示单个文件的上传进度，当同时上传多个文件时，进度条会发生跳跃




