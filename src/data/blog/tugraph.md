---
title: "Tugraph"
description: "Tugraph是一款阿里开发高性能、高可靠性和高可扩展性的分布式图数据库，适用于各种复杂的图数据应用场景。它提供了丰富的数据处理和查询功能，可以帮助用户快速高效地处理海量图数据。 主要功能包括： 标签属性图模型 支持多图 完善的AC"
pubDatetime: 2023-02-22T09:01:27Z
tags:
  - 知识图谱
draft: false
---

## 简介：

Tugraph是一款阿里开发高性能、高可靠性和高可扩展性的分布式图数据库，适用于各种复杂的图数据应用场景。它提供了丰富的数据处理和查询功能，可以帮助用户快速高效地处理海量图数据。

主要功能包括：

- 标签属性图模型
- 支持多图
- 完善的ACID事务处理
- 内置 25+ 图分析算法
- 基于web客户端的图可视化工具
- 支持RESTful API和RPC
- OpenCypher图查询语言
- 基于 C++/Python的存储过程
- 适用于高效图算法开发的Traversal API

性能及可扩展性特征包括：

- TB级大容量
- 千万顶点/秒的高吞吐率
- 高可用性支持
- 高性能批量导入
- 在线/离线备份

[TuGraph-DB \(github.com\)](https://github.com/TuGraph-family)
[TuGraph 高性能图数据库 \(antgroup.com\)](https://tugraph.antgroup.com/)

## 快速上手：

### 建模：

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_16-37-07.webp)

点击左侧菜单的"建模"菜单，然后参考建模导引完成创建；

在建模页面中，左侧蓝色部分表示点的模型，右侧绿色部分表示边的模型。一级子节点是模型的名称，二级子节点是模型的属性，三级子节点是这个属性的信息：是否可空，和他的数据类型。右上角可以搜索模型的名称或者属性，页面中会用红色高亮显示。创建顶点模型，点击添加，选择对应的数据类型，是否可空默认是否，设置主键，创建成功之后页面中就会显示出来。创建边的模型，不需要设置主键，也可以不添加任何属性。创建好模型之后，我们就可以导入数据了。

### 导入数据：

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_16-37-50.webp)

点击左侧菜单的"导入"菜单，参考导引完成数据导入；您可以通过编写Cypher语句向数据库中写数据。

在导入页面，我们可以上传csv文件在线导入数据，点击选择文件从电脑中选择csv
文件，之后我们先要进行映射数据的操作，首先选择对应的模型（选择movie），点击映射数据，上面的表格是数据模型的属性、数据类型、是否选填，下面的表格是
csv文件的前十行数据，我们需要把数据和模型进行连线匹配。点击数据的id列，再点击模型的id列，就可以匹配成功，接下来继续匹配，没有连
线的数据不会被上传。如果csv文件有表头，还需要选择跳过行，，跳过的行的数据不会被导入。这里我们选择跳过两行。映射数据完毕点击确定，我们可以看到映射状
态变成完成的状态。点击导入，导入数据成功。接下来我们映射person的数据，选择person的模型，点击映射数据，连线匹配，如
果连线错误，可以选中这条线，点击删除线，重新连接，点击导入，导入成功。接下来我们映射边的数据，边的数据需要选择起点的挂载和终点的挂载，起点的挂
载我们选择person的id，选择完之后表格会对应生成，终点的挂载选择movie的id，之后连接数据，点击确定，点击导入，导入数据成功。

导入数据时注意文档中不能有隐藏字符，否则导入不成功，还会造成网页无法访问

### 查询数据

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_16-36-50.webp)

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_17-07-20.webp)路径查询

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_17-07-00.webp)节点查询

您可以点击左侧菜单的"查询"，参考查询中的导引熟悉Cypher查询过程，在交互式界面对查询结果自由操作。

查询的方式除了语句查询，还支持节点查询和路径查询，如上图所示。

在查询页面，我们输入一个Cypher语句

MATCH (n:person{name:'Hugo Weaving'}) RETURN n

