---
title: "设计模式--装饰者模式"
description: "前言 晓子（咖啡店员），来一杯美式，加点威士忌和砂糖。 抱歉啊，猫。收银系统还没有你说的组合，要不换一个😁 🤨这系统不是你哥设计的，还没加上吗？ 对啊，听他说加入了威士忌后，要修改的类太多了，还没来得及改完 行吧，那就只要美式+砂糖吧。"
pubDatetime: 2022-12-27T13:41:08Z
tags: 
    - 设计模式
draft: false
---

# 前言

晓子（咖啡店员），来一杯美式，加点威士忌和砂糖。 抱歉啊，猫。收银系统还没有你说的组合，要不换一个😁 🤨这系统不是你哥设计的，还没加上吗？
对啊，听他说加入了威士忌后，要修改的类太多了，还没来得及改完 行吧，那就只要美式+砂糖吧。系统的代码也发我一份看看吧，我也出出力
好嘞！谢谢啦

# 一、未使用设计模式

终于可以给别人改改代码了🥳 ![在这里插入图片描述](https://pic.lamper.top/wp/2025/08/a2618793c9f440dda81f7a8989b21f2d.jpeg)

猫啊，在干嘛呢？ 给别人改代码呢，这是部分类图，你也看看 （讲诉了事情的经过后），这么好心呢🤭

这个类的设计实在是不太合理，相信设计者现在也发现了弊端。一旦我们需要增加新的配料，或者修改价格，很轻松的就会出现类爆炸的问题，同时造成不小的维护困难。

![在这里插入图片描述](https://pic.lamper.top/wp/2025/08/fc122238934649e2a44087a1ea9dfab0.jpeg) 这是我的改进方案，怎么样？
通过使用继承，在Beverage类中加入了实例变量，超类的cost()方法将会计算所有配料的价格，而子类依然可以覆盖cost()
并扩展超类的功能，加入咖啡的价格。

但是这样也会出现一些问题的吧，我们使用了继承，如果她开发了新的口味，但是有的配料不适合这个口味，可以考虑考虑使用组合。

组合： 继承虽好，可不能过度使用， 利用继承设计子类，所有的子类都会继承到相同的行为，在编译时就已经静态的决定好了。但是组合却在运行时具有和继承相同的效果，动态的进行扩展，组合对象，无需修改现有的代码

# 二、装饰者模式

## 1.定义

装饰者模式（Decorator Pattern）允许向一个现有的对象扩展新的功能，同时不改变其结构。主要解决直接继承下因功能的不断横向扩展导致子类膨胀的问题，无需考虑子类的维护。提供了比继承更有弹性的方案。

## 2.角色

- Component（抽象构件）：它是具体构件和抽象装饰类的共同父类，声明了在具体构件中实现的业务方法，它的引入可以使客户端以一致的方式处理未被装饰的对象以及装饰之后的对象，实现客户端的透明操作。
- ConcreteComponent（具体构件）：它是抽象构件类的子类，用于定义具体的构件对象，实现了在抽象构件中声明的方法，装饰器可以给它增加额外的职责（方法）。
- Decorator（抽象装饰类）：它也是抽象构件类的子类，用于给具体构件增加职责，但是具体职责在其子类中实现。它维护一个指向抽象构件对象的引用，通过该引用可以调用装饰之前构件对象的方法，并通过其子类扩展该方法，以达到装饰的目的。
- ConcreteDecorator（具体装饰类）：它是抽象装饰类的子类，负责向构件添加新的职责。每一个具体装饰类都定义了一些新的行为，它可以调用在抽象装饰类中定义的方法，并可以增加新的方法用以扩充对象的行为。

![在这里插入图片描述](https://pic.lamper.top/wp/2025/08/0e932735a7b8437590b0ccee5ed404e6.png)

Component（抽象构件）：

```java
public abstract class Beverage {
    public abstract double cost();
}
```

ConcreteComponent（具体构件）：

```java
public class Latte extends Beverage {
    @Override
    public double cost() {
        System.out.println("Latte + 5$");
        return 5;
    }
}
```

```java
public class Mocha extends Beverage {
    @Override
    public double cost() {
        System.out.println("Latte + 9$");
        return 9;
    }
}
```

Decorator（抽象装饰类）：

```java
public abstract class MixedIngredients extends Beverage {
    public abstract double cost();
}
```

ConcreteDecorator（具体装饰类）：

```java
public class Sugar extends MixedIngredients {
    private static final int COST = 3;
    public final Beverage beverage;

    public Sugar(Beverage beverage) {
        this.beverage = beverage;
    }
    @Override
    public double cost() {
        System.out.println("add Sugar 3$");
        return COST+beverage.cost();
    }
}
```

```java
public class Whisky extends MixedIngredients {
    private static final int COST = 7;
    public final Beverage beverage;

    public Whisky(Beverage beverage){
        this.beverage=beverage;
    }
    @Override
    public double cost() {
        System.out.println("add Whisky 7$");
        return COST+beverage.cost();
    }
}
```

# 三、应用场景

- 功能扩展 : 为一个类扩展功能 , 为其添加额外的职责
- 动态添加撤销功能 : 为一个对象动态添加额外功能 , 同时这些被添加的功能还能被动态撤销

# 四、优缺点

## 优

- 通过组合而非继承的方式，动态地扩展一个对象的功能，在运行时可以选择不同的装饰器从而实现不同的功能。
- 有效的避免了使用继承的方式扩展对象功能而带来的灵活性差、子类无限制扩张的问题。
- 具体组件类与具体装饰类可以独立变化，用户可以根据需要新增具体组件类跟装饰类，在使用时在对其进行组合，原有代码无须改变，符合"
  开闭原则"。

## 缺

- 设计时加入大量的小类，使他人不容易了解设计方式
- 比继承更加灵活机动的特性，也同时意味着更加多的复杂性
