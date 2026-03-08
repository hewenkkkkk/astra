---
title: "注解和反射"
description: "元注解 负责注解其它注解 @Target：用于描述注解的使用范围（可以用在哪个地方） @Retention：描述注解的生命周期（SOURCE<CLASS<RUNTIME） @Document：说明该注解将被包含再javadoc中 @Inhe"
pubDatetime: 2024-03-21T14:52:00Z
tags:
   - java
draft: false
---

## 元注解

负责注解其它注解
@Target：用于描述注解的使用范围（可以用在哪个地方）
@Retention：描述注解的生命周期（SOURCE<CLASS<RUNTIME）
@Document：说明该注解将被包含再javadoc中
@Inheriteg：说明该子类可以继承父类中的该注解

## 反射

反射可以让Java代码动起来（动态的去创建Java对象），就好比写游戏外挂，游戏已经在运行了，我们要如何修改数据呢，就需要动态的去创建对象，也就是一个钩子，然后去修改里面的数据。

Java创建对象的方式：new、clone克隆、反射、反序列化

借助于反射API取得任何类的内部信息还可以直接操作对象的内部属性及方法。 加载完类后，在堆内存中就产生了一个Class类型的对象，包含了完整的类的结构信息，这就是反射。

```java
Class obj = Class.forName("java.lang.String")
```

