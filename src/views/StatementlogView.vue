<template>
    <div>
        <el-page-header @back="goBack" content="系统管理-流水查询">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative;">
            <span>病人名:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="statementLogId" label="id" width="200">
            </el-table-column>
            <el-table-column prop="patientName" label="名字" width="200">
            </el-table-column>
            <el-table-column prop="statementLogNum" label="交易额" width="200">
            </el-table-column>
            <el-table-column prop="statementLogTime" label="交易时间" :formatter="timeMatter">
            </el-table-column>
        </el-table>

        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>


    </div>
</template>

<script>


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
            formDialogId: "",
            labelPosition: 'right',
            formLabelAlign: {
                name: '',
                type: true
            },
            dialogLoading: false
        }
    },
    mounted() {
        this.getStatementlog();
    },
    methods: {
        getStatementlog() {
            this.$axios.post(
                "/statementlog/getStatementlogByPage",
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
                this.getStatementlog()
            } else {
                this.doSearch()
            }

        },
        goBack() {
            this.$router.push("/main")
        },
        reset() {
            this.searchInput = ""
            this.temSearch = ""
            this.currentPage = 1
            this.getStatementlog()
        },
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/statementlog/getStatementlogInSearchByPage",
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