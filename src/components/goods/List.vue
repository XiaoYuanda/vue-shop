<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            @change="searchGoods"
            clearable
            v-model="queryInfo.query"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchGoods"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="GoAddGoods"
            >添加商品</el-button
          >
        </el-col>
      </el-row>

    <!-- 商品数据表 -->
    <el-table :data="goodsList" border stripe size="small ">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="goods_name" label="商品名称"></el-table-column>
      <el-table-column
        prop="goods_price"
        label="商品价格"
        width="60"
      ></el-table-column>
      <el-table-column
        prop="goods_weight"
        label="商品重量"
        width="60"
      ></el-table-column>
      <el-table-column prop="add_time" label="创建时间" width="140">
        <template slot-scope="scope">{{
          scope.row.add_time | dateFormat
        }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="clickGoodEdit(scope.row)"
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="clickGoodsDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页控件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 20]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 搜索的字符串
      searchStr: '',
      // 商品数据
      goodsList: [],
      // 商品列表的数量
      total: 0,
      // 获取商品的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      }
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 点击搜索时触发
    searchGoods () {
      this.getGoodsList()
    },
    // 点击添加按钮执行的函数
    showAddGoodsDialog () {},
    // 根据分页获取商品列表数据
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
      console.log(this.goodsList)
      this.$message.success('获取商品数据成功！')
    },
    // 每页显示数量改变时触发
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 当前页码改变时触发
    handleCurrentChange (newPagnum) {
      this.queryInfo.pagenum = newPagnum
      this.getGoodsList()
    },
    // 点击编辑商品按钮时触发
    clickGoodEdit () {},
    // 点击删除商品按钮时触发
    clickGoodsDelete (row) {
      // 弹出提示框
      this.$confirm('是否删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: res } = await this.$http.delete(
            `goods/${row.goods_id}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除商品失败！')
        }
        this.$message.success('删除商品成功！')
        this.getGoodsList()
      }).catch(() => {
        this.$message.info('已取消！')
      })
    },
    GoAddGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>
.el-pagination {
  margin-top: 10px;
}
</style>
