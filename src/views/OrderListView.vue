<template>
    <div>
        <el-page-header @back="goBack" content="开单">
        </el-page-header>
        <hr>

        <div style="text-align: left; padding-left: 20px;padding-bottom: 20px;position: relative; height: 30px">
            <span>订单号:</span>
            <el-input v-model="searchInput" placeholder="请输入内容" style="width:200px; padding-right: 10px"></el-input>
            <el-button type="success" @click="doSearch">搜索</el-button>
            <el-button @click="reset">重置</el-button>
            <el-button type="primary" style="position: absolute;right: 20px;" @click="addForm">添加</el-button>
        </div>

        <el-table :data="tableData" style="width: 100%" v-loading="loading" stripe>
            <el-table-column prop="orderId" label="id" width="50">
            </el-table-column>
            <el-table-column prop="orderNumber" label="订单号" width="250">
            </el-table-column>
            <el-table-column prop="orderCreateTime" label="创建时间" width="200" :formatter="timeMatter">
            </el-table-column>
            <el-table-column prop="orderStatus" label="状态" width="100" :formatter="statusMatter">
            </el-table-column>
            <el-table-column prop="orderPrice" label="价格(￥)" width="100">
            </el-table-column>
            <el-table-column label="操作">
                <template slot-scope="scope">
                    <el-popconfirm title="确认结账吗？" @confirm="checkOut(scope.row)">
                        <el-button type="success" :disabled="scope.row.orderStatus == 1" slot="reference">
                            结账
                        </el-button>
                    </el-popconfirm>
                </template>
            </el-table-column>
        </el-table>
        <div class="block">
            <el-pagination layout="prev, pager, next" :total=total :page-size="pageSize"
                @current-change="handleCurrentChange" :current-page="currentPage">
            </el-pagination>
        </div>

        <el-dialog title="订单操作" height="100%" :visible.sync="formDialogVisible" width="60%" v-loading="dialogLoading">
            <el-steps :active="active" finish-status="success" class="custom-steps" style="text-align: left">
                <el-step title="选择项目"></el-step>
                <el-step title="选择套餐"></el-step>
            </el-steps>
            <el-table ref="multipleTable1" height="300" :data="dialogTableData" tooltip-effect="dark"
                style="width: 100%" @selection-change="handleProjectSelectionChange" v-show="showTable1"
                :summary-method="getSummaries" :show-summary="true">
                <el-table-column type="selection" width="80">
                </el-table-column>
                <el-table-column prop="projectId" label="id" width="120">
                </el-table-column>
                <el-table-column prop="projectName" label="项目名" width="400">
                </el-table-column>
                <el-table-column prop="projectPrice" label="项目价格(￥)" show-overflow-tooltip>
                </el-table-column>
            </el-table>
            <el-table ref="multipleTable2" height="300" :data="dialogTableData2" tooltip-effect="dark"
                style="width: 100%" @selection-change="handleComboSelectionChange" v-show="showTable2"
                :show-summary="true" :summary-method="getSummariesCombo">
                <el-table-column type="selection" width="55">
                </el-table-column>
                <el-table-column prop="comboId" label="id" width="120">
                </el-table-column>
                <el-table-column prop="comboName" label="项目名" width="400">
                </el-table-column>
                <el-table-column prop="comboPrice" label="项目价格(￥)" show-overflow-tooltip>
                </el-table-column>
            </el-table>
            <div style="margin-top: 20px">
                <el-button v-show="showTable2" @click="lastTable">上一步</el-button>
                <el-button v-if="showTable1" @click="nextTable">下一步</el-button>
                <el-button v-else type="success" @click="submitForm">提交</el-button>
            </div>

        </el-dialog>



    </div>
</template>

<script>
import { FailInMsg } from '@/api/errorNoties';
import { defaultSuccess, successInMsg } from '@/api/successNoties';


