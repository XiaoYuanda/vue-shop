<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="getParams.query"
            placeholder="请输入内容"
            class="input-with-select"
            clearable
            @clear="getUserlist"
            @change="getUserlist"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserlist"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogForm">添加用户</el-button>
        </el-col>
      </el-row>

      <el-table :data="userList" stripe style="width: 100%" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              @change="userStatusChange(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>

            <el-tooltip
              class="item"
              effect="dark"
              content="请谨慎删除"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="deleteUser(scope.row.id, scope.row.username)"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoleForUser(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="getParams.pagenum"
        :page-sizes="[2, 5, 10]"
        :page-size="getParams.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%">
      <el-form
        :model="addUserForm"
        label-width="70px"
        ref="addUserRef"
        :rules="addUserRules"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="addUserForm.username"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="addUserForm.password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input
            v-model="addUserForm.mobile"
            placeholder="请输入手机号码"
          ></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="addUserForm.email"
            placeholder="请输入邮箱地址"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelAddUser">取 消</el-button>
        <el-button type="primary" @click="sendAddUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @closed="cancelEditUser"
    >
      <el-form
        :model="editForm"
        label-width="70px"
        ref="editUserRef"
        :rules="editUserRules"
      >
        <el-form-item label="用户名">
          <el-input disabled v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelEditUser">取 消</el-button>
        <el-button type="primary" @click="sendEditUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%"
    >
    <p>当前的用户：{{userInfo.username}}</p>
    <p>当前的角色：{{userInfo.role_name}}</p>
    <p>分配新角色：</p>
      <el-select v-model="selectedRoleId" placeholder="请选择">
        <el-option
          v-for="item in rolesList"
          :key="item.id"
          :label="item.roleName"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendSetRoleForUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    this.getUserlist()
  },
  data: function () {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的邮箱地址'))
    }
    var checkPhone = (rule, value, cb) => {
      const regPhone = /^1(3|4|5|7|8)\d{9}$/
      if (regPhone.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号码'))
    }
    return {
      userList: [],
      getParams: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      deleteDialogVisible: false,
      setRoleDialogVisible: false,
      selectedRoleId: '',
      rolesList: [],
      userInfo: {},
      addUserForm: {
        username: '',
        email: '',
        phone: '',
        password: ''
      },
      addUserRules: {
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          {
            min: 5,
            max: 10,
            message: '长度在 5 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      editUserRules: {
        mobile: [
          { required: true, message: '手机号码不能为空', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ]
      },
      editForm: {
        id: '',
        username: '',
        role_id: '',
        mobile: '',
        email: ''
      }
    }
  },
  methods: {
    // 获取
    async getUserlist () {
      const { data: res } = await this.$http.get('users', {
        params: this.getParams
      })
      this.userList = res.data.users
      this.total = res.data.total
    },

    //
    handleCurrentChange (newPage) {
      this.getParams.pagenum = newPage
      this.getUserlist()
    },

    //
    handleSizeChange (newSize) {
      this.getParams.pagesize = newSize
      this.getParams.pagenum = 1
      this.getUserlist()
    },

    //
    async userStatusChange (userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },

    //
    cancelAddUser () {
      this.addDialogVisible = false
    },

    //
    addDialogForm () {
      this.addUserForm = {
        username: 'xiao',
        email: 'xiao@mail.com',
        mobile: '18666473455',
        password: 'mobileads'
      }
      this.addDialogVisible = true
      this.$refs.addUserRef.clearValidate()
    },

    // 发起添加用户的请求
    sendAddUser () {
      this.$refs.addUserRef.validate(async (valid) => {
        if (!valid) return
        this.addDialogVisible = false
        const { data: res } = await this.$http.post('users', this.addUserForm)
        if (res.meta.status !== 201) {
          return this.$message.error('创建用户失败')
        }
        this.$message.success('创建用户成功')
      })
    },

    // 展示编辑用户的对话框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    // 发起修改用户信息请求
    sendEditUser () {
      this.$refs.editUserRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败')
        }
        this.editDialogVisible = false
        this.$message.success('用户信息修改成功')
        this.getUserlist()
      })
    },
    cancelEditUser () {
      this.$refs.editUserRef.resetFields()
      this.editDialogVisible = false
    },

    // 删除用户
    deleteUser (id, username) {
      this.$confirm(
        '此操作将永久删除用户 ' + username + ' , 是否确定?',
        '删除用户',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$http
            .delete('users/' + id)
            .then((data) => {
              if (data.data.meta.status !== 200) { return this.$message.error('删除用户失败') }
              this.$message.success('删除用户成功')
              this.getUserlist()
            })
            .catch(() => {
              this.$message.error('删除用户失败')
            })
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
    },
    setRoleForUser (user) {
      this.setRoleDialogVisible = true
      this.getRolesList()
      this.userInfo.username = user.username
      this.userInfo.role_name = user.role_name
      this.userInfo.id = user.id
    },
    getRolesList () {
      this.$http
        .get('roles')
        .then((p) => {
          const res = p.data
          this.rolesList = res.data
        })
        .catch((e) => {
          console.log(e)
        })
    },
    async sendSetRoleForUser () {
      console.log(this.selectedRoleId)
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectedRoleId })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('分配角色失败')
      }
      this.$message.success('分配角色成功')
      this.getUserlist()
      console.log(this.userList)
      this.setRoleDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-row {
  margin-bottom: 20px;
}
</style>
