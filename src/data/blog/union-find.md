---
title: "并查集"
description: "概论 定义： 并查集是一种树型的数据结构，用于处理一些不相交集合的合并及查询问题（即所谓的并、查）。比如说，我们可以用并查集来判断一个森林中有几棵树、某个节点是否属于某棵树等。 主要构成： 并查集主要由一个整型数组pre[ ]和两个函数fi"
pubDatetime: 2023-02-08T15:08:07Z
tags:
  - 蓝桥杯
draft: false
---

# 概论

定义： 并查集是一种树型的数据结构，用于处理一些不相交集合的合并及查询问题（即所谓的并、查）。比如说，我们可以用并查集来判断一个森林中有几棵树、某个节点是否属于某棵树等。

主要构成： 并查集主要由一个整型数组pre[ ]和两个函数find( )、join( )构成。 数组 pre[ ] 记录了每个点的前驱节点是谁，函数 find(
x) 用于查找指定节点 x 属于哪个集合，函数 join(x,y) 用于合并两个节点 x 和 y 。

作用： 并查集的主要作用是求连通分支数（如果一个图中所有点都存在可达关系（直接或间接相连），则此图的连通分支数为1；如果此图有两大子图各自全部可达，则此图的连通分支数为2……）

推荐一个介绍Kruskal算法的视频[Kruskal一往无前，并查集鼎力相助（算法童话第一回）](https://www.bilibili.com/video/BV11N4y1F7wv/?spm_id_from=..search-card.all.click&vd_source=c20f4b23e174f6798039a2df37244c01)
[数据结构-并查集](https://blog.csdn.net/the_ZED/article/details/105126583)

# 题目

## 蓝桥幼儿园

### 题目描述

蓝桥幼儿园的学生是如此的天真无邪，以至于对他们来说，朋友的朋友就是自己的朋友。

小明是蓝桥幼儿园的老师，这天他决定为学生们举办一个交友活动，活动规则如下：

小明会用红绳连接两名学生，被连中的两个学生将成为朋友。

小明想让所有学生都互相成为朋友，但是蓝桥幼儿园的学生实在太多了，他无法用肉眼判断某两个学生是否为朋友。于是他起来了作为编程大师的你，请你帮忙写程序判断某两个学生是否为朋友（默认自己和自己也是朋友）。

### 输入描述

第 1 行包含两个正整数N,M，其中 N 表示蓝桥幼儿园的学生数量，学生的编号分别为 1∼N。

之后的第 2∼M+1 行每行输入三个整数，op,x,y：

- 如果 op=1，表示小明用红绳连接了学生 x 和学生 y 。
- 如果 op=2，请你回答小明学生 x 和 学生 y 是否为朋友。

1 ≤ N, M ≤ 5 × 10^5，1 ≤ x, y ≤ N。

### 输出描述

对于每个 op=2 的输入，如果 x 和y 是朋友，则输出一行 YES，否则输出一行 NO。

### 输入输出样例

#### 示例 1

输入

```text
5 5
2 1 2
1 1 3
2 1 3
1 2 3
2 1 2
```

输出

```text
NO
YES
YES
```

### 题解

```java
public class 蓝桥幼儿园 {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc=new Scanner(System.in);
		int n=sc.nextInt();
		int m=sc.nextInt();
		int[] pre=new int[n+1];
		for(int k=1;k<=n;k++) {
			pre[k]=k;
		}
		for(int i=0;i<m;i++) {
			int op=sc.nextInt();
			int x=sc.nextInt();
			int y=sc.nextInt();
			if(op==2) {
				int an=find(pre,x);
				int az=find(pre,y);
				if(an==az) {
					System.out.println("YES");
				}else System.out.println("NO");
			}else {
				join(pre,x,y);
			}

		}

	}

	//查找
	public static int find(int[] pre, int x) {
		while(pre[x]!=x) {
			x=pre[x];
		}
		return x;

//		if(x == pre[x]) return x;
//		else
//		{
//			pre[x] = find(pre,pre[x]);
//			return pre[x];
//		}

	}
	//合并x和y
	public static void join(int[] pre,int x,int y) {
		int fx=find(pre,x),fy=find(pre,y);
		if(fx!=fy) {
			pre[fx]=fy;
		}
		//pre[find(pre,x)] = find(pre,y);
	}

}
```

[0, 3, 3, 3, 4, 5] 数组中索引代表节点值，元素代表节点的父节点 上面数组中，1 2 3的父节点就为3

## 蓝桥侦探

### 题目描述

小明是蓝桥王国的侦探。

这天，他接收到一个任务，任务的名字叫分辨是非，具体如下：

蓝桥皇宫的国宝被人偷了，犯罪嫌疑人锁定在 N 个大臣之中，他们的编号分别为1∼N。

在案发时这 N 个大臣要么在大厅11，要么在大厅22，但具体在哪个大厅他们也不记得了。

审讯完他们之后，小明把他们的提供的信息按顺序记了下来，一共 M 条，形式如下：

- x y，表示大臣 x 提供的信息，信息内容为：案发时他和大臣 y 不在一个大厅。

小明喜欢按顺序读信息，他会根据信息内容尽可能对案发时大臣的位置进行编排。

他推理得出第一个与先前信息产生矛盾的信息提出者就是偷窃者，但推理的过程已经耗费了他全部的脑力，他筋疲力尽的睡了过去。作为他的侦探助手，请你帮助他找出偷窃者！

### 输入描述

第 11 行包含两个正整数N,M，分别表示大臣的数量和口供的数量。

之后的第2∼M+1 行每行输入两个整数 x,y，表示口供的信息。

1≤N,M≤ \(5\times 10^{5}\)，1≤x,y≤N。

### 输出描述

输出仅一行，包含一个正整数，表示偷窃者的编号。

### 输入输出样例

#### 示例 1

输入

```text
4 5
1 2
1 3
2 3
3 4
1 4
```

输出

```text
2
```

### 题解

![](https://pic.lamper.top/wp/2023/02/bingchaji.webp)

我们定义一个数字的黑暗面为 x+n（例如2的黑暗面!2=2+n）

当两个数字的光明面（or黑暗面）同时指向了同一个（如上图2和3的光明面同时指向了1的黑暗面），那么一定说谎了。

```java
public class 蓝桥侦探 {
	static BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
	public static void main(String[] args) throws IOException {
		// TODO Auto-generated method stub
		//Scanner sc=new Scanner(System.in);
		String[] str=in.readLine().split(" ");
		int n=Integer.parseInt(str[0]);
		int m=Integer.parseInt(str[1]);
		int[] pre=new int[2*n+2];
		for(int k=1;k<=2*n+1;k++) {
			pre[k]=k;
		}

		for(int i=0;i<m;i++) {
//			int x=sc.nextInt();
//			int y=sc.nextInt();
			str = in.readLine().split(" ");
			int x=Integer.parseInt(str[0]);
			int y=Integer.parseInt(str[1]);
			if(find(pre,x)!=find(pre,y)) {
				join(pre,x+n,y);
				join(pre,x,y+n);
			}else {
				System.out.print(x);
				return;//return结束整个方法（在这里找到了直接结束main方法）
			}
		}
		//System.out.print(Arrays.toString(pre));

	}
	//查找boss
	public static int find(int[] pre, int x) {
		while(pre[x]!=x) {
			x=pre[x];
		}
		return x;

	}
	//合并x和y
	public static void join(int[] pre,int x,int y) {
		int fx=find(pre,x),fy=find(pre,y);
		if(fx!=fy) {
			pre[fx]=fy;
		}
	}

}
```

此题如果用Scanner来处理输入在最后一个用例会超时，一般做题可以考虑使用BufferedReader

## 蓝桥部队

### 题目描述

小明是蓝桥部队的长官，他的班上有 N 名军人和 11 名军师。

这天，N 名军人在操场上站成一排，起初编号为i 的军人站在第 i 列。

作为长官，小明可以对军人和军师下达 M 条命令，命令有两种类型，格式如下：

- 1 x y，让军人 x 所在列的所有人作为一个整体移动到和军人 y 所在列的后面，使两列合并为一列。
- 2 x y，询问军师军人 x 和军人 y 是否站在同一列。若是，则军师要回应小明 x,y 之间有多少人，否则军师要回应 −1。

你就是小明的军师，请你回答小明的每个询问。

### 输入描述

输入第 11 行包含两个正整数 N,M，分别表示军人的数量和小明的命令条数。

第 2∼M+1 行每行表示一条命令。

2≤N≤\(1\times 10^{5}\)，1≤M≤\(3\times 10^{5}\)，1≤x,y≤N。

### 输出描述

对于每个询问，输出一行表示答案。

### 输入输出样例

#### 示例 1

输入

```text
3 5
2 1 2
1 2 1
2 1 2
1 1 3
2 2 3
```

输出

```text
-1
0
1
```

### 题解

加权标记法

```java
public class 蓝桥部队 {

	static BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
	static PrintWriter out = new PrintWriter(new OutputStreamWriter(System.out));
	static int[] f;//存放此列的排头元素
	static int[] length;//存放此列的军人数量
	static int[] num;//此军人是此列第几个
	public static void main(String[] args) throws IOException{
		String[] s = in.readLine().split(" ");
		int n = Integer.parseInt(s[0]);
		int m = Integer.parseInt(s[1]);
		f = new int[n+1];
		length = new int[n+1];
		num = new int[n+1];
		for(int i=1;i<=n;i++) {
			f[i] = i;
			length[i] = 1;
		}
		for(int i=0;i<m;i++) {
			s = in.readLine().split(" ");
			int op = Integer.parseInt(s[0]);
			int x = Integer.parseInt(s[1]);
			int y = Integer.parseInt(s[2]);
			if(op==1) {//合并x和y所在列 x到y后面
				and(x, y);
			}else {//求x和y间隔
				if(find(x)!=find(y)) {
					System.out.println(-1);
				}else {
					System.out.println(Math.abs(num[x]-num[y])-1);
				}
			}
		}
	}

	static void and(int x,int y) {
		x = find(x);//查找x的排头
		y = find(y);//查找y的排头
		if(x==y)//如果不做此判断，只能过20%，不能把已经在一起的两列合并
			return;
		num[x] = num[x] + length[y];//x在y的后面，所以现在x是这一列的第几个，需要加上y所在列一共有多少个人
		length[y] = length[y] + length[x];//x和y列合并，这一列的总人数更新
		f[x] = y;//x军人这一列的排头是y
	}

	static int find(int x) {
		if(x!=f[x]) {//x不是x所在列的排头
			int root = find(f[x]);//递归找到x所在列的排头是谁
			num[x] = num[x] + num[f[x]];//现在x是这一列的第几个人，就是原来x是这一列的第几个人再加上x的排头是这一列的第几个
			return f[x] = root;
		}
		return f[x];
	}

}
```
