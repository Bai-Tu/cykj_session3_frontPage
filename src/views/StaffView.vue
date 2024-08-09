<template>
    <div>
        <el-page-header @back="goBack" content="系统管理--工作人员管理">
        </el-page-header>
        <hr>
        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="adminId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="adminName" label="名字" width="100">
            </el-table-column>
            <el-table-column prop="adminAccount" label="账号" width="150">
            </el-table-column>
            <el-table-column prop="adminPassword" label="密码" width="300">
            </el-table-column>
            <el-table-column prop="adminRoleId" label="身份" width="120">
            </el-table-column>
            <el-table-column prop="adminDepartmentId" label="部门" width="120">
            </el-table-column>
            <el-table-column prop="adminStatus" label="状态" width="80" :formatter="StatusFormatter">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button @click="openForm(scope.row)" type="primary">编辑</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div> -->


    </div>
</template>

<script>
import {getRoleList,getDepartmentList} from "@/store/index"

export default {
    data() {
        return {
            loading:true,
            pageLoading:true,
            tableData:[],
            total: 0,
            pageSize: 5,
            currentPage: 1,
            dialogFormVisible: false,
            formLabelWidth: '120px',
            roleList:[],
            departmentList:[]
        }
    },
    mounted() {
        this.getAdmin()
        this.getOtherList()
    },
    methods: {
        getAdmin(){
            this.$axios.post(
                "/admin/getAllAdmin"
            ).then((res)=>{
                this.loading = false
                this.tableData = res.data
            })
        },
        getOtherList(){
            this.roleList = getRoleList()
            this.departmentList = getDepartmentList()
            console.log(this.roleList);
            
        },




        // DepartmentFormatter(row,colum,cellValue){
        //     console.log(this.roleList);
        // },
        StatusFormatter(row, column, cellValue) {
            return cellValue === 1 ? '正常' : '冻结';
        },
        goBack(){
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

.el-transfer-panel__item .el-checkbox__inputt{
    position: absolute;
    top: 8px;
    left: 20px !important; 
}
</style>

<style>
.transfer-title{
    margin-top:0; 
}
</style>