---
title: "Spring Data Neo4j（1.对象映射）"
description: "一、Spring Data Neo4j Spring Data Neo4j或简称SDN是下一代Spring Data模块，由Neo4j，Inc.创建和维护。与VMware的Spring Data Team密切合作。 它支持所有官方支持的Ne"
pubDatetime: 2022-12-27T13:44:36Z
tags:
  - 知识图谱
draft: false
---

# 一、Spring Data Neo4j

Spring Data Neo4j或简称SDN是下一代Spring Data模块，由Neo4j，Inc.创建和维护。与VMware的Spring Data Team密切合作。
它支持所有官方支持的Neo4j版本，包括Neo4j AuraDB。 Spring Data Neo4j项目将上述Spring Data概念应用于使用Neo4j图形数据存储开发解决方案。

SDN完全依赖于Neo4j Java驱动程序，而无需在映射框架和驱动程序之间引入另一个“驱动程序”或“传输”层。Neo4j Java驱动程序 -
有时被称为Bolt或Bolt驱动程序 - 被用作协议，就像JDBC与关系数据库一样。

SDN是一个 对象-图形-映射（OGM） 库。 OGM 将图中的节点和关系映射到域模型中的对象和引用。
对象实例映射到节点，而对象引用使用关系映射，或序列化为属性（例如，对日期的引用）。 JVM 基元映射到节点或关系属性。 OGM
抽象化数据库，并提供一种方便的方法，将域模型保留在图形中并查询它，而无需直接使用低级别驱动程序。 它还为开发人员提供了灵活性，可以在
SDN 生成的查询不足的情况下提供自定义查询。

SDN的所有抽象都有命令式和响应式。 不建议在同一应用程序中混合使用这两种编程样式。 反应式基础架构需要一个 Neo4j 4.0+ 数据库 !

# 二、注释

```java
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.schema.Relationship.Direction;

@Node("Movie")   // 1
public class MovieEntity {

    @Id      // 2
    private final String title;

    @Property("tagline")    // 3
    private final String description;

    @Relationship(type = "ACTED_IN", direction = Direction.INCOMING)   // 4
    private List<Roles> actorsAndRoles;

    @Relationship(type = "DIRECTED", direction = Direction.INCOMING)
    private List<PersonEntity> directors = new ArrayList<>();

    public MovieEntity(String title, String description) {   // 5
        this.title = title;
        this.description = description;
    }

    // Getters omitted for brevity
}
```

① @Node用于将此类标记为托管实体。 它还用于配置 Neo4j 标签。 标签默认为类的名称，如果您只是使用普通。@Node
② 每个实体都必须有一个 ID。 此处显示的电影类使用 attributeas 唯一的业务键。 如果你没有这样的唯一密钥，你可以使用组合的and来配置SDN以使用Neo4j的内部ID。
We also provide generators for UUID。title@Id@GeneratedValue
③ 这显示为一种为字段使用与图形属性不同的名称的方法。@Property
④ 这定义了与类型和关系类型的类的关系PersonEntityACTED_IN
⑤ 这是应用程序代码要使用的构造函数

## @Node

注释用于将类标记为托管域类，受映射上下文的类路径扫描的约束。@Node

要将 Object 映射到图中的节点，反之亦然，我们需要一个标签来标识要映射到和从中映射的类。

@Node具有一个属性允许您配置一个或多个标签，以便在读取和写入带批注的类的实例时使用。 属性是 的别名。 如果未指定标签，则简单类名将用作主标签。
如果要提供多个标签，可以：labelsvaluelabels

- 向属性提供数组。 数组中的第一个元素将被视为主标签。labels
- 提供值并将其他标签放入。primaryLabellabels 主标签应始终是反映您的域类的最具体的标签。

对于通过存储库或 Neo4j 模板编写的注释类的每个实例，将写入图形中至少具有主标签的一个节点。 反之亦然，所有具有主标签的节点都将映射到带注释的类的实例。

## @Id

在类和具有特定标签的节点之间创建映射时，我们还需要在该类（对象）的各个实例和节点实例之间建立连接。@Node

这就是发挥作用的地方。将类的一个属性标记为对象的唯一标识符。 该唯一标识符在最佳环境中是唯一的业务键，换句话说，是自然键。可用于具有受支持的简单类型的所有属性。@Id