查询Hugo
Weaving这个演员，他就在页面中呈现出来了。把鼠标放在这个顶点上，就可以看到这个顶点相关的属性，比如他的出生日期，在图中的顶点id，名字等等。双击顶点，这个顶点会被展开，显示出与他有关联的其他顶点，我们可以看到这些顶点是他参演过的电影。可以通过拖拽和鼠标滚轮来调整画面的位置。我们双击一个电影，出现了更多不同颜色的顶点，不同的颜色代表不同的顶点类型，不同顶点之间的边代表顶点之间的关系，TuGraph支持多种多样的关系类型，比如扮演的关系，评分的关系，影片类型的关系等等。TuGraph还支持颜色修改，图标大小，等个性化功能，只需要选中某个模型，在这里选择即可。在右上角菜单栏还有更多的功能，如合并或展开多条边，数据的编辑，固定布局，悬停高亮，导出，刷新，全屏等功能。除了可视化的查看方式之外，TuGraph的返回数据还支持表格和文本的查看方式。我们还可以收藏这个Cypher语句，收藏成功之后可以在收藏夹中看到这个语句，方便下次调用。

### 创建插件

在插件页面，用户可以导入编写好的存储过程，在线执行并查看执行结果。我们来添加一个插件，点击添加插件，填写插件名称，选择插件类型，CPP或者Python，填写插件描述，选择是否只读，导入插件文件，点击创建，创建成功之后，点击这个插件，我们可以看到他的名称、描述、是否只读。在列表上边我们可以输入参数，超时长度，选择调用方式，点击执行，下面可以看到执行的结果。
点击卸载可以卸载掉这个插件。在列表上方可以输入插件的名称，查找对应的插件。

## 查询：

