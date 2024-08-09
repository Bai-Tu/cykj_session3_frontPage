import { Notification } from 'element-ui';

export function accountExist(){
        Notification.error({
        title: '错误',
        message: '内容已存在'
    })
}

export function checkCodeError() {
    Notification.error({
        title: '错误',
        message: '验证码错误'
    })
}

export function systemError() {
    Notification.error({
        title: '错误',
        message: '系统错误'
    })
}

export function accOrPwdError(){
    Notification.error({
        title: '错误',
        message: '账号或密码错误'
    })
}

export function accNotLegal(){
    Notification.error({
        title: '错误',
        message: '账号非法，需要11位电话号码或18位身份证号'
    })
}

export function accFreeze(){
    Notification.error({
        title: '错误',
        message: '账号非法，需要11位电话号码或18位身份证号'
    })
}

export function defaultFail(){
    Notification.error({
        title: '错误',
        message: '操作失败'
    })
}

export function FailInMsg(msg){
    Notification.error({
        title: '错误',
        message: msg
    })
}