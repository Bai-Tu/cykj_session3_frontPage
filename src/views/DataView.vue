<template>
    <div>
        <div ref="ageContainer" style="width: 600px; height: 400px; float: left"></div>
        <div ref="saleContainer" style="width: 600px; height: 400px; float: right;"></div>
    </div>
</template>

<script>
import * as echarts from 'echarts';

export default {
    data() {
        return {
            ageData: [
                {
                    value: 335,
                    name: '直接访问'
                },
                {
                    value: 234,
                    name: '联盟广告'
                },
                {
                    value: 1548,
                    name: '搜索引擎'
                }
            ],
            saleData: [10, 22, 28],
            salexAxisData: ['A', 'B', 'C'],
        }
    },
    mounted() {
        this.getAgeData()
        this.getSaleData()
    },
    methods: {
        // 获得数据
        getAgeData(){
            this.$axios.post(
                "/data/getAgeData"
            ).then((res)=>{
                this.ageData = res.data                
                this.initAgeChart();
            })
        },
        getSaleData(){
            this.$axios.post(
                "/data/getSaleData"
            ).then((res)=>{
                this.saleData = res.data.saleList;
                this.salexAxisData = res.data.saleTitle
                this.initSaleChart()
            })
        },


        // 初始化图表
        // 年龄饼图
        initAgeChart() {
            const ageChart = echarts.init(this.$refs.ageContainer);
            const ageOption = {
                title: {
                    text: '年龄构成'
                },
                series: [
                    {
                        type: 'pie',
                        data: this.ageData
                    }
                ],
                tooltip: {
                    trigger: 'item'
                },
            };
            ageChart.setOption(ageOption);
        },
        // 销售额折线图
        initSaleChart() {
            const saleChart = echarts.init(this.$refs.saleContainer);
            const saleOption = {
                title: {
                    text: "销售额"
                },
                series: [
                    {
                        data: this.saleData,
                        type: 'line',
                        label: {
                            show: true,
                            position: 'bottom',
                            textStyle: {
                                fontSize: 20
                            }
                        }
                    }
                ],
                xAxis: {
                    data: this.salexAxisData
                },
                yAxis: {},
            }
            saleChart.setOption(saleOption);
        }
    }
};

</script>