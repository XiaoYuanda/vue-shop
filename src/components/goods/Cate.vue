<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
        :show-row-hover="false"
      >
        <template slot="isok" slot-scope="scope">
          <i
            v-if="scope.row.cat_deleted === false"
            class="el-icon-success"
            style="color: lightgreen"
          ></i>
          <i v-else class="el-icon-error"></i>
        </template>

        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" type="success" size="mini"
            >一级</el-tag
          >
          <el-tag v-else-if="scope.row.cat_level === 1" size="mini"
            >二级</el-tag
          >
          <el-tag v-else type="warning" size="mini">三级</el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" size="mini">编辑</el-button>
          <el-button @click="deleteCateById(scope.row)" type="danger" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加商品分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
    >
      <el-form
        :model="addCateForm"
        label-width="80px"
        ref="addUCateRef"
        :rules="addCateRules"
      >
        <!-- 分类名称 -->
        <el-form-item label="分类名称" prop="cat_name">
          <el-input
            v-model="addCateForm.cat_name"
            placeholder="请输入分类名称"
          ></el-input>
        </el-form-item>

        <!-- 父级分类 -->
        <el-form-item label="父级分类">
          <el-cascader class="cascaderclass"
            :clearable="true"
            v-model="selectedParentCateKey"
            :options="parentCateList"
            :props="CascaderProps"
            @change="ParentCateChange"
            placeholder="请选择分类"
            size="small"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddCate">取 消</el-button>
        <el-button type="primary" @click="sendAddCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      parentCateQueryInfo: {
        type: 2
      },
      total: 0,
      cateList: [],
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
          width: '300px'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],

      // 添加分类对话框的显示与隐藏
      addCateDialogVisible: false,

      // 添加分类的表单
      addCateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },

      // 添加分类表单的校验规则
      addCateRules: {
        cat_name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' },
          {
            min: 1,
            max: 8,
            message: '长度在 1 到 8 个字符',
            trigger: 'blur'
          }
        ]
      },

      // 父级分类列表
      parentCateList: [],

      // CascaderProps
      CascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectedParentCateKey: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表失败！')
      }
      this.cateList = res.data.result
      this.$message.success('数据已更新')
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    // 显示添加分类的对话框
    showAddCateDialog () {
      // 获取父级数据分类的列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },

    // 清除表单与校验规则
    cancelAddCate () {
      console.log('清除表单与校验规则')
      this.addCateDialogVisible = false
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_name = ''
      this.addCateForm.cat_level = 0
      this.$refs.addUCateRef.resetFields()
      this.selectedParentCateKey = []
    },

    // 发起添加请求
    sendAddCate () {
      console.log('发起添加请求, 对话框关闭，清楚表单校验')
      this.$refs.addUCateRef.validate(async val => {
        if (!val) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
      })
      this.addCateDialogVisible = false
    },

    // 获取父级分类列表
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.parentCateQueryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // cascader 选择项变化时
    ParentCateChange () {
      console.log(this.selectedParentCateKey)
      if (this.selectedParentCateKey.length > 0) {
        const index = this.selectedParentCateKey.length - 1
        this.addCateForm.cat_pid = this.selectedParentCateKey[index]
        this.addCateForm.cat_level = this.selectedParentCateKey.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
        this.$message.info('没有选择父级分类')
      }
    },
    async deleteCateById (scope) {
      const { data: res } = await this.$http.delete('categories/' + scope.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品分类失败')
      }
      this.$message.success('删除商品分类成功')
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
  margin-bottom: 15px;
}
.cascaderclass{
  width: 100%;
}

</style>
