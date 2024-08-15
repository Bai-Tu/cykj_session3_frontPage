<template>
    <div>
        <el-page-header @back="goBack" content="诊疗内容管理--项目管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>项目名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <span>价格区间:</span>
            <el-input v-model="searchInpuLow" placeholder="请输入最低价" style="width:200px; padding-right: 10px"></el-input>
            <el-input v-model="searchInputHigh" placeholder="请输入最高价" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="projectId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="projectName" label="项目名字" width="200">
            </el-table-column>
            <el-table-column prop="projectPrice" label="项目价格(￥)" width="120">
            </el-table-column>
            <el-table-column prop="departmentId" label="所属部门" width="120" :formatter="DepartmentFormatter">
            </el-table-column>
            <el-table-column prop="projectStatus" label="状态" width="100">
                <template slot-scope="stateScope">
                    <el-switch :value="stateScope.row.projectStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
                </template>
            </el-table-column>
            <el-table-column prop="projectStatus" label="细项" width="200">
                <template slot-scope="idScope">
                    <el-popover placement="right" width="300" trigger="click">
                        <el-table :data="gridData" v-loading="popoverLoading">
                            <el-table-column width="50" property="subitemId" label="Id"></el-table-column>
                            <el-table-column width="250" property="subitemName" label="细项名"></el-table-column>
                        </el-table>
                        <el-button slot="reference" @click="getSubitem(idScope.row.projectId)">查看细项</el-button>
                    </el-popover>
                </template>
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openForm(scope.row)" type="primary">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>
        

        <el-dialog title="项目操作" :visible.sync="formDialogVisible" width="40%" v-loading="dialogLoading"
            id="my-custom-dialog">
            <el-form :model="formData" ref="myformData" :rules="rules" >
                <el-form-item label="项目名" label-width="100px" prop="projectName">
                    <el-input v-model="formData.projectName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="项目价格" label-width="100px" prop="projectPrice">
                    <el-input v-model="formData.projectPrice" autocomplete="off" placeholder="￥"></el-input>
                </el-form-item>
                <el-form-item label="项目状态:" label-width="100px">
                    <el-switch style="display: block;padding-top: 10px;" v-model="formData.projectStatus"
                        active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0"
                        active-text="开启" inactive-text="关闭">
                    </el-switch>
                </el-form-item>
                <el-form-item label="部门" label-width="100px" prop="projectDepartment">
                    <el-select v-model="formData.projectDepartment" placeholder="请选择部门">
                        <el-option v-for="(item, index) in departmentList" :label="item.departmentName"
                            :value="index + 1" :key="index"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <tree-transfer :from_data="leftData" :to_data="rightData" mode="transfer" height='320px'
                        v-loading="pageLoading" :title="title" node_key="subitemId" :filter="true"
                        :defaultProps="{ label: 'subitemName' }"></tree-transfer>
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
            title: ['未分配细项', '已分配细项'],
            loading: true,
            rules: {
                projectName: [
                    { required: true, message: '请输入名字', trigger: 'blur' },
                ],
                projectPrice: [
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
                projectId: "",
                projectName: "",
                projectStatus: 1,
                projectPrice: "",
                projectDepartment: ""
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
        this.getProject()
        this.getDepartmentList()
    },
    methods: {
        // 数据获取
        getDepartmentList() {
            this.departmentList = JSON.parse(sessionStorage.getItem("departmentList"))
        },
        getProject() {
            this.$axios.post(
                "/project/getAllProject",
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
        getSubitem(projectId) {
            this.popoverLoading = true;
            this.$axios.post(
                "/project-subitem/getSubitemById",
                {
                    projectId
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
                    if (this.formData.projectId == "") {
                        this.$axios.post(
                            "/project/addProject",
                            {
                                projectName: this.formData.projectName,
                                projectPrice: this.formData.projectPrice,
                                projectStatus: this.formData.projectStatus,
                                departmentId:this.formData.projectDepartment,
                                subItems: this.rightData
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false;
                                this.getProject()
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
                            "/project/editProject",
                            {
                                projectId: this.formData.projectId,
                                projectName: this.formData.projectName,
                                projectPrice: this.formData.projectPrice,
                                projectStatus: this.formData.projectStatus,
                                departmentId:this.formData.projectDepartment,
                                subItems: this.rightData
                            }
                        ).then((res) => {
                            if (res.code == 1) {
                                this.formDialogVisible = false
                                this.getProject()
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

        openForm(res) {
            if(this.$refs['myformData']){
                this.$refs['myformData'].resetFields()
            }
            this.pageLoading = true
            this.formData.projectId = res.projectId
            this.formData.projectName = res.projectName
            this.formData.projectPrice = res.projectPrice
            this.formData.projectStatus = res.projectStatus
            this.formData.projectDepartment = res.departmentId
            
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
            this.formData.projectId = ""
            this.formData.projectName = ""
            this.formData.projectPrice = ""
            this.formData.projectStatus = 1
            this.formData.projectDepartment = ""
            this.rightData = []
            this.getAllSubitem()

            this.pageLoading = false;
            this.formDialogVisible = true
        },
        getAllSubitem() {
            this.$axios.post(
                "/subitem/getAllSubitemNoVoWithStatus",
                {
                    subitemStatus:1
                }
            ).then((res) => {
                this.leftData = res.data

            })
        },
        getDiffSubitem(res) {
            this.$axios.post(
                "/subitem/getDiffSubitemWithStatus",
                {
                    projectId: res.projectId,
                    projectStatus:1
                }
            ).then((res) => {
                this.leftData = res.data

            })
        },
        getRightSubitem(res) {
            this.$axios.post(
                "/project-subitem/getSubitemById",
                {
                    projectId: res.projectId
                }
            ).then((res) => {
                this.rightData = res.data;
            })
        },

        // 状态修改
        handleStatusChange(res) {
            let changeStatus;
            if (res.projectStatus == 1) {
                changeStatus = 0
            } else {
                changeStatus = 1
            }
            this.$axios.post(
                "/project/switchProjectStatus",
                {
                    projectId: res.projectId,
                    projectStatus: changeStatus
                }
            ).then((res) => {
                if (res.code == 1) {
                    defaultSuccess()
                    this.getProject()
                } else if (res.code == -2) {
                    FailInMsg("该项目还有在其他套餐中被使用，无法删除")
                }
            })
        },

        // 查询
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/project/searchProject",
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
            this.getProject()
        },


        // 表格操作
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getProject()
            } else {
                this.doSearch()
            }
        },
        handleSubitemCurrentChange(index) {
            this.subitemPageVo.pagen = index
            this.getAllSubitem();
        },

        // 数据处理
        DepartmentFormatter(row, colum, cellValue) {
            return this.departmentList[cellValue - 1].departmentName
        },
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