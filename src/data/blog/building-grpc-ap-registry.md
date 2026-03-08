---
title: "用 gRPC 打造最终一致的 AP-模式注册中心"
description: "背景与目标 需求 说明 高可用 (A) 任意 Dispatcher 宕机或网络分区，注册/发现仍立即可用 分区容忍 (P) 各分区内继续服务，网络恢复后自动收敛数据 最终一致 强一致不是刚需；允许短暂不一致 低延迟 注册/心跳 O(μs)，"
pubDatetime: 2025-06-10T15:39:42Z
tags: 
   - java
draft: false
---

## 背景与目标

| 需求 | 说明 |
|---|---|
| 高可用 (A) | 任意 Dispatcher 宕机或网络分区时，注册与服务发现仍然可以立即使用 |
| 分区容忍 (P) | 各网络分区内继续提供服务，网络恢复后自动收敛数据 |
| 最终一致 | 不要求强一致性，允许短暂的数据不一致 |
| 低延迟 | 注册与心跳操作为微秒级（O(μs)），不阻塞业务线程 |
| 架构策略 | 传统 CP 系统（如 ZooKeeper）在网络分区时会牺牲可写性；Eureka / Nacos Naming 采用 AP 路线 |
| 实现思路 | 在现有 executor ↔ dispatcher 架构基础上，实现“Δ-Gossip + 内存快照”的极简 AP 注册发现机制 |

## 总体架构

- Executor ⇄ Dispatcher：对外 gRPC 接口（9090、9091 …）。
- Dispatcher ↔ Dispatcher：集群 Δ-Gossip（9581、9582 …）。
- deltaQueue：本节点待广播增量缓冲，实现写-读解耦。

## 核心组件拆解

| 位置 | 类 | 作用 |
|---|---|---|
| executor config | ExecutorRegister | 读取 `executor.*` 配置并完成注册组件注入 |
| executor registryStub executor lifecycle | ExecutorLifecycleManager | 使用 `@EventListener` 完成注册与心跳；`@PreDestroy` 时执行注销 |
| dispatcher registry | GrpcRegistryServiceImpl | 对外提供 gRPC 接口：`register` / `heartbeat` / `unregister` |
| dispatcher store | InstanceStore | 线程安全 `Map` + Δ 队列；提供幂等 `upsert()` |
| dispatcher store | RevisionGenerator | 生成单调递增版本号（Lamport Clock） |
| dispatcher cluster/gossip | ClusterGossipSender | 每 500 ms 批量 `drain Δ` 并推送给 peers |
| dispatcher cluster/sync | ClusterSyncServiceImpl | 接收 Δ / FullSync 后执行 `store.upsert()` |
| dispatcher scheduler | ExpireScanner | 每 5 s 扫描并剔除心跳超时实例（TTL 机制） |

peer = 与本节点处在同一集群、需要相互同步数据的 其他 Dispatcher。

## 一次「上线-下线」全过程

| 时间线 | 组件 | 详细步骤 |
|---|---|---|
| 1 | Executor 启动 | `ApplicationReadyEvent` 触发 → 组装 `RegisterRequest(instanceKey, executorId…)` → 通过 gRPC 调用 Dispatcher |
| 2 | Dispatcher-A | `GrpcRegistryServiceImpl.register()`：① `InstanceStore.upsert(dto)` 更新本地快照；② `deltaQueue.offer(dto)` 写入 Δ 队列；③ `gossipSender.signal()` 触发扩散 → 立即返回 `ACK Success` |
| 3 | Δ 扩散 | `ClusterGossipSender` 每 500 ms 执行 `pushDelta()`：① drain 0–500 条 Δ；② 组装 `DeltaSync`；③ 遍历 `cluster.peers` 调用 `pushDelta()` |
| 4 | Peers (B, C…) | `ClusterSyncServiceImpl.pushDelta()`：再次执行 `InstanceStore.upsert()` → 本节点 `signal()` → 继续波浪式扩散 |
| 5 | 心跳 | Executor 每 5 s 调用 `heartbeat(instanceKey)` → 同样走 Δ 扩散机制 |
| 6 | 宕机 / 退出 | `@PreDestroy` 触发 `unregister(instanceKey)` → 创建 tombstone Δ → 扩散 |
| 7 | 失联剔除 | `ExpireScanner.scan()` 每 5 s 检查 `now - lastBeat > ttl` → 生成 tombstone Δ |
| 8 | 分区自愈 | 网络分区恢复后节点互推 Δ；`revision` 冲突解决策略：版本号大的胜出 |

## Δ 队列：写-读解耦、可靠缓冲、低带宽

