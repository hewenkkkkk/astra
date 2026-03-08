---
title: "Spring Boot 默认 DataSource 自动配置机制解析"
description: "背景： 在一个项目中我自己写了一个db-starter来作为所有模块的数据库连接器，在其它模块引入了db-starter后且没有配置数据库连接信息在配置文件中(需求需要在创建连接的时候才会提供，而不是在配置文件中写死)后启动项目报错Fail"
pubDatetime: 2025-08-09T15:42:29Z
tags:
  - Java实战
draft: false
---

# 背景：

在一个项目中我自己写了一个db-starter来作为所有模块的数据库连接器，在其它模块引入了db-starter后且没有配置数据库连接信息在配置文件中(
需求需要在创建连接的时候才会提供，而不是在配置文件中写死)后启动项目报错Failed to determine a suitable driver class

## 1）启动到自动配置：关键链路

Spring Boot 在应用启动时会加载一批 AutoConfiguration 类；是否生效由一堆 @ConditionalXXX 条件控制。对 JDBC 来说，入口是
DataSourceAutoConfiguration。从官方 API 文档可以看到它带着几条关键条件（概念化地理解如下）：

- 类路径有 JDBC 相关类：例如 javax.sql.DataSource；
- 容器里还没有你自己定义的 DataSource Bean；
- （优先）选择 Hikari：只要类路径存在 HikariDataSource 就走 Hikari 分支。

这些条件就对应了我们遇到的问题情境：类路径有Hikari（因为引入了 db-starter），你没有自己注册DataSource，于是Boot进入“默认分支”，打算帮你造一个 Hikari 连接池。以上判断逻辑来自官方类与包文档，可对照：DataSourceAutoConfiguration、DataSourceConfiguration、以及包说明。

真正挑选Hikari的细节在DataSourceConfiguration里（内部有 Hikari、Tomcat、Dbcp2 等嵌套配置类，用 @ConditionalOnClass(HikariDataSource) 这类条件选择具体实现）。

## 2）抛 “Failed to determine a suitable driver class”

默认分支创建 HikariDataSource 时，会把属性绑定到 DataSourceProperties。接着它需要推断驱动类：如果没有显式配置
spring.datasource.driver-class-name，就会尝试从 spring.datasource.url 解析数据库类型，进而推断
driver；两者都没配时，DataSourceProperties#determineDriverClassName() 会直接抛错，于是得到这条报错。

只要满足 “类路径有 Hikari + 容器没有 DataSource + 未提供 spring.datasource.* 必要属性”，默认分支就会被触发，而属性不全就会报错。

## 3）销毁时的其它异常

ApplicationContext 刷新失败会触发回滚与销毁流程；如果某些 Bean 的 @PreDestroy/销毁回调里假设了“已成功启动”的状态，就可能再抛出与数据库无关的异常。

# 解决方案：采用“懒初始化 + 关闭 DB 健康检查”

```java
@Configuration
public class PlaceholderDataSourceConfig {

    /**
     * Primary 占位池：一旦被误用，立即抛异常提示。
     * @return 永远不能真正获得连接的 DataSource
     */
    @Bean
    @Primary       // 让 Spring 退而用它，避免走 DataSourceAutoConfiguration 的 Hikari
    @Lazy          // 懒加载——只有被注入才实例化
    public DataSource placeholderDataSource() {
        return new AbstractDataSource() {
            @Override
            public Connection getConnection() {
                throw new IllegalStateException(
                        "禁止直接注入 DataSource —— 请使用 ConnectionFactory#getConn(Datasource)");
            }
            @Override
            public Connection getConnection(String u, String p) {
                return getConnection();
            }
        };
    }
}
```

配置文件添加下面两段配置：

```yml
spring:
  main:
    lazy-initialization: true
management:
  health:
    db:
      enabled: false
```

## 1）全局懒初始化（spring.main.lazy-initialization=true）

