<template>
    <div>
        <el-page-header @back="goBack" content="诊疗工作--就诊人员管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>姓名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <span>身份证:</span>
            <el-input v-model="searchInputIden" placeholder="请输入身份证"
                style="width:200px; padding-right: 10px"></el-input>
            <span>电话:</span>
            <el-input v-model="searchInputTele" placeholder="请输入电话" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" plain style="position: absolute;right: 210px;"
                @click="downloadTemplate">下载模板</el-button>
            <el-upload ref="upload" accept=".xlsx, .xls" action="phy/patient/uploadExcel" :headers="uploadHeaders"
                :limit="1" :on-success="handleUploadSuccess" :show-file-list="false">
                <el-button type="primary" plain style="position: absolute;right: 100px; top:0px" >批量添加</el-button>
            </el-upload>
            <el-button type="primary" style="position: absolute;right: 20px; top:0px" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="patientId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="patientName" label="名字" width="100">
            </el-table-column>
            <el-table-column prop="patientIdentity" label="身份证" width="170">
            </el-table-column>
            <el-table-column prop="patientPhone" label="电话" width="150">
            </el-table-column>
            <el-table-column prop="patientBuddget" label="余额(￥)" width="100">
            </el-table-column>
            <el-table-column prop="patientAge" label="年龄" width="60">
            </el-table-column>
            <el-table-column prop="patientCreateTime" label="创建时间" width="200" :formatter="timeMatter">
            </el-table-column>
            <el-table-column prop="patientStatus" label="状态" width="60">
                <template slot-scope="stateScope">
                    <el-switch v-model="stateScope.row.patientStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openForm(scope.row)" type="primary">编辑</el-button>
                    <el-button @click="addBudget(scope.row)" type="success">充值</el-button>
                    <el-button @click="resetPwd(scope.row)" type="danger">重置密码</el-button>
                    <el-button @click="goOrderList(scope.row)">开单</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>

        <el-dialog title="患者账号操作" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <el-form ref="formData" :model="formData" :rules="rules">
                <el-form-item label="身份证号" label-width="50px" prop="patientIdentity">
                    <el-input v-model="formData.patientIdentity" autocomplete="off" :disabled="canInput"
                        placeholder="输入身份证号"></el-input>
                </el-form-item>
                <el-form-item label="电话" label-width="50px" prop="patientPhone">
                    <el-input v-model="formData.patientPhone" autocomplete="off" placeholer="输入电话"></el-input>
                </el-form-item>
                <el-form-item label="姓名" label-width="50px" prop="patientName">
                    <el-input v-model="formData.patientName" autocomplete="off" placeholer="输入姓名"></el-input>
                </el-form-item>
                <el-form-item label="年龄" label-width="50px" prop="patientAge">
                    <el-input v-model="formData.patientAge" autocomplete="off" placeholer="输入年龄"></el-input>
                </el-form-item>
                <el-form-item label="状态" label-width="50px">
                    <el-switch style="display: block;padding-top: 10px;" v-model="formData.patientStatus"
                        active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0"
                        active-text="开启" inactive-text="关闭">
                    </el-switch>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitEdit">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="充值" :visible.sync="budgetDialogVisible" width="30%" center v-loading="dialogLoading">
            <div>
                <div style="margin: 20px;"></div>
                <span>充值数:</span>
                <el-input v-model="patientBuddget"></el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitAddBudget">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>

<script>
import { defaultFail, FailInMsg } from '@/api/errorNoties';
import { defaultSuccess, successInMsg } from '@/api/successNoties';
import { getToken } from '@/utils/authToken';


