import { UploadedDoc } from '../types';
import { tokenizeText } from './similarityEngine';

export const SAMPLE_DOCUMENTS: Omit<UploadedDoc, 'id' | 'label' | 'uploadedAt'>[] = [
  {
    name: 'Consensus_Engine_Architecture_v1.0.pdf',
    size: 245180,
    format: 'pdf',
    rawText: `
Distributed Consensus and Fault-Tolerant State Machine Replication: System Architecture v1.0.
Abstract:
This technical specification outlines the design principles, state transitions, and leader election protocols
for high-throughput distributed replicated state machines operating across untrusted network partitions.
We implement an asynchronous Raft-derived consensus protocol with dynamic cluster membership changes,
pipelined log entries, and proactive disk snapshotting.

1. System Model and Assumptions
The cluster comprises N nodes where at most F = (N - 1) / 2 failures can be tolerated concurrently.
Communication between nodes occurs via encrypted bidirectional RPC channels. Network latency is partially
synchronous: message delays may be unbounded during network partition incidents, but are assumed to stabilize
during leader election phases.

2. Leader Election Protocol
Nodes transition between Follower, Candidate, and Leader states. When election timeouts expire without heartbeats,
followers increment their current term, transition to candidate status, and broadcast RequestVote RPCs.
A candidate receives votes if its log is at least as up-to-date as the responding peer's log.

3. Log Replication and Persistence
Client write commands are submitted strictly to the cluster leader. The leader appends the entry to its local WAL
(Write-Ahead Log) and concurrently replicates the log entry to all peer followers using AppendEntries RPCs.
An entry is considered committed once acknowledged by a majority quorum of participating nodes.

4. Compaction and Snapshotting
To prevent logs from growing indefinitely in disk storage, nodes periodically execute background state compaction.
The state machine snapshot serializes the in-memory key-value database, records the last included index and term,
and truncates obsolete log entries from persistent storage.
    `.trim(),
    charCount: 1680,
    wordCount: 228,
    tokens: [],
    tokenCounts: new Map(),
    isScannedOrLowText: false,
    status: 'ready',
  },
  {
    name: 'Consensus_Engine_Architecture_v2.1_Revised.docx',
    size: 312890,
    format: 'docx',
    rawText: `
Distributed Consensus and Multi-Raft Partition Tolerance: Architecture Specification v2.1.
Abstract:
This revised specification refines the state transition invariants and leader election protocols for high-throughput
distributed state machine replication under volatile WAN latency and geographic partitions.
Building upon our earlier Raft consensus implementation, v2.1 introduces Multi-Raft partitioning groups,
pipelined log entry streaming, non-blocking disk snapshotting, and preemptive lease reads.

1. System Model and Partition Resiliency
The cluster operates across multi-region availability zones where F = (N - 1) / 2 node failures are tolerated.
RPC communication operates over zero-copy gRPC transport with automated TLS certificate rotation.
Network partitions are mitigated using joint consensus membership transitions and dynamic timeout adjustments.

2. Optimized Leader Election and Leases
Followers transition to Candidate states upon randomized heartbeat timeout expiration.
To reduce client read latency, cluster leaders acquire bounded time-based leases, bypassing AppendEntries
verification for pure query workloads. Log comparisons enforce strict term superiority before vote granting.

3. Parallelized Log Replication
Write commands submitted to the active leader are queued in a high-performance circular ring buffer.
The leader streams uncommitted log entries in parallel to followers via batched AppendEntries RPCs.
Quorum commits require majority acknowledgments before executing state machine application.

4. Snapshotting and Storage Compaction
Background snapshotting executes via copy-on-write page isolation to eliminate write stalls.
The state machine produces transactional storage checkpoints, updates index offsets, and safely prunes WAL logs.
    `.trim(),
    charCount: 1785,
    wordCount: 231,
    tokens: [],
    tokenCounts: new Map(),
    isScannedOrLowText: false,
    status: 'ready',
  },
  {
    name: 'Enterprise_Cloud_Budget_Allocation_Q3.pdf',
    size: 184500,
    format: 'pdf',
    rawText: `
Executive Financial Report: Enterprise Cloud Infrastructure and Operational Expenditures Q3.
Executive Summary:
This fiscal analysis summarizes quarterly cloud hosting expenditures, compute resource reservation amortizations,
and departmental cost attribution across multi-cloud production and staging environments.
Total operational expenditures increased by 8.4% due to container cluster scale-outs and machine learning pipeline runs.

1. Compute and Storage Expenditure Summary
Compute instance costs represented 62% of aggregate infrastructure spend, dominated by GPU accelerated worker pools.
Object storage retention policies were revised to tier cold datasets into low-cost glacier storage, yielding
an annualized savings projection of $420,000 across data engineering teams.

2. Departmental Chargeback Models
Engineering accounted for $1.85M in quarterly utilization, followed by Product Analytics at $740,000.
We have implemented automated cost-center tagging policies in Terraform templates to ensure strict compliance
and prevent untracked resource provisioning.

3. Reserved Instance and Savings Plan Commitments
The procurement committee approved a three-year compute savings commitment, securing a 41% blended discount
relative to on-demand pricing across Kubernetes node groups.
    `.trim(),
    charCount: 1290,
    wordCount: 165,
    tokens: [],
    tokenCounts: new Map(),
    isScannedOrLowText: false,
    status: 'ready',
  },
];

export function getInitializedSampleDocs(): UploadedDoc[] {
  return SAMPLE_DOCUMENTS.map((doc, idx) => {
    const { tokens, tokenCounts } = tokenizeText(doc.rawText);
    return {
      ...doc,
      id: `sample-${idx + 1}`,
      label: `D${idx + 1}`,
      tokens,
      tokenCounts,
      wordCount: tokens.length,
      charCount: doc.rawText.length,
      uploadedAt: Date.now() - (3 - idx) * 60000,
    };
  });
}
