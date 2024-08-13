<template>
    <div>
        <el-page-header @back="goBack" content="开单">
        </el-page-header>
        <hr>
    </div>
</template>

<script>

export default {
    data() {
        return {

        }
    },
    mounted() {
        const patientId = this.$route.query.patientId;
        const patientBudget = this.$route.query.patientBudget;
        console.log(patientId, patientBudget);
    },
    methods: {
        goBack() {
            this.$router.push("/patient")
        }
    }
}

</script>