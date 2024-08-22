<template>
    <div>
        <el-page-header @back="goBack" content="系统管理-流水查询">
        </el-page-header>
        <hr>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="logId" label="id" width="200">
            </el-table-column>
            <el-table-column prop="adminId" label="管理员id" width="200">
            </el-table-column>
            <el-table-column prop="logs" label="操作" width="200">
            </el-table-column>
            <el-table-column prop="logTime" label="交易时间" :formatter="timeMatter">
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
            pageSize: 10,
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
        this.getlog();
    },
    methods: {
        getlog() {
            this.$axios.post(
                "/logs/getLogsByPage",
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
                this.getlog()
            } else {
                this.doSearch()
            }

        },
        goBack() {
            this.$router.push("/main")
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