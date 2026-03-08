---
title: "RabbitMQ数据上传"
description: "背景： 在知识图谱可视化的系统中需要将数据同时导入到MySQL数据库和Neo4j数据库中。 大数据量、不需要时效性。 再原来的代码中，只是使用了双线程来执行导入到两个库中的逻辑，对于数据导入的异常和数据一致性等存在较大的问题。 正如标题，在"
pubDatetime: 2024-03-01T09:41:03Z
tags:
  - Java实战
draft: false
---

## 背景：

在知识图谱可视化的系统中需要将数据同时导入到MySQL数据库和Neo4j数据库中。 大数据量、不需要时效性。

再原来的代码中，只是使用了双线程来执行导入到两个库中的逻辑，对于数据导入的异常和数据一致性等存在较大的问题。

正如标题，在这里使用了RabbitMQ来做数据上传的处理。下面是RabbitMQ的配置类。

```java
@Configuration
public class RabbitmqConfig {
    public static final String QUEUE_INFORM_MYSQL = "queue_inform_mysql";
    public static final String QUEUE_INFORM_NEO4J = "queue_inform_neo4j";
    public static final String EXCHANGE_TOPICS_INFORM="exchange_topics_inform";
    public static final String ROUTINGKEY_MYSQL="inform.mysql";
    public static final String ROUTINGKEY_NEO4J="inform.neo4j";

    //声明交换机
    @Bean(EXCHANGE_TOPICS_INFORM)
    public Exchange EXCHANGE_TOPICS_INFORM(){
        //durable(true) 持久化，mq重启之后交换机还在
        return ExchangeBuilder.topicExchange(EXCHANGE_TOPICS_INFORM).durable(true).build();
    }

    //声明QUEUE_INFORM_MYSQL队列
    @Bean(QUEUE_INFORM_MYSQL)
    public Queue QUEUE_INFORM_MYSQL(){
        return new Queue(QUEUE_INFORM_MYSQL);
    }
    //声明QUEUE_INFORM_NEO4J队列
    @Bean(QUEUE_INFORM_NEO4J)
    public Queue QUEUE_INFORM_NEO4J(){
        return new Queue(QUEUE_INFORM_NEO4J);
    }

    //ROUTINGKEY_EMAIL队列绑定交换机，指定routingKey
    @Bean
    public Binding BINDING_QUEUE_INFORM_MYSQL(@Qualifier(QUEUE_INFORM_MYSQL) Queue queue,
                                              @Qualifier(EXCHANGE_TOPICS_INFORM) Exchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(ROUTINGKEY_MYSQL).noargs();
    }
    //ROUTINGKEY_NEO4J队列绑定交换机，指定routingKey
    @Bean
    public Binding BINDING_ROUTINGKEY_NEO4J(@Qualifier(QUEUE_INFORM_NEO4J) Queue queue,
                                          @Qualifier(EXCHANGE_TOPICS_INFORM) Exchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(ROUTINGKEY_NEO4J).noargs();
    }
}
```

其中，SpringBoot集成的RabbitMQ的默认的序列化和反序列化方法是org.springframework.amqp.support.converter.SimpleMessageConverter，它呢严格要求对象属性，类型，包路径严格一致，才能反序列化成功。这样就会有很多的限制，通常我们都会自定义的实现。
配置序列化类：

```java
public class JsonMessageConverter implements MessageConverter {

    private final ObjectMapper objectMapper;

    public JsonMessageConverter() {
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public Message toMessage(Object object, MessageProperties messageProperties) throws MessageConversionException {
        try {
            byte[] bytes = objectMapper.writeValueAsBytes(object);
            messageProperties.setContentType(MessageProperties.CONTENT_TYPE_JSON);
            messageProperties.setContentEncoding("UTF-8");
            return new Message(bytes, messageProperties);
        } catch (Exception e) {
            System.out.println("消息转换过程中出错");
            throw new MessageConversionException("消息转换过程中出错", e);

        }
    }

    @Override
    public Object fromMessage(Message message) throws MessageConversionException {
        try {
            return objectMapper.readValue(message.getBody(), Object.class);
        } catch (Exception e) {
            System.out.println("消息转换过程中出错");
            throw new MessageConversionException("消息转换过程中出错", e);
        }
    }
}
```

然后在RabbitmqConfig类中定义Bean

```java
@Bean
public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
    final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
    rabbitTemplate.setMessageConverter(new JsonMessageConverter());
    return rabbitTemplate;
}
```

生产者代码，在这个案例中使用easyexcel导入表格中的数据，并且设置当数据到达1000条再加入到队列中。

