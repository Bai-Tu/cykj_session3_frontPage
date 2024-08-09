<template>
    <div>
        <el-page-header @back="goBack" content="科室管理--科室列表">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative;">
            <span>科室名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="openDialog">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="departmentId" label="id" width="200">
            </el-table-column>
            <el-table-column prop="departmentName" label="名字" width="300">
            </el-table-column>
            <el-table-column prop="departmentStatus" label="状态" width="300" :formatter="StatusFormatter">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openFormDialog(scope.row)" type="primary">编辑</el-button>
                    <el-button type="danger" v-if="scope.row.departmentStatus == 1"
                        @click="switchDepartmentStatus(scope.row)">隐藏</el-button>
                    <el-button type="success" v-else @click="switchDepartmentStatus(scope.row)">开启</el-button>
                </template>
            </el-table-column>
        </el-table>

        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>


        <el-dialog title="添加科室" :visible.sync="dialogVisible" width="30%" center v-loading="dialogLoading">
            <div>
                <div style="margin: 20px;"></div>
                <el-form :label-position="labelPosition" label-width="80px" :model="formLabelAlign">
                    <el-form-item label="名称:">
                        <el-input v-model="formLabelAlign.name"></el-input>
                    </el-form-item>
                    <el-form-item label="科室状态:">
                        <el-switch style="display: block;padding-top: 10px;" v-model="formLabelAlign.type"
                            active-color="#13ce66" inactive-color="#ff4949" active-text="开启" inactive-text="关闭">
                        </el-switch>
                    </el-form-item>
                </el-form>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitForm">确 定</el-button>
            </span>
        </el-dialog>

        <el-dialog title="编辑科室" :visible.sync="formDialogVisible" width="30%" center v-loading="dialogLoading">
            <div>
                <div style="margin: 20px;"></div>
                <span>科室名:</span>
                <el-input v-model="formDialogName"></el-input>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitEdit">确 定</el-button>
            </span>
        </el-dialog>


    </div>
</template>

<script>
import { accountExist, defaultFail, FailInMsg } from '@/api/errorNoties';
import { defaultSuccess } from '@/api/successNoties';


export default {
    data() {
        return {
            temSearch: "",
            searchInput: "",
            loading: true,
            pageLoading: true,
            total: 0,
            pageSize: 5,
            currentPage: 1,
            dialogFormVisible: false,
            formLabelWidth: '120px',
            tableData: [],
            searchPagen: 1,
            dialogVisible: false,
            formDialogVisible: false,
            formDialogName: "",
            formDialogId:"",
            labelPosition: 'right',
            formLabelAlign: {
                name: '',
                type: true
            },
            dialogLoading: false
        }
    },
    mounted() {
        this.getDepartment();
    },
    methods: {
        submitEdit(){
            this.$axios.post(
                "/department/editDepartment",
                {
                    departmentName: this.formDialogName,
                    departmentId: this.formDialogId
                }
            ).then((res)=>{
                if(res.code == 1){
                    defaultSuccess()
                    this.formDialogVisible = false
                    this.getDepartment()
                }else{
                    defaultFail()
                }
            })

        },
        openFormDialog(res) {
            this.formDialogName = res.departmentName;
            this.formDialogId = res.departmentId;
            this.formDialogVisible = true;
        },
        submitForm() {
            this.dialogLoading = true
            this.$axios.post(
                "/department/addDepartment",
                {
                    departmentName: this.formLabelAlign.name,
                    departmentStatus: this.formLabelAlign.type ? 1 : 0
                }
            ).then((res) => {
                this.dialogLoading = false
                if (res.code == 1) {
                    defaultSuccess()
                    this.dialogVisible = false
                    this.getDepartment()
                } else {
                    accountExist()
                }
            })

        },
        openDialog() {
            this.dialogVisible = true,
                this.formLabelAlign.name = '',
                this.formLabelAlign.type = true
        },
        StatusFormatter(row, column, cellValue) {
            return cellValue === 1 ? '开启' : '关闭';
        },
        getDepartment() {
            this.$axios.post(
                "/department/getAllDepartment",
                {
                    pagen: this.currentPage,
                    limit: this.pageSize
                }
            ).then((res) => {
                this.loading = false;
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getDepartment()
            } else {
                this.doSearch()
            }

        },
        goBack() {
            this.$router.push("/main")
        },
        switchDepartmentStatus(res) {
            this.$axios.post(
                "/department/switchDepartmentStatus",
                {
                    departmentId: res.departmentId,
                    departmentStatus: res.departmentStatus
                }
            ).then((res) => {
                if (res.code == -2) {
                    FailInMsg("该科室下还有医生，无法删除");
                }
                else if (res.code == 1) {
                    defaultSuccess()
                } else {
                    defaultFail()
                }
                this.getDepartment();
            })
        },
        reset() {
            this.searchInput = "",
                this.temSearch = "",
                this.getDepartment();
        },
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/department/getDepartmentInSearch",
                {
                    pagen: this.searchPagen,
                    departmentName: this.searchInput,
                    limit: this.pageSize
                }
            ).then((res) => {
                this.loading = false;
                this.temSearch = this.searchInput;
                this.tableData = res.data.list
                this.total = res.data.total
            })
        }
    },

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