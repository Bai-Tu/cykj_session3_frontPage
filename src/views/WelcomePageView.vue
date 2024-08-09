<template>
    <h1>欢迎,<span>{{ name }}</span></h1>
</template>

<script>

export default{
    data(){
        return {
            name:"狗管理"
        }
    },
    mounted(){
        this.getName()
    },
    methods:{
        getName(){
            this.name=this.$store.getters.getAdmin.adminName;
        }
    }
}

</script>