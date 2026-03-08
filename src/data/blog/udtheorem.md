---
title: "唯一分解定理"
description: "唯一分解定理 又称为算数基本定理，基本内容为： 每个大于1的自然数，要么本身是质数，要么可以写为2个或以上的质数的积，而且这些质因子按大小排列之后，写法仅有一种。（任何一个大于1的正整数够可以表示为素数的积） 对于任何大于1的正整数，都存在"
pubDatetime: 2023-01-09T15:00:35Z
tags:
  - 算法
draft: false
---

## 唯一分解定理

又称为算数基本定理，基本内容为：

每个大于1的自然数，要么本身是质数，要么可以写为2个或以上的质数的积，而且这些质因子按大小排列之后，写法仅有一种。（任何一个大于1的正整数够可以表示为素数的积）

- 对于任何大于1的正整数，都存在一个标准的分解式：N=\(p_{1} ^{a_{1} } \ast p_{2} ^{a_{2} }\ast\dots \ast p_{n} ^{a_{n} }\)
- 设F(n)为代表n的正因子的数量(约数个数)，则F(n)=\((a_{1}+1)\ast (a_{2}+1)\ast (a_{3}+1)\ast \dots \ast (a_{n}+1)\)
- 设G(n)代表n的正因子的和，则G(n)=\((1+p_{1}^{2}+p_{1}^{3}+\dots p_{1}^{a_{1}})\ast (1+p_{2}^{2}+p_{2}^{3}+\dots p_
  {2}^{a_{2}})\ast \dots \ast(1+p_{n}^{2}+p_{n}^{3}+\dots p_{n}^{a_{n}})= {\textstyle \prod_{i=1}^{n}}\frac{p_
  {i}^{ei+1}- 1}{p_{i}-1}\)

## 算法

### 模板

此模板可解决int类型的，数据为long的要单独判断，不应用数组存，而是直接统计

```java
import java.util.Arrays;
import java.util.Scanner;

public class 唯一分解定理模板 {
//此模板有段错误的危险
	public static void main(String[] args) {

		Scanner sc=new Scanner(System.in);
		int n=sc.nextInt();
		int[] ans=new int[n+1];//ans[i]表示素数i，出现了ans[i]次
		for(int i=2;i<n/i;i++) {
			while(n%i==0) {
				n=n/i;
				ans[i]++;
			}
		}
		if(n>1) ans[n]++;
		System.out.println(Arrays.toString(ans));
	}
}
```

![](https://pic.lamper.top/wp/2023/01/20230113041646363.webp)

24=\(2^{3} +3\)

### 唯一分解定理深入理解：

结合上述模板代码食用更香

```java
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		Scanner sc=new Scanner(System.in);
		int n=sc.nextInt();

		for(int i=2;i<=n/i;i++) { //每一个数，有且最多只有一个质因子是>=根号n的
			int sum=0;
			while(n%i==0) {
				sum++;
				n/=i;
			}
			System.out.println(i+"^"+sum);// i就是Pi，sum就是ai
		}
		//进入此if的条件
		//1.n原本就是素数，就算进入for循环中，也不会进入while
	    //2.n在for中的while中只剩下最后一个数（素数），且最多只有一个质因子是>=根号n的
		//  因为这个最后一个数是素数，所以不会进入while中，就要在外面单独加上
		if(n>1) {
			System.out.println("-----");
			System.out.println(n+"^"+1);
		}
	}
}
```

36 2^2 3^27 2^0 ----- 7^124 2^3 ---- 3^1

- 因子：如果a%b==0，就称b是a的因子，例如8的因子有: 1，2，4，8；
- 因数：假如a*b=c（a、b、c都是整数)，那么我们称a和b就是c的因数。

### 质因数个数

题目描述：给定正整数 n, 请问有多少个质数是 n的约数。（求质因子的个数）

输入396，输出3

对于所有评测用例：\(1 \leq n \leq 10^{16}\)

求\(p_{i}\) 此题需要求出有几个素数，就是唯一分解定理模板中数组不为0的有几个 但是此题测试用例超过了int的最大值，只能用long。同时数据量过大，
用数组存放在遍历统计容易超时，出现段错误，所以直接计数

```java
import java.util.ArrayList;
import java.util.Scanner;

public class 质因数个数 {
//唯一分解定理处理
	public static void main(String[] args) {
		// TODO Auto-generated method stub
        Scanner sc = new Scanner(System.in);
		long n=sc.nextLong();
		int count=0;
		for(int i=2;i<n/i;i++) {
			if(n%i==0) {
				while(n%i==0) {
					n=n/i;
				}
				count++;// 直接计数，不用ans数组
			}
		}
		if(n>1) count++;
        System.out.println(count);
        sc.close();
	}
}
```

### 求解质因子

题目描述：给定一个数字N，求出它的所有质因子。N：\(1 \leq n \leq 10^{12}\)

输入：60 输出：2 3 5（用空格隔开）

此题就是求出图1的数组索引

```java
import java.util.*;

public class 求解质因子 {

	public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        long n=sc.nextLong();
        ArrayList<Long> arr=new ArrayList<>();

        for(long i=2;i<=n/i;i++){
            if(n%i==0){
                while(n%i==0){
                    n/=i;
                }
                arr.add(i);
              }
        }
        if (n>1){
            arr.add(n);
        }

        for(Long k:arr) {
        	System.out.print(k+" ");
        }
	}
}
```

### 数数

问题描述：任何一个大于 1 的正整数都能被分解为若干个质数相乘, 比如 28=2×2×7
被分解为了三个质数相乘。请问在区间 [2333333, 23333333] 中有多少个正整数 可以被分解为 12 个质数相乘?

```java
import java.util.Arrays;
import java.util.Scanner;

public class Main {

	   public static void main(String[] args) {
		   int count=0;
		   for(int ik=2333333;ik<=23333333;ik++) {
				if(check(ik)==12) count++;
		   }
		   System.out.println(count);
	    }
	   public static int check(int n) {
		   int m=0;
		   int sum=0;
		   for(int i=2;i<=n/i;i++) {
			   while(n%i==0) {
				   sum++;
				   n/=i;
			   }
		   }
		   if(n>1)sum++;
		   return sum;
	   }
}
```