这会让所有 Bean 默认 @Lazy：注册 Bean 定义，但不立刻实例化。 因此，即便 DataSourceAutoConfiguration 仍然注册了一个默认的
DataSource Bean“定义”，只要没有人注入它，它就不会真正创建，也就不会走到“推断驱动类”的报错分支，该特性是 Spring Boot
的通用懒加载能力。

也就是说把“启动期会炸”的点，拖到了“第一次有人用它时才会炸”。下一步就要避免“有人去用它”。

## 2）关闭 Actuator 的 DB 健康检查（management.health.db.enabled=false）

Spring Boot Actuator 默认会注册 DataSourceHealthIndicator，它会主动向容器要 DataSource 并调用 getConnection()
做探活——这恰好会触发懒 Bean 的实例化，把问题又拉回启动/运行早期。关闭 db 健康检查后，Actuator 不再去唤醒这个默认
DataSource，于是懒 Bean 会一直“睡着”，应用自然不会触发那条报错路径。该行为由 DataSourceHealthContributorAutoConfiguration
管理。

### 与 db-starter 的配合

在我的代码真正访问数据库时，并不依赖容器中的默认 DataSource，而是把“数据源元信息”交给自研的 ConnectionFactory/Registry
来懒创建或复用连接池。因此，即使容器里“潜伏”着那个默认的 DataSource Bean 定义，它也永远不会被用到。

# 关键源码：

## 1）DataSourceAutoConfiguration 顶层条件到底在判断什么

```java
@AutoConfiguration( before = { SqlInitializationAutoConfiguration.class } )
@ConditionalOnClass({ DataSource.class, EmbeddedDatabaseType.class })
@ConditionalOnMissingBean( type = { "io.r2dbc.spi.ConnectionFactory" } )
@EnableConfigurationProperties({ DataSourceProperties.class })
@Import({
  DataSourcePoolMetadataProvidersConfiguration.class,
  DataSourceCheckpointRestoreConfiguration.class
})
public class DataSourceAutoConfiguration { ... }
```

- @ConditionalOnClass(DataSource, EmbeddedDatabaseType) 类路径里必须有 JDBC 接口与“内嵌库类型”枚举，才考虑做 JDBC
  自动配置。没有这些类，整个数据源自动配置直接失效。
- @ConditionalOnMissingBean(type = "io.r2dbc.spi.ConnectionFactory") 如果你用的是 R2DBC（响应式的 ConnectionFactory
  已存在），就不做 JDBC 的自动配置，避免冲突。
- @EnableConfigurationProperties(DataSourceProperties) 启用 spring.datasource.* 的属性绑定（比如
  url、username、driver-class-name）。
- @AutoConfiguration(before = SqlInitializationAutoConfiguration.class) 先把数据源配置好，再决定是否跑 schema.sql /
  data.sql 初始化脚本。

到这Boot 只是“允许自动配置”，具体到底建什么样的 DataSource，还要看后面的两套分支。

## 2）两套互斥分支：连接池 和 内嵌库

源码里有两个静态内部配置类，互斥生效：

```java
@Configuration(proxyBeanMethods = false)
@Conditional({ PooledDataSourceCondition.class })
@ConditionalOnMissingBean({ DataSource.class, XADataSource.class })
@Import({
  DataSourceConfiguration.Hikari.class,
  DataSourceConfiguration.Tomcat.class,
  DataSourceConfiguration.Dbcp2.class,
  DataSourceConfiguration.OracleUcp.class,
  DataSourceConfiguration.Generic.class,
  DataSourceJmxConfiguration.class
})
protected static class PooledDataSourceConfiguration { ... }

@Configuration(proxyBeanMethods = false)
@Conditional({ EmbeddedDatabaseCondition.class })
@ConditionalOnMissingBean({ DataSource.class, XADataSource.class })
@Import({ EmbeddedDataSourceConfiguration.class })
protected static class EmbeddedDatabaseConfiguration { ... }
```

共同点：