```java
@Service("nodeService")
public class NodeServiceImpl implements NodeService {
    private final List<Nodeino> userDataList = new ArrayList<>();

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Override
    public void input() {
        StopWatch stopWatch = new StopWatch();
        stopWatch.start();
        String filePath = "data/bao.xlsx";
        // 使用EasyExcel读取Excel文件
        EasyExcel.read(filePath, Nodeino.class, new ReadListener<Nodeino>() {
            @Override
            public void invoke(Nodeino nodeData, AnalysisContext context) {

                userDataList.add(nodeData);

                if (userDataList.size() >= 1000) {
                    List<Nodeino> batch = new ArrayList<>(userDataList); // 复制列表以防修改冲突
                    userDataList.clear();
                    rabbitTemplate.convertAndSend(RabbitmqConfig.EXCHANGE_TOPICS_INFORM,"inform.mysql",batch);
                    rabbitTemplate.convertAndSend(RabbitmqConfig.EXCHANGE_TOPICS_INFORM,"inform.neo4j",batch);
                }

            }

            @Override
            public void doAfterAllAnalysed(AnalysisContext context) {
                // 所有数据解析完成后会调用此方法
                System.out.println("所有数据读取完成");
                stopWatch.stop();
                System.out.println("保存总数据耗时：" + stopWatch.getTotalTimeMillis() + "ms");
            }

            @Override
            public void onException(Exception exception, AnalysisContext context) throws Exception {
                throw exception;
            }
        }).sheet().doRead();

    }
}
```

在消费者的代码中可能会遇到一个问题，当在处理一个信息时数据库出现异常导致事务数据不能正常添加，但是另外一个导入到数据库的却正常执行了，这样就会导致数据出现不一致在两个数据中。

于是就想到了可以把出现异常的消息加入到死信队列中，然后等到excel表格中全部的消息都处理完成后再处理死信队列中的消息单独导入到数据库中。

那么应该如何判断剩下的消息全部执行完成呢，第一次我想到的思路时是提前记录好一共会产生多少个信息，也就是说提前知道excel中有多少条数据，然后计算出会产生多少个信息加入到队列中，但是经查询后得知easyexcel不支持获取行数，于是这个方案暂时不满足要求。

想到的第二方法不需要知道消息总数，而是通过监控队列在一定时间内是否还有活动（即消息处理）来判断所有消息是否已处理完毕，通过定时任务来检查是否该开始处理死信队列。

- 定义一个服务来跟踪最后一条消息处理的时间。如果自最后一条消息处理之后已经过了足够长的时间（比如1分钟），则认为主队列的所有消息都已处理完成。
- 每次处理消息时，更新最后处理时间。
- 使用定时任务来定期检查是否所有消息都已处理，并触发死信队列的处理。

```java
@Component
@EnableScheduling
public class RabbitMqConsumer {
    @Resource
    private  NodeMapper nodeMapper;
    @Resource
    private GrapherService grapherService;

    @Autowired
    private MessageProcessingTracker messageProcessingTracker;

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // 使用RabbitListener监听QUEUE_INFORM_MYSQL队列的消息
    @RabbitListener(queues = RabbitmqConfig.QUEUE_INFORM_MYSQL)
    @Transactional(rollbackFor = Exception.class)
    public void consumeMySQLFromQueue(String message) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            // 使用自定义的JsonMessageConverter来反序列化消息
            List<Nodeino> nodeList = mapper.readValue(message, new TypeReference<List<Nodeino>>(){});
            // 插入到MySQL数据库
            for (Nodeino node : nodeList) {
                nodeMapper.save(node.getNode1(), node.getNode2(), node.getRelationship());
            }
            messageProcessingTracker.updateLastProcessedTime();
        } catch (Exception e) {
            rabbitTemplate.convertAndSend(RabbitmqConfig.DEAD_LETTER_EXCHANGE, RabbitmqConfig.DEAD_LETTER_QUEUE_MYSQL, message);
            e.printStackTrace();
        }
    }
    @RabbitListener(queues = RabbitmqConfig.QUEUE_INFORM_NEO4J)
    public void consumeNeo4jFromQueue(String message) {
        ObjectMapper mapper = new ObjectMapper();
        try {
            List<Nodeino> nodeList = mapper.readValue(message, new TypeReference<List<Nodeino>>(){});
            grapherService.saveToDatabase(nodeList);
            messageProcessingTracker.updateLastProcessedTime();
        } catch (Exception e) {
            rabbitTemplate.convertAndSend(RabbitmqConfig.DEAD_LETTER_EXCHANGE, RabbitmqConfig.DEAD_LETTER_QUEUE_NEO4J, message);
            e.printStackTrace();
        }
    }

    // 死信队列的处理方法 for MySQL
    public void processDeadLetterQueueMySQL() {
        String message;
        while ((message = (String) rabbitTemplate.receiveAndConvert(RabbitmqConfig.DEAD_LETTER_QUEUE_MYSQL)) != null) {
            try {
                consumeMySQLFromQueue(message);
            } catch (Exception e) {
                // 可以在这里记录日志，表示消息已经无法处理，或者进行其他形式的错误处理
                e.printStackTrace();
            }
        }
    }

    // 死信队列的处理方法 for Neo4j
    public void processDeadLetterQueueNeo4j() {
        String message;
        while ((message = (String) rabbitTemplate.receiveAndConvert(RabbitmqConfig.DEAD_LETTER_QUEUE_NEO4J)) != null) {
            try {
                consumeNeo4jFromQueue(message);
            } catch (Exception e) {
                // 可以在这里记录日志，表示消息已经无法处理，或者进行其他形式的错误处理
                e.printStackTrace();
            }
        }
    }

    @Scheduled(fixedRate = 60000)  // 每分钟检查一次
    public void processDeadLettersIfIdle() {
        if (messageProcessingTracker.isIdleForLong()) {
            // 处理死信队列
            processDeadLetterQueueMySQL();
            processDeadLetterQueueNeo4j();
        }
    }
}
```

