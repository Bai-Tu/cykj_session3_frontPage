<template>
    <div>
        <el-page-header @back="goBack" content="权限管理--角色管理">
        </el-page-header>
        <hr>
        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="roleId" label="id" width="200">
            </el-table-column>
            <el-table-column prop="roleName" label="角色名字" width="300">
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

        <!-- Form -->
        <el-dialog title="权限管理" :visible.sync="dialogFormVisible" width="50%">
            <tree-transfer :from_data="leftData" :to_data="rightData" mode="transfer" height='500px' openAll   
            v-loading="pageLoading" :title="title"></tree-transfer>
            <div slot="footer" class="dialog-footer">
                <el-button @click="dialogFormVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitContent">确 定</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
import { defaultFail } from '@/api/errorNoties';
import { defaultSuccess } from '@/api/successNoties';
import treeTransfer from 'el-tree-transfer';

export default {
    data() {
        return {
            title: ["未分配权限", "已分配权限"],
            loading: true,
            pageLoading: true,
            tableData: [],
            leftData: [],
            rightData: [],
            selectRoleId: 0,
            total: 0,
            pageSize: 5,
            currentPage: 1,
            dialogFormVisible: false,
            formLabelWidth: '120px',
            selectedRow: {}
        }
    },
    mounted() {
        this.getRole();
    },
    methods: {
        getRole() {
            this.$axios.post(
                "/role/getAllRole",
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
            this.currentPage = index
            this.getAdmin()
        },
        openForm(row) {
            this.pageLoading = true;
            this.getAdminMenu(row.roleId);
            this.dialogFormVisible = true
            this.selectRoleId = row.roleId
            this.$axios.post(
                "/menu/getDifferentTree",
                {
                    roleId: row.roleId
                }
            ).then((res) => {
                this.leftData = res.data
                this.pageLoading = false;
            })
        },
        getAdminMenu(roleId) {
            this.$axios.post(
                "/menu/searchMenuByRoleInEletree",
                {
                    roleId
                }
            ).then((res) => {
                this.selectedRow = res.data
                this.rightData = res.data
            })
        },
        submitContent() {
            this.pageLoading = true
            this.$axios.post(
                "/menu/editMenuAuthority",
                {
                    roleId: this.selectRoleId,
                    menuData: this.rightData
                }
            ).then((res) => {
                this.pageLoading = false
                if (res.code == 1) {
                    this.dialogFormVisible = false
                    defaultSuccess();
                }else{
                    defaultFail()
                }
            })

        },
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
</style>

<style>
.transfer-title {
    margin-top: 0;
}
</style>