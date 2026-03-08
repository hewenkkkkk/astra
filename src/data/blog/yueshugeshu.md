---
title: "求约数"
description: "求一个数的约数个数 方法一：简单粗暴，for循环取余计数 public static int f1(int n) { int ans=0; for(int i=1;i<=n;i++) { if(n%i==0){ ans++; } } ret"
pubDatetime: 2023-01-07T09:55:41Z
tags:
  - 蓝桥杯
draft: false
---

## 求一个数的约数个数

方法一：简单粗暴，for循环取余计数

```java
public static int f1(int n) {
     int ans=0;
     for(int i=1;i<=n;i++) {
	if(n%i==0){
	ans++;
	}
     }
     return ans;
}
```

方法二：优化方法一，范围从1-n到1-\(\sqrt{n}\)。

```java
public static int f2(int n) {
    int ans=0;
    for(int i=1;i*i<=n;i++) {
	if(n%i==0){
	  if(i*i==n) {
	    ans++;  // 在36中，会遇到6*6的可能
	  }else ans+=2;  // +2是因为i<根号n，只会判断一半，所以+2
	}
    }
    return ans;
}
```

方法三：使用公式 \(\mathbf{n}=\prod_{i=1}^{k} p_{i}^{a_{i}}=p_{1}^{a_{1}}* p_{2}^{a_{2}} \ldots p_{k}^{a_{k}}\)

如此，约数的个数就为\((a_{1}+1)(a_{2}+1)\dots (a_{k}+1)\)

例如：24= 2*2*2*3=\(2^{3} \cdot 3^{1}\) 那么24的约数个数为(3+1)(1+1)= 8

```java
public static int f3(int n) {
     int ans=1;  // 要连*，初始值为1
     int temp=n;
     for(int i=2;i*i<n;i++) {  //for循环这里不用考虑i=4的情况，可参考视频最后，所有的i都为素数
        int num=0;            //  如 720，180/2=90/2=45/3=15/5=3，不会出现除4的可能，因为一
	    while(temp%i==0){     //  旦4可以除尽，前面/2的时候一定会把它除掉
	       num++;
	       temp/=i;
	    }
	    ans=ans*(num+1);
      }
      if(temp>1)ans=ans*(1+1);  // 如果temp最后是素数，不会进入到上面的for循环，只有1和它自己
      return ans;               // 如68=2*2*17 temp最后就是17，17是素数，只能被1和自己整除，
		                // 就不会进入for循环中，但是也作为68的一个约数，所以要+1
}
```

## 100!的约数个数

如果直接先把100！算出来再求约数个数，就很容易超时。

- 定义prime数组，用来后期统计1-100的约数个数
- 参考方法三，求出每个数的约数个数，放入prime数组

![](https://pic.lamper.top/wp/2023/01/20230113041650667.webp)

```java
public class Main {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		long res=fun(100);
		System.out.println(res);

	}

	public static long fun(int n) {
		int[] prime=new int[n+1];
		long ans=1;
		for(int i=2;i<=n;i++) {  //这个循环是 1*2*3*4...98*99*100
			int temp=i;
			for(int j=2;j*j<=temp;j++) {  // 此循环求一个数的约数个数
				while(temp%j==0) {
					prime[j]++;
					temp/=j;
				}
			}
			if(temp>1)prime[temp]++;
		}
		for(int k=2;k<n;k++) {
			if(prime[k]>=1)ans=ans*(prime[k]+1);
		}
		return ans;
	}

}
```
