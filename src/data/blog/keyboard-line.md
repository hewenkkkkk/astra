---
title: "键盘行"
description: "题目 原题链接 算法思路 思路一（无脑） 思路分析 首先给出每行的所有字母的字符串，包括大小写（我没有使用大小写转换）。然后使"
pubDatetime: 2022-10-24T02:26:39Z
tags:
  - 算法
draft: false
---

# 题目

[原题链接](https://leetcode.cn/problems/keyboard-row/)

![](https://images.xcnv.com/2022/11/02/63614a3c6089d.png)

# 算法思路

## 思路一（无脑）

### 思路分析

首先给出每行的所有字母的字符串，包括大小写（我没有使用大小写转换）。然后使用增强for循环遍历words里面的单词，判断出单词的第一个字母属于哪一行，然后将那个单词转化为字符串数组和那一行进行比较，是则加入list数组，最后转为字符串数组。

### 源码

```java
class Solution {
    public String[] findWords(String[] words) {
    List<String> list = new ArrayList<>();
    String str1 = "qwertyuiopQWERTYUIOP";
    String str2 = "asdfghjklASDFGHJKL";
    String str3 = "zxcvbnmZXCVBNM";
    for (String word : words) {
        boolean flag = true;
        String str = "";
        //.charAt(0)  返回字符串索引处的字符，返回类型为char
        //String.valueOf()  将char转化为String
        String first = String.valueOf(word.charAt(0));
        //.contains()  比较内容是不是一样的，是则返回ture，不是比较地址
        if (str1.contains(first)){
            str = str1;
        }
        if (str2.contains(first)){
            str = str2;
        }
        if (str3.contains(first)){
            str = str3;
        }
        //字符串转换到一个新的字符数组
        char[] chars = word.toCharArray();
        for (char aChar : chars) {
            if (!str.contains(String.valueOf(aChar))) {
                flag = false;
                //跳出for循环
                break;
            }
        }
        if (flag){
            list.add(word);
        }
    }
        //以正确的顺序(从第一个到最后一个元素)返回一个包含此列表中所有元素的数组。这充当了基于数组的API和基于集合的API之间的桥梁。
        //toArray(T[] a)方法接收T类型的数组, 返回一个T类型的数组
    return list.toArray(new String [0]);
    }
}
```

### 时间和空间复杂度

## 思路二（哈希）

### 思路分析

[原题解链接](https://leetcode.cn/problems/keyboard-row/solution/java-100-ha-xi-by-siguo-2/)

java : 有关这种26个字符的，通常有两种可以解决：1、new HashMap<> 2、new int[] 这里为了避免频繁调用map.put()
，这里仅展示数组实现的哈希表，下标就代表字符，数组里的值代表行数
C++ : 1.将所有的字母对应行数赋值 2.遍历所有字符串，判断每个字符串的各个字符是否存在于同一行

### java源码

```java
class Solution {
    public String[] findWords(String[] words) {
        int[] map = {2,3,3,2,1,2,2,2,1,2,2,2,3,3,1,1,1,1,2,1,1,3,1,3,1,3};
        List<String> list = new ArrayList<>();
        for(String word : words){
            if(helper(word, map))
                list.add(word);
        }
        return list.toArray(new String[list.size()]);
    }
    public boolean helper(String string, int[] map){    //判断某个字符是否在同一行
        String str = string.toLowerCase();
        int flag = map[str.charAt(0) - 'a'];        //首个字母所在行号
        for(int i = 1; i < str.length(); i++){
            char ch = str.charAt(i);
            if(map[ch - 'a'] != flag)
                return false;
        }
        return true;
    }
}

作者：siguo
链接：https://leetcode.cn/problems/keyboard-row/solution/java-100-ha-xi-by-siguo-2/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

### C++代码

```java
class Solution {
public:
    vector<string> findWords(vector<string>& words) {

        vector<string> result;   //定义vector<string>变量result保存结果
        string hash_map = "23321222122233111121131313";//定义string 变量hash_map保存所有字母对应的行数
        char current_sign = '0'; //定义char变量current_sign保存每个字符串第一个字符所在行数,零为初始值

        for (string i : words){   //遍历每个字符串

            current_sign = hash_map[(i[0] >= 'a' ? i[0] : i[0] + 32) - 'a'];//取出字符串第一个字符所在的行数

            for (char k : i){     //遍历字符串的各个字符
                if (hash_map[(k >= 'a' ? k : k + 32) - 'a'] == current_sign) {continue;}//判断各个字符是否都在同一行，是则继续循环遍历
                else {current_sign = '0'; break;}//存在字符不在同一行，结束当前字符串遍历，字符串已不合法，current_sign归零
            }

            if (current_sign != '0') {result.push_back(i);}//若各个字符都在同一行，当前字符串合法，保存进结果
            }

            return result;       //返回结果
    }
};

作者：yi-si-cb
链接：https://leetcode.cn/problems/keyboard-row/solution/xie-shi-cbao-li-fa-0mszhi-xing-by-yi-si-ommud/
来源：力扣（LeetCode）
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
```

### 时间和空间复杂度

# 所用API

- .charAt(0) 返回字符串索引处的字符，返回类型为char
- String.valueOf() 将char转化为String
- .contains() 比较内容是不是一样的，是则返回ture，不是比较地址
- list.toArray(new String [0]) 以正确的顺序(从第一个到最后一个元素)返回一个包含此列表中所有元素的数组。这充当了基于数组的API和基于集合的API之间的桥梁。
  toArray(T[] a)方法接收T类型的数组, 返回一个T类型的数组 list.toArray(new String [0]) 详解
