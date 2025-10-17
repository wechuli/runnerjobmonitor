# Gemini AI Integration

## Overview

The GitHub Actions Runner Observability Tool integrates Google's Gemini AI to provide intelligent analysis of workflow job performance. The AI analyzes system metrics and job logs to identify bottlenecks and provide actionable recommendations.

## Prompt Engineering Strategy

### Context Provided to Gemini

The prompt sent to Gemini includes the following context:

1. **Job Metadata:**
   - Job name
   - Workflow name
   - Execution duration

2. **System Metrics:**
   - Time-series data of CPU usage (%)
   - Memory usage (MB and %)
   - Disk usage (%)
   - Network activity
   - Timestamps relative to job start

3. **Job Logs:**
   - Console output from the job execution
   - Truncated if too long (first and last portions preserved)
   - Timestamps for correlation with metrics

### Prompt Structure

The prompt is structured to guide Gemini toward producing actionable insights:

```
You are an expert DevOps engineer specializing in GitHub Actions performance optimization.

Analyze the following GitHub Actions job data and provide actionable insights.

**Job Information:**
- Job Name: {job_name}
- Workflow: {workflow_name}

**System Metrics Over Time:**
{formatted_metrics}

**Job Logs (excerpt):**
{truncated_logs}

**Your Task:**
1. **Performance Summary**: Provide an overview of the job's performance
2. **Bottlenecks Identified**: Identify any performance bottlenecks such as:
   - CPU spikes or sustained high CPU usage
   - Memory pressure or out-of-memory risks
   - Disk I/O limitations
   - Network bottlenecks
3. **Correlation Analysis**: Correlate high resource usage with specific log entries or workflow steps
4. **Recommendations**: Provide specific, actionable recommendations such as:
   - Adjusting runner machine size
   - Optimizing workflow steps
   - Caching strategies
   - Parallelization opportunities

Format your response in markdown with clear sections using ### for headings.
```

## Example Prompt

Here's a complete example of what gets sent to Gemini:

```
You are an expert DevOps engineer specializing in GitHub Actions performance optimization.

Analyze the following GitHub Actions job data and provide actionable insights.

**Job Information:**
- Job Name: build-and-test
- Workflow: CI/CD Pipeline

**System Metrics Over Time:**
[2025-01-01T12:00:00Z] CPU: 5.2%, Memory: 512MB (6.1%), Disk: 45.0%
[2025-01-01T12:00:10Z] CPU: 8.4%, Memory: 545MB (6.5%), Disk: 45.2%
[2025-01-01T12:00:20Z] CPU: 75.3%, Memory: 1234MB (14.8%), Disk: 45.8%
[2025-01-01T12:00:30Z] CPU: 88.2%, Memory: 1456MB (17.5%), Disk: 46.2%
...
[2025-01-01T12:04:50Z] CPU: 15.1%, Memory: 678MB (8.1%), Disk: 52.3%

... (150 more metrics omitted for brevity)

**Job Logs (excerpt):**
```
[2025-01-01T12:00:00] Starting job...
[2025-01-01T12:00:05] Checking out repository...
[2025-01-01T12:00:15] Running npm install...
[2025-01-01T12:00:45] npm install completed in 30s
[2025-01-01T12:00:46] Running npm run build...
[2025-01-01T12:02:15] Build completed successfully
[2025-01-01T12:02:16] Running tests...
[2025-01-01T12:04:50] All tests passed
[2025-01-01T12:04:51] Job completed successfully
```

**Your Task:**
1. **Performance Summary**: Provide an overview of the job's performance
2. **Bottlenecks Identified**: Identify any performance bottlenecks such as:
   - CPU spikes or sustained high CPU usage
   - Memory pressure or out-of-memory risks
   - Disk I/O limitations
   - Network bottlenecks
3. **Correlation Analysis**: Correlate high resource usage with specific log entries or workflow steps
4. **Recommendations**: Provide specific, actionable recommendations such as:
   - Adjusting runner machine size
   - Optimizing workflow steps
   - Caching strategies
   - Parallelization opportunities

Format your response in markdown with clear sections using ### for headings.
```

## Example Response from Gemini

```markdown
### Performance Summary

The job completed successfully in approximately 5 minutes. Overall resource utilization was moderate, with notable CPU spikes during specific phases of the workflow.

### Bottlenecks Identified

* **High CPU Usage During Build Phase**: CPU usage spiked to 88% during the npm run build step (12:00:46 - 12:02:15), which lasted approximately 90 seconds.
* **Moderate Memory Usage**: Memory usage remained stable around 1.2-1.5GB during the build phase, which is well within acceptable limits for a 2-core runner.
* **Network Activity During npm install**: Significant network activity observed during the npm install phase, indicating dependency downloads.

### Correlation Analysis

1. **npm install (12:00:15 - 12:00:45)**: CPU usage increased to 75-80% with high network activity. This is expected behavior as npm downloads and extracts packages.

2. **npm run build (12:00:46 - 12:02:15)**: CPU usage peaked at 88% with sustained high usage. This indicates CPU-intensive compilation/transpilation work.

3. **Test execution (12:02:16 - 12:04:50)**: CPU usage dropped to 15-30% with occasional spikes, suggesting I/O-bound test operations.

### Recommendations

1. **Implement Dependency Caching**: Use GitHub Actions cache action to cache node_modules. This would eliminate the 30-second npm install phase and reduce network usage:
   ```yaml
   - uses: actions/cache@v3
     with:
       path: node_modules
       key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
   ```

2. **Current Runner Size is Appropriate**: The 2-core runner handles the workload adequately. CPU usage is high but not maxed out, and memory usage is comfortable. No need to upgrade.

3. **Consider Build Output Caching**: If build outputs are reusable across runs, consider caching them to skip rebuilding unchanged code.

4. **Parallelize Tests**: If your test suite supports it, consider running tests in parallel to reduce the test execution time.

5. **Monitor Disk Usage**: Disk usage increased from 45% to 52% during the job. Monitor this over time to ensure sufficient disk space for future runs.
```

## Implementation Details

### Model Selection

Currently using: `gemini-2.0-flash-exp`

This model provides a good balance between:
- Speed: Fast response times for real-time analysis
- Quality: Accurate identification of performance issues
- Cost: Reasonable pricing for production use

### Data Sampling

To stay within token limits and API constraints:

1. **Metrics Sampling**: If there are more than 50 metrics, we sample them evenly across the timeline while always including the last metric.

2. **Log Truncation**: If logs exceed 5000 characters, we keep the first 2500 and last 2500 characters, inserting a truncation notice in the middle.

### Error Handling

The service includes robust error handling:
- API key validation before making requests
- Timeout handling for long-running requests
- Graceful degradation if Gemini is unavailable
- Clear error messages returned to the user

## Configuration

Set the Gemini API key in the backend `.env` file:

```
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

## Best Practices

1. **Prompt Clarity**: Keep prompts clear and structured with specific tasks
2. **Context Relevance**: Only include relevant metrics and log excerpts
3. **Output Format**: Explicitly request markdown formatting for consistent rendering
4. **Token Limits**: Monitor token usage and adjust sampling if needed
5. **Rate Limiting**: Implement rate limiting to prevent API quota exhaustion

## Future Enhancements

1. **Custom Prompts**: Allow users to customize the analysis prompt
2. **Historical Comparison**: Compare current job performance with historical data
3. **Trend Analysis**: Identify performance trends across multiple job runs
4. **Cost Tracking**: Track Gemini API usage and costs per analysis
5. **Alternative Models**: Support for other Gemini models or LLM providers
