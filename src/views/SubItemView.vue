<template>
    <div>
        <el-page-header @back="goBack" content="诊疗内容管理--细项管理">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>细项名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="subitemId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="subitemName" label="名字" width="200">
            </el-table-column>
            <el-table-column prop="subitemStandardMin" label="最小值" width="80">
            </el-table-column>
            <el-table-column prop="subitemStandardMax" label="最大值" width="80">
            </el-table-column>
            <el-table-column prop="subitemUnit" label="单位" width="150">
            </el-table-column>
            <el-table-column prop="subitemStatus" label="状态" width="100">
                <template slot-scope="stateScope">
                    <el-switch :value="stateScope.row.subitemStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
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
            <el-form :model="formData" ref="formData" :rules="rules">
                <el-form-item label="名字" label-width="50px" prop="subitemName">
                    <el-input v-model="formData.subitemName" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="下限" label-width="50px" prop="subitemStandardMin">
                    <el-input v-model="formData.subitemStandardMin" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="上限" label-width="50px" prop="subitemStandardMax">
                    <el-input v-model="formData.subitemStandardMax" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="单位" label-width="50px" prop="subitemUnit">
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
            rules: {
                subitemName: [
                    { required: true, message: '请输入名字', trigger: 'blur' }
                ],
                subitemStandardMin: [
                    { required: true, message: '请输入最小值', trigger: 'blur' }
                ],
                subitemStandardMax: [
                    { required: true, message: '请输入最大值', trigger: 'blur' }
                ],
                subitemUnit: [
                    { required: true, message: '请输入单位', trigger: 'change' }
                ]

            },
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
            }
        }
    },
    mounted() {
        this.getSubitem()
    },
    methods: {
        // 数据获取
        getSubitem() {
            this.$axios.post(
                "/subitem/getAllSubitem",
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

        // 数据操作
        submitEdit() {
            if (this.formData.subitemStandardMin >= this.formData.subitemStandardMax) {
                FailInMsg("最大值不能小于最小值")
                return
            }
            this.$refs['formData'].validate((validate) => {
                if (validate) {
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
                                this.getSubitem()
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
                                this.getSubitem()
                                defaultSuccess()
                            } else {
                                defaultFail()
                            }
                        })

                    }
                } else {
                    FailInMsg("内容不能为空")
                }
            })


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

            if (this.$refs['formData']) {
                this.$refs['formData'].resetFields()
            }

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
                    this.getSubitem()
                } else if (res.code == -2) {
                    FailInMsg("该细项还有在其他项目中被使用，无法删除")
                }
            })
        },

        // 查询
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/subitem/getSubitemInSearch",
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
            this.getSubitem()
        },


        // 表格操作
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getSubitem()
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