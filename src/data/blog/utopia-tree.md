---
title: "乌托邦树"
description: "题目描述 实现一个算法得到乌托邦树的高度。介绍如下： 乌托邦树每年经历 2 个生长周期。每年春天，它的高度都会翻倍。每年夏天，它的高度都会增加 1 米。 对于一颗在春天开始时种下的高 1 米的树，问经过指定周期后，树的高度为多少。 输入描述"
pubDatetime: 2022-12-27T14:46:04Z
tags:
  - 蓝桥杯
draft: false
---

## 题目描述

实现一个算法得到乌托邦树的高度。介绍如下：

乌托邦树每年经历 2 个生长周期。每年春天，它的高度都会翻倍。每年夏天，它的高度都会增加 1 米。

对于一颗在春天开始时种下的高 1 米的树，问经过指定周期后，树的高度为多少。

## 输入描述

输入一个数字 N (0≤N≤1000)，表示指定周期。

## 输出描述

输出一个数字，为经过指定周期后树的高度。

## 思路

先计算出一共需要几个完整的一年，在这一年中分别加倍和+1。

```text
周期如果为偶数，则for循环中即可完美处理，若为奇数，则一定剩下1个周期，结果*2即可
```

## 代码

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scan = new Scanner(System.in);
        //在此输入您的代码...
        int n=scan.nextInt();
        int nums=n/2;  // 经历了几年完整
        int high=1;   //初始高度
        for(int i=0;i<nums;i++){
            high=high*2;   // 周期1
            high+=1;       // 周期2
        }
        int ans=0;
        if(n%2!=0){
            ans=high*2; // 周期如果为偶数，则for循环中即可完美处理，若为奇数，则一定剩下1个周期，结果*2即可
        }else ans=high;

        System.out.printf("%d",ans);
        scan.close();
    }
}
```