export default {
    data() {
        return {
            rules: {
                patientIdentity: [
                    { required: true, message: '请输入身份证号', trigger: 'blur' },
                ],
                patientPhone: [
                    { required: true, message: '请输入电话', trigger: 'blur' },
                ],
                patientAge: [
                    { required: true, message: '请输入年龄', trigger: 'change' },
                ],
                patientName: [
                    { required: true, message: '请输入名字', trigger: 'change' },
                ]
            },
            loading: true,
            pageLoading: true,
            budgetDialogVisible: false,
            tableData: [],
            total: 0,
            canInput: false,
            pageSize: 5,
            currentPage: 1,
            searchPagen: 1,
            formDialogVisible: false,
            dialogLoading: false,
            formLabelWidth: '120px',
            roleList: [],
            searchInput: "",
            searchInputIden: "",
            searchInputTele: "",
            departmentList: [],
            formData: {
                patientId: "",
                patientName: "",
                patientStatus: 1,
                patientPhone: "",
                patientIdentity: "",
                patientAge: "",
                patientBuddget: ""
            },
            uploadHeaders: {
                Authorization: getToken()
            },
            patientBuddget: ""
        }
    },
    mounted() {
        this.getPatient()
        // this.getOtherList()
    },
    methods: {
        // 数据获取
        getPatient() {
            this.$axios.post(
                "/patient/getAllPatientByPage",
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
        addBudget(res) {
            this.budgetDialogVisible = true
            this.formData.patientId = res.patientId
            this.formData.patientBudget = res.patientBudget
        },

        // 数据操作
        submitEdit() {
            this.$refs['formData'].validate((valid) => {
                if (valid) {
                    // 当是添加操作时
                    if (this.formData.patientId == "") {
                        this.$axios.post(
                            "/patient/addPatient",
                            {
                                patientIdentity: this.formData.patientIdentity,
                                patientPhone: this.formData.patientPhone,
                                patientAge: this.formData.patientAge,
                                patientName: this.formData.patientName,
                                patientStatus: this.formData.patientStatus
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false;
                                this.getPatient()
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
                            "/patient/editPatient",
                            {
                                patientId: this.formData.patientId,
                                patientIdentity: this.formData.patientIdentity,
                                patientPhone: this.formData.patientPhone,
                                patientAge: this.formData.patientAge,
                                patientName: this.formData.patientName,
                                patientStatus: this.formData.patientStatus
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false
                                this.getPatient()
                                defaultSuccess()
                            } else {
                                defaultFail()
                            }
                        })

                    }
                } else {
                    FailInMsg("内容不能为空")
                    return false
                }
            })


        },
        resetPwd(res) {
            this.$confirm('是否确认重置密码,密码重置后为:123456', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$axios.post(
                    "/patient/resetPwd",
                    {
                        patientId: res.patientId
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
        submitAddBudget() {
            this.dialogLoading = true
            this.$axios.post(
                "/patient/addBudget",
                {
                    patientId: this.formData.patientId,
                    patientBuddget: this.patientBuddget
                }
            ).then((res) => {
                this.dialogLoading = false;
                if (res.code == 1) {
                    this.budgetDialogVisible = false
                    successInMsg("充值成功")
                    this.getPatient()
                } else {
                    defaultFail()
                }
            })
        },
        openForm(res) {
            this.formData.patientPhone = res.patientPhone
            this.formData.patientIdentity = res.patientIdentity
            this.formData.patientId = res.patientId
            this.formData.patientName = res.patientName
            this.formData.patientStatus = res.patientStatus
            this.formData.patientAge = res.patientAge

            this.formDialogVisible = true
        },
        addForm() {
            this.formData.patientPhone = ""
            this.formData.patientIdentity = ""
            this.formData.patientId = ""
            this.formData.patientName = ""
            this.formData.patientAge = ""
            this.formData.patientStatus = 1
            this.formDialogVisible = true
            if (this.$refs['formData']) {
                this.$refs['formData'].resetFields()
            }

            this.canInput = false

        },
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/patient/searchPatient",
                {
                    pagen: this.searchPagen,
                    name: this.searchInput,
                    tele: this.searchInputTele,
                    iden: this.searchInputIden,
                    limit: this.pageSize
                }
            ).then((res) => {
                this.loading = false;
                this.temSearch = this.searchInput;
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        reset() {
            this.searchInput = ""
            this.searchInputIden = "",
                this.searchInputTele = "",
                this.currentPage = 1
            this.getPatient()
        },

        // 表格操作
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getPatient()
            } else {
                this.doSearch()
            }
        },
        handleStatusChange(res) {
            this.$axios.post(
                "/patient/editPatient",
                {
                    patientId: res.patientId,
                    patientStatus: res.patientStatus
                }
            ).then((res) => {
                if (res.code == 1) {
                    this.getPatient()
                    defaultSuccess()
                } else {
                    defaultFail()
                }
            })

        },


        // 数据处理
        timeMatter(row, colum, cellValue) {
            let myDate = new Date(cellValue);
            return myDate.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },
        RoleFormatter(row, colum, cellValue) {
            return this.roleList[cellValue - 1].roleName
        },
        DepartmentFormatter(row, colum, cellValue) {
            return this.departmentList[cellValue - 1].departmentName
        },
        goOrderList(res) {
            this.$store.dispatch("setPatientId", res.patientId)
            this.$router.push({
                path: "/orderList"
            })
        },
        goBack() {
            this.$router.push("/main")
        },
        //其他操作
        downloadTemplate() {
            const filePath = '/template.xlsx';
            // 创建隐藏的链接元素
            const link = document.createElement('a');
            link.href = filePath;
            link.download = 'template.xlsx'; // 设置下载文件的名称

            // 触发点击事件
            document.body.appendChild(link);
            link.click();

            // 移除链接元素
            successInMsg("下载成功")
            document.body.removeChild(link);
        },
        handleUploadSuccess(response){
            this.$refs.upload.clearFiles(); // 清除上传文件
            if (response.code == 1){
                this.getPatient()
                let successMsg = '上传成功，但以下账号插入失败，请查询是否已经注册<br>' + response.data
                successInMsg(successMsg)
            }else{
                defaultFail()
            }
        },
        triggerUpload(){
            this.$refs.upload.submit(); // 触发上传
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