<template>
    <div>
        <el-page-header @back="goBack" content="诊疗内容管理--套餐管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>套餐名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <span>价格区间:</span>
            <el-input v-model="searchInpuLow" placeholder="请输入最低价" style="width:200px; padding-right: 10px"></el-input>
            <el-input v-model="searchInputHigh" placeholder="请输入最高价" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="comboId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="comboName" label="项目名字" width="200">
            </el-table-column>
            <el-table-column prop="comboPrice" label="项目价格(￥)" width="120">
            </el-table-column>
            <el-table-column prop="comboStatus" label="状态" width="100">
                <template slot-scope="stateScope">
                    <el-switch :value="stateScope.row.comboStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
                </template>
            </el-table-column> 
            <el-table-column prop="comboIndex" label="项目内容" width="200">
                <template slot-scope="idScope_pro">
                    <el-popover placement="right" width="300" trigger="click">
                        <el-table :data="gridData" v-loading="popoverLoading">
                            <el-table-column width="50" property="projectId" label="Id"></el-table-column>
                            <el-table-column width="250" property="projectName" label="套餐名"></el-table-column>
                        </el-table>
                        <el-button slot="reference" @click="getProject(idScope_pro.row.comboId)">查看项目</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openProjectForm(scope.row)" type="primary">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>
        

        <el-dialog title="套餐操作" :visible.sync="formDialogVisible" width="40%" v-loading="dialogLoading"
            id="my-custom-dialog">
            <el-form :model="formData" ref="myformData" :rules="rules" >
                <el-form-item label="套餐名" label-width="100px" prop="comboName">
                    <el-input v-model="formData.comboName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="套餐价格" label-width="100px" prop="comboPrice">
                    <el-input v-model="formData.comboPrice" autocomplete="off" placeholder="￥"></el-input>
                </el-form-item>
                <el-form-item label="套餐状态:" label-width="100px">
                    <el-switch style="display: block;padding-top: 10px;" v-model="formData.comboStatus"
                        active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0"
                        active-text="开启" inactive-text="关闭">
                    </el-switch>
                </el-form-item>
                <el-form-item>
                    <tree-transfer :from_data="leftData" :to_data="rightData" mode="transfer" height='320px'
                        v-loading="pageLoading" :title="title" node_key="projectId" :filter="true"
                        :defaultProps="{ label: 'projectName' }"></tree-transfer>
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
import treeTransfer from 'el-tree-transfer';

