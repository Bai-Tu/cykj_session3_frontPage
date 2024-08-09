import axios from "axios";//1、导入
import {getToken} from '@/utils/authToken'
import router from "@/router";

//2、创建axios

var http = axios.create({
    baseURL:"/phy",
    timeout:10000,//设置请求超时时间

});

//3、设置请求拦截器，统一设置一些请求头
http.interceptors.request.use(config => {
    if(getToken()){
        config.headers["Authorization"] = getToken()
    }
    return config;
})

//4、创建响应拦截器
http.interceptors.response.use(res =>{
    console.log(res);
    if(res.data == -200){
        alert("登录过期")
        if(router.history.current.path != "/login"){
            router.push({
                path:"/login"
            })
        }
        return false;
    }else{
        return res.data
    }
},
    error =>{
        if(error.request.status === 404){//代表服务器返回404，not found
            alert("404 not fount");
        }
    
        if(error.request.status === 500){//服务器出错
            alert("服务器错误")
        }
    
        if(error.request.status === 403){//无操作权限
            alert("无操作权限")
        }

        return Promise.reject(error)
    }
)

//导出
export default http;