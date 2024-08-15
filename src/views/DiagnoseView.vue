<template>
    <div>
        <el-page-header @back="goBack" content="查询&诊断">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>订单号:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"
                :disabled="!isGo||!canInput"></el-input>
            <el-button type="success" @click="doSearch" v-show="isGo">搜索</el-button>
            <el-button @click="reset" v-show="isGo">重置</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="subitemConclutionId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="orderNameber" label="订单编号" width="250">
            </el-table-column>
            <el-table-column prop="subitemName" label="细项名" width="250">
            </el-table-column>
            <el-table-column prop="subitemConclution" label="细项结果" width="200">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" :disabled="scope.row.departmentId !== myDepartmentId" slot="reference" v-show="isGo"
                        @click="openForm(scope.row)">
                        编辑
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>

        <el-dialog title="细项结果" height="100%" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <span>结果：</span>
            <el-input v-model="dialogInput.subitemConclution" placeholder="请输入结果"
                style="width:200px; padding-right: 10px"></el-input>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitConclution">确 定</el-button>
            </div>

        </el-dialog>




    </div>
</template>

<script>
import { FailInMsg } from '@/api/errorNoties';
import { successInMsg } from '@/api/successNoties';


export default {
    data() {
        return {
            canInput:true,
            orderNumberByGo: "",
            active: 0,
            isGo: false,
            patientId: "",
            orderNumber: "",
            searchInput: "",
            searchPagen: 1,
            pageSize: 5,
            showTable1: true,
            showTable2: false,
            myDepartmentId:"",
            currentPage: 1,
            temSearch: "",
            loading: false,
            dialogLoading: false,
            formDialogVisible: false,
            projectPrice: 0,
            comboPrice: 0,
            tableData: [],
            dialogInput: {
                subitemConclutionId: "",
                subitemConclution: "",
            },
            total: 1,

        }
    },
    mounted() {
        this.orderNumberByGo = this.$route.query.orderNumberByGo
        this.myDepartmentId = this.$store.getters.getAdmin.adminDepartmentId
        if (this.orderNumberByGo != undefined) {
            this.isGo = false
            this.searchInput = this.orderNumberByGo
            this.doSearch()
        } else {
            this.searchInput = ""
            this.isGo = true
        }

    },
    methods: {

        // 按钮功能
        openForm(res) {
            this.formDialogVisible = true
            this.dialogInput.subitemConclutionId = res.subitemConclutionId
            this.dialogInput.subitemConclution = res.subitemConclution
            console.log(res);

        },
        submitConclution(){
            if(this.dialogInput.subitemConclution == ''){
                FailInMsg("不能为空")
            }else if(Number.isFinite(Number(this.dialogInput.subitemConclution))){
                this.$axios.post(
                    "/diagnose/updateConclution",
                    {
                        subitemConclutionId:this.dialogInput.subitemConclutionId,
                        subitemConclution:this.dialogInput.subitemConclution
                    }
                ).then((res)=>{
                    if(res.code == 1){
                        this.formDialogVisible = false
                        successInMsg("修改成功")
                        this.doSearch()
                    }                    
                })
            }else{
                FailInMsg("输入格式有误")
            }
        },
        // 搜索
        doSearch() {
            if (this.searchInput.length != 16) {
                FailInMsg("需填入完整16位订单编号")
                return
            }
            this.canInput = false;
            this.loading = true;
            this.$axios.post(
                "/diagnose/getOrderContextByNumberByPage",
                {
                    pagen: this.searchPagen,
                    name: this.searchInput,
                    limit: this.pageSize,
                }
            ).then((res) => {
                this.loading = false;
                this.temSearch = this.searchInput;
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        // 基础功能
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getPatient()
            } else {
                this.doSearch()
            }
        },
        reset() {
            this.canInput = true
            this.searchInput = ""
            this.currentPage = 1
            this.total = 1
            this.tableData = []
        },
        goBack() {
            if (this.orderNumberByGo != undefined) {
                this.$router.push("/patient")
            } else {
                this.$router.push("/main")
            }

        }
    }
}

</script>