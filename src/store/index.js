import Vue from 'vue'
import Vuex from "vuex";
import http from '@/utils/request';
import { getToken } from '@/utils/authToken';

Vue.use(Vuex);

var store = new Vuex.Store({//开启状态管理器
    state:{
        admin:{},
        roleList:{},
        departmentList:{},
        menuList:{}
    },
    getters:{
        getAdmin(state){
            return state.admin
        },
        getRoleList(state){
            return state.roleList
        },
        getDepartmentList(state){
            return state.departmentList
        },
        getMenuList(state){
            return state.menuList
        }
    },
    mutations:{
        setAdmin(state,newAdmin){
            state.admin = newAdmin;
        },
        setRoleList(state,newRoleList){
            state.roleList = newRoleList;
        },
        setDepartmentList(state,newDepartmentList){
            state.departmentList = newDepartmentList
        },
        setMenuList(state,newMenuList){
            state.menuList = newMenuList
        }
    },
    actions:{
        setAdmin(store,newAdmin){
            store.commit('setAdmin',newAdmin);
        },
        setRoleList(store,newRoleList){
            store.commit("setRoleList",newRoleList);
        },
        setDepartmentList(store,newDepartmentList){
            store.commit("setDepartmentList",newDepartmentList)
        },
        setMenuList(store,newMenuList){
            store.commit("setMenuList",newMenuList)
        },
        async getAdminInfo(store){
            return await http.get(
                "/tool/parseToken",
                {
                    params:{
                        token:getToken()
                    }
                }
            ).then(res => {
                if(res){
                    if(res.code != -200){
                        store.commit("setAdmin",res.data.adminInfo);
                        return true;
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
                
            })
        }
    }
})


export default store;