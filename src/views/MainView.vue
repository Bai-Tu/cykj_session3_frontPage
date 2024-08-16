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
                                <el-dropdown-item @click.native="openForm">修改密码</el-dropdown-item>
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

        <el-dialog title="总结" height="100%" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <div style="margin-bottom: 10px;" class="demo-input-suffix">
                <span>旧密码:</span>
                <el-input placeholder="请输入内容" v-model="dialogInput.oldPwd" style="width: 60%;">
                </el-input>
            </div>
            <div style="margin-bottom: 10px;" class="demo-input-suffix">
                <span>新密码:</span>
                <el-input placeholder="请输入内容" v-model="dialogInput.newPwd" style="width: 60%;">
                </el-input>
            </div>
            <div class="demo-input-suffix">
                <span>确认密码:</span>
                <el-input placeholder="请输入内容" v-model="dialogInput.newPwdCheck" style="width: 60%;">
                </el-input>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="changePwd">确 定</el-button>
            </div>

        </el-dialog>

    </div>
</template>

<script>

import { FailInMsg } from '@/api/errorNoties';
import {  successInMsg } from '@/api/successNoties';
import { removeToken } from '@/utils/authToken';
import {blockForThreeSeconds} from '@/api/outherTools'

export default {
    data() {
        return {
            formDialogVisible: false,
            dialogLoading: false,
            menuList: [],
            name: '狗管理',
            roleId: 1,
            dialogInput: {
                oldPwd: "",
                newPwd: "",
                newPwdCheck: ""
            }
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
            successInMsg("退出成功")
        },
        openForm() {
            this.formDialogVisible = true
            this.dialogInput.newPwd = ""
            this.dialogInput.newPwdCheck = ""
            this.dialogInput.oldPwd = ""
        },
        changePwd() {
            this.dialogLoading = true
            if (this.dialogInput.newPwd === this.dialogInput.newPwdCheck) {
                this.$axios.post(
                    "/admin/changePwd",
                    {
                        id: this.roleId,
                        oldPwd: this.dialogInput.oldPwd,
                        newPwd: this.dialogInput.newPwd
                    }
                ).then((res) => {
                    this.dialogLoading = false;
                    if (res.code == 1) {
                        this.formDialogVisible = false
                        successInMsg("修改成功,即将退出")
                        blockForThreeSeconds().then(() => {
                            this.quitLogin()
                        })
                    } else {
                        FailInMsg("旧密码错误")
                        this.dialogInput.newPwd = ""
                        this.dialogInput.newPwdCheck = ""
                        this.dialogInput.oldPwd = ""
                    }
                })

            } else {
                FailInMsg("两次密码输入不一致")
                this.dialogInput.newPwd = ""
                this.dialogInput.newPwdCheck = ""
                this.dialogInput.oldPwd = ""
                this.dialogLoading = false
            }
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
                    roleId: this.roleId
                }
            ).then((res) => {
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