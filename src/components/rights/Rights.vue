<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">权限管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-table :data="rightsList" stripe style="width: 100%" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level == '1'">一级</el-tag>
            <el-tag v-else-if="scope.row.level == '2'" type="danger">二级</el-tag>
            <el-tag v-else type="success">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    getRightsList () {
      this.$http.get('rights/list').then((p) => {
        const res = p.data
        if (res.meta.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        this.rightsList = res.data
        console.log(this.rightsList)
      }).catch(() => {
        this.$message.error('执行异常')
      })
    }
  }

}
</script>
