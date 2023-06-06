# alpha-components-ant

基于ant design vue封装的组件

# 当前依赖
1. ant-design-vue v3.2.x
2. vue v3.2.x
3. uuid v9.0.0

# 使用方法
1. 确保项目开启了JSX支持   
如果使用的是vite3引入官方插件@vitejs/plugin-vue-jsx(v2.x.x), v2.x.x需要vite3, 注意vite3不支持node12,13,15,因为它们进入了EOL  
如果使用的是vite2, 尝试引入@vitejs/plugin-vue-jsx(v1.x.x),如果不行建议升级到vite3或者引入bable插件(暂时自行解决);官方没有给出版本兼容性, vite2引入v2.x.x的插件会报createFilter不是函数的错误
引入插件后  
````javascript  
import vueJsx from '@vitejs/plugin-vue-jsx';
plugins: [
  vueJsx()
]
````
2. 引入依赖ant-design-vue v3.2.x, vue v3.2.x, uuid v9.0.x
2. (简陋,待改进)clone这个项目,把需要用到的组件的顶级文件夹复制粘贴到你的项目中即可

# 版本记录
## (当前版本)v0.1.0
发布基于ant-design-vue table组件的alphaTable
配置项:

````typescript 
interface TableConfig {
  rowKey: string; //同ant table的rowKey
  fetchTableData: ((queryParams: Object | undefined, additionalParam?: any) => Promise<any>) | undefined | null;
  whereis?:string|string[];//默认接口中的数据存放在'rows'这个键中,如果不是,可以配置该项来指定数据位置, 支持嵌套
  paginationSize?: 'small';//控制分页器的尺寸
  pageSizeOptions?: string[];//控制分页器的每页数量选项, 当该Options的长度大于等于2时,默认取第二个分页数量为默认每页数量. 不配置此项,则默认[10,20,50,100]
  additionalParam?: any;
  queryParams?: { [key: string]: any };
  scrollConfig?: ScrollConfig;
  rowSelection?: {
    preserveSelectedRowKeys?: boolean;
    selectedRowKeys: any[];
    onChange?: (selectedRowKeys: any, selectedRows: any) => any;
    getCheckboxProps?: (record: any) => { disabled: boolean; name: string };
    onSelect?: (record: any, selected?: boolean, selectedRows?, nativeEvent?) => any;
    onSelectAll?: (selected: boolean, selectedRows?, changeRows?) => any;
  };
  before?: (dataSource:any[])=>any[]; //前置钩子,必须要有返回值, 返回值可以影响列表数据
  after?: (dataSource)=>void; //后置钩子, 在完成数据获取之后会将数据当作参数传给后置钩子
}
````




事件:

名称	描述	

类型


afterDataFetched	当完成数据获取之后会触发该事件, 获取的数据会成为参数传递给该事件的监听器	(dataSource)=>void




钩子:

名称	描述	

类型


before	在获取列表数据之后, 在表格渲染数据之前会调用该钩子函数, 将被渲染的数据会成为参数传递给该钩子函数, 该钩子函数需要一个返回值, 返回值会替换原本将要被渲染的数据	(dataSource)=>any[]
after	

当表格数据渲染完成之后会调用该钩子函数, 渲染在表格上的数据会成为参数传递给该钩子函数(功能上和afterDataFetched事件有一点重复了, 先保留)

	(dataSource)=>void




插槽:

名称	描述	类型
默认插槽	个性化单元格	v-slot="{text, column, record, reloadTableData}"




对外暴露:

名称	描述	类型
reloadTableData	刷新表格的当前页面	(void)=>void
dataSource	表格的当前页面的数据	any[]
getSelectedRowKeys	当多选开启时, 该函数返回被选中的数据的key	(void)=>any[]
clearSelectedRowKeys	当多选开启时, 该函数会清空所有被选中的数据	(void)=>void




使用例子:

````html
<template>
	<AlphaTable :table-config="tableConfig" :columns="columns">
		<template v-slot="{text, column, record, reloadTableData}">
          		<template v-if="column.key === 'actions'">
            			<a-button>123</a-button>
          		</template>
          		<template v-else-if="column.key === 'sex'">
            			{{record['sex']===6?'男':'女'}}
          		</template>
        	</template>
	</AlphaTable>
</template>
<script>
import AlphaTable, {type TableConfig} from '@/components/alphaTable/universalTableWithJsx'
import { generateColumns } from '@/components/alphaTable/utils/helper';

const columns = generateColumns([
  ['id','id'],
  ['username','名字'],
  ['sex','性别'],
])

const tableConfig = ref<TableConfig>({
  rowKey:'id',
  fetchTableData:testUserAPI.getUserList,
  queryParams:{
    test:234,
  },
  pageSizeOptions:[],
  // paginationSize:'small',
  scrollConfig:{
    x:true,
    y:800,
    scrollToFirstRowOnChange:false,
  },
  rowSelection:{//这个配置配一个selectedRowKeys就等于时开启了多选
    selectedRowKeys:[],
  },
})

const table = ref();

function reloadTableData(){ //刷新表格
  if(table.value){
    table.value.reloadTableData();
  }
}

function getSelectedKeys(){ //开启多选后,获取被选中的数据的key
  console.log(table.value.getSelectedRowKeys());
}

function clearSelectedRowKeys(){ //开启多选后, 清除所有被选中的数据的key
  table.value.clearSelectedRowKeys()
}

function search(){// 搜索只需要修改tableConfig中queryParams对象中的属性的值即可,会自动触发获取表格数据的方法
  tableConfig.value.queryParams!.test = inputV.value;
}
</script>


````






特性:

自适应父容器高度, 默认开启, 不支持关闭




相比于上一个版本的变更:

关于自适应父容器高度
上一个版本需要在父容器中额外引入Hooks才能实现, 此版本内嵌了该特性, 开箱即用
上一个版本的自适应父容器高度在父容器的尺寸发生变化时会触发表格数据重载, 操作不流畅, 此版本自适应容器高度的过程丝般顺滑
数据多选相关
上一个版本多选支持动态的开启和隐藏, 开启和隐藏时会使表格抖动, 此版本取消了这个特性 (全凭个人喜好的修改)
此版本多选数据配置项格式已被修改,与上一个版本完全不一样,不兼容上一个版本的配置格式
新增分页器相关配置
此版本增加了配置分页器尺寸大小(paginationSize) 和 分页器分页大小选项(pageSizeOptions)的配置项,增加灵活性
新增俩钩子函数
before, 详情看上面的文档
after, 详情看上面的文档
表格渲染完数据的事件名称从gotData修改为afterDataFetched(全凭个人喜好的修改)
增加表格兼容性, 现在可以指定接口中表格的数据存放再哪里(whereis配置项), 默认是存放在'rows'这个键中.

# TODO
1. 目前组件开发工作在web项目模板中进行,需要将开发工作移到该项目重