export default {
    data() {
        return {
            active: 0,
            patientId: "",
            orderNumber: "",
            searchInput: "",
            searchPagen: 1,
            pageSize: 5,
            showTable1: true,
            showTable2: false,
            currentPage: 1,
            temSearch: "",
            loading: false,
            dialogLoading: false,
            formDialogVisible: false,
            multipleProjectSelection: [],
            multipleComboSelection: [],
            projectPrice: 0,
            comboPrice: 0,
            tableData: [],
            dialogTableData: [],
            dialogTableData2: [],
            total: 1,

        }
    },
    mounted() {
        this.patientId = this.$store.state.patientId
        if (this.patientId == '') {
            this.$router.push("/patient")
        }

        this.getOrderById()
    },
    methods: {
        // 数据获取
        getOrderById() {
            this.loading = true
            this.$axios.post(
                "/orderList/getOrderListByIdInPage",
                {
                    pagen: this.currentPage,
                    limit: this.pageSize,
                    id: this.patientId
                }
            ).then((res) => {
                this.loading = false
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        getAllProject() {
            this.dialogLoading = true
            this.$axios.post(
                "/project/getAllProjectNoPage",
                {
                    pagen: this.currentPage,
                    limit: this.pageSize
                }
            ).then((res) => {
                this.dialogLoading = false
                this.dialogTableData = res.data
            })
        },
        getAllCombo() {
            this.dialogLoading = true
            this.$axios.post(
                "/combo/getAllComboNoPage"
            ).then((res) => {
                this.dialogLoading = false
                this.dialogTableData2 = res.data
            })
        },
        getSummaries(param) {
            const { columns } = param;
            const sums = [];
            const selectedItems = this.multipleProjectSelection;
            let comboPrice = 0; // 使用局部变量来存储计算结果
            columns.forEach((column, index) => {
                if (index === 3) { // Assuming 'projectPrice' column is at index 3
                    const values = selectedItems.map(item => Number(item[column.property])).filter(value => !isNaN(value));
                    const total = values.reduce((prev, curr) => prev + curr, 0);
                    comboPrice += total; // 累加总价
                    sums[index] = `总计: ￥${total.toFixed(2)}`;
                } else {
                    sums[index] = '';
                }
            });
            this.projectPrice = comboPrice.toFixed(2);
            return sums;
        },
        getSummariesCombo(param1) {
            const { columns: columns1 } = param1;
            const sums1 = [];
            const selectedItems1 = this.multipleComboSelection;
            let comboPrice = 0; // 使用局部变量来存储计算结果

            columns1.forEach((column1, index1) => {
                if (index1 === 3) {
                    const values1 = selectedItems1.map(item1 => Number(item1[column1.property])).filter(value1 => !isNaN(value1));
                    const total1 = values1.reduce((prev1, curr1) => prev1 + curr1, 0);
                    comboPrice += total1; // 累加总价
                    sums1[index1] = `总计: ￥${total1.toFixed(2)}`;
                } else {
                    sums1[index1] = '';
                }
            });
            this.comboPrice = comboPrice.toFixed(2);
            return sums1;
        },


        // 按钮功能
        checkOut(res) {
            this.loading = true;
            this.$axios.post(
                "/orderList/checkOutOrder",
                {
                    patientId: this.patientId,
                    orderNumber: res.orderNumber,
                    orderPrice: res.orderPrice,
                    orderId: res.orderId,
                }
            ).then((res) => {
                this.loading = false;
                if (res.code == 1) {
                    successInMsg("结账成功")
                    this.getOrderById();
                } else if (res.code == -2) {
                    FailInMsg("余额不足")
                }

            })
        },
        addForm() {
            this.orderNumber = ""
            this.multipleComboSelection = []
            this.multipleProjectSelection = []
            this.projectPrice = 0
            this.comboPrice = 0
            this.active = 0
            this.showTable1 = true
            this.showTable2 = false

            this.getAllProject()
            this.getAllCombo()
            this.formDialogVisible = true
        },
        nextTable() {
            this.showTable1 = false
            this.showTable2 = true


            this.active++
        },
        lastTable() {
            this.showTable1 = true
            this.showTable2 = false

            this.active--
        },
        submitForm() {
            this.dialogLoading = true
            let projectPrice = parseFloat(this.projectPrice) || 0; // 转换为数字，如果转换失败则默认为 0
            let comboPrice = parseFloat(this.comboPrice) || 0;     // 转换为数字，如果转换失败则默认为 0
            let sumprice = projectPrice + comboPrice;
            this.$axios.post(
                "/orderList/addOrder",
                {
                    projects:this.multipleProjectSelection,
                    combos:this.multipleComboSelection,
                    price:sumprice,
                    patientId:this.patientId,
                }
            ).then((res)=>{
                console.log(res);
                if(res.code == 1){
                    this.dialogLoading = false
                    this.formDialogVisible = false
                    defaultSuccess()
                    this.getOrderById()
                }
            })        
        },
        // 搜索
        doSearch() {
            this.loading = true;
            this.$axios.post(
                "/orderList/searchOrderByIdInPage",
                {
                    pagen: this.searchPagen,
                    name: this.searchInput,
                    limit: this.pageSize,
                    iden: this.patientId
                }
            ).then((res) => {
                this.loading = false;
                this.temSearch = this.searchInput;
                this.tableData = res.data.list
                this.total = res.data.total
            })
        },
        // 基础功能
        handleProjectSelectionChange(val) {
            this.multipleProjectSelection = val;
        },
        handleComboSelectionChange(val) {
            this.multipleComboSelection = val
        },
        handleCurrentChange(index) {
            this.searchPagen = index
            this.currentPage = index
            if (this.temSearch == '') {
                this.getPatient()
            } else {
                this.doSearch()
            }
        },
        statusMatter(row, colum, cellValue) {
            return cellValue == 1 ? "已付款" : "未付款"
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
        reset() {
            this.searchInput = ""
            this.currentPage = 1
            this.getOrderById()
        },
        goBack() {
            this.$router.push("/patient")
        }
    }
}

</script>