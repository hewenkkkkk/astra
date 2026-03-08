---
title: "Maven教程"
description: "前言 网上已经有许多maven的下载和配置教程，本文就不再介绍。 一、Maven是什么？ 使用maven，最直观的感受是方便。当我们学习或者工作的时候，创建一个项目往往需要大量的jar包，但这些jar包的分布十分广泛，收集所需要的往往要耗费"
pubDatetime: 2022-12-27T06:53:40Z
tags:
  - 技术
draft: false
---

# 前言

网上已经有许多maven的下载和配置教程，本文就不再介绍。

# 一、Maven是什么？

使用maven，最直观的感受是方便。当我们学习或者工作的时候，创建一个项目往往需要大量的jar包，但这些jar包的分布十分广泛，收集所需要的往往要耗费大量的时间。 [Maven](https://maven.apache.org/)
是一个项目管理工具，可以对 Java 项目进行构建、依赖管理。我们所使用的jar包可直接由pom.xml文件导入项目使用，极大方便了开发，当然，这只是maven中的一个功能。

# 二、Maven命令

网上查找，如有错误，欢迎指出

## 1.打包命令

| 命令 | 作用说明 |
|-----|-----|
| mvn compile | 编译项目，将 Java 源代码编译为 `.class` 字节码文件 |
| mvn test | 执行单元测试，并生成测试报告 |
| mvn clean | 清理项目，删除之前编译生成的 `.class` 等构建文件 |
| mvn package | 打包项目：Web 工程生成 `war` 包，Java 工程生成 `jar` 包 |
| mvn install | 将项目打成 `jar` 包并安装到本地 Maven 仓库，供其他模块依赖 |
| mvn clean install -Dmaven.test.skip=true | 清理并打包项目，跳过单元测试，同时安装到本地仓库 |
| mvn clean package -Dmaven.test.skip=true | 清理并打包项目，跳过单元测试 |
| mvn clean deploy -Dmaven.test.skip=true | 清理并打包项目，跳过单元测试，并发布到远程仓库 |

## 2.常用命令

| 命令 | 描述 |
|---|---|
| mvn -v | 查看 Maven 版本 |
| mvn validate | 验证工程是否正确，检查所有需要的资源 |
| mvn compile | 自动下载依赖并编译源码，生成 `.class` 字节码文件 |
| mvn test-compile | 编译测试代码 |
| mvn verify | 构建项目并运行所有测试用例，检查集成测试结果是否符合质量标准 |
| mvn integration-test | 在可运行集成测试的环境中执行测试 |
| mvn deploy | 将构建的工件部署到远程仓库 |
| mvn site | 为项目生成站点文档 |
| mvn archetype:create -DgroupId=packageName -DartifactId=projectName | 创建普通 Java Maven 项目 |
| mvn archetype:create -DgroupId=packageName -DartifactId=webappName -DarchetypeArtifactId=maven-archetype-webapp | 创建 Maven Web 项目 |
| mvn clean | 清理 Maven 项目（删除 target 构建目录） |
| mvn eclipse:eclipse | 生成 Eclipse 项目配置 |
| mvn eclipse:clean | 清理 Eclipse 项目配置 |
| mvn idea:idea | 生成 IntelliJ IDEA 项目配置 |
| mvn dependency:tree | 显示 Maven 依赖树 |
| mvn dependency:list | 显示 Maven 依赖列表 |
| mvn dependency:analyze | 分析项目依赖使用情况 |
| mvn dependency:sources | 下载依赖包源码 |
| mvn -Dmaven.test.skip=true | 忽略测试并进行构建 |
| mvn help:system | 显示系统和 Maven 运行环境详细信息 |
| mvn help:active-profiles | 查看当前激活的 profiles |
| mvn help:all-profiles | 查看所有 profiles |
| mvn help:effective-pom | 查看完整有效的 POM 配置 |

## 3.web项目相关命令

| 命令 | 描述 |
|---|---|
| mvn tomcat:run | 启动 Tomcat 服务器并运行当前 Web 项目 |
| mvn jetty:run | 启动 Jetty 服务器并运行当前 Web 项目 |
| mvn tomcat:deploy | 将打包后的应用部署到 Tomcat |
| mvn tomcat:undeploy | 从 Tomcat 中撤销部署的应用 |
| mvn tomcat:start | 启动已经部署的 Web 应用 |
| mvn tomcat:stop | 停止已经部署的 Web 应用 |
| mvn tomcat:redeploy | 重新部署 Web 应用 |
| mvn war:exploded tomcat:exploded | 部署展开的 WAR 文件（非压缩形式） |

# 三、分模块开发与设计

我们的程序按照不同的功能是可以分成不同的模块来开发的，将原始的模块按照功能拆分成若干个子模块，方便模块的相互调用，接口共享就是分模块开发。

Maven中，将子模块进行打包（jar包），然后导入主模块的pom.xml文件中即可实现多模块开发。

# 四、依赖管理

Maven 一个核心的特性就是依赖管理。当我们处理多模块的项目（包含成百上千个模块或者子项目），模块间的依赖关系就变得非常复杂，管理也变得很困难。针对此种情形，Maven
提供了一种高度控制的方法。

## 1.依赖传递

Maven 的依赖传递机制是指：不管 Maven 项目存在多少间接依赖，POM 中都只需要定义其直接依赖，不必定义任何间接依赖，Maven
会自动读取当前项目各个直接依赖的 POM，将那些必要的间接依赖以传递性依赖的形式引入到当前项目中。此机制能够帮助用户一定程度上简化
POM 的配置。

直接依赖： 在当前项目中通过依赖配置建立的依赖关系
间接依赖： 被依赖的资源依赖别的资源，当前项目间接依赖其它资源

对于图1主模块来说，空间1是直接依赖，空间2-5是间接依赖

## 2.依赖冲突

当我们导入一个依赖时，可能会出现一个问题。依赖1的间接依赖5版本高于子模块1中的依赖5，那么对于主模块来说，他会使用哪一个呢？这就是依赖冲突。

对于上述问题，maven给出3种方法：路径优先、声明优先和特殊优先

1.特殊优先：同级（不同空间）配置了相同资源的不同版本，后配置的优先级高于先配置的 优先执行2.12.6.1的版本

```xml

<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.9.0</version>
</dependency>

<dependency>
<groupId>com.fasterxml.jackson.core</groupId>
<artifactId>jackson-databind</artifactId>
<version>2.12.6.1</version>
</dependency>
```

2.路径优先：一个项目中出现相同资源时，层级越高，优先级越低 图1中空间2的依赖5优先级高于空间4中的依赖5
3.声明优先：当在同一空间时，配置靠前的优先配置靠后的

## 3.可选依赖

如图1，当主模块想要排除间接依赖7，我们可以使用 < optional> 来排除依赖7，默认为false，当要排除时设为true。隐藏后的资源不具有依赖的传递性

```xml

<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.6</version>
    <optional>true</optional>
</dependency>
```

## 4.排除依赖

当我们在开发项目时，往往要用到他人开发的jar包，但是他人jar包中的一些依赖可能会对我们的项目有一定的影响（依赖冲突），但我们不可能在它的依赖中写入可选依赖，这时我们就可以使用排除依赖来排除不需要的依赖。
必须在引入的依赖中排除它的依赖，以下仅为举例

```xml

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.28</version>
    <exclusions>
        <!-- 设置排除 -->
        <exclusion>
            <!--设置具体排除-->
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.11.4</version>
        </exclusion>
    </exclusions>
</dependency>
```

# 五、聚合与继承

## 1.聚合

在我们开发中会产生很多的模块，如果在构建项目时，一个一个模块的构建会非常消耗我们都时间和精力。maven提出的聚合功能就很好的帮助我们解决了这个问题，使用它来解决批量模块同步构建。

使用聚合时，我们首先要创建一个聚合模块来管理其它的模块，里面只有pom.xml文件,并无其它实质性的内容。

在聚合模块中，我们需要将它的打包方式设置为pom，这是聚合模块与其它模块的最大区别。 使用 < modules> 将要聚和的模块引入即可

```xml

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.hewen</groupId>
    <artifactId>maven_00</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>maven_00 Maven Webapp</name>
    <url>http://maven.apache.org</url>
    <modules>
        <module>../maven_01</module>
        <module>../maven_02_domain</module>
        <module>../maven_03_dao</module>
    </modules>
</project>
```

## 2.继承

我们提出3个问题？

1.图3中的三个模块中都有依赖1-2，有没有一种方法可以一次性导入呢？
2.只有模块1-2有依赖3，可不可以简化导入呢？
3.如果我需要改变模块3中的依赖2版本，同时模块1-2的也需要改，可不可以一次性操作呢？

和Java的继承类似，maven也提出了继承来解决以上的三个问题。 当一个项目包含多个模块时，可以在该项目中再创建一个父模块，并在其
pom.xml 中声明依赖，它的子模块的 pom.xml 可通过继承父模块的 pom.xml 来获得对相关依赖的声明。对于父模块而言，其目的是为了消除子模块
pom.xml 中的重复配置，其中不包含有任何实际代码，因此父模块 pom.xml 的打包类型（packaging）也必须是 pom。

父模块：

```xml

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.hewen</groupId>
    <artifactId>maven_00</artifactId>
    <packaging>pom</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>maven_00 Maven Webapp</name>
    <url>http://maven.apache.org</url>
    <modules>
        <module>../../maven_01/maven_01</module>
        <module>../../maven_02_domain/maven_02_domain</module>
        <module>../../maven_03_dao/maven_03_dao</module>
    </modules>
    <dependencies>

        <!--引入domain包-->
        <dependency>
            <groupId>org.hewen</groupId>
            <artifactId>maven_02_domain</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>

        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>

    </dependencies>
    <build>
        <finalName>maven_00</finalName>
    </build>
</project>
```

子模块：

```xml

<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.hewen</groupId>
    <artifactId>maven_01</artifactId>
    <packaging>war</packaging>
    <version>1.0-SNAPSHOT</version>
    <name>maven_01 Maven Webapp</name>
    <url>http://maven.apache.org</url>

    <!--继承-->
    <parent>
        <groupId>org.hewen</groupId>
        <artifactId>maven_00</artifactId>
        <version>1.0-SNAPSHOT</version>
        <!--relativePath不是必须需要-->
        <relativePath>../maven_00/pom.xml</relativePath>
    </parent>

    <dependencies>
    </dependencies>

    <build>
        <finalName>maven_01</finalName>
    </build>
</project>
```

现在我们来看第二个问题，假设在子模块中不需要主模块中的org.springframework，我们就可以使用 < dependencyMangement> 来实现。

主模块：

```xml

<dependencyMangement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
            <version>5.2.10.RELEASE</version>
        </dependency>
        <dependencies>
            <dependencyMangement>
```

子模块： 子模块中不需要再写版本号

```xml

<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
</dependency>
```

# 六、属性

一个项目里面的依赖多的可以达到50个以上，当我们需要更改一些依赖的版本时就会变得麻烦，需要不停的上下翻找。而属性可以帮我们更方便的管理依赖版本。

```xml

<dependencies>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-webmvc</artifactId>
        <version>${spring-webmvc}</version>
    </dependency>
</dependencies>

<properties>
<spring-webmvc>5.2.10.RELEASE</spring-webmvc>
</properties>
```

属性引用格式内置属性${属性名}Java系统属性${系统属性分类.系统属性名}环境变量属性${env.环境变量属性名}Setting属性$
{setting.属性名}自定义属性（上文）${属性名}

# 七、版本管理（了解）

工程版本发布版本SNAPSHOT（测试版）alpha版RELEASE（稳定版）beta版------------------------------纯数字版

# 八、多环境开发与应用

## 1.多环境

在项目开发的过程中，经常需要面对不同的运行环境（开发环境、测试环境、生产环境、内网环境、外网环境等等），在不同的环境中，相关的配置一般不一样，比如数据源配置、日志文件配置、以及一些软件运行过程中的基本配置。每次在不同环境部署程序时，都需要修改相应的配置文件。这么做存在一个比较大的问题：每次修改配置非常麻烦，而且配置错误会产生不可预估的影响。

在属性一节中，pom还可以加载配置文件的属性，这样就可以做到依据需求改变不同的环境。

这里以连接数据库为例： jdbc.properties配置文件

```yml
jdbc.driver=${driver}
jdbc.url=${url}
jdbc.username=${username}
jdbc.password=${password}
```

主模块配置多环境： 我们也可以不使用 < activation> 来配置默认启动环境，只需要输入命令 mvn install -P 环境id即可。

```xml

<profiles>
    <!--开发环境-->
    <profile>
        <id>dep</id>
        <properties>
            <driver>com.mysql.cj.jdbc.Driver</driver>
            <url>jdbc:mysql://localhost:3306/dep</url>
            <username>root</username>
            <password>147258</password>
        </properties>
        <!--默认启动环境-->
        <activation>
            <activeByDefault>true</activeByDefault>
        </activation>
    </profile>
    <!--测试环境-->
    <profile>
        <id>test</id>
        <properties>
            <driver>com.mysql.cj.jdbc.Driver</driver>
            <url>jdbc:mysql://157.55.39.151:3306/test</url>
            <username>root</username>
            <password>154564</password>
        </properties>
    </profile>
    <!--上线环境-->
    <profile>
        <id>online</id>
        <properties>
            <driver>com.mysql.cj.jdbc.Driver</driver>
            <url>jdbc:mysql://157.56.39.161:3306/online</url>
            <username>root</username>
            <password>154564</password>
        </properties>
    </profile>
</profiles>
```

## 2.跳过测试

Maven 构建（build）生命周期是由以下几个阶段的序列组成的：

阶段处理描述验证 validate验证项目验证项目是否正确且所有必须信息是可用的编译 compile执行编译源代码编译在此阶段完成测试
Test测试使用适当的单元测试框架（例如JUnit）运行测试包装 package打包创建jar/war包如在 pom.xml 中定义提及的包检查
verify检查对集成测试的结果进行检查，以保证质量达标安装 install安装安装打包的项目到本地仓库，以供其他项目使用部署
deploy部署拷贝最终的工程包到远程仓库中，以共享给其他开发人员和工程

在maven构建的时候，可能有些功能我们无法进行测试，此时就无法完成整个项目的打包部署。跳过测试则可以帮我们跳过一些暂时不需要的测试，使用mvn
指令 -D skipTests即可。

```xml

<piugin>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>2.22.1</version>
    <configuration>
        <skipTests>true</skipTests>
        <!--包含-->
        <includes>
            <include>目录</include>
        </includes>
        <!--排除-->
        <excludes>
            <exclude>目录</exclude>
        </excludes>
    </configuration>
</piugin>
```
