---
title: "算法中的数学思维"
description: "gcd、lcm、进制、运运算"
pubDatetime: 2022-12-31T07:28:53Z
tags:
  - 蓝桥杯
draft: false
---

# gcd&&lcm

## gcd

最大公约数：两个或多个整数共有约数中最大的一个

24：1、2、3、4、6、8、12、24
15：1、3、5、15
24和5的最大公约数为3

gcd(24,15)==>gcd(15,24%15)==>gcd(15,9)

gcd(15,9)==>gcd(9,6)

gcd(9,6)==>gcd(6,3)

gcd(6,3)==>gcd(3,3)

gcd(a,b)==>gcd(b,a%b)

```java
public static int gcd(int a,int b){
     while(b>0){
        int temp = a % b;
        a=b;
        b=temp;
     }
     return a;
}

//改
public static int gcd(int a,int b){
     return b==0?a:gcd(b,a%b);
}
```

## lcm

最小公倍数:公倍数(common multiple)是指在两个或两个以上的自然数中，如果它们有相同的倍数，这些倍数就是它们的公倍数。公倍数中最小的，就称为这些整数的最小公倍数（lowest
common multiple）。

lcm= \(\frac{\left | a*b \right |}{gcd(a,b)}\)

# 进制转换

## 16、8、2=>10

16，8，2进制转10进制以权计算

16的权为16，8的为8，2的为2

十六进制个位数的权为个位数乘以16的0次方，十位数的权为十位的数乘以16的1次方，以此类推

0x54（16）就可以这样换算：5X16+4X1=84 8和2也一样

## 10=>16、8、2

除n取余，逆序排列

- 将 N 作为除数，用十进制整数除以 N，可以得到一个商和余数；
- 保留余数，用商继续除以 N，又得到一个新的商和余数；
- 仍然保留余数，用商继续除以 N，还会得到一个新的商和余数；
- ……
- 如此反复进行，每次都保留余数，用商接着除以 N，直到商为 0 时为止。

![](https://images.xcnv.com/2022/12/29/63ad9e930662c.jpg)

## JavaAPI

```java
String s=Integer.toString(12,8); //10转0-35进制，一默认为十进制，二位要转进制

int a=Integer.parseInt(s,16); //把字符串当做多少进制转换为10进制

BigInteger m=new BigInteger(s,16);//把16进制的字符串封装为大数对象，默认转为10进制
```

## 算法题

### 天空数

一个特殊的数，如果他的十进制、十六进制、十二进制的四位数之和相同，则称为天空数。

输入一个小于100000000正整数，如果输入为0，则输入结束，判断是否为天空数。

分别将输入的数转为十、十六、十二进制，进行数位拆分求和比较

```java
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
		int n=0;
		while(sc.hasNext()) {
			n=sc.nextInt();
			if(getSum(n,10)==getSum(n,16)&&getSum(n,10)==getSum(n,12)) {
				System.out.println("YES");
			}else System.out.println("NO");
		}
	}

    public static int getSum(int n,int r) {
    	int sum=0;
    	while(n>0) {
    		sum+=n%r;
    		n/=r;
    	}
    	return sum;
    }
}
```

### 集合的子集

给定集合如{1,2,3,4}，它的子集有16个，输出所有的子集。

思路：

| 十进制 | 二进制 | 输出 |
|---|---|---|
| 0 | 0000 | {} |
| 1 | 0001 | {4} |
| 2 | 0010 | {3} |
| 3 | 0011 | {3,4} |
| ... | ... | ... |
| 15 | 1111 | {1,2,3,4} |

```java
public class Main {

	public static void main(String[] args) {
		int[] arr= {1,2,3,4};
		for(int i=0;i<15;i++) {
			System.out.print("{");
			int n=i; // 储存要转换为2进制的i
			int index=0; //当前是第几次除2
			while(n>0) {
				if(n%2==1) {
					// 处理末尾空格
					if(n>2) {
						System.out.print(arr[index]+",");
					}else System.out.print(arr[index]);
				}
				index++;
				n=n/2; // 不断缩小为原来的1/2
			}
			System.out.println("}"); //换行
		}
	}
}
```

# 位运算

## 原码 反码 补码

原码：计算机中对数字的二进制定点表示方法，首位为符号位，其余位数表示数字大小。
```
127（十进制）==>01111111（二进制）
01111111就是127的原码
-25（十进制）==>10011001（二进制）
10011001就是-25的原码
```
反码：

- 对于正数来说，原码==反码
- 对于正数来说，反码==原码符号位不变，其余位取反

补码：

- 对于正数来说，补码==原码==反码
  127（十进制）：原码（01111111），反码（01111111），补码（01111111）
- 对于负数来说，补码==反码+1
  -25（十进制）：原码（10011001），反码（11100110），补码（11100111）

原码：1000 0111

反码：1111 1000（原码符号位不变，其余位取反）

补码：1111 1001（反码+1）

## 与and或and异或

| 运算符 | 含义 | 说明 |
|---|---|---|
| `&` | 与（AND） | 两位都为 1 才为 1 |
| `\|` | 或（OR） | 有一位为 1 就为 1 |
| `^` | 异或（XOR） | 两位不同为 1，相同为 0 |

1为true,0为false

| 运算 | 十进制结果 | 二进制计算过程 |
|---|---|---|
| 7 & 3 | 3 | 111 (7) <br> 011 (3) <br> -------- <br> 011 = 3 |
| 7 \| 3 | 7 | 111 (7) <br> 011 (3) <br> -------- <br> 111 = 7 |
| 7 ^ 3 | 4 | 111 (7) <br> 011 (3) <br> -------- <br> 100 = 4 |

![](https://pic.lamper.top/wp//2023/01/20230113041303512.webp)

| 表达式 | 含义 | 结果 | 说明 |
|---|---|---|---|
| `7 << 2` | 左移 2 位 | 28 | 二进制 `111 << 2 = 11100`，右侧补 `0` |
| `7 >> 2` | 右移 2 位 | 1 | 二进制 `111 >> 2 = 1`，左侧补 `0` |
| `-7 << 2` | 左移 2 位 | -28 | 二进制左移，右侧补 `0` |
| `-7 >> 2` | 右移 2 位 | -2 | 算术右移，左侧补 `1`（保持符号位） |

负数右移2位要补1（所有移动全是补码移动）

## 算法题

1.输入一个数n，判断是否为2的x次方

```java
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
		while(sc.hasNext()) {
			int n=sc.nextInt();
			if((n&(n-1))==0) {
				System.out.println("YES");
			}else System.out.println("NO");
		}
	}
}
```

2.第一行输入一个数n，第二行输入2n-1个整数，找出只出现一次的数。

输入：

4
1 2 3 2 1 4 4
2
1 2 1

输出：

3
2

读题，首先想到的是数组计数，但是会出现下标越界的问题。

使用^来解题：x ^ x = 0 、x ^ 0 = x

所以1^2^3^2^1^4^4=1^1^2^2^4^4^3=0^0^0^3=3

```java
import java.util.Scanner;

public class Main {

	public static void main(String[] args) {
		Scanner sc=new Scanner(System.in);
		int ans=0;
		while(sc.hasNext()) {
			int n=sc.nextInt(); //要输入的数的个数
			ans=0; // 一次输入结束后，ans重置
			for(int i=0;i<2*n-1;i++) {
				ans = ans ^ sc.nextInt();
			}
			System.out.println(ans);
		}
	}
}
```
