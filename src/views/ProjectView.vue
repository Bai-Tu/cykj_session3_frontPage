<template>
    <div>
        <el-page-header @back="goBack" content="诊疗内容管理--套餐管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>套餐名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="projectId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="projectName" label="套餐名字" width="200">
            </el-table-column>
            <el-table-column prop="projectPrice" label="套餐价格(￥)" width="120">
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
                    <el-popover placement="right" width="300" trigger="click" >
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

        <el-dialog title="细项操作" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <el-form :model="formData">
                <el-form-item label="名字" label-width="50px">
                    <el-input v-model="formData.subitemName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="下限" label-width="50px">
                    <el-input v-model="formData.subitemStandardMin" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="上限" label-width="50px">
                    <el-input v-model="formData.subitemStandardMax" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="单位" label-width="50px">
                    <el-input v-model="formData.subitemUnit" autocomplete="off"></el-input>
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
            popoverLoading:true,
            tableData: [],
            searchInput: "",
            temSearch: "",
            total: 0,
            pageSize: 5,
            currentPage: 1,
            formDialogVisible: false,
            dialogLoading: false,
            searchPagen: 1,
            formLabelWidth: '120px',
            formData: {
                subitemId: "",
                subitemName: "",
                subitemStandardMin: "",
                subitemStandardMax: "",
                subitemUnit: ""
            },
            gridData: []
        }
    },
    mounted() {
        this.getProject()
    },
    methods: {
        // 数据获取
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
            // 当是添加操作时
            if (this.formData.subitemId == "") {
                this.$axios.post(
                    "/subitem/insertSubitem",
                    {
                        subitemName: this.formData.subitemName,
                        subitemStandardMin: this.formData.subitemStandardMin,
                        subitemStandardMax: this.formData.subitemStandardMax,
                        subitemUnit: this.formData.subitemUnit
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
                    "/subitem/editSubitem",
                    {
                        subitemId: this.formData.subitemId,
                        subitemName: this.formData.subitemName,
                        subitemStandardMin: this.formData.subitemStandardMin,
                        subitemStandardMax: this.formData.subitemStandardMax,
                        subitemUnit: this.formData.subitemUnit
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

        },
        openForm(res) {
            this.formData.subitemId = res.subitemId
            this.formData.subitemName = res.subitemName
            this.formData.subitemStandardMax = res.subitemStandardMax
            this.formData.subitemStandardMin = res.subitemStandardMin
            this.formData.subitemUnit = res.subitemUnit

            this.formDialogVisible = true
            this.canInput = true
        },
        addForm() {
            this.formData.subitemId = ""
            this.formData.subitemName = ""
            this.formData.subitemStandardMax = ""
            this.formData.subitemStandardMin = ""
            this.formData.subitemUnit = ""

            this.canInput = false
            this.formDialogVisible = true
        },
        handleStatusChange(res) {
            let changeStatus;
            if (res.subitemStatus == 1) {
                changeStatus = 0
            } else {
                changeStatus = 1
            }


            this.$axios.post(
                "/subitem/editSubitemStatus",
                {
                    subitemId: res.subitemId,
                    subitemStatus: changeStatus
                }
            ).then((res) => {
                if (res.code == 1) {
                    defaultSuccess()
                    this.getProject()
                } else if (res.code == -2) {
                    FailInMsg("该细项还有在其他项目中被使用，无法删除")
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
            this.temSearch = ""
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
        // 其他函数
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