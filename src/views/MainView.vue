<template>
    <div>
        <el-container style="height: 100vh;">
            <el-aside width="auto">
                <p style="width: 200px;height: 60px; font-size: 20px; 
                position: relative; bottom: 70px;  text-align: center; right: 10px;">体检系统后台</p>
                <el-row class="tac">
                    <el-col :span="24">
                        <el-menu v-for="(item, index) in menuList" :key="item.menuId" :default-active="$route.path"
                            class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                            @select="handleSeclect" background-color="#545c64" text-color="#fff"
                            active-text-color="#ffd04b" :router="true" :unique-opened="true">

                            <el-submenu v-if="item.children.length > 0" :index="index + ''">
                                <template slot="title">
                                    <i :class="item.menuIcon" v-if="item.menuIcon !== ''"></i>
                                    <i class="el-icon-menu" v-else></i>
                                    <span>{{ item.menuName }}</span>
                                </template>
                                <el-menu-item v-for="(subItem) in item.children" :key="subItem.menuId"
                                    :index="subItem.menuPath">
                                    {{ subItem.menuName }}
                                </el-menu-item>
                            </el-submenu>

                            <el-menu-item v-else :index="item.menuPath">
                                <i :class="item.menuIcon" v-if="item.menuIcon !== ''"></i>
                                <i class="el-icon-menu" v-else></i>
                                <span slot="title">{{ item.menuName }}</span>
                            </el-menu-item>
                        </el-menu>
                    </el-col>
                </el-row>
            </el-aside>

            <el-container>
                <el-header style="text-align: right; font-size: 12px">
                    <el-dropdown>
                        <i class="el-icon-setting" style="margin-right: 15px;cursor:default;">
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item >修改密码</el-dropdown-item>
                                <el-dropdown-item @click.native="quitLogin">退出登录</el-dropdown-item>
                            </el-dropdown-menu>
                            <span>{{ this.$store.getters.getAdmin.adminName }}</span>
                        </i>
                    </el-dropdown>
                </el-header>

                <el-main>
                    <router-view></router-view>
                </el-main>

                <el-footer>ljy 2024/8/8 - 2024/8/23 阿巴阿巴阿巴阿巴</el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script>

import { defaultSuccess } from '@/api/successNoties';
import { removeToken } from '@/utils/authToken';

export default {
    data() {
        return {
            menuList: [],
            name: '狗管理',
            roleId: 1
        }
    },
    created() {
        this.$store.dispatch("getAdminInfo")
        this.getOtherInfo()
    },
    mounted() {
        this.changeIndex();
        this.getMenu()
    },
    methods: {
        quitLogin() {
            this.$router.push(
                "/login"
            )
            removeToken()
            defaultSuccess()
        },
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
        handleSeclect(index, indexPath) {
            console.log(index, indexPath);
        },
        changeIndex() {
            this.name = this.$store.getters.getAdmin.adminName;
            this.roleId = this.$store.getters.getAdmin.adminId;  
        },
        getMenu() {
            this.$axios.post(
                "/menu/searchMenuByRoleInTree",
                {
                    roleId:this.roleId
                }
            ).then((res)=>{
                this.menuList = res.data
            })
        },
        getOtherInfo() {
            console.log("getOtherInfo被调用");
            
            this.$axios.post(
                "/admin/getAdminOtherInfo",
                {
                    adminRoleId: this.roleId
                }
            ).then((otherInfo) => {
                sessionStorage.setItem("departmentList", JSON.stringify(otherInfo.data.departmentList))
                sessionStorage.setItem("roleList", JSON.stringify(otherInfo.data.roleList))
            }).catch((err) => {
                console.log(err);
            })
        }
    }
}




</script>

<style scoped>
.el-header,
.el-footer {
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
}

.el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: left;
    line-height: 200px;
    height: 100vh;
}

.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
}

body>.el-container {
    margin-bottom: 40px;
}

.el-container:nth-child(5) .el-aside,
.el-container:nth-child(6) .el-aside {
    line-height: 260px;
}

.el-container:nth-child(7) .el-aside {
    line-height: 320px;
}
</style>