<template>
    <div>
        <el-page-header @back="goBack" content="权限管理-菜单管理">
        </el-page-header>
        <hr>

        <el-table :data="tableData" hight="500" style="width: 100%;margin-bottom: 20px;" row-key="menuId" border default-expand-all
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
            <el-table-column prop="menuName" label="菜单名" sortable width="180">
            </el-table-column>
            <el-table-column prop="menuStatus" label="菜单状态" width="120">
                <template slot-scope="stateScope">
                    <el-switch :value="stateScope.row.menuStatus" active-color="#13ce66" inactive-color="#ff4949"
                        :active-value="1" :inactive-value="0" @change="handleStatusChange(stateScope.row)">
                    </el-switch>
                </template>
            </el-table-column>
        </el-table>

    </div>
</template>

<script>
import { FailInMsg } from '@/api/errorNoties';
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
        this.getMenuList();
    },
    methods: {
        // 获得数据
        getMenuList(){
            this.$axios.post(
                "/menu/searchMenuByRoleInTreeNoPage"
            ).then((res)=>{
                this.tableData = res.data
            })
        },

        // 操作数据
        handleStatusChange(res){
            let changeStatus
            if(res.menuStatus == 1){
                changeStatus = 0
            }else{
                changeStatus = 1
            }
            
            this.$axios.post(
                "/menu/switchMenuStatus",
                {
                    menuId:res.menuId,
                    menuStatus:changeStatus
                }
            ).then((res)=>{
                if(res.code == 1){
                    defaultSuccess()
                    this.getMenuList()
                }else{
                    FailInMsg("还有子项没有隐藏，无法隐藏")
                }
            })
            
        },

        //固定方法 
        goBack() {
            this.$router.push("/patient")
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