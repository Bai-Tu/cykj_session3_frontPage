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
            <el-button type="primary" style="position: absolute;right: 20px;">添加</el-button>
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
                    <el-button @click="openForm(scope.row)" type="primary">编辑</el-button>
                    <el-button type="danger" v-if="scope.row.departmentStatus == 1" @click="switchDepartmentStatus(scope.row)">隐藏</el-button>
                    <el-button type="success" v-else @click="switchDepartmentStatus(scope.row)">开启</el-button>
                </template>
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
import { defaultFail } from '@/api/errorNoties';
import { defaultSuccess } from '@/api/successNoties';


export default {
    data() {
        return {
            temSearch:"",
            searchInput:"",
            loading:true,
            pageLoading:true,
            total: 0,
            pageSize: 5,
            currentPage: 1,
            dialogFormVisible: false,
            formLabelWidth: '120px',
            tableData:[],
            searchPagen:1
        }
    },
    mounted() {
        this.getDepartment();
    },
    methods: {
        StatusFormatter(row, column, cellValue){
            return cellValue === 1 ? '开启' : '关闭';
        },
        getDepartment() {
            this.$axios.post(
                "/department/getAllDepartment",
                {
                    pagen:this.currentPage,
                    limit:this.pageSize
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
            if(this.temSearch == '' ){
                this.getDepartment()
            }else{
                this.doSearch()
            }
 
        },
        goBack(){
            this.$router.push("/main")
        },
        switchDepartmentStatus(res){
            this.$axios.post(
                "/department/switchDepartmentStatus",
                {
                    departmentId:res.departmentId,
                    departmentStatus:res.departmentStatus
                }
            ).then((res)=>{
                if(res.code == 1){
                    defaultSuccess()
                }else{
                    defaultFail()
                }
                this.getDepartment();
            })
        },
        reset(){
            this.searchInput = "",
            this.temSearch = "",
            this.getDepartment();
        },
        doSearch(){
            this.loading = true;
            this.$axios.post(
                "/department/getDepartmentInSearch",
                {
                    pagen:this.searchPagen,
                    departmentName:this.searchInput,
                    limit:this.pageSize
                }
            ).then((res)=>{
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