- 都要求 容器里还没有别的 DataSource 或 XADataSource（@ConditionalOnMissingBean）。 一旦手写了一个数据源 Bean，自动配置就不会有效。

分歧点在它们各自的 @Conditional 条件。

## 2.1）连接池分支：PooledDataSourceCondition

```java
static class PooledDataSourceCondition extends AnyNestedCondition {
  PooledDataSourceCondition() { super(ConfigurationPhase.PARSE_CONFIGURATION); }

  @Conditional({ PooledDataSourceAvailableCondition.class })
  static class PooledDataSourceAvailable { }

  @ConditionalOnProperty(prefix="spring.datasource", name={"type"})
  static class ExplicitType { }
}
```

它是“只要满足下面任意一个，就选连接池分支”。

1. PooledDataSourceAvailableCondition :

```java
return DataSourceBuilder.findType(classLoader) != null
    ? match("supported DataSource")
    : noMatch("supported DataSource");
```

DataSourceBuilder.findType(...) 会在类路径上寻找已知的连接池实现（Hikari、Tomcat、Dbcp2、OracleUcp 等）—只要有一个在场，此条件成立。
把 HikariCP 放进类路径，这里就命中。

2. @ConditionalOnProperty(prefix="spring.datasource", name="type") 也可以手动指定连接池实现类（spring.datasource.type=
   某个DataSource的全限定名），则不必依赖类路径探测。

这就是“类路径有 Hikari → 进入连接池分支”的具体判断处。

进入连接池分支后，@Import(...) 把各个具体实现的配置类都导进来，但每个配置类自身还有一个 @ConditionalOnClass(...)，比如：

```
// 以 Hikari 为例
@Configuration
@ConditionalOnClass(HikariDataSource.class)
class DataSourceConfiguration.Hikari {
  @Bean // -> 创建 HikariDataSource
}
```

谁在类路径，谁通过 @ConditionalOnClass，最终只会实例化你带着的那个连接池（Hikari）。

## 2.2）内嵌库分支：EmbeddedDatabaseCondition

```java
static class EmbeddedDatabaseCondition extends SpringBootCondition {
  private static final String DATASOURCE_URL_PROPERTY = "spring.datasource.url";
  private final SpringBootCondition pooledCondition = new PooledDataSourceCondition();

  public ConditionOutcome getMatchOutcome(ConditionContext context, AnnotatedTypeMetadata md) {
    if (hasDataSourceUrlProperty(context)) {
      return noMatch("spring.datasource.url is set");   // 显式配了 URL → 就不走内嵌库
    }
    else if (anyMatches(context, md, new Condition[]{ this.pooledCondition })) {
      return noMatch("supported pooled data source");   // 能用连接池 → 也不走内嵌库
    }
    else {
      EmbeddedDatabaseType type = EmbeddedDatabaseConnection.get(loader).getType();
      return (type == null) ? noMatch("did not find embedded database")
                            : match("found embedded database " + type);
    }
  }
}
```

逻辑是“能不用内嵌库就不会用

- 显式配置了 spring.datasource.url → 肯定不是内嵌库
- 类路径能找到任一连接池实现 → 也不走内嵌库
- 二者都不满足，且类路径能找到 H2/HSQL/Derby → 才回退到内嵌库

# 其它解决方法：

- 排除 JDBC 相关自动配置 在注解或配置文件中 exclude DataSourceAutoConfiguration / JdbcTemplateAutoConfiguration /
  DataSourceTransactionManagerAutoConfiguration——这样容器里根本没有默认 DataSource 的 Bean 定义。
- 自己提供“路由 DataSource” + 事务管理器 注册一个 @Primary DataSource 外壳（继承 AbstractRoutingDataSource），内部把
  getConnection() 路由到自研的连接池注册表；再配 DataSourceTransactionManager，即可让 @Transactional
  与多数据源路由共存。Actuator 的 db 健康检查也会针对这个“可用”的 DataSource 生效。
