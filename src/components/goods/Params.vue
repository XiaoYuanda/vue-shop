<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <!-- 提示组件 -->
      <el-alert
        title="注意：只允许为三级分类设置相关参数！"
        type="warning"
        show-icon
        :closable="false"
      />
      <el-row class="el-row-params">
        <el-col>
          <span>选择分类:</span>
          <el-cascader
            class="cascaderclass"
            :clearable="true"
            v-model="selectedCateKey"
            :options="cateList"
            :props="CascaderProps"
            @change="CateChange"
            placeholder="请选择分类"
            size="small"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs
        v-model="activeName"
        class="demo-tabs"
        @tab-click="handleTabClick"
      >
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addManyOrOnlyData"
            >添加动态参数</el-button
          >
          <el-table stripe :data="manyTableData" border>
            <el-table-column type="expand">
              <!-- 显示所有的Tag -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  class="mx-1"
                  closable
                  :disable-transitions="false"
                  @close="TaghandleClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>

                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  autofocus
                  size="small"
                  @change="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag ml-1"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + {{ addParamsDialogString }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditParamsDialog(scope.row.attr_id)"
                  icon="el-icon-edit"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  @click="deleteParams(scope)"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisable"
            @click="addManyOrOnlyData"
            >添加静态属性</el-button
          >
          <el-table stripe :data="onlyTableData" border>
            <el-table-column type="expand">
              <!-- 显示所有的Tag -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  class="mx-1"
                  closable
                  :disable-transitions="false"
                  @close="TaghandleClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>

                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  autofocus
                  size="small"
                  @change="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag ml-1"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + {{ addParamsDialogString }}
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditParamsDialog(scope.row)"
                  icon="el-icon-edit"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  size="mini"
                  @click="deleteParams(scope)"
                  icon="el-icon-delete"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 显示添加属性的对话框 -->
    <el-dialog
      :title="'添加' + addParamsDialogString"
      :visible.sync="addParamsDialogVisable"
      width="50%"
    >
      <el-form
        :model="addParamsForm"
        label-width="90px"
        :rules="addParamsRules"
        ref="addParamsRef"
      >
        <el-form-item :label="addParamsDialogString" prop="paramsName">
          <el-input
            v-model="addParamsForm.paramsName"
            :placeholder="`请输入${addParamsDialogString}名称`"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddParams">取 消</el-button>
        <el-button type="primary" @click="addManyOrOnlyData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 显示修改属性的对话框 -->
    <el-dialog
      :title="'修改' + addParamsDialogString"
      :visible.sync="editParamsDialogVisable"
      width="50%"
    >
      <el-form
        :model="editParamsForm"
        label-width="90px"
        :rules="editParamsRules"
        ref="editParamsRef"
      >
        <el-form-item :label="addParamsDialogString" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditParams">取 消</el-button>
        <el-button type="primary" @click="sendEditParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // vue的数据
    return {
      queryInfo: {
        // 定义查询参数
        type: 3
      },
      selectedCateKey: {}, // 级联选择器选定的商品分类ID
      CascaderProps: {
        // 级联选择器的设置
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
        // checkStrictly: true
      },
      cateList: [], // 存储查询到的分类数据
      activeName: 'many', // 被激活的页签的名称
      manyTableData: [], // 动态参数数据
      onlyTableData: [], // 静态属性的数据
      addParamsDialogVisable: false, // 添加属性对话框的显示与隐藏
      addParamsForm: {
        // 添加分类参数的表单
        paramsName: ''
      },
      addParamsRules: {
        // 添加分类参数的校验规则
        paramsName: [
          { required: true, message: '分类参数名不能为空', trigger: 'blur' }
        ]
      },
      editParamsForm: {},
      editParamsRules: {
        paramsName: [
          { required: true, message: '分类参数名不能为空', trigger: 'blur' }
        ]
      },
      editParamsDialogVisable: false // 修改属性对话框的显示与隐藏
    }
  },
  computed: {
    isBtnDisable () {
      // 按钮是否可用
      if (this.selectedCateKey.length !== 3) {
        return true
      }
      return false
    },
    cateId () {
      // 当前选中的三级分类ID
      if (this.selectedCateKey.length === 3) {
        return this.selectedCateKey[2]
      }
      return null
      // return 6
    },
    addParamsDialogString () {
      // 计算动态标题的文本
      if (this.activeName === 'many') {
        return '动态属性'
      }
      return '静态属性'
    }
  },
  created () {
    // 生命周期函数
    this.getCateList() // 调用获取分类数据的方法
  },
  methods: {
    async getCateList () {
      // 获取分类数据的网络请求
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('商品列表失败！')
      }
      this.cateList = res.data
    },
    CateChange () {
      // 级联选择器改变选择的函数
      if (this.selectedCateKey.length !== 3) {
        this.selectedCateKey = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      this.getParamsData()
    },
    handleTabClick () {
      // Tab页签点击事件的函数
      this.getParamsData()
    },
    async getParamsData () {
      // 获取参数列表的网络请求
      if (!this.cateId) return this.$message.error('请选择三级分类！')
      // const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败！')
      }
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false // 控制文本框的显示与隐藏
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    addManyOrOnlyData () {
      // 添加静态属性or动态参数
      this.addParamsDialogVisable = true // 显示对话框
      // 表单校验并发起网络请求
      this.$refs.addParamsRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.paramsName,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        this.addParamsDialogVisable = false // 隐藏显示的对话框
        this.$refs.addParamsRef.resetFields() // 清楚表单校验规则
        this.addParamsForm.paramsName = '' // 清除表单数据
        this.getParamsData() // 调用获取参数列表的方法
      })
    },
    async showEditParamsDialog (attrId) {
      // 编辑动态参数方法
      // 显示编辑动态参数的对话框
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editParamsForm = res.data
      console.log(res)
      this.editParamsDialogVisable = true
    },
    deleteParams (scope) {
      // 删除动态参数方法
      this.deleteParamsData(scope.row.attr_id)
    },
    async deleteParamsData (attrId) {
      // 删除动态参数或静态属性的实现
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error(
          '删除' + this.addParamsDialogString + '失败！'
        )
      } else {
        this.getParamsData()
        this.$message.success('删除' + this.addParamsDialogString + '成功！')
      }
    },
    cancelAddParams () {
      // 取消添加分类参数
      this.addParamsDialogVisable = false // 隐藏显示的对话框
      this.$refs.addParamsRef.resetFields() // 清楚表单校验规则
      this.addParamsForm.paramsName = '' // 清除表单数据
    },
    cancelEditParams () {
      // 取消编辑分类参数
      this.editParamsDialogVisable = false // 隐藏显示的对话框
      this.$refs.editParamsRef.resetFields() // 清楚表单校验规则
      this.editParamsForm.paramsName = '' // 清除表单数据
    },
    sendEditParams () {
      // 发起编辑参数的请求
      // 表单校验并发起请求
      this.$refs.editParamsRef.validate(async (valid) => {
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数属性失败！')
        } // 失败提示
        this.$message.success('参数修改成功！') // 消息提示
        this.getParamsData() // 重新获取当前需要的数据
        this.editParamsDialogVisable = false // 关闭对话框
      })
    },
    showInput (row) { // 点击+Tag，显示Input组件
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveRagInput.$refs.input.focus()
      })
    },
    async saveattr_vals (row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        row.attr_vals.pop()
        return this.$message.error('修改参数失败！')
      }
      this.$message.success('修改参数成功！')
    },
    handleInputConfirm (row) { // 输入框按 enter 或 在blur 的时候触发
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      // 绘制前端数据
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      // 发起参数添加请求
      this.saveattr_vals(row)
    },
    async TaghandleClose (row, i) { // Tag 标签的关闭事件，删除相关的 attr_vals
      row.attr_vals.splice(i, 1)
      // 发起参数添加请求
      this.saveattr_vals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.el-row-params {
  margin-top: 15px;
}
.cascaderclass {
  margin-left: 15px;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>
