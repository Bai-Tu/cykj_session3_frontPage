<template>
    <div id="outside_container">
        <div class="container" id="container" v-loading="loading">
            <form onsubmit="return false;" style="margin-top: 50px;">
                <h1>后台登陆</h1>
                <p></p>
                <input type="text" placeholder="身份证/电话" v-model="acc" />
                <input type="password" placeholder="密码" v-model="pwd" />
                <p></p>
                <button @click="doLogin">登陆</button>
            </form>
        </div>
    </div>
</template>

<script>
import { accFreeze, accOrPwdError, FailInMsg } from '@/api/errorNoties';
import { blockForThreeSeconds } from '@/api/outherTools';
import { successEnter } from '@/api/successNoties';
import { setToken } from '@/utils/authToken';


export default {
    data() {
        return {
            acc: "_admin",
            pwd: "123456",
            rig_acc: "",
            rig_pwd: "",
            rig_name: "",
            rig_age: "",
            check_code: "",
            imgUrl: "/phy/tool/refreshCheckCode",
            loading: false
        }
    },
    mounted() {
        this.refreshCheckCode();
    },
    methods: {
        async doLogin() {
            this.loading = true;
            try {
                if (this.acc.includes('_')) { // 管理员
                    const res = await this.$axios.post("/admin/adminLogin", {
                        acc: this.acc,
                        pwd: this.pwd
                    });

                    this.loading = false;

                    if (res.code == 1) {
                        setToken(res.data);
                        successEnter();
                        await this.$store.dispatch("getAdminInfo"); // 使用 dispatch 而非 commit
                        await blockForThreeSeconds(); // 等待 3 秒

                        if (location.href.includes('?redirect')) {
                            const urlobj = location.href.split('redirect=')[1];
                            const newDes = decodeURIComponent(urlobj);
                            this.$router.push({ path: newDes });
                        } else {
                            this.$router.push({ path: "/main" });
                        }
                    } else if (res.code == -101) {
                        accFreeze();
                    } else {
                        accOrPwdError();
                    }
                } else {
                    FailInMsg("账号错误");
                }
            } catch (error) {
                console.error("Login failed:", error);
                FailInMsg("登录失败，请重试");
            } finally {
                this.loading = false;
            }

        },
        refreshCheckCode() {
            this.imgUrl = "/phy/tool/refreshCheckCode?a=" + new Date().getTime();
        },

    }

}

</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Montserrat:400,800');

#outside_container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 100px;
}

* {
    box-sizing: border-box;
}

body {
    background: #f6f5f7;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    font-family: 'Montserrat', sans-serif;
    height: 100vh;
    margin: -20px 0 50px;
}

h1 {
    font-weight: bold;
    margin: 0;
}

h2 {
    text-align: center;
}

p {
    font-size: 14px;
    font-weight: 100;
    line-height: 20px;
    letter-spacing: 0.5px;
    margin: 20px 0 30px;
}

span {
    font-size: 12px;
}

a {
    color: #333;
    font-size: 14px;
    text-decoration: none;
    margin: 15px 0;
}

button {
    border-radius: 20px;
    border: 1px solid #FF4B2B;
    background-color: #FF4B2B;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: bold;
    padding: 12px 45px;
    letter-spacing: 1px;
    text-transform: uppercase;
    transition: transform 80ms ease-in;
}

button:active {
    transform: scale(0.95);
}

button:focus {
    outline: none;
}

button.ghost {
    background-color: transparent;
    border-color: #FFFFFF;
}

form {
    background-color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 50px;
    height: 100%;
    text-align: center;
}

input {
    background-color: #eee;
    border: none;
    padding: 12px 15px;
    margin: 8px 0;
    width: 100%;
}

.container {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    position: relative;
    overflow: hidden;
    width: 768px;
    max-width: 100%;
    min-height: 480px;
}

.form-container {
    position: absolute;
    top: 0;
    height: 100%;
    transition: all 0.6s ease-in-out;
}

.sign-in-container {
    left: 0;
    width: 50%;
    z-index: 2;
}

.container.right-panel-active .sign-in-container {
    transform: translateX(100%);
}

.sign-up-container {
    left: 0;
    width: 50%;
    opacity: 0;
    z-index: 1;
}

.container.right-panel-active .sign-up-container {
    transform: translateX(100%);
    opacity: 1;
    z-index: 5;
    animation: show 0.6s;
}

@keyframes show {

    0%,
    49.99% {
        opacity: 0;
        z-index: 1;
    }

    50%,
    100% {
        opacity: 1;
        z-index: 5;
    }
}

.overlay-container {
    position: absolute;
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
    overflow: hidden;
    transition: transform 0.6s ease-in-out;
    z-index: 100;
}

.container.right-panel-active .overlay-container {
    transform: translateX(-100%);
}

.overlay {
    background: #FF416C;
    background: -webkit-linear-gradient(to right, #FF4B2B, #FF416C);
    background: linear-gradient(to right, #FF4B2B, #FF416C);
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 0 0;
    color: #FFFFFF;
    position: relative;
    left: -100%;
    height: 100%;
    width: 200%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.container.right-panel-active .overlay {
    transform: translateX(50%);
}

.overlay-panel {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 0 40px;
    text-align: center;
    top: 0;
    height: 100%;
    width: 50%;
    transform: translateX(0);
    transition: transform 0.6s ease-in-out;
}

.overlay-left {
    transform: translateX(-20%);
}

.container.right-panel-active .overlay-left {
    transform: translateX(0);
}

.overlay-right {
    right: 0;
    transform: translateX(0);
}

.container.right-panel-active .overlay-right {
    transform: translateX(20%);
}

.social-container {
    margin: 20px 0;
}

.social-container a {
    border: 1px solid #DDDDDD;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 5px;
    height: 40px;
    width: 40px;
}

footer {
    background-color: #222;
    color: #fff;
    font-size: 14px;
    bottom: 0;
    position: fixed;
    left: 0;
    right: 0;
    text-align: center;
    z-index: 999;
}

footer p {
    margin: 10px 0;
}

footer i {
    color: red;
}

footer a {
    color: #3c97bf;
    text-decoration: none;
}
</style>