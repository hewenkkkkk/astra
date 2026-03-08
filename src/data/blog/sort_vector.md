---
title: "Java自定义排序"
description: "前言 主要内容为Java的几种自定义排序方法、Vector的API和相结合的算法题。 自定义排序 普通类型数组 Java的Arrays类中提供了几种方法来对普通类型数组排序： Arrays.sort(int[] a)：按照数字顺序排列指定的"
pubDatetime: 2023-01-25T09:06:46Z
tags:
  - java
draft: false
---

## 前言

主要内容为Java的几种自定义排序方法、Vector的API和相结合的算法题。

## 自定义排序

### 普通类型数组

Java的Arrays类中提供了几种方法来对普通类型数组排序：

- Arrays.sort(int[] a)：按照数字顺序排列指定的数组
- sort(int[] a, int fromIndex, int toIndex)：按升序排列数组的指定范围
- Arrays.parallelSort(int[] a) ：按照数字顺序排列指定的数组
- Arrays.parallelSort(int[] a, int fromIndex, int toIndex) ：按照数字顺序排列数组的指定范围

### 包装类型数组

- Arrays.parallelSort(T[] a)：对指定对象升序排列的阵列，根据natural ordering的元素。
- Arrays.parallelSort(T[] a, Comparator <? super T> cmp)：根据指定的比较器引发的顺序对指定的对象数组进行排序。
- Arrays.parallelSort(T[] a, int fromIndex, int toIndex)：对指定对象升序排列的数组的指定范围内，根据natural ordering的元素。
- Arrays.parallelSort(T[] a, int fromIndex, int toIndex, Comparator <? super T> cmp)：根据指定的比较器引发的顺序对指定的对象数组的指定范围进行排序。
- Arrays.sort(T[] a, Comparator <? super T> c)：根据指定的比较器引发的顺序对指定的对象数组进行排序。
- Arrays.sort(T[] a, int fromIndex, int toIndex, Comparator <? super T> c)：根据指定的比较器引发的顺序对指定的对象数组的指定范围进行排序。

方法中含有Comparator <? super T> ，可以使用Comparator 接口实现自定义排序。

```java
package Arrays_API;

import java.util.Arrays;
import java.util.Comparator;

//自定义排数方式
public class Arrays_paixu_test_Student {
    public static void main(String[] args) {
        Integer[] arr = {45,21,8,89,453,7};
        Arrays.sort(arr, new Comparator<Integer>() { //匿名内部类知识
            @Override
            public int compare(Integer o1, Integer o2) {
                return o2-o1;//数组降序排序
            //    return o1-o2;//数组升序排序
            }
        });
        System.out.println(Arrays.toString(arr));

    }
}
```

compare中的o1和o2分别为数组中的左边的元素和数组中右边的元素，不论如何，o1和o2是相邻的。sort方法可以接受任何一个Object[]数组。

关于返回值的规则如下：

- 如果认为第一个元素大于第二个元素返回正整数即可。(不交换o1和o2的的位置)
- 如果认为第一个元素小于第二个元素返回负整数即可。(交换o1和o2的的位置)
- 如果认为第一个元素等于第二个元素返回0即可。(不交换位置，不排序)

### 对象数组的排序

对象数组的排序有两种方法：

- 1.类实现Comparable<T>接口，重写compareTo方法
- 2.实现Comparator接口中的compare(T o1, T o2)方法来实现自定义排序

推荐方法一和方法二的代码联系起来看

#### 方法一

```java
package Collection_Set_treeSet;

public class Apple implements Comparable<Apple>{ //  implements Comparable<Apple>为自定义比较方法一添加
    private String name;
    private String color;
    private double weight;
    private int money;

    public Apple() {
    }

    public Apple(String name, String color, double weight, int money) {
        this.name = name;
        this.color = color;
        this.weight = weight;
        this.money = money;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public double getWeight() {
        return weight;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

    public int getMoney() {
        return money;
    }

    public void setMoney(int money) {
        this.money = money;
    }

    @Override
    public String toString() {
        return "Apple{" +
                "name='" + name + '\'' +
                ", color='" + color + '\'' +
                ", weight=" + weight +
                ", money=" + money +
                '}';
    }

    /**
     * 1.自定义比较方法一
     * @param o
     * @return
     */
    @Override
    public int compareTo(Apple o) {
        return this.money-o.money;//消除重复内容
        //return this.money-o.money >=0 ? 1:-1;   不消除重复内容
       // return Double.compare(this.weight,o.weight);  浮点型用此方法
    }
}
```

#### 方法二

