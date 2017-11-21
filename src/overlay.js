import React,{Component} from 'react'
import ReactDOM from 'react-dom'

export default class Overlay extends Component{
    constructor(props){
        super(props);
        this.container=document.createElement('div')
        document.body.appendChild(this.container);
    }
    componentWillUnmount(){
        document.body.removeChild(this.container);
    }
    render(){
        return ReactDOM.createPortal(
            <div className='overlay'>
                <span className='overlay-close' onClick={this.props.onClose}>&times;</span>
                {this.props.children}
            </div>,
            this.container
        )
    }
}