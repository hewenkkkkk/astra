---
title: "Calendar类"
description: "创建 Calendar 是一个抽象类, 无法通过直接实例化得到对象. 因此, Calendar 提供了一个方法 getInstance,来获得一个Calendar对象。 1 Calendar cal = Calendar.getInstan"
pubDatetime: 2022-12-28T08:03:33Z
tags:
  - API
  - 蓝桥杯
draft: false
---

## 创建

Calendar 是一个抽象类, 无法通过直接实例化得到对象. 因此, Calendar 提供了一个方法 getInstance,来获得一个Calendar对象。

```java
1 Calendar cal = Calendar.getInstance();
```

## 基本使用

```java
int year=cal.get(Calendar.YEAR);       //得到当前年
int month=cal.get(Calendar.MONTH)+1;   //得到当前月份
int day=cal.get(Calendar.DAY_OF_MONTH);//得到当前月份的第几天
int hour=cal.get(Calendar.HOUR_OF_DAY);//得到一天的第几小时
int minute=cal.get(Calendar.MINUTE);   //得到分
int second=cal.get(Calendar.SECOND);   //得到秒
```

[label color="red"]此API中MONTH是从0开始，所以需要+1[/label]

[label color="red"]当使用Calender.DAY_OF_WEEK时，默认是从星期天开始，所以需要-1[/label]

```java
cal.set(2022,12,12);  // 设置初始时间，此后得到的时间以此为基础
cal.add(2022,1);      // 加减当前时间
```

## 算法题

### 星期一

整个20世纪（1901年1月1日至2000年12月31日之间），一共有多少个星期一？ (不要告诉我你不知道今天是星期几)

注意：需要提交的只是一个整数，不要填写任何多余的内容或说明文字。

```java
import java.util.Calendar;

public class Main
    public static void main(String[] args) {

        Calendar cal = Calendar.getInstance();
        cal.set(1901,0,1);   // 月份从0开始
        int count = 0;
        while(cal.get(Calendar.YEAR)!=2001){
            if(cal.get(Calendar.DAY_OF_WEEK)==2){  //判断星期1，所以需要==2
               count++;
            }
            cal.add(Calendar.DATE,1);
        }
        System.out.println(count);
        }
}
```

### 天数

输入月份，输出2021年这个月包有多少天。

```java
import java.util.Calendar;
import java.util.Scanner;

public class Main{
    public static void main(String[] args) {
        Scanner sc=new Scanner(System.in);
        Calendar cal = Calendar.getInstance();
        cal.set(2021,sc.nextInt(),1);  // 2021 9 1  输入的，由于不知道一个月具体是有几天
        cal.add(Calendar.DATE,-1);     // 2021 8 31 需要的
        System.out.println(cal.get(Calendar.DAY_OF_MONTH));
        }
}
```

### 跑步

小蓝每周六、周日都晨跑，每月的1、11、21、31日也晨跑。

已知2022年1月1日是周六，请问小蓝整个2022年晨跑多少天？

```java
import java.util.Calendar;

public class vdfg {
    public static void main(String[] args) {
        Calendar cal = Calendar.getInstance();
        cal.set(2022,0,1);  // 2022年1月1日
        int count = 0;
        while (cal.get(Calendar.YEAR)!=2023){
            // 星期天1 星期一2 星期二3 星期三4 星期四5 星期五6 星期六7
            if (cal.get(Calendar.DAY_OF_WEEK)==7||cal.get(Calendar.DAY_OF_WEEK)==1||
                    cal.get(Calendar.DAY_OF_MONTH)==1||cal.get(Calendar.DAY_OF_MONTH)==11||
                    cal.get(Calendar.DAY_OF_MONTH)==21||cal.get(Calendar.DAY_OF_MONTH)==31){
                count++;
            }
            cal.add(Calendar.DATE,1);
        }
        System.out.println(count);
    }
}
```

### 天数(国庆)

请问从1949年10月1日至2022年1月1日经历了多少天？

```java
import java.util.Calendar;

public class Mian{
    public static void main(String[] args) {
        Calendar cal = Calendar.getInstance();
        cal.set(1949,9,1); //1949年10月1日
        int count = 0;
        while (cal.get(Calendar.YEAR)!=2022){
            cal.add(Calendar.DATE,1);
            count++;
        }
        System.out.println(count);
    }
}
```

### 判断闰年

方法一：12月31日是这一年的第366天

方法二：2月的天数为29天（3月1日减1天）

```java
import java.util.Calendar;
import java.util.Scanner;

public class Main{
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        Calendar cal = Calendar.getInstance();
        //方法一
        cal.set(sc.nextInt(),11,31);  // 12月31日
        System.out.println(cal.get(Calendar.DAY_OF_YEAR)==366?"YES":"NO");
        //方法二
        cal.set(sc.nextInt(),2,1);
        cal.add(Calendar.DATE,-1);
        System.out.println(cal.get(Calendar.DAY_OF_MONTH)==29?"YES":"NO");
    }
}
```
