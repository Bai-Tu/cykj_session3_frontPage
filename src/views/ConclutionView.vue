<template>
    <div>
        <el-page-header @back="goBack" content="总检">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>订单号:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px" :disabled="!canInput"></el-input>
            <el-button type="success" @click="doSearch" >搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="margin-left: 50%;" @click="getConclution" v-show="temSearch != ''">查看总检</el-button>
            <el-button type="primary" v-show="temSearch != ''"  @click="addConclution" :disabled="!(myDepartmentId==1||myDepartmentId == 3)">编写总检</el-button>
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
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>

        <el-dialog title="总结" height="100%" :visible.sync="formDialogVisible" width="30%" v-loading="dialogLoading">
            <span>总结：</span>
            <el-input type="textarea" autosize placeholder="请输入内容" v-model="dialogInput.conclution" :disabled="active">
            </el-input>
            <div slot="footer" class="dialog-footer">
                <el-button @click="formDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitConclution" v-show="!active">确 定</el-button>
            </div>

        </el-dialog>




    </div>
</template>

<script>
import { defaultFail, FailInMsg } from '@/api/errorNoties';
import { successInMsg } from '@/api/successNoties';


export default {
    data() {
        return {
            orderNumberByGo: "",
            active: false,
            canInput:true,
            patientId: "",
            orderNumber: "",
            searchInput: "",
            searchPagen: 1,
            pageSize: 5,
            myDepartmentId: "",
            currentPage: 1,
            temSearch: "",
            loading: false,
            dialogLoading: false,
            formDialogVisible: false,
            projectPrice: 0,
            comboPrice: 0,
            tableData: [],
            dialogInput: {
                conclution: "",
            },
            total: 1,

        }
    },
    mounted() {
        this.myDepartmentId = this.$store.getters.getAdmin.adminDepartmentId
    },
    methods: {

        // 按钮功能
        getConclution() {
            this.$axios.post(
                "/conclution/getConclutionByOrderNumber",
                {
                    orderNumber:this.temSearch
                }
            ).then((res)=>{
                if(res.code == -2){
                    FailInMsg("还有细项没有结果，无法查看总结")
                }else{
                    this.dialogInput.conclution = res.data.conclutionContent;
                    this.active = true
                    this.formDialogVisible = true
                }               
                
            })

        },
        addConclution(){
            this.$axios.post(
                "/conclution/getConclutionByOrderNumber",
                {
                    orderNumber:this.temSearch
                }
            ).then((res)=>{
                if(res.code == -2){
                    FailInMsg("还有细项没有结果，无法查看总结")
                }else{
                    this.dialogInput.conclution = res.data.conclutionContent;
                    this.active = false
                    this.formDialogVisible = true
                }               
                
            })
        },


        submitConclution(){
            this.$axios.post(
                "/conclution/setConclution",
                {
                    orderNumber:this.temSearch,
                    conclutionContent:this.dialogInput.conclution
                }
            ).then((res)=>{
                if(res.code == 1){
                    this.formDialogVisible = false
                    successInMsg("修改成功")
                }else{
                    defaultFail()
                }
            })
            
        },

        // 搜索
        doSearch() {
            if (this.searchInput.length != 16) {
                FailInMsg("需填入完整16位订单编号")
                return
            }
            this.canInput = false
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
            this.doSearch()
        },
        reset() {
            this.canInput = true
            this.searchInput = ""
            this.temSearch = ""
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