| 价值点 | 体现 |
|---|---|
| 写-读解耦 | 注册/心跳只写内存并入 Δ 队列，立即返回；网络 I/O 由定时线程异步执行，不阻塞业务线程 |
| 可靠缓冲 | peer 网络异常导致发送失败时，将对应 Δ 重新入队；网络恢复后自动重播，确保增量不丢 |
| 低带宽 | 队列仅存变化量（diff）；批量打包后可将 N 次心跳合并为约 1 个 `DeltaSync` 报文 |

## 一条实例的“出生-心跳-注销”

### ① Executor 启动 —— 注册

```java
// ExecutorLifecycleManager.register()
String instanceKey = name + "-" + host + "-" + port;
long executorId    = ToolObjectId.getInstance().nextId();

registryStub.register(RegisterRequest.newBuilder()
        .setInstanceKey(instanceKey)
        .setExecutorId(executorId)
        .setName(name).setHost(host).setPort(port)
        .build());
```

做了什么？

- 组合 instanceKey（逻辑主键）
- 生成分布式 executorId
- gRPC 调用 Dispatcher-A

### ② Dispatcher-A 落本地 + Δ 入队

```java
// GrpcRegistryServiceImpl.register()
InstanceDTO dto = InstanceDTO.newBuilder()
    .setInstanceKey(req.getInstanceKey())
    .setExecutorId(req.getExecutorId())
    .setRevision(revGen.next())           // Lamport Clock
    .setLastBeat(System.currentTimeMillis())
    .build();

store.upsert(dto);   // ① merge Map ② deltaQueue.offer(dto)
gossip.signal();     // needPush = true 触发发送
```

做了什么？ O(1) 内存写完立即 ACK Executor —— 写-读分离。

### ③ Δ 广播线程

```java
// ClusterGossipSender.pushDelta()
if (!needPush.compareAndSet(true,false)) return;

List<InstanceDTO> batch = store.drainDelta(500);
DeltaSync ds = DeltaSync.newBuilder().addAllInstances(batch).build();

peerList.forEach(addr -> {
    try {
        stub(addr).withDeadlineAfter(300, MILLISECONDS)
                  .pushDelta(ds);         // 一次发送整批增量
    } catch (Exception ex) {
        log.debug("push fail {}", addr);
    }
});
```

做了什么？

将过去 ≤ 500 条 Δ 打成一个 DeltaSync 报文广播给所有 peer —— 低带宽 + 可靠缓冲。

### ④ 其他 Dispatcher 收 Δ

```java
// ClusterSyncServiceImpl.pushDelta()
req.getInstancesList().forEach(store::upsert); // 同样入 Map & Δ 队列
```

做了什么？ 幂等 merge —— 如果版本号 (revision) 大，则覆盖；否则丢弃。 随后本节点也 signal()，确保继续扩散到更多 peer。

### ⑤ Executor 心跳

```java
// Executor 定时线程
registryStub.heartbeat(
   HeartbeatRequest.newBuilder().setInstanceKey(instanceKey).build());
```

Dispatcher 更新 lastBeat → 再次 Δ 扩散，所有节点 TTL 计时同步。

### ⑥ 过期剔除

```java
@Scheduled(fixedDelay = 5000)
public void scan() {
    long now = System.currentTimeMillis();
    store.all().forEach(inst -> {
        if (!inst.getTombstone() &&
            now - inst.getLastBeat() > inst.getTtl()) {
            store.tombstone(inst.getInstanceKey(), revGen.next());
            gossip.signal();               // tombstone Δ 扩散
        }
    });
}
```

做了什么？

- 失联 > TTL 的实例会被自动标记为 tombstone = true 并同步全网。

### ⑦ Executor 优雅下线

```java
@PreDestroy
public void onShutdown() {
    registryStub.unregister(
        UnregisterRequest.newBuilder().setInstanceKey(instanceKey).build());
}
```

Dispatcher 侧生成 tombstone Δ → 全网立即下线。

## 网络分区 & 节点失联自愈

场景系统表现Dispatcher-A 离线Executors 自动重试列表中的 B/C；注册/心跳继续成功跨机房分区分区内各 Dispatcher 独立可写； 
恢复后 Δ 汇合，执行 revision 规则收敛Executor 崩溃未发送 Unregister，但 Dispatcher 在 3×TTL 后自动 tombstone 下线

## 总结

极简原则： 一台 Dispatcher 能活，就让写入成功；多台能连，就让数据最终一致。

- Executor 关心极简接口：注册 / 心跳 / 注销
- Dispatcher 内部通过 deltaQueue + Gossip 架起 AP 高可用桥梁
- Δ 把「更新」从「传播」中切出来： 写线程 = 低延迟 读线程 = 异步容错
- 分区、节点故障、全员重启，都能依靠 Δ + revision 自动收敛