export default {
    data() {
        return {
            title: ['未分配套餐', '已分配套餐'],
            loading: true,
            rules: {
                comboName: [
                    { required: true, message: '请输入名字', trigger: 'blur' },
                ],
                comboPrice: [
                    { required: true, message: '请输入价格', trigger: 'blur' },
                ],
                projectDepartment: [
                    { required: true, message: '请输入部门', trigger: 'change' },
                ]
            },
            pageLoading: true,
            popoverLoading: true,
            departmentList: [],
            tableData: [],
            searchInput: "",
            searchInpuLow:"",
            searchInputHigh:"",
            temSearch: "",
            total: 0,
            pageSize: 5,
            currentPage: 1,
            formDialogVisible: false,
            dialogLoading: false,
            searchPagen: 1,
            formLabelWidth: '120px',
            leftData: [],
            rightData: [],
            formData: {
                comboId: "",
                comboName: "",
                comboStatus: 1,
                comboPrice: "",
            },
            subitemPageVo: {
                pagen: 1,
                limit: 5,
                total: 1,

            },
            gridData: [],
            allSubitem: [],
            multipleSelection: []
        }
    },
    mounted() {
        this.getCombo()
        // this.getDepartmentList()
    },
    methods: {
        // 数据获取
        // getDepartmentList() {
        //     this.departmentList = JSON.parse(sessionStorage.getItem("departmentList"))
        // },
        getCombo() {
            this.$axios.post(
                "/combo/getAllComboByPage",
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
        getProject(comboId) {
            this.popoverLoading = true;
            this.$axios.post(
                "/combo-project/getProjectByComboId",
                {
                    comboId
                }
            ).then((res) => {
                this.gridData = res.data;
                this.popoverLoading = false;
            })
        },

        // 数据操作
        submitEdit() {
            this.$refs['myformData'].validate((validata) => {
                if (validata) {
                    // 当是添加操作时
                    if (this.formData.comboId == "") {
                        this.$axios.post(
                            "/combo/addCombo",
                            {
                                comboName: this.formData.comboName,
                                comboPrice: this.formData.comboPrice,
                                comboStatus: this.formData.comboStatus,
                                projects: this.rightData
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false;
                                this.getCombo()
                                successInMsg("添加成功")
                            } else if (res.code == -2) {
                                FailInMsg("细项已存在")
                            } else {
                                defaultFail()
                            }
                        })
                        // 当是编辑操作时
                    } else {
                        this.$axios.post(
                            "/combo/editCombo",
                            {
                                comboId:this.formData.comboId,
                                comboName: this.formData.comboName,
                                comboPrice: this.formData.comboPrice,
                                comboStatus: this.formData.comboStatus,
                                projects: this.rightData
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false
                                this.getCombo()
                                defaultSuccess()
                            } else {
                                defaultFail()
                            }
                        })

                    }
                }else{
                    FailInMsg("内容不能为空")
                    return;
                }
            })


        },

        openProjectForm(res) {
            if(this.$refs['myformData']){
                this.$refs['myformData'].resetFields()
            }
            this.pageLoading = true
            this.formData.comboId = res.comboId
            this.formData.comboName = res.comboName
            this.formData.comboPrice = res.comboPrice
            this.formData.comboStatus = res.comboStatus
            
            this.getDiffSubitem(res)
            this.getRightSubitem(res)

            this.pageLoading = false;
            this.formDialogVisible = true
        },
        // 添加弹窗的内容初始化
        addForm() {
            this.pageLoading = true
            if(this.$refs['myformData']){
                this.$refs['myformData'].resetFields()
            }
            this.formData.comboId = ""
            this.formData.comboName = ""
            this.formData.comboPrice = ""
            this.formData.comboStatus = 1
            this.rightData = []
            this.getAllProject()

            this.pageLoading = false;
            this.formDialogVisible = true
        },
        getAllProject() {
            this.$axios.post(
                "/project/getAllProjectNoPage"
            ).then((res) => {
                this.leftData = res.data
            })
        },
        getDiffSubitem(res) {
            this.$axios.post(
                "/project/getDiffProject",
                {
                    comboId: res.comboId
                }
            ).then((res) => {
                this.leftData = res.data
            })
        },
        getRightSubitem(res) {
            this.$axios.post(
                "/combo-project/getProjectByComboId",
                {
                    comboId: res.comboId
                }
            ).then((res) => {
                this.rightData = res.data;
            })
        },

        // 状态修改
        handleStatusChange(res) {
            let changeStatus;
            if (res.comboStatus == 1) {
                changeStatus = 0
            } else {
                changeStatus = 1
            }
            this.$axios.post(
                "/combo/switchComboStatus",
                {
                    comboId: res.comboId,
                    comboStatus: changeStatus
                }
            ).then((res) => {
                if (res.code == 1) {
                    defaultSuccess()
                    this.getCombo()
                } 
            })
        },

        // 查询
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/combo/searchCombo",
                {
                    pagen: this.searchPagen,
                    name: this.searchInput,
                    limit: this.pageSize,
                    highPrice:this.searchInputHigh,
                    lowPrice:this.searchInpuLow
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
            this.temSearch = ""
            this.searchInpuLow=""
            this.searchInputHigh=""
            this.currentPage = 1
            this.getCombo()
        },


        // 表格操作
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getCombo()
            } else {
                this.doSearch()
            }
        },

        // 数据处理
        // DepartmentFormatter(row, colum, cellValue) {
        //     return this.departmentList[cellValue - 1].departmentName
        // },
        // 其他函数
        goBack() {
            this.$router.push("/main")
        }
    },
    components: {
        treeTransfer
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

#my-custom-dialog {
    margin-top: 5px !important;
}
</style>

<style>
.transfer-title {
    margin-top: 0;
}

.el-dialog {
    margin-top: 5px !important;
}

.el-dialog__body,
.el-dialog__footer {
    padding-bottom: 5px;
}
</style>