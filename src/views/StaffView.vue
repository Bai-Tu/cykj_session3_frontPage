<template>
    <div>
        <el-page-header @back="goBack" content="系统管理--工作人员管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="adminId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="adminName" label="名字" width="100">
            </el-table-column>
            <el-table-column prop="adminAccount" label="账号" width="150">
            </el-table-column>
            <el-table-column prop="adminRoleId" label="身份" width="180" :formatter="RoleFormatter">
            </el-table-column>
            <el-table-column prop="adminDepartmentId" label="部门" width="120" :formatter="DepartmentFormatter">
            </el-table-column>
            <el-table-column prop="adminStatus" label="状态" width="80">
                <template slot-scope="stateScope">
                    <el-switch v-model="stateScope.row.adminStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openForm(scope.row)" type="primary">编辑</el-button>
                    <el-button @click="resetPwd(scope.row)" type="danger">重置密码</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>

        <el-dialog title="员工操作" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <el-form :model="formData">
                <el-form-item label="账号" label-width="50px">
                    <el-input v-model="formData.adminAccount" autocomplete="off" :disabled="canInput"
                        placeholder="新增账号前默认会添加 _ 用做区分"></el-input>
                </el-form-item>
                <el-form-item label="昵称" label-width="50px">
                    <el-input v-model="formData.adminName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="身份" label-width="50px">
                    <el-select v-model="formData.adminRoleId" placeholder="请选择身份">
                        <el-option v-for="(item, index) in roleList" :label="item.roleName" :value="index + 1"
                            :key="index + 100"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="部门" label-width="50px">
                    <el-select v-model="formData.adminDepartmentId" placeholder="请选择部门">
                        <el-option v-for="(item, index) in departmentList" :label="item.departmentName"
                            :value="index + 1" :key="index"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitEdit">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>

<script>
import { defaultFail, FailInMsg } from '@/api/errorNoties';
import { defaultSuccess, successInMsg } from '@/api/successNoties';


export default {
    data() {
        return {
            loading: true,
            pageLoading: true,
            tableData: [],
            total: 0,
            canInput: false,
            pageSize: 5,
            currentPage: 1,
            formDialogVisible: false,
            dialogLoading: false,
            formLabelWidth: '120px',
            roleList: [],
            departmentList: [],
            formData: {
                adminId: "",
                adminName: "",
                adminAccount: "",
                adminRoleId: "",
                adminDepartmentId: ""
            }
        }
    },
    mounted() {
        this.getAdmin()
        this.getOtherList()
    },
    methods: {
        // 数据获取
        getAdmin() {
            this.$axios.post(
                "/admin/getAllAdmin",
                {
                    pagen: this.currentPage,
                    limit: this.pageSize
                }
            ).then((res) => {
                this.loading = false
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        getOtherList() {
            this.roleList = JSON.parse(sessionStorage.getItem("roleList"))
            this.departmentList = JSON.parse(sessionStorage.getItem("departmentList"))
        },

        // 数据操作
        submitEdit() {
            // 当是添加操作时
            if (this.formData.adminId == "") {
                this.$axios.post(
                    "/admin/addAdmin",
                    {
                        adminName: this.formData.adminName,
                        adminAccount: "_" + this.formData.adminAccount,
                        adminDepartmentId: this.formData.adminDepartmentId,
                        adminRoleId: this.formData.adminRoleId
                    }
                ).then((res) => {
                    if (res.code == 1) {
                        this.formDialogVisible = false;
                        this.getAdmin()
                        successInMsg("添加成功，默认密码123456")
                    } else if (res.code == -2) {
                        FailInMsg("账号已存在")
                    } else {
                        defaultFail()
                    }
                })
                // 当是编辑操作时
            } else {
                this.$axios.post(
                    "/admin/editAdmin",
                    {
                        adminId: this.formData.adminId,
                        adminName: this.formData.adminName,
                        adminDepartmentId: this.formData.adminDepartmentId,
                        adminRoleId: this.formData.adminRoleId
                    }
                ).then((res) => {
                    if (res.code == 1) {
                        this.formDialogVisible = false
                        this.getAdmin()
                        defaultSuccess()
                    } else {
                        defaultFail()
                    }
                })

            }

        },
        resetPwd(res) {
            this.$confirm('是否确认重置密码,密码重置后为:123456', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.post(
                    "/admin/resetPwd",
                    {
                        adminId: res.adminId
                    }
                ).then((res) => {
                    if (res.code == 1) {
                        this.$message({
                            type: 'success',
                            message: '重置成功!'
                        });
                    } else {
                        defaultFail()
                    }
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消'
                });
            });

        },
        openForm(res) {
            this.formData.adminAccount = res.adminAccount
            this.formData.adminId = res.adminId,
                this.formData.adminRoleId = res.adminRoleId,
                this.formData.adminDepartmentId = res.adminDepartmentId,
                this.formData.adminName = res.adminName

            this.formDialogVisible = true
            this.canInput = true
        },
        addForm() {
            this.formData.adminAccount = "",
                this.formData.adminId = "",
                this.formData.adminRoleId = "",
                this.formData.adminDepartmentId = "",
                this.formData.adminName = "",

                this.canInput = false
            this.formDialogVisible = true
        },

        // 表格操作
        handleCurrentChange(index) {
            this.currentPage = index
            this.getAdmin()
        },
        handleStatusChange(res){
            this.$axios.post(
                "/admin/editAdmin",
                {
                    adminId:res.adminId,
                    adminStatus:res.adminStatus
                }
            ).then((res)=>{
                if(res.code == 1){
                    this.getAdmin()
                    defaultSuccess()
                }else{
                    defaultFail()
                }
            })
            
        },

        // 数据处理
        RoleFormatter(row, colum, cellValue) {
            return this.roleList[cellValue - 1].roleName
        },
        DepartmentFormatter(row, colum, cellValue) {
            return this.departmentList[cellValue - 1].departmentName
        },
        StatusFormatter(row, column, cellValue) {
            return cellValue === 1 ? '正常' : '冻结';
        },

        goBack() {
            this.$router.push("/main")
        }
    }
}

</script>

<style scoped>
.el-table {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 20px;
}

.el-transfer-panel__item .el-checkbox__inputt {
    position: absolute;
    top: 8px;
    left: 20px !important;
}
</style>

<style>
.transfer-title {
    margin-top: 0;
}
</style>