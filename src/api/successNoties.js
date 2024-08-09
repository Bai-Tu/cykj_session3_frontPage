import { Notification } from 'element-ui';

export function successEnter() {
    Notification.success({
        title: '成功',
        message: '成功登陆，稍后会自动跳转'
    })
}

export function successRigister() {
    Notification.success({
        title: '成功',
        message: '注册成功，稍后会自动跳转'
    })
}

export function defaultSuccess() {
    Notification.success({
        title: '成功',
        message: '操作成功'
    })
}