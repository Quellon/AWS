# Database Design

## Database Selection

### Decision: Amazon DynamoDB

**Rationale**: DynamoDB is the optimal choice for this log service based on the following requirements analysis.

## Database Comparison

### 1. Amazon DynamoDB (Selected)

**Pros**:
- **Serverless**: No infrastructure management, perfectly aligns with Lambda
- **Performance**: Single-digit millisecond latency at any scale
- **Scalability**: Automatic scaling with on-demand pricing
- **Cost-effective**: Pay per request, no idle capacity costs
- **Simple Operations**: No patching, backup automation built-in
- **Fast Writes**: Optimized for high-velocity writes (log ingestion)
- **Time-to-Live (TTL)**: Built-in feature for automatic log expiration
- **Point-in-Time Recovery**: Easy backup and restore

**Cons**:
- Limited query patterns (must design schema carefully)
- Eventually consistent reads by default
- Complex queries require GSIs (Global Secondary Indexes)

**Why it fits this use case**:
- Log ingestion is write-heavy → DynamoDB excels at writes
- Simple query pattern (get 100 most recent) → Easy to implement
- Serverless architecture → Matches Lambda's serverless nature
- No need for complex queries or joins
- Cost-effective for variable workloads

### 2. Amazon Aurora Serverless v2 (Alternative)

**Pros**:
- Full SQL support (complex queries)
- ACID compliance
- Auto-scaling compute
- MySQL/PostgreSQL compatible

