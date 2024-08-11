<template>
    <div>
        <el-page-header @back="goBack" content="权限管理-菜单管理">
        </el-page-header>
        <hr>

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
            this.searchInput = ""
            this.temSearch = ""
            this.currentPage = 1
            this.getDepartment()
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