```java
@Service
public class MessageProcessingTracker {
    private final AtomicLong lastProcessedTime = new AtomicLong(System.currentTimeMillis());

    public void updateLastProcessedTime() {
        lastProcessedTime.set(System.currentTimeMillis());
    }

    public boolean isIdleForLong() {
        // 如果超过1分钟没有消息处理，认为已处理完毕
        return (System.currentTimeMillis() - lastProcessedTime.get()) > 60000;
    }
}
```

完整的RabbitmqConfig类代码：

```java
@Configuration
public class RabbitmqConfig {
    public static final String QUEUE_INFORM_MYSQL = "queue_inform_mysql";
    public static final String QUEUE_INFORM_NEO4J = "queue_inform_neo4j";
    public static final String EXCHANGE_TOPICS_INFORM="exchange_topics_inform";
    public static final String ROUTINGKEY_MYSQL="inform.mysql";
    public static final String ROUTINGKEY_NEO4J="inform.neo4j";

    //死信队列
    public static final String DEAD_LETTER_EXCHANGE = "dead_letter_exchange";
    public static final String DEAD_LETTER_QUEUE_MYSQL = "dead_letter_queue_mysql";
    public static final String DEAD_LETTER_QUEUE_NEO4J = "dead_letter_queue_neo4j";

    //声明交换机
    @Bean(EXCHANGE_TOPICS_INFORM)
    public Exchange EXCHANGE_TOPICS_INFORM(){
        //durable(true) 持久化，mq重启之后交换机还在
        return ExchangeBuilder.topicExchange(EXCHANGE_TOPICS_INFORM).durable(true).build();
    }

    @Bean(DEAD_LETTER_EXCHANGE)
    public Exchange DEAD_LETTER_EXCHANGE() {
        return ExchangeBuilder.directExchange(DEAD_LETTER_EXCHANGE).durable(true).build();
    }

    // 声明MySQL队列并配置死信交换机
    @Bean(QUEUE_INFORM_MYSQL)
    public Queue QUEUE_INFORM_MYSQL() {
        return QueueBuilder.durable(QUEUE_INFORM_MYSQL)
                .withArgument("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DEAD_LETTER_QUEUE_MYSQL)
                .build();
    }

    // 声明Neo4j队列并配置死信交换机
    @Bean(QUEUE_INFORM_NEO4J)
    public Queue QUEUE_INFORM_NEO4J() {
        return QueueBuilder.durable(QUEUE_INFORM_NEO4J)
                .withArgument("x-dead-letter-exchange", DEAD_LETTER_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DEAD_LETTER_QUEUE_NEO4J)
                .build();
    }

    // 声明死信队列
    @Bean
    public Queue DEAD_LETTER_QUEUE_MYSQL() {
        return new Queue(DEAD_LETTER_QUEUE_MYSQL);
    }

    @Bean
    public Queue DEAD_LETTER_QUEUE_NEO4J() {
        return new Queue(DEAD_LETTER_QUEUE_NEO4J);
    }

    @Bean
    public Binding BINDING_QUEUE_INFORM_MYSQL(@Qualifier(QUEUE_INFORM_MYSQL) Queue queue,
                                              @Qualifier(EXCHANGE_TOPICS_INFORM) Exchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(ROUTINGKEY_MYSQL).noargs();
    }

    @Bean
    public Binding BINDING_ROUTINGKEY_NEO4J(@Qualifier(QUEUE_INFORM_NEO4J) Queue queue,
                                          @Qualifier(EXCHANGE_TOPICS_INFORM) Exchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(ROUTINGKEY_NEO4J).noargs();
    }

    //定义了序列化器
    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(new JsonMessageConverter());
        return rabbitTemplate;
    }
}
```