**Cons**:
- Higher latency (10-100ms vs DynamoDB's 1-5ms)
- More expensive for small/variable workloads
- Minimum capacity charges even when idle
- Overkill for simple key-value operations
- Cold start issues with v1 (improved in v2)

**Trade-offs**:
- Better for complex relational queries
- Not optimal for simple log storage
- Higher operational complexity

### 3. Amazon RDS (Not Recommended)

**Pros**:
- Full SQL capabilities
- ACID compliance
- Mature ecosystem

**Cons**:
- Not serverless (requires capacity planning)
- Higher costs (always-on instances)
- Requires maintenance windows
- Connection pooling challenges with Lambda
- Overprovisioning needed for burst traffic

**Trade-offs**:
- Fixed costs regardless of usage
- Better for traditional applications
- Not suitable for serverless architecture

### 4. Amazon Timestream (Niche Use Case)

**Pros**:
- Purpose-built for time-series data
- Built-in analytics
- Automatic data lifecycle management

**Cons**:
- More expensive for simple logging
- Overkill for this use case
- Limited to time-series queries

## Selected: DynamoDB

**Final Decision**: DynamoDB provides the best balance of performance, cost, scalability, and simplicity for this log service.

## DynamoDB Schema Design

### Table: LogEntries

#### Primary Key Design

**Option 1: Partition Key Only (Simple but Limited)**
```
Partition Key (PK): id (String - UUID)
```
**Problem**: Cannot efficiently retrieve "most recent 100" without scanning entire table.

**Option 2: Composite Key (Recommended)**
```
Partition Key (PK): logPartition (String - e.g., "LOGS")
Sort Key (SK): dateTime (String - ISO 8601 format)
```
**Advantages**:
- Efficient queries for recent logs using Query operation
- All logs in single partition enables sorted retrieval
- Descending sort order returns newest first

**Considerations**:
- Single partition may have limitations at extreme scale (10GB limit, 3000 RCU/1000 WCU)
- For high-scale systems, use date-based partitions

**Option 3: Date-Sharded Partitions (For High Scale)**
```
Partition Key (PK): logDate (String - e.g., "2025-11-08")
Sort Key (SK): dateTime (String - ISO 8601 with microseconds)
```
**Advantages**:
- Distributes load across multiple partitions
- Prevents hot partition issues
- Scales to millions of logs per day

**Trade-offs**:
- Query must specify date or scan multiple partitions
- More complex "most recent 100" query logic

### Recommended Schema

**For this project (moderate scale)**: Use Option 2 (Composite Key with single partition)

```
Table Name: LogEntries

Primary Key:
- Partition Key: logPartition (String) - Always "LOGS"
- Sort Key: dateTime (String) - ISO 8601 format

Attributes:
- id (String) - UUID v4, unique identifier
- dateTime (String) - ISO 8601: "2025-11-08T10:30:45.123Z"
- severity (String) - "info" | "warning" | "error"
- message (String) - Log message text (max 1KB recommended)

Indexes: None required for basic functionality

Settings:
- Billing Mode: On-Demand (or Provisioned with auto-scaling)
- Encryption: AWS Managed Key (default)
- Point-in-Time Recovery: Enabled
- TTL: Optional - ttlExpiration attribute (for log retention policy)
```

### Sample Items

```json
{
  "logPartition": "LOGS",
  "dateTime": "2025-11-08T10:30:45.123Z",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "severity": "error",
  "message": "Database connection timeout"
}
```

```json
{
  "logPartition": "LOGS",
  "dateTime": "2025-11-08T10:30:46.456Z",
  "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "severity": "info",
  "message": "User login successful"
}
```

## Query Patterns

### 1. Ingest Log Entry (Write)

**Operation**: `PutItem`

```javascript
{
  TableName: "LogEntries",
  Item: {
    logPartition: "LOGS",
    dateTime: new Date().toISOString(),
    id: generateUUID(),
    severity: "info",
    message: "Log message here"
  }
}
```

**Performance**: O(1) - Consistent write latency

### 2. Get 100 Most Recent Logs (Read)

**Operation**: `Query`

```javascript
{
  TableName: "LogEntries",
  KeyConditionExpression: "logPartition = :pk",
  ExpressionAttributeValues: {
    ":pk": "LOGS"
  },
  ScanIndexForward: false,  // Descending order (newest first)
  Limit: 100
}
```

**Performance**: O(log n) - Efficient, uses index

### 3. Alternative: Query with Severity Filter

**Operation**: `Query` with FilterExpression

```javascript
{
  TableName: "LogEntries",
  KeyConditionExpression: "logPartition = :pk",
  FilterExpression: "severity = :sev",
  ExpressionAttributeValues: {
    ":pk": "LOGS",
    ":sev": "error"
  },
  ScanIndexForward: false,
  Limit: 100
}
```

**Note**: FilterExpression applied after fetch, may need to retrieve more than 100 items.

## Data Integrity

### 1. Unique IDs
- Generate UUID v4 on write
- Collision probability: negligible (2^122)
- No duplicate check needed

### 2. DateTime Precision
- ISO 8601 format with milliseconds
- Server-side timestamp generation (in Lambda)
- Prevents client clock skew issues

### 3. Severity Validation
- Enforce in Lambda before write
- Options: "info" | "warning" | "error"
- Reject invalid values

### 4. Message Size
- Recommend max 1KB per message
- DynamoDB item limit: 400KB
- Consider truncation for oversized messages

## Capacity Planning

### On-Demand Mode (Recommended for Start)

**Advantages**:
- No capacity planning needed
- Automatically scales
- Pay per request

**Pricing** (approximate):
- Write: $1.25 per million writes
- Read: $0.25 per million reads

**Example Cost** (1000 logs/hour):
- Daily writes: 24,000 writes = $0.03/day
- Daily reads: 10,000 reads = $0.0025/day
- Monthly: ~$1.00

### Provisioned Mode (For Predictable Load)

**When to switch**:
- Consistent traffic patterns
- Can save 40-60% vs on-demand
- Requires monitoring and adjustment

**Example Provisioning**:
- WCU: 5 (5 writes/sec)
- RCU: 5 (5 eventually consistent reads/sec)
- Cost: ~$3/month

## Backup and Recovery

### 1. Point-in-Time Recovery (PITR)
- Enable PITR in Terraform
- Restore to any point in last 35 days
- Minimal performance impact

### 2. On-Demand Backups
- Manual snapshots for long-term retention
- Cross-region copy for DR

### 3. Time-to-Live (TTL)
- Automatically delete old logs
- Add `ttlExpiration` attribute
- Example: Retain 90 days

```javascript
{
  ttlExpiration: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60)
}
```

## Performance Optimization

### 1. Batch Writes
- Use BatchWriteItem for multiple logs
- Up to 25 items per batch
- Reduces Lambda execution time

### 2. Consistent Reads
- Use eventual consistency for cost savings
- Strong consistency if needed: `ConsistentRead: true`

### 3. Projection
- Only fetch required attributes
- Use ProjectionExpression to reduce data transfer

### 4. Connection Reuse
- Reuse DynamoDB client across Lambda invocations
- Initialize outside handler function

## Migration Strategy (If Needed)

### To Aurora Serverless
1. Enable DynamoDB Streams
2. Use AWS DMS (Database Migration Service)
3. Stream changes to Aurora
4. Switch read/write traffic

### To OpenSearch (for Search)
1. Enable DynamoDB Streams
2. Lambda trigger to index in OpenSearch
3. Dual writes or stream-based sync

## Schema Evolution

### Adding New Attributes
- DynamoDB is schema-less
- Add new attributes without migration
- Handle missing attributes in Lambda

### Changing Sort Key
- Requires new table creation
- Migrate data with DynamoDB Streams
- Blue-green deployment

## Conclusion

DynamoDB provides the optimal solution for this log service with:
- Minimal operational overhead
- Excellent write performance for log ingestion
- Efficient retrieval of recent logs
- Cost-effective serverless pricing
- Built-in reliability and scaling

The schema design ensures data integrity while enabling efficient queries for the required use case.