但随着时间的推移，键的设置会变得越来越麻烦，就提出如下方法解决

在类型器的属性上，可以使用它。 这会将 Neo4j 内部 ID（它不是节点或关系上的属性，通常不可见）映射到属性，并允许 SDN
检索类的各个实例。longLong@Id@GeneratedValue @GeneratedValue提供属性。可用于指定类实现。 Anis 一个功能接口，它包含主标签和实例来生成
Id。 我们支持开箱即用的实现。

```java
@Node("Movie")
public class MovieEntity {

    @Id @GeneratedValue(UUIDStringGenerator.class)
    private String id;

    private String name;
}
```

- 还可以从应用程序上下文中指定 Spring Bean。 该 Bean 也需要实现，但可以利用上下文中的所有内容，包括 Neo4j 客户端或模板与数据库进行交互。

```java
@Node("Movie")
public class MovieEntity {

    @Id @GeneratedValue(generatorRef = "myIdGenerator")
    private String id;

    private String name;
}
```

```java
@Component
class MyIdGenerator implements IdGenerator<String> {

    private final Neo4jClient neo4jClient;

    public MyIdGenerator(Neo4jClient neo4jClient) {
        this.neo4jClient = neo4jClient;
    }

    @Override
    public String generateId(String primaryLabel, Object entity) {
        return neo4jClient.query("YOUR CYPHER QUERY FOR THE NEXT ID")
            .fetchAs(String.class).one().get();
    }
}
```

## @Version(乐观锁)

Spring Data Neo4j通过在非类型字段上使用注释来支持乐观锁定。 此属性将在更新期间自动递增，不得手动修改。@VersionLong

例如，如果不同线程中的两个事务想要使用版本修改同一对象，则第一个操作将成功持久化到数据库中。 此时，版本字段将递增，因此。
第二个操作将失败，因为它想要使用数据库中不再存在的版本修改对象。
在这种情况下，需要重试操作，首先从数据库中重新获取具有当前版本的对象。xx+1OptimisticLockingFailureExceptionx

## @Property

带注释的类的所有属性都将保留为 Neo4j 节点和关系的属性。 如果没有进一步的配置，Java 或 Kotlin 类中的属性名称将用作 Neo4j 属性。

## @Node

如果您正在使用现有的 Neo4j 模式，或者只是想根据自己的需求调整映射，则需要使用。 用于指定数据库中属性的名称。@Propertyname

## @Relationship

Neo4j不仅支持在节点上定义属性，还支持在关系上定义属性。 为了在模型中表达这些属性，SDN提供应用于简单的Java类。
在属性类中，必须只有一个标记为 as 的字段来定义关系指向的实体。 或者，在关系的背景下，来自。@RelationshipProperties@TargetNodeINCOMING

该注释可用于非简单类型的所有属性。 它适用于其他类型的属性注释或集合及其Map。@Relationship@Node

属性允许配置关系的类型，允许指定方向。 SDN 中的默认方向是。typevaluedirectionRelationship.Direction#OUTGOING

我们支持动态关系。 动态关系表示为 aor。 在这种情况下，与其他域类的关系类型由 maps 键给出，不得通过 进行配置。MapMap@Relationship

```java
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;
import org.springframework.data.neo4j.core.schema.Relationship.Direction;

@Node("Movie")
public class MovieEntity {

    @Id
    private final String title;

    @Property("tagline")  //这显示为一种为字段使用与图形属性不同的名称的方法
    private final String description;

    @Relationship(type = "ACTED_IN", direction = Direction.INCOMING)
    private List<Roles> actorsAndRoles;

    @Relationship(type = "DIRECTED", direction = Direction.INCOMING)
    private List<PersonEntity> directors = new ArrayList<>();

    public MovieEntity(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // Getters omitted for brevity
}
```

我们还没有在两个方向上模拟电影和人之间的关系。 为什么？ 我们将 thes 视为聚合根，拥有关系。
另一方面，我们希望能够从数据库中提取所有人，而无需选择与他们关联的所有电影。 在尝试将数据库中的每个关系映射到各个方向之前，请考虑应用程序的用例。
虽然您可以这样做，但您最终可能会在对象图中重建图形数据库，这不是映射框架的意图。 如果您必须对循环域或双向域进行建模，并且不想获取整个图，
您可以使用投影定义要提取的数据的细化描述。MovieEntity
