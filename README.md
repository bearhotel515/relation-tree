# Relation Tree
## 使用
在页面直接引入RelationTree.js
```
<script src="./js/RelationTree.js"></script>
```
## 例子
详见项目中的examples

## 方法

* app(canvas,opts)

### 参数

* canvas 页面的canvas元素

* opts 配置参数

  * width 画布的宽度 
  * height 画布的高度
  * containerStyle 容器样式  {}
    * padding 内边距
  * direction 树的方向 （默认是 ttb  顶到底 top to bottom）
  
    还有：
  
    btt 底到顶 （bottom to top）
  
    ltr 左到右  (left to right)
  
    rtl 右到左  (left to right)
    
  * edge 边的设置   
    * mode 模式  （默认是 line 直线）
    
    还有：  curve 曲线、    polyline 折线
    
  * node  点的设置   
    * textPos 文字位置 默认值 'top' 还可以 'left'、 'right' 、 'bottom'
    * lineWidth 边框宽度 默认值 1
    * font 文字字体 默认值 "15px Arial"
    * fillStyle 颜色 默认值 'green'
    * strokeStyle: 边框颜色 默认值 'green' 
    * textStyle 文字颜色 默认值 '#666' 
    * radius 半径  默认值 10
    
  * artists  自定义点或边
    * edgeArtists 画边的Handle 返回一个数据 ，数组中的对象要有一个draw 方法 
      如果使用该方法将覆盖默认的方法
      ```
      [{
        draw(ctx){
        
        }
      }]
      ```
     * nodeArtists 画点的Handle 返回一个数据 ，数组中的对象要有一个draw 方法 
       如果使用该方法将覆盖默认的方法
       ```
       [{
         draw(ctx){
        
         }
       }]
       ```

      
* load(data)  加载数据    

### 参数

* data 数据

#### 示例

  ```
  {
  name: 'root',
  children: [
     {
      name: 'childA',
      children: []
      }
      ...
   ]
  }
  ```

      
* addEventListener(opts) 添加事件监听

### 参数

* click(sprite)  
* mouseup(sprite)  
* mousedown(sprite)  
* mousemove(sprite)  

#### 示例

  ```
  addEventListener({
    click: (sprite) => {
      console.log('click', sprite)
    },
    mouseup: (sprite) => {
      console.log('mouseup', sprite)
    },
    mousedown: (sprite) => {
      console.log('mousedown', sprite)
    },
    mousemove: (sprite) => {
      //console.log('mousemove',sprite)
    },
  })
  ```

* removeEventListener 移除事件


 
# 感谢

lamberta （ https://github.com/lamberta/html5-animation ）

David Geary (https://www.ibm.com/developerworks/cn/java/j-html5-game5/)

Alan_147 （https://blog.csdn.net/Alan_1550587588/article/details/80384945）

本项目中使用了他们的思路、代码

