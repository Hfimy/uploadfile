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

    changePath = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        let src,preview,type=file.type;
        if (/^image\/\S+$/.test(type)) {

            src = URL.createObjectURL(file)
            preview = <img src={src} alt='' />

        } else if (/^video\/\S+$/.test(type)) {

            src = URL.createObjectURL(file)
            preview = <video src={src} autoPlay loop controls />

        } else if (/^text\/\S+$/.test(type)) {
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

    upload = () => {
        
        const data = this.state.data;
        if (!data) {
            console.log('未选择文件');
            return;
        }

        //此处的url应该是服务端提供的上传文件api 
        // const url = 'http://localhost:3000/api/upload';
        const url = 'http://192.168.155.207:3000/api/containers/common/upload';

        const form = new FormData();

        //此处的file字段由服务端的api决定，可以是其它值
        form.append('file', data);

        fetch(url, {
            method: 'POST',
            body: form
        }).then(res => {
            console.log(res)
        })
    }

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