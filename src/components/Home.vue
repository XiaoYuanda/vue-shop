<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <div class="imgbox">
          <img src="../assets/logo/heima.png" alt="logo" />
        </div>

        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="asideWidth" style="background-color:#efefef">
        <div class="toggleCollapse" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#eee"
          text-color="#000"
          active-text-color="#1b99e2"
          unique-opened
          :collapse="iscollapse"
          :collapse-transition="false"
          router
        >
          <el-submenu v-for="item in menuList" :key="item.id" :index="item.id + ''">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="'/' + subItem.path">
              <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data: function () {
    return {
      menuList: [],
      iconObj: {
        125: 'el-icon-user',
        103: 'el-icon-circle-check',
        101: 'el-icon-receiving',
        102: 'el-icon-document',
        145: 'el-icon-data-analysis'
      },
      iscollapse: false,
      asideWidth: '200px'
    }
  },
  created () {
    this.getMenu()
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenu () {
      const { data: res } = await this.$http('menus')
      this.menuList = res.data
    },
    toggleCollapse () {
      this.iscollapse = !this.iscollapse
      if (this.iscollapse === true) {
        this.asideWidth = '64px'
      } else {
        this.asideWidth = '200px'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #1b242e;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
}
.el-aside {
  background-color: rgb(255, 255, 255);
  .el-menu{
    border-right: 0;
  }
}
.el-main {
  background-color: white;
}
.home_container {
  height: 100%;
}
.toggleCollapse{
  background-color: rgb(223, 223, 223);
  font-size: 10px;
  text-align: center;
  color: black;
  line-height: 100%;
  letter-spacing: 0.2rem;
  cursor: pointer;
  padding: 15px;
}
</style>
