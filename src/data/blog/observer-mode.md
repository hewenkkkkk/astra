---
title: "设计模式--观察者模式"
description: "前言 甲人A（产品经理）：好啊，你小子，又被我逮到了，很闲是吧😇，需求完成了吗？ two days later… 芯不小：猫啊（自称）,手速不够快啊！又被小甲逮到了。我苦心专研了数十载，开发了一个探A 【主题】，但是还缺一个app，不然你"
pubDatetime: 2022-12-27T13:39:56Z
tags:
  - 设计模式
draft: false
---

# 前言

甲人A（产品经理）：好啊，你小子，又被我逮到了，很闲是吧😇，需求完成了吗？ two days later…

芯不小：猫啊（自称）,手速不够快啊！又被小甲逮到了。我苦心专研了数十载，开发了一个探A 【主题】，但是还缺一个app，不然你来试试😘

需求： 建立一个应用，事实汇报甲人A的方位，并传给芯不小和猫 【观察者】。 同时也是一个可扩展的，我们也要赚money嘛，只要支付一定的￥，我们就可以让更多人享受此服务

# 一、未使用设计模式

本着为人民服务的宗旨🤑，我义不容辞

```java
public class Tana {

    private String position;
    public String getPosition() {
        return position;
    }
    public void positionChanged(){
        String loc=getPosition();
        user1.update(loc);
        user2.update(loc);
    }
}
```

芯不小：既然我们知道在未来会有许多的人订阅这项服务，也会有人取消，未来就不得不在代码中进行修改操作。而这就会大大增加代码的耦合度。不妨再改改😘

松耦合的强大之处 当两个对象之间松耦合，它们之间依然可以交互，但不太清除彼此的细节

# 二、观察者模式

## 1.定义

观察者模式定义了对象之间一对多的关系，这样一来，当一个对象改变状态时，它的所有依赖着都会收到并自动更新

## 2.组成

![在这里插入图片描述](https://pic.lamper.top/wp/2025/08/565d8f5c08c34853a849be200f84c549.jpeg)

- 抽象主题（Subject）：主题是一个接口，该接口规定了具体主题需要实现的方法，比如，添加、删除观察者以及通知观察者更新数据的方法。
- 具体主题（ConcreteSubject）：具体主题是实现主题接口类的一个实例，该实例包含有可以经常发生变化的数据。具体主题需使用一个集合，比如ArrayList，存放观察者的引用，以便数据变化时通知具体观察者。
- 抽象观察者（Observer）：观察者是一个接口，该接口规定了具体观察者用来更新数据的方法。
- 具体观察者（ConcreteObserver）：具体观察者是实现观察者接口类的一个实例。具体观察者包含有可以存放具体主题引用的主题接口变量，以便具体观察者让具体主题将自己的引用添加到具体主题的集合中，使自己成为它的观察者，或让这个具体主题将自己从具体主题的集合中删除，使自己不再是它的观察者。

抽象观察者：

```java
public interface Observer {
    public void update(String position);
}
```

具体观察者：

```java
public class User implements Observer {
    // 订阅者名字
    private String name;
    public User(String name) {
        this.name = name;
    }
    @Override
    public void update(String position) {
        System.out.println(name + "-" + position);
    }

}
```

抽象主题：

```java
public interface Subject {
    /**
     * 增加订阅者
     */
    public void attach(Observer observer);
    /**
     * 删除订阅者
     */
    public void detach(Observer observer);
    /**
     * 通知订阅者更新消息
     */
    public void notify(String position);
}
```

具体主题：

```java
public class SubscriptionSubject implements Subject {
    //储存订阅用户
    private List<Observer> userlist = new ArrayList<>();

    @Override
    public void attach(Observer observer) {
        userlist.add(observer);
    }

    @Override
    public void detach(Observer observer) {
        userlist.remove(observer);
    }

    @Override
    public void notify(String position) {
        for (Observer observer : userlist) {
            observer.update(position);
        }
    }
}
```

```java
public class Client {
    public static void main(String[] args) {
        SubscriptionSubject subscriptionSubject=new SubscriptionSubject();
        //创建用户
        User user1=new User("猫");
        User user2=new User("芯不小");
        //订阅
        subscriptionSubject.attach(user1);
        subscriptionSubject.attach(user2);
        //发出消息
        subscriptionSubject.notify("甲A来了");
    }
}
```

找出变化的，和不变的分离： 在观察者模式中，主题的状态和观察者的数目、类型会改变。使用此模式，我们可以改变依赖于主题状态的对象，而不改变主题。
针对接口编程，而不针对实现编程： 主题和观察者都为接口，观察者利用主题的接口向主题注册，主题使用观察者接口(update)
通知观察者。具有了松耦合。
多用组合，少用继承： 观察者模式利用组合将许多的观察者和主题绑定，而不是通过继承产生的关系。

# 三、应用场景

- 当一个对象的数据更新时需要通知其他对象，但这个对象又不希望和被通知的那些对象形成紧耦合。
- 当一个对象的数据更新时，这个对象需要让其他对象也各自更新自己的数据，但这个对象不知道具体有多少对象需要更新数据。

# 四、优缺点

## 优

- 主题只知道观察者实现了某个接口，我们可以在任何时候增加新的观察者，同时主题的代码不用修改。当我们在其他的地方需要使用主题或观察者时，可以轻松的复用。
- 观察者模式满足开闭原则

## 缺

- 如果一个被观察者对象有很多的直接和间接的观察者的话，将所有的观察者都通知到会花费很多时间。此问题可以使用pull解决
- 如果在观察者和观察目标之间有循环依赖的话，观察目标会触发它们之间进行循环调用，可能导致系统崩溃。
- 观察者模式没有相应的机制让观察者知道所观察的目标对象是怎么发生变化的，而仅仅只是知道观察目标发生了变化。

## 　　

终于完成啦，芯啊，这副业不就🤑，嘿嘿 芯不小：猫啊，格局，格局

某天，甲人A的办公室传来了一个声音 猫，正在摸鱼… XXX，在浏览短视频网站…
