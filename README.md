# alpha-components-ant

基于ant design vue封装的组件

# 当前依赖
1. ant-design-vue v3.2.x
2. vue v3.2.x

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
2. (简陋,待改进)clone这个项目,把需要用到的组件的顶级文件夹复制粘贴到你的项目中即可

# 版本记录
## (当前版本)v0.1.0
发布基于ant-design-vue table组件的alphaTable
相关文档地址:https://confluence.dqalpha.com/x/7IC7Aw

# TODO
1. 目前组件开发工作在web项目模板中进行,需要将开发工作移到该项目重