![](https://pic.lamper.top/wp/2023/02/Snipaste_2023-02-23_16-48-59.webp)

上图中红框从左到右依次为：

增加节点、增加边、条件过滤、可视化分析（目前仅支持最短路径）、布局选择、合并边、合并or散开节点、固定、hover、导出。

### 节点调整：

点击节点person，可以调整节点的颜色和大小

在Properties选择中，可以选择此节点的属性来选择显示的节点名称。

SystemProperties可以选择显示节点的id还是Properties。

## TuGraph-OGM

TuGraph-OGM(Object Graph Mapping)为面向 TuGraph 的图对象映射工具，支持将 JAVA 对象（POJO）映射到 TuGraph 中，JAVA
中的类映射为图中的节点、类中的集合映射为边、类的属性映射为图对象的属性，并提供了对应的函数操作图数据库，因此 JAVA
开发人员可以在熟悉的生态中轻松地使用 TuGraph 数据库。同时 TuGraph-OGM 兼容 Neo4j-OGM，Neo4j 生态用户可以无缝迁移到 TuGraph
数据库上。

### 导入依赖：

```xml

<dependency>
    <groupId>org.neo4j</groupId>
    <artifactId>neo4j-ogm-api</artifactId>
    <version>0.1.0-SNAPSHOT</version>
</dependency>

<dependency>
<groupId>org.neo4j</groupId>
<artifactId>neo4j-ogm-core</artifactId>
<version>0.1.0-SNAPSHOT</version>
</dependency>

<dependency>
<groupId>org.neo4j</groupId>
<artifactId>tugraph-rpc-driver</artifactId>
<version>0.1.0-SNAPSHOT</version>
</dependency>
```

### 构建对象：

```java
@NodeEntity
public class Movie {      // 构建Movie节点
    @Id
    private Long id;      // Movie节点的id
    private String title; // title属性
    private int released; // released属性

    // 构建边ACTS_IN    (actor)-[:ACTS_IN]->(movie)
    @Relationship(type = "ACTS_IN", direction = Relationship.Direction.INCOMING)
    Set<Actor> actors = new HashSet<>();

    public Movie(String title, int year) {
        this.title = title;
        this.released = year;
    }

    public Long getId() {
        return id;
    }

    public void setReleased(int released) {
        this.released = released;
    }
}

@NodeEntity
public class Actor {      // 构建Actor节点
    @Id
    private Long id;
    private String name;

    @Relationship(type = "ACTS_IN", direction = Relationship.Direction.OUTGOING)
    private Set<Movie> movies = new HashSet<>();

    public Actor(String name) {
        this.name = name;
    }

    public void actsIn(Movie movie) {
        movies.add(movie);
        movie.getActors().add(this);
    }
}
```

### 与 TuGraph 建立连接

```java
// 配置
String databaseUri = "list://ip:port";
String username = "admin";
String password = "73@TuGraph";
//启动driver
Driver driver = new RpcDriver();
Configuration.Builder baseConfigurationBuilder = new Configuration.Builder()
                            .uri(databaseUri)
                            .verifyConnection(true)
                            .credentials(username, password);
                            driver.configure(baseConfigurationBuilder.build());
driver.configure(baseConfigurationBuilder.build());
// 开启session
SessionFactory sessionFactory = new SessionFactory(driver, "entity_path");
Session session = sessionFactory.openSession();
```

### 通过 OGM 进行增删改查

支持通过queryForObject、query方法向TuGraph发送Cypher查询，由于Cypher查询的灵活性，需要用户自行指定返回结果格式。

session.queryForObject方法：需要在方法第一个参数处指定返回类型，可设定为某一实体类或数字类型。

session.query方法：Cypher查询的返回结果被存储为Result类型，其内部数据需要用户自行解析，以下方代码为例，传入数据库的Cypher为CREATE查询，返回结果createResult可被解析为QueryStatistics，可获取到此次查询被创建的节点与边的数目。

```java
// 增
Movie jokes = new Movie("Jokes", 1990);  // 新建Movie节点jokes
session.save(jokes);                     // 将jokes存储在TuGraph中

Movie speed = new Movie("Speed", 2019);
Actor alice = new Actor("Alice Neeves");
alice.actsIn(speed);                    // 将speed节点与alice节点通过ACTS_IN进行连接
session.save(speed);                    // 存储两个节点与一条边

// 删
session.delete(alice);                  // 删除alice节点以及相连的边
Movie m = session.load(Movie.class, jokes.getId());   // 根据jokes节点的id获取jokes节点
session.delete(m);                                    // 删除jokes节点

// 改
speed.setReleased(2018);
session.save(speed);                   // 更新speed节点属性

// 查
Collection<Movie> movies = session.loadAll(Movie.class);  // 获取所有Movie节点
Collection<Movie> moviesFilter = session.loadAll(Movie.class,
        new Filter("released", ComparisonOperator.LESS_THAN, 1995));  // 查询所有小于1995年发布的电影

// 调用Cypher
HashMap<String, Object> parameters = new HashMap<>();
parameters.put("Speed", 2018);
Movie cm = session.queryForObject(Movie.class,
        "MATCH (cm:Movie{Speed: $Speed}) RETURN *", parameters);      // 查询Speed为2018的Movie

session.query("CALL db.createVertexLabel('Director', 'name', 'name'," +
        "STRING, false, 'age', INT16, true)", emptyMap());            // 创建节点Label Director
session.query("CALL db.createEdgeLabel('DIRECT', '[]')", emptyMap()); // 创建边Label DIRECT
Result createResult = session.query(
        "CREATE (n:Movie{title:\"The Shawshank Redemption\", released:1994})" +
        "<-[r:DIRECT]-" +
        "(n2:Director{name:\"Frank Darabont\", age:63})",
        emptyMap());
QueryStatistics statistics = createResult.queryStatistics();          // 获取create结果
System.out.println("created " + statistics.getNodesCreated() + " vertices");    // 查看创建节点数目
System.out.println("created " + statistics.getRelationshipsCreated() + " edges");  //查看创建边数目

// 清空数据库
session.deleteAll(Movie.class);        // 删除所有Movie节点
session.purgeDatabase();               // 删除全部数据
```
