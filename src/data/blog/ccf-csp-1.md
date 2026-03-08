---
title: "CCF-坐标变换(其一)"
description: "202309-1 坐标变换（其一） 对于平面直角坐标系上的坐标"
pubDatetime: 2023-12-03T04:07:16Z
tags:
  - ccf-csp
draft: false
---

## 202309-1 坐标变换（其一）

对于平面直角坐标系上的坐标 (x,y)，小 P 定义了一个包含 n 个操作的序列 \( T= \left ( t_{1} ,t_{2},\dots ,t_{n} \right )
\)。其中每个操作 \( t_{i}\left ( 1< i<n \right ) \)包含两个参数 \( dx_{i} \)和 \( dy_{i} \)，表示将坐标 \( \left ( x,y
\right ) \) 平移至 \( \left ( x+dx_{i},y+dy_{i} \right ) \) 处。

现给定 m个初始坐标，试计算对每个坐标 \( \left ( x_{i},y_{i} \right ) \) \( \left ( 1 \le j\le m \right ) \)依次进行 T中 n
个操作后的最终坐标。

### 输入格式：

从标准输入读入数据。

输入共 m+n+1 行。

输入的第一行包含空格分隔的两个正整数 n 和 m，分别表示操作和初始坐标个数。

接下来 n 行依次输入 n 个操作，其中第 \( i\left ( 1\le i\le n \right ) \)行包含空格分隔的两个整数 \( dx_{i},dy_{i} \) 。

接下来 m 行依次输入 m 个坐标，其中第 \( j\left ( 1\le j\le m \right ) \)行包含空格分隔的两个整数 \( x_{i},y_{i} \) 。

### 输出格式：

输出到标准输出中。

输出共 m 行，其中第 \( j\left ( 1\le j\le m \right ) \)行包含空格分隔的两个整数，表示初始坐标\( \left ( x_{j},y_{j}
\right ) \)经过 n个操作后的位置。

### 样例输入：

```text
3 2
10 10
0 0
10 -20
1 -1
0 0
```

### 样例输出：

```text
21 -11
20 -10
```

### 样例说明：

第一个坐标 (1,−1) 经过三次操作后变为 (21,−11)；第二个坐标 (0,0) 经过三次操作后变为 (20,−10)。

### 题解

```java
package csp;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;

public class 坐标变换1_二维数组 {

	public static void main(String[] args) throws IOException {
        // TODO Auto-generated method stub
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        PrintWriter out = new PrintWriter(new OutputStreamWriter(System.out));
        String[] str = in.readLine().split(" ");
        int n = Integer.parseInt(str[0]);
        int m = Integer.parseInt(str[1]);
        //思路一：二维数组
        int[][] arr = new int[n][2];
        for(int i=0;i<n;i++) {
            str = in.readLine().split(" ");
            arr[i][0] = Integer.parseInt(str[0]);
            arr[i][1] = Integer.parseInt(str[1]);

        }
        for(int j=0;j<m;j++) {
            str = in.readLine().split(" ");
            int x = Integer.parseInt(str[0]);
            int y = Integer.parseInt(str[1]);

            for(int k=0;k<n;k++) {
                x+=arr[k][0];
                y+=arr[k][1];
            }
            System.out.println(x+" "+y);
        }

 	}
}
```

个人思考：一个相对来说较为简单的，典型的坐标平移问题，。它涉及到基本的数组操作和循环控制结构。关键在于这么确定操作的存储(
可以使用Map或者题解中的二维数组)，选择合适的方法可以较为简单的完成题解。

未完待续……