![](https://pic.lamper.top/wp/2024/05/Snipaste_2024-05-09_18-55-31.webp)

反射主要API java.lang.reflect.Method：类的方法 java.lang.reflect.Field：类的成员变量 java.lang.reflect.Constructor：类的构造器

通过打印通过反射创建的类的hashcode就可以发现所有的类都是一样的。

![](https://pic.lamper.top/wp/2024/05/image.webp)

获取Class类实例的方法

```
1.如果已经知道具体的类，通过类的class属性获取，该方法最为安全可靠。
Class obj = Persion.class;

2.已经知道某个类的示例，调用getClass()方法获取
Class obj = persion.getClass()

3.知道类的全类名，可以通过forName()获取
Class obj = Class.forName("java.lang.String")
```

## 类加载分析

### 1. 加载

- 读取：这一阶段，类加载器从文件系统、网络或其他源读取.class文件的二进制数据。
- 解析：将这些二进制数据转换成方法区内的运行时数据结构。在这个过程中，Java虚拟机将生成一个代表这个类的java.lang.Class对象。

### 2. 连接

将Java类的二进制代码合并到JVM的运行状态中

- 验证：确保被加载的类的正确性，验证字节码是否符合Java语言的规范，以及是否不会危害虚拟机的安全。
- 准备：为类的静态变量分配内存，并将其初始化为默认值，这个阶段不包括Java代码中定义的初始化值。
- 解析：虚拟机将所有的符号引用转换成直接引用，这些引用来自常量池，包括类、接口、字段和方法的引用(
  比如创建的类是引用类型，就会去找它的真实类型)

### 3. 初始化

- 执行类构造器：这一阶段，类的静态变量将被初始化为声明时指定的值，静态代码块将被执行。这个过程是按照程序代码中的顺序来执行的。（合并static和代码块，构造类信息）

先静态代码块，然后默认代码块，最后构造方法

类加载：在方法区中先生成A类的一些数据（静态变量、常量池、代码等），然后在堆中就会生成这些类对应的Class对象（此时这个对象中就包含所有的信息）

连接：栈中执行main()方法 ，给变量设置一个默认的值（就比如定义了一个int的变量，那么它的默认值就为0），然后在堆中new了一个A类的对象，和之前生成的Class对象不同 。

![](https://pic.lamper.top/wp/2024/05/jvmstatic.webp)

初始化：随后通过A类的Class对象来给new的A的栈中的变量显示的赋值

![](https://pic.lamper.top/wp/2024/05/Snipaste_2024-05-09_20-49-32.webp)

## 类加载器

### 1. 启动类加载器

- 功能：这是虚拟机自带的类加载器，负责加载Java的核心类库，如rt.jar、charsets.jar等，这些库位于JRE的lib目录下。
- 特点：由于启动类加载器不是Java实现的，它通常是用本地代码（如C/C++）实现的，因此在Java应用中不可见。

### 2. 扩展类加载器

- 功能：加载Java的扩展库，这些库通常位于JRE的lib/ext目录或者由系统属性java.ext.dirs指定的其他目录。
- 特点：它由Java实现，继承自ClassLoader类。

### 3. 应用程序类加载器

- 功能：这是类层次结构中的默认类加载器，用于加载用户路径（classpath）上的类库。
- 特点：如果没有自定义类加载器，那么应用程序中的类都由它来加载。

### 4.自定义类加载器

- 创建方式：可以通过继承java.lang.ClassLoader类的方式来创建自己的类加载器。
- 用途：用于特定的需要，如动态地加载网络上的类，解密加密的类文件，或者从非标准源加载类（如数据库、文件等）。

```java
public static void main(String[] args) throws ClassNotFoundException {
        // 1.通过反射获取类的Class对象
        final ClassLoader systemClassLoader = ClassLoader.getSystemClassLoader();
        System.out.println(systemClassLoader);

        // 2.获取系统类加载器的父类加载器-->扩展类加载器
        final ClassLoader parent = systemClassLoader.getParent();
        System.out.println(parent);

        // 3.获取扩展类加载器的父类加载器-->根加载器(C/C++)
        final ClassLoader parent1 = parent.getParent();
        System.out.println(parent1);
    }

jdk.internal.loader.ClassLoaders$AppClassLoader@63947c6b
jdk.internal.loader.ClassLoaders$PlatformClassLoader@27bc2616
null
```

## Class获取类的信息

反射通常是针对类进行的(而不是实例)，因为sourceFields是一个实例对象，所以要先通过getClass()获取类对象

```java
public static <S, T> T copyClass(S sourceClass, Class<T> targetClass)  {
        try {
            if (sourceClass==null){
                throw new RuntimeException();
            }
            if (targetClass==null){
                throw new RuntimeException();
            }

            T target = targetClass.getDeclaredConstructor().newInstance();
            // 反射通常是针对类进行的(而不是实例)，因为sourceFields是一个实例对象，所以要先通过getClass()获取类对象
            Field[] sourceFields = sourceClass.getClass().getDeclaredFields();
            Field[] targetFields = targetClass.getDeclaredFields();

            //外层遍历获取原对象的值
            for (Field sourceField : sourceFields) {
                sourceField.setAccessible(true);
                Object value = sourceField.get(sourceClass);

                for (Field targetField : targetFields) {
                    if (targetField.getName().equals(sourceField.getName())
                            && targetField.getType().isAssignableFrom(sourceField.getType())) {
                        targetField.setAccessible(true);
                        targetField.set(target, value);
                        break;
                    }
                }
            }
            return target;
        }catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }
```

| 方法类型 | 方法名 | 返回类型 | 用途描述 |
|---|---|---|---|
| 类名称和修饰符 | getName() | String | 获取类的完全限定名 |
| 类名称和修饰符 | getSimpleName() | String | 获取类的简单名称（不包含包名） |
| 类名称和修饰符 | getModifiers() | int | 获取类的修饰符（如 public、private 等） |
| 构造函数 | getConstructor(Class<?>... parameterTypes) | Constructor<T> | 获取指定参数的公共构造函数 |
| 构造函数 | getConstructors() | Constructor<?>[] | 获取所有公共构造函数 |
| 构造函数 | getDeclaredConstructor(Class<?>... parameterTypes) | Constructor<T> | 获取指定构造函数，包括私有的 |
| 构造函数 | getDeclaredConstructors() | Constructor<?>[] | 获取所有构造函数，包括私有的 |
| 方法 | getMethod(String name, Class<?>... parameterTypes) | Method | 获取指定的公共方法 |
| 方法 | getMethods() | Method[] | 获取类及其父类的所有公共方法 |
| 方法 | getDeclaredMethod(String name, Class<?>... parameterTypes) | Method | 获取指定的方法，包括私有方法 |
| 方法 | getDeclaredMethods() | Method[] | 获取类中声明的所有方法，包括私有 |
| 字段 | getField(String name) | Field | 获取指定的公共字段 |
| 字段 | getFields() | Field[] | 获取类及其父类的所有公共字段 |
| 字段 | getDeclaredField(String name) | Field | 获取类中声明的指定字段，包括私有 |
| 字段 | getDeclaredFields() | Field[] | 获取类中声明的所有字段，包括私有 |
| 父类和接口 | getSuperclass() | Class<?> | 获取类的父类 |
| 父类和接口 | getInterfaces() | Class<?>[] | 获取类实现的所有接口 |
| 实例创建 | newInstance() | Object | 创建类实例（已废弃，推荐使用 `getDeclaredConstructor().newInstance()`） |
| 类型检查 | isInterface() | boolean | 判断 Class 对象是否表示接口 |
| 类型检查 | isArray() | boolean | 判断类是否为数组类型 |
| 类型检查 | isPrimitive() | boolean | 判断类是否为基本数据类型 |