```java
package Collection_Set_treeSet;

import java.util.Comparator;
import java.util.Set;
import java.util.TreeSet;

//了解treeSet的有值排序和自定义排序，字符串排序按照ASCII对应的编码排序(不重复，无索引，可排序)
public class treeSet_paixu {
    public static void main(String[] args) {
        Set<Integer> se = new TreeSet<>();
        se.add(45);
        se.add(12);
        se.add(124);
        se.add(33);
        System.out.println(se);//  [12, 33, 45, 124]

        //自定义排序

        /**
         * 自定义比较方法二
         * 优先使用此方法
         Set<Apple> app = new TreeSet<>(new Comparator<Apple>() {
                   @Override
                   public int compare(Apple o1, Apple o2) {
                       return o1.getWeight()-o2.getWeight();
                   }
         });
         */
        Set<Apple> app = new TreeSet<>();
        app.add(new Apple("红苹果","红色",45.5,54));
        app.add(new Apple("绿苹果","绿色",23.0,89));
        app.add(new Apple("黄苹果","黄色",12.5,4));
        app.add(new Apple("金苹果","金色",49.5,4));
        System.out.println(app);//排序代码见Apple61-70。按照money排序，因为红苹果和金苹果的价格相同，则输出后不会显示金苹果的资料
        //如果两个比较的内容相同且需要都显示出来，可在Apple类中68排变为return this.money-o.money >=0 ? 1:-1;
    }
}
/**
 自定义排序规则
 方式一
 让自定义的类（如学生类）实现Comparable接口重写里面的compareTo方法来定制比较规则。
 方式二
 TreeSet集合有参数构造器，可以设置Comparator接口对应的比较器对象，来定制比较规则。
 两种方式中，关于返回值的规则：
 如果认为第一个元素大于第二个元素返回正整数即可。
 如果认为第一个元素小于第二个元素返回负整数即可。
 如果认为第一个元素等于第二个元素返回0即可，此时Treeset集合只会保留一个元素，认为两者重复。
 如果要保留重复内容,可用三元运算符
 */
```

### 集合排序

- 使用容器类中的sort(Comparator<? super E> c)方法
- Collections.sort(List list)
- Collections.sort(List list, Comparator<? super T>

直接调用静态方法Collections.sort(List<T> list)或者Collections.sort(List<T> list, Comparator<? super T>
对List进行排序。前者是升序排序，后者是自定义排序规则。自定义排序规则如上，不在说明。

## Vector

Java的数组具有很强的功能但它并不总是能满足用户的要求。数组一旦被创建。它的长度就固定了（对于算法题中数据大的可能就不太适用）但是,有时用户在创建数组时并不确切地知道有多少项需要加进去。解决这一问题的办法是创建一个尽可能大的数组，以满足要求,但会造成空间的浪费。Java中java.util包中的Vector类提供了一种与动态数组相似的功能。如果不能确定要保存的对象的数目或是方便获得某个对象的存放位置时，可以选择Vector类。

常用API：

- 添加元素 void addElement(Object obj):在Vector 的最后增加一个元素 void insertElementAt( Object obj,int index):
  在Vector的指定位置插入一个元素
- 删除元素 void removeAllElement():删除 Vector 中的所有元素 void removeElement(Object obj):删除Vector中指定的元素(
  仅删除第一次出现的元素) void removeElement( int index):删除 Vector 中一个指定位置的元素
- 搜索中的元素 Object firstElement():返回这个Vector的第一个元素 Object lastElement():返回这个Vector的最后一个元素 Object
  ElementAt(int index):返回这个Vector中指定位置的元素
- int capacity():返回这个Vector的当前容量
- int size():返回这个Vector的元素个数

## 数位排序

问题描述：

小蓝对一个数的数位之和很感兴趣, 今天他要按照数位之和给数排序。当两个数各个数位之和不同时, 将数位和较小的排在前面,
当数位之和相等时, 将数值小的排在前面。例如, 2022 排在 409 前面, 因为 2022 的数位之和是 6, 小于 409 的数位 之和 13 。又如,
6 排在 2022 前面, 因为它们的数位之和相同, 而 6 小于 2022。给定正整数 n,m, 请问对 1 到 n 采用这种方法排序时, 排在第 m
个的元素是多少?

输入：

输入第一行包含一个正整数 n 。第二行包含一个正整数 m 。

输入13 5，输出3

思路：

因为同时需要比较数位和和这个数的大小，便需要一个方法可以同时获取到这两个值，由于所有的用例数据为10e6，用数组不太合适。hash没试过，应该可以。我这里自定义的一格num类，便可获取到这两个值，同时因为num是一个类，需要对对象排序，就需要用到对象的自定义排序。

```java
import java.util.Collections;
import java.util.Comparator;
import java.util.Scanner;
import java.util.Vector;

public class 数位排序 {
	//static BufferedReader input=new BufferedReader(new InputStreamReader(System.in));
	//static PrintWriter output = new PrintWriter(new OutputStreamWriter(System.out));
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc=new Scanner(System.in);
		int n=sc.nextInt();
		int m=sc.nextInt();
		//定义Vector集合
		Vector<num> nums=new Vector<>();
		for(int i=1;i<=n;i++) {
			//在Vector 的最后增加一个元素。
			nums.addElement(new num(i,num.getSum(i)));
		}

		//自定义排序规则
		Collections.sort(nums,new Comparator<num>() {

			@Override
			public int compare(num o1, num o2) {
				// TODO Auto-generated method stub
				if(o1.ans != o2.ans) {
					return o1.ans-o2.ans>0?1:-1;
				}else return o1.val-o2.val>0?1:-1;
			}

		});
		//返回这个Vector中指定位置的元素
		System.out.println(nums.elementAt(m-1).val);
	}
	//定义num类,便于同时比较值和数位和
	static class num{
		int val;
		int ans;
		public num (int val,int ans) {
			this.val=val;
			this.ans=ans;
		}
		public static int getSum(int val) {
			int ans=0;
			while(val>0) {
				ans+=val%10;
				val/=10;
			}
			return ans;
		}
	}
